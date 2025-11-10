import express from "express";
import bcrypt from "bcrypt";
import {
  checkearExisteUsuario,
  crearUsuario,
  desactivarAnonimizarUsuario,
  eliminarUsuario,
  getUsuario,
  listarDatosUsuario,
} from "../../bd/controladores/usuario.js";
import { crearToken, authMiddleware } from "../../utils/jwt.js";
import {
  crearNuevoPresupuesto,
  eliminarPresupuesto,
  getPresupuestoUsuario,
  hayRentingsActivos,
  MODOS_RENTING,
} from "../../bd/controladores/presupuesto.js";
import { desvincularVehiculosDeUsuario } from "../../bd/controladores/vehiculo.js";
import { validateUsuariosRegistro } from "../validators/usuarios/validatorUsuarios.js";
import { validateRequest } from "../validators/validatorRequest.js";
const router = express.Router();
/**
 * @route POST /oauth/auth0
 * @description
 * Endpoint utilizado durante el proceso de autenticación OAuth con Auth0.
 * Verifica si el usuario existe en la base de datos según las credenciales recibidas (correo y nombre de usuario).
 * Si el usuario no existe, lo crea con rol por defecto `"user"` y genera un nuevo presupuesto asociado.
 * Si existe, pues devuelve el token con los datos del usuario encontrado y el mensaje exitoso.
 * Finalmente, devuelve un token JWT con los datos del usuario autenticado.
 *
 * @middleware
 * - `validateUsuariosRegistro`: Valida los campos de registro del usuario.
 * - `validateRequest`: Maneja posibles errores de validación antes de ejecutar la lógica principal.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.body - Credenciales del usuario provenientes de Auth0.
 * @param {string} req.body.correo - Correo electrónico del usuario autenticado.
 * @param {string} req.body.nombreUsuario - Nombre de usuario proporcionado por Auth0.
 *
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o al manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con:
 * - `token`: Token JWT del usuario autenticado o recién creado.
 * - `message`: Mensaje de confirmación.
 *
 * @throws {Error} 400 - Validation error
 * @throws {Error} 500 - Si ocurre un error inesperado durante la operación.
 *
 * @example
 * // Ejemplo de cuerpo de solicitud:
 * {
 *   "correo": "usuario@example.com",
 *   "nombreUsuario": "juanperez"
 * }
 *
 * // Respuesta exitosa:
 * {
 *   "token": "<jwt-token>",
 *   "message": "Credenciales introducidas correctamente!"
 * }
 */
router.post(
  "/oauth/auth0",
  validateUsuariosRegistro,
  validateRequest,
  async (req, res, next) => {
    try {
      const credencialesUsuario = req.body;
      const { correo, nombreUsuario } = credencialesUsuario;
      // shorthand property (propiedades abreviadas), no es necesario poner "correo : correo, contrasenya: contrasenya..."
      const objUsuario = { correo, nombreUsuario, role: "user" };
      const usuarioEncontrado = await checkearExisteUsuario(objUsuario);
      let usuarioCreado = null;
      if (!usuarioEncontrado) {
        usuarioCreado = await crearUsuario(objUsuario);
        const presupuestoEncontrado = await crearNuevoPresupuesto(
          usuarioCreado._id
        );
        if (!presupuestoEncontrado) {
          const error = new Error(`No se ha podido crear el presupuesto!`);
          error.status = 500;
          return next(error);
        }
      }
      const token = crearToken({
        idUsuario: usuarioCreado ? usuarioCreado._id : usuarioEncontrado._id,
        nombreUsuario: usuarioCreado
          ? usuarioCreado.nombreUsuario
          : usuarioEncontrado.nombreUsuario,
        role: usuarioCreado ? usuarioCreado.role : usuarioEncontrado.role,
      });

      res
        .status(201)
        .json({ token, message: "Credenciales introducidas correctamente!" });
    } catch (err) {
      // si viene de crearUsuario, respetamos err.codigo
      const error = new Error(err.message);
      error.status = err.codigo || 500;
      return next(error);
    }
  }
);
/**
 * @route GET /profile
 * @description
 * Obtiene la información del perfil del usuario autenticado.
 * Retorna los datos básicos del usuario (nombre, correo) junto con su presupuesto actual.
 *
 * @middleware
 * - `authMiddleware`: Verifica que el usuario esté autenticado y añade `req.idUsuario` y `req.role` al objeto de solicitud.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {string} req.idUsuario - ID del usuario autenticado, inyectado por el middleware de autenticación.
 *
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con la información del perfil del usuario.
 *
 * @example
 * // Respuesta exitosa:
 * {
 *   "perfilUsuario": {
 *     "nombreUsuario": "juanperez",
 *     "correo": "juanperez@example.com",
 *     "presupuesto": {
 *       total_rentings: 1,
 *       id_usuario: ObjectId("..."),
 *       gasto_total: 19000,
 *       gasto_mensual: 1000,
 *       ...
 *     }
 *   }
 * }
 *
 * @throws {Error} 403 - Si el usuario no está autorizado o token caducado.
 * @throws {Error} 500 - Si ocurre un error al obtener los datos del usuario o su presupuesto.
 */
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const perfilUsuario = {};
    const datosUsuario = await listarDatosUsuario(req.idUsuario);
    perfilUsuario.nombreUsuario = datosUsuario.nombreUsuario;
    perfilUsuario.correo = datosUsuario.correo;
    const presupuestoEncontrado = await getPresupuestoUsuario(req.idUsuario);
    perfilUsuario.presupuesto = presupuestoEncontrado;
    res.json({ perfilUsuario });
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.codigo || 500;
    return next(error);
  }
});
/**
 * @route DELETE /eliminar
 * @description
 * Elimina o desactiva al usuario autenticado según el estado de sus rentings.
 *
 * - Si el usuario tiene **rentings activos**, no se permite la eliminación.
 * - Si el usuario **tuvo rentings previos**, se desactiva y anonimiza su cuenta.
 * - Si el usuario **no tiene ni tuvo rentings**, se elimina definitivamente junto con su presupuesto.
 *
 * @middleware
 * - `authMiddleware`: Verifica que el usuario esté autenticado y agrega `req.idUsuario` y `req.role` al objeto de solicitud.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {string} req.idUsuario - ID del usuario autenticado, proporcionado por el middleware de autenticación.
 *
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON indicando el resultado de la operación.
 *
 * @example
 * // Posibles respuestas:
 * {
 *   "respuesta": "No puede eliminar el usuario porque tiene rentings activos"
 * }
 *
 * {
 *   "respuesta": "Tu usuario quedó desactivado, en un futuro habrá una opción para recuperarlo, de momento está registrado pero desactivado!"
 * }
 *
 * {
 *   "respuesta": "Usuario eliminado correctamente!"
 * }
 *
 * @throws {Error} 403 - Si el usuario no está autorizado o token caducado.
 * @throws {Error} 500 - Si ocurre un error al procesar la eliminación o desactivación del usuario.
 */
router.delete("/eliminar", authMiddleware, async (req, res, next) => {
  try {
    const idUsuario = req.idUsuario;
    const respuesta = await hayRentingsActivos(idUsuario);
    if (respuesta === MODOS_RENTING.HAY_ACTIVOS) {
      const error = new Error(
        `No puede eliminar el usuario porque tiene rentings activos`
      );
      error.status = 400;
      return next(error);
    } else if (respuesta === MODOS_RENTING.HA_HABIDO) {
      const usuarioDesactivado = await desactivarAnonimizarUsuario(
        req.idUsuario
      );
      const vehiculosDesvinculados = await desvincularVehiculosDeUsuario(
        req.idUsuario
      );
      res.json({
        respuesta:
          usuarioDesactivado && vehiculosDesvinculados
            ? "Tu usuario quedó desactivado, en un futuro habrá una opción para recuperarlo, de momento está registrado pero desactivado!"
            : "Ha habido algún error desactivando el usuario.",
      });
    } else {
      const usuarioEliminado = await eliminarUsuario(req.idUsuario);
      const presupuestoEliminado = await eliminarPresupuesto(req.idUsuario);
      res.json({
        respuesta:
          usuarioEliminado && presupuestoEliminado
            ? "Usuario eliminado correctamente!"
            : "Ha habido algún error eliminando el usuario.",
      });
    }
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.codigo || 500;
    return next(error);
  }
});

export default router;

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

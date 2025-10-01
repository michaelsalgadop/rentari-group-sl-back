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
import { crearCodigoVerificacion } from "../../bd/controladores/codigoVerificacion.js";
import { enviarCorreo } from "../../nodemailer/email.js";
import { desvincularVehiculosDeUsuario } from "../../bd/controladores/vehiculo.js";
const router = express.Router();

router.put("/login", async (req, res, next) => {
  try {
    const credencialesUsuario = req.body;

    const { correo, contrasenya } = credencialesUsuario;
    const usuarioEncontrado = await getUsuario(correo);
    const coincideContrasenya = await bcrypt.compare(
      contrasenya,
      usuarioEncontrado.contrasenya
    );
    if (!coincideContrasenya) {
      const error = new Error(
        `La contraseña no coincide con la del nombre de usuario guardado!`
      );
      error.status = 403;
      return next(error);
    }
    const token = crearToken({
      idUsuario: usuarioEncontrado._id,
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      role: usuarioEncontrado.role,
    });
    res.json({ token });
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(err.codigo ? err : error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const credencialesUsuario = req.body;
    const { correo, contrasenya, nombreUsuario } = credencialesUsuario;
    // shorthand property (propiedades abreviadas), no es necesario poner "correo : correo, contrasenya: contrasenya..."
    const objUsuario = { correo, contrasenya, nombreUsuario, role: "user" };
    const usuarioEncontrado = await checkearExisteUsuario(objUsuario);
    if (usuarioEncontrado) {
      const error = new Error();
      if (usuarioEncontrado.nombreUsuario === nombreUsuario) {
        error.message += `El nombre de usuario ya ha sido registrado!\n`;
      }
      if (usuarioEncontrado.correo === correo) {
        error.message += `\nEl correo electrónico ya ha sido registrado!`;
      }
      error.status = 409; // Recurso ya existe, código 409
      return next(error);
    }
    const contrasenyaHasheada = await bcrypt.hash(objUsuario.contrasenya, 10);
    objUsuario.contrasenya = contrasenyaHasheada;
    const usuarioCreado = await crearUsuario(objUsuario);
    const presupuestoEncontrado = await crearNuevoPresupuesto(
      usuarioCreado._id
    );
    if (!presupuestoEncontrado) {
      const error = new Error(`No se ha podido crear el presupuesto!`);
      error.status = 500;
      return next(error);
    }
    const token = crearToken({
      idUsuario: usuarioCreado._id,
      nombreUsuario: usuarioCreado.nombreUsuario,
      role: usuarioCreado.role,
    });

    res
      .status(201)
      .json({ token, message: "Usuario registrado correctamente!" });
  } catch (err) {
    // si viene de crearUsuario, respetamos err.codigo
    const error = new Error(err.message);
    error.status = err.codigo || 500;
    return next(error);
  }
});

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

router.post("/validacion", async (req, res, next) => {
  try {
    const credencialesUsuario = req.body;
    const { correo, nombreUsuario } = credencialesUsuario;
    const usuarioEncontrado = await checkearExisteUsuario({
      correo,
      nombreUsuario,
    });
    if (usuarioEncontrado) {
      const error = new Error();
      if (usuarioEncontrado.nombreUsuario === nombreUsuario) {
        error.message += `El nombre de usuario ya ha sido registrado!\n`;
      }
      if (usuarioEncontrado.correo === correo) {
        error.message += `\nEl correo electrónico ya ha sido registrado!`;
      }
      error.status = 409; // Recurso ya existe, código 409
      return next(error);
    }
    const codigoVerificacion = await crearCodigoVerificacion(correo);
    if (!codigoVerificacion) {
      const error = new Error(
        "No ha sido posible crear el código de verificación!"
      );
      error.status = 500;
      return next(error);
    }
    enviarCorreo(nombreUsuario, correo, codigoVerificacion.codigo);
    res.json({ codigoVerificacion });
  } catch (err) {
    const error = new Error(err.message);
    error.status = err.codigo || 500;
    return next(error);
  }
});

export default router;

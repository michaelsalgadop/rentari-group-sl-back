import { body } from "express-validator";
import {
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
} from "../validatorInjection.js";
import {
  correoValido,
  nombreUsuarioValido,
} from "../validatorGeneral.js";
import { getLlavesUsuarios } from "../../../bd/controladores/usuario.js";
let clavesValidas = [];
(async () => {
  try {
    clavesValidas = await getLlavesUsuarios();
    console.log("Claves de usuario cargadas:", clavesValidas);
  } catch (error) {
    console.error("Error cargando claves:", error.message);
  }
})();
const testCamposValidosUsuarios = (peticion) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};

const bodyValidaUsuarios = body().custom(async (_, { req }) => {
  const peticion = req.body;
  // testGeneral ya lanza sus propios errores si algo va mal (inyección, etc.)
  testGeneral(peticion);
  // Si las claves actuales son válidas, todo bien
  if (!testCamposValidosUsuarios(peticion)) return true;
  // Si detecta claves inválidas, recarga desde BD y reintenta
  clavesValidas = await getLlavesUsuarios();
  if (testCamposValidosUsuarios(peticion))
    throw new Error(mensajeParametrosNoPermitidos);
  return true;
});

const validateUsuariosRegistro = [
  bodyValidaUsuarios,
  body("correo").custom(correoValido).withMessage("Correo no es válido!"),
  body("nombreUsuario")
    .custom(nombreUsuarioValido)
    .withMessage("Nombre de usuario no es válido!"),
];
export { validateUsuariosRegistro };

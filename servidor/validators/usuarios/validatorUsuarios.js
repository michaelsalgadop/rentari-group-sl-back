import { body } from "express-validator";
import {
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
} from "../validatorInjection.js";
import { correoValido, nombreUsuarioValido } from "../validatorGeneral.js";
import { getLlavesUsuarios } from "../../../bd/controladores/usuario.js";
let clavesValidas = [];
/**
 * Inicializa las claves válidas de usuarios al iniciar la aplicación.
 *
 * Esta función se ejecuta automáticamente al cargar el módulo y obtiene
 * las llaves necesarias mediante `getLlavesUsuarios()`.
 * Si ocurre un error durante la carga, se registra en consola.
 *
 * @async
 * @function anonymous
 * @returns {Promise<void>} No devuelve valor; solo inicializa la variable global `clavesValidas`.
 *
 * @example
 * // Salida esperada en consola:
 * Claves de usuario cargadas: ["clave1", "clave2", "clave3"]
 */
(async () => {
  try {
    clavesValidas = await getLlavesUsuarios();
    console.log("Claves de usuario cargadas:", clavesValidas);
  } catch (error) {
    console.error("Error cargando claves:", error.message);
  }
})();
/**
 * Verifica si una petición contiene alguna clave no permitida según un conjunto de claves válidas.
 *
 * Esta función se utiliza principalmente para validar las solicitudes de usuario
 * y detectar campos inesperados antes de procesarlas.
 *
 * @param {Object} peticion - Objeto a validar (por ejemplo, `req.body`).
 *
 * @returns {boolean} `true` si se detecta al menos una clave inválida; `false` si todas las claves son válidas.
 *
 * @throws {Error} Si `peticion` no es un objeto o `clavesValidas` no es un array.
 *
 * @example
 * // Todas las claves válidas
 * rastrearClaveInvalida(peticion(req.body) => { nombreUsuario: "ejemplo_ejemplo", correo: "ejemplo@ejemplo.com" }, clavesValidas => ["nombreUsuario", "correo"]);
 * // false
 *
 * // Contiene clave inválida
 * rastrearClaveInvalida(peticion(req.body) => { nombreUsuario: "ejemplo_ejemplo", precioExtra: 100 }, clavesValidas => ["nombreUsuario", "correo"]);
 * // true
 */
const testCamposValidosUsuarios = (peticion) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 * Validador personalizado para comprobar que los campos enviados en una solicitud
 * de registro de usuario sean válidos según las claves permitidas actuales.
 *
 * Este validador:
 * 1. Ejecuta una validación general de seguridad (`testGeneral`). En busca, por ejemplo, de inyecciones de código.
 * 2. Verifica si las claves de la petición son válidas.
 * 3. Si detecta alguna clave inválida, recarga la lista de claves válidas desde la BD y vuelve a comprobar.
 * 4. Lanza un error si la petición sigue teniendo claves no permitidas tras la recarga.
 *
 * @type {import('express-validator').ValidationChain}
 *
 * @throws {Error} Si la petición contiene parámetros no permitidos
 * o si la validación general detecta algún problema.
 *
 * @example
 * // En una ValidationChain[]:
 * const validateUsuariosRegistro = [
  bodyValidaUsuarios,
  body("correo").custom(correoValido).withMessage("Correo no es válido!"),
  body("nombreUsuario")
    .custom(nombreUsuarioValido)
    .withMessage("Nombre de usuario no es válido!"),
];
 */
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
/**
 * Conjunto de validaciones para solicitudes de registro de usuarios.
 *
 * Comprueba que:
 * - Los campos enviados son válidos según las claves permitidas (`bodyValidaUsuarios`).
 * - `correo` es un string y correo válido.
 * - `nombreUsuario` es un string y nombre de usuario válido.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.post(
  "/oauth/auth0",
  validateUsuariosRegistro,
  validateRequest,
  controladorUsuario =====> (req,res,next));
 */
const validateUsuariosRegistro = [
  bodyValidaUsuarios,
  body("correo").custom(correoValido).withMessage("Correo no es válido!"),
  body("nombreUsuario")
    .custom(nombreUsuarioValido)
    .withMessage("Nombre de usuario no es válido!"),
];
export { validateUsuariosRegistro };

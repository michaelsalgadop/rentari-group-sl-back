import { body } from "express-validator";
import {
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
} from "../validatorInjection.js";
import { getLlavesRentings } from "../../../bd/controladores/rentingPendiente.js";
import {
  isObligatoriIntNumber,
  isObligatoriFloatNumber,
} from "../validatorGeneral.js";
let clavesValidasRentingsPendientes = [];
/**
 * Inicializa las claves válidas de rentings pendientes al iniciar la aplicación.
 *
 * Esta función se ejecuta automáticamente al cargar el módulo y obtiene
 * las llaves necesarias mediante `getLlavesRentings()`.
 * Si ocurre un error durante la carga, se registra en consola.
 *
 * @async
 * @function anonymous
 * @returns {Promise<void>} No devuelve valor; solo inicializa la variable global `clavesValidasRentingsPendientes`.
 *
 * @example
 * // Salida esperada en consola:
 * Claves de rentings cargadas: ["clave1", "clave2", "clave3"]
 */
(async () => {
  try {
    clavesValidasRentingsPendientes = await getLlavesRentings();
    console.log(
      "Claves de rentings cargadas:",
      clavesValidasRentingsPendientes
    );
  } catch (error) {
    console.error("Error cargando claves:", error.message);
  }
})();
/**
 * Verifica si una petición contiene alguna clave no permitida según un conjunto de claves válidas.
 *
 * Esta función se utiliza principalmente para validar las solicitudes de renting
 * y detectar campos inesperados antes de procesarlas.
 *
 * @param {Object} peticion - Objeto a validar (por ejemplo, `req.body`).
 * @param {string[]} clavesValidas - Lista de claves aceptadas para la petición.
 *
 * @returns {boolean} `true` si se detecta al menos una clave inválida; `false` si todas las claves son válidas.
 *
 * @throws {Error} Si `peticion` no es un objeto o `clavesValidas` no es un array.
 *
 * @example
 * // Todas las claves válidas
 * rastrearClaveInvalida(peticion(req.body) => { idVehiculo: "123", meses: 12 }, clavesValidas => ["idVehiculo", "meses", "cuota"]);
 * // false
 *
 * // Contiene clave inválida
 * rastrearClaveInvalida(peticion(req.body) => { idVehiculo: "123", precioExtra: 100 }, clavesValidas => ["idVehiculo", "meses", "cuota"]);
 * // true
 */
const testCamposValidosRentings = (peticion, clavesValidas) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 * Validador personalizado para comprobar que los campos enviados en una solicitud
 * de renting pendiente sean válidos según las claves permitidas actuales.
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
 * const validateRentingsPendientes = [
    bodyValidaRentingsPendientes,
    body("idVehiculo")
      .exists()
      .isMongoId()
      .withMessage("ID de vehículo no válido"),
    body("meses")
      .custom(isObligatoriIntNumber)
      .withMessage("Número de meses no válido!"),
    body("cuota")
      .custom(isObligatoriFloatNumber)
      .withMessage("Cuota no es válida!"),
    body("total")
      .custom(isObligatoriFloatNumber)
      .withMessage("Total no es válido!"),
  ];
 */
const bodyValidaRentingsPendientes = body().custom(async (_, { req }) => {
  const peticion = req.body;
  // testGeneral ya lanza sus propios errores si algo va mal (inyección, etc.)
  testGeneral(peticion);
  // Si las claves actuales son válidas, todo bien
  if (!testCamposValidosRentings(peticion, clavesValidasRentingsPendientes))
    return true;
  // Si detecta claves inválidas, recarga desde BD y reintenta
  clavesValidasRentingsPendientes = await getLlavesRentings();
  if (testCamposValidosRentings(peticion, clavesValidasRentingsPendientes))
    throw new Error(mensajeParametrosNoPermitidos);
  return true;
});
/**
 * Validador personalizado para verificar que los campos enviados en una solicitud
 * de confirmación de renting sean válidos según las claves permitidas actuales.
 *
 * Este validador ejecuta una serie de pasos para asegurar la integridad del body recibido:
 *
 * 1. Ejecuta `testGeneral` para comprobar seguridad general (inyecciones, formatos, etc.).
 * 2. Comprueba si `clavesValidasRentingsPendientes` contiene claves cargadas en memoria.
 * 3. Clona el array existente y agrega las claves adicionales necesarias (`idUsuario` y `id_vehiculo`).
 * 4. Elimina la clave `idVehiculo`, ya que se reemplaza por `id_vehiculo`.
 * 5. Valida si todas las claves del body son válidas con `testCamposValidosRentings`.
 * 6. Si hay claves inválidas, recarga las claves desde la BD (`getLlavesRentings()`), vuelve a clonar,
 *    aplicar los cambios y repetir la validación.
 * 7. Lanza un error si, tras la recarga, la petición sigue incluyendo campos no permitidos.
 *
 * @type {import('express-validator').ValidationChain}
 *
 * @throws {Error} Si la petición contiene parámetros no permitidos
 * o si la validación general (`testGeneral`) detecta un problema de seguridad.
 *
 * @example
 * // Ejemplo de uso dentro de una ValidationChain[]
 * const validateRentingsCrear = [
 *   bodyValidaRentingsConfirmar,
 *   body("id_vehiculo")
 *     .exists()
 *     .isMongoId()
 *     .withMessage("ID de vehículo no válido"),
 *   body("idUsuario")
 *     .exists()
 *     .isMongoId()
 *     .withMessage("ID de usuario no válido"),
 *   body("meses")
 *     .custom(isObligatoriIntNumber)
 *     .withMessage("Número de meses no válido!"),
 *   body("cuota")
 *     .custom(isObligatoriFloatNumber)
 *     .withMessage("Cuota no válida!"),
 *   body("total")
 *     .custom(isObligatoriFloatNumber)
 *     .withMessage("Total no válido!"),
 * ];
 */
const bodyValidaRentingsConfirmar = body().custom(async (_, { req }) => {
  const peticion = req.body;
  testGeneral(peticion);

  if (clavesValidasRentingsPendientes.length === 0) return false;
  let clavesRentingsConfirmar = [...clavesValidasRentingsPendientes];
  clavesRentingsConfirmar.push("idUsuario", "id_vehiculo");
  clavesRentingsConfirmar.splice(
    clavesRentingsConfirmar.indexOf("idVehiculo"),
    1
  );
  if (!testCamposValidosRentings(peticion, clavesRentingsConfirmar))
    return true;
  clavesValidasRentingsPendientes = await getLlavesRentings();
  clavesRentingsConfirmar = [...clavesValidasRentingsPendientes];
  clavesRentingsConfirmar.push("idUsuario");
  if (testCamposValidosRentings(peticion, clavesRentingsConfirmar))
    throw new Error(mensajeParametrosNoPermitidos);
  return true;
});
/**
 * Conjunto de validaciones para solicitudes de renting pendientes.
 *
 * Comprueba que:
 * - Los campos enviados son válidos según las claves permitidas (`bodyValidaRentingsPendientes`).
 * - `idVehiculo` es un ObjectId válido.
 * - `meses`, `cuota` y `total` son valores numéricos válidos según los validadores personalizados.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.post("/pending", validateRentingsPendientes, validateRequest, controladorRenting =====> (req,res,next));
 */
const validateRentingsPendientes = [
  bodyValidaRentingsPendientes,
  body("idVehiculo")
    .exists()
    .isMongoId()
    .withMessage("ID de vehículo no válido"),
  body("meses")
    .custom(isObligatoriIntNumber)
    .withMessage("Número de meses no válido!"),
  body("cuota")
    .custom(isObligatoriFloatNumber)
    .withMessage("Cuota no es válida!"),
  body("total")
    .custom(isObligatoriFloatNumber)
    .withMessage("Total no es válido!"),
];
/**
 * Conjunto de validaciones para la creación definitiva de un renting.
 *
 * Comprueba que:
 * - Se cumplen las validaciones personalizadas del body (`bodyValidaRentingsConfirmar`).
 * - `id_vehiculo` y `idUsuario` son ObjectId válidos.
 * - `meses`, `cuota` y `total` contienen valores numéricos correctos.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.post("/create", validateRentingsCrear, validateRequest, controladorRenting);
 */
const validateRentingsCrear = [
  bodyValidaRentingsConfirmar,
  body("id_vehiculo")
    .exists()
    .isMongoId()
    .withMessage("ID de vehículo no válido"),
  body("idUsuario").exists().isMongoId().withMessage("ID de usuario no válido"),
  body("meses")
    .custom(isObligatoriIntNumber)
    .withMessage("Número de meses no válido!"),
  body("cuota")
    .custom(isObligatoriFloatNumber)
    .withMessage("Cuota no es válida!"),
  body("total")
    .custom(isObligatoriFloatNumber)
    .withMessage("Total no es válido!"),
];
/**
 * Conjunto de validaciones para la confirmación de un renting ya existente.
 *
 * Comprueba únicamente que el campo `idUsuario` está presente
 * y es un ObjectId válido.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.post("/confirm", validateRentingsConfirmar, validateRequest, controladorRenting);
 */
const validateRentingsConfirmar = [
  body("idUsuario").exists().isMongoId().withMessage("ID de usuario no válido"),
];

export {
  validateRentingsPendientes,
  validateRentingsCrear,
  validateRentingsConfirmar,
};

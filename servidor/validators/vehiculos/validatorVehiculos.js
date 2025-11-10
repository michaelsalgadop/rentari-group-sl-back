import { query, param } from "express-validator";
import {
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
} from "../validatorInjection.js";
import {
  anyoValido,
  isNumberFilter,
  noInjection,
} from "../validatorGeneral.js";
import { getLlavesVehiculos } from "../../../bd/controladores/vehiculo.js";
let clavesValidas = [];
/**
 * Inicializa las claves válidas de vehiculos al iniciar la aplicación.
 *
 * Esta función se ejecuta automáticamente al cargar el módulo y obtiene
 * las llaves necesarias mediante `getLlavesVehiculos()`.
 * Si ocurre un error durante la carga, se registra en consola.
 *
 * @async
 * @function anonymous
 * @returns {Promise<void>} No devuelve valor; solo inicializa la variable global `clavesValidas`.
 *
 * @example
 * // Salida esperada en consola:
 * Claves de vehiculo cargadas: ["clave1", "clave2", "clave3"]
 */
(async () => {
  try {
    clavesValidas = await getLlavesVehiculos();
    console.log("Claves de vehiculo cargadas:", clavesValidas);
  } catch (error) {
    console.error("Error cargando claves:", error.message);
  }
})();
/**
 * Verifica si una petición contiene alguna clave no permitida según un conjunto de claves válidas.
 *
 * Esta función se utiliza principalmente para validar las solicitudes de vehiculo
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
 * rastrearClaveInvalida(peticion(req.body) => { nombre: "opel...", anio: 2015 }, clavesValidas => ["nombre", "anio", ...]);
 * // false
 *
 * // Contiene clave inválida
 * rastrearClaveInvalida(peticion(req.body) => { nombre: "opel...", precioExtra: 100 }, clavesValidas => ["nombre", "anio", ...]);
 * // true
 */
const testCamposValidosVehiculos = (peticion) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 * Validador personalizado para verificar que los parámetros de consulta (`req.query`)
 * sean válidos y no contengan claves o valores no permitidos.
 *
 * Este validador:
 * 1. Ejecuta una comprobación general de seguridad (`testGeneral`) para prevenir inyecciones.
 * 2. Verifica que todas las claves del query estén entre las permitidas (`testCamposValidosVehiculos`).
 * 3. Si encuentra claves inválidas, recarga desde la base de datos las claves válidas (`getLlavesVehiculos`) y reintenta.
 * 4. Lanza un error si, tras la recarga, siguen existiendo parámetros no permitidos.
 *
 * @type {import('express-validator').ValidationChain}
 *
 * @throws {Error} Si se detectan parámetros no permitidos o se produce una inyección en el query.
 *
 * @example
 * // Uso interno dentro de la validación de filtros de vehículos:
 * const validateVehiculoFilter = [queryValidaVehiculos, ...];
 */
const queryValidaVehiculos = query().custom(async (_, { req }) => {
  const peticion = req.query;
  // testGeneral ya lanza sus propios errores si algo va mal (inyección, etc.)
  testGeneral(peticion);
  // Si las claves actuales son válidas, todo bien
  if (!testCamposValidosVehiculos(peticion)) return true;
  // Si detecta claves inválidas, recarga desde BD y reintenta
  clavesValidas = await getLlavesVehiculos();
  if (testCamposValidosVehiculos(peticion))
    throw new Error(mensajeParametrosNoPermitidos);
  return true;
});
/**
 * Conjunto de validaciones para los filtros de búsqueda de vehículos.
 *
 * Comprueba que:
 * - Las claves de la query son válidas (`queryValidaVehiculos`).
 * - Los valores de filtros opcionales cumplen los formatos correctos:
 *   - `buscadorVehiculos`: no contiene inyecciones o caracteres peligrosos.
 *   - `precio`, `kilometros`: son valores numéricos válidos.
 *   - `anyo`: pasa la validación personalizada `anyoValido`.
 *   - `orden`: coincide con una de las opciones de ordenación permitidas.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.get("/vehiculos/filter", validateVehiculoFilter, validateRequest, controladorFiltrado);
 */
const validateVehiculoFilter = [
  queryValidaVehiculos,
  query("buscadorVehiculos")
    .optional()
    .custom(noInjection)
    .withMessage("El valor del buscador contiene caracteres no permitidos"),
  query("precio")
    .optional()
    .custom(isNumberFilter)
    .withMessage("El valor del precio no es numérico"),
  query("kilometros")
    .optional()
    .custom(isNumberFilter)
    .withMessage("El valor de kilómetros no es numérico"),
  query("anyo")
    .optional()
    .custom(anyoValido)
    .withMessage("El valor de años no es correcto"),
  query("orden")
    .optional()
    .isString()
    .isIn([
      "nuevosCoches",
      "menosKm",
      "masKm",
      "rentingsBajos",
      "rentingsAltos",
      "",
    ])
    .withMessage("Ordenación no reconocida"),
];
/**
 * Conjunto de validaciones para comprobar que el parámetro `idVehiculo`
 * en la URL de una solicitud corresponde a un identificador MongoDB válido.
 *
 * @type {import('express-validator').ValidationChain[]}
 *
 * @example
 * // En una ruta:
 * router.get("/vehiculo/:idVehiculo", validateVehiculoId, validateRequest, controladorVehiculo);
 */
const validateVehiculoId = [
  param("idVehiculo")
    .exists()
    .isMongoId()
    .withMessage("ID de vehículo no válido"),
];
export { validateVehiculoFilter, validateVehiculoId };

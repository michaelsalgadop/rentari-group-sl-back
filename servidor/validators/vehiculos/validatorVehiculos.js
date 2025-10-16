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
(async () => {
  try {
    clavesValidas = await getLlavesVehiculos();
    console.log("Claves de vehiculo cargadas:", clavesValidas);
  } catch (error) {
    console.error("Error cargando claves:", error.message);
  }
})();
const testCamposValidosVehiculos = (peticion) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};
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

const validateVehiculoId = [
  param("idVehiculo")
    .exists()
    .isMongoId()
    .withMessage("ID de vehículo no válido"),
];
export { validateVehiculoFilter, validateVehiculoId };

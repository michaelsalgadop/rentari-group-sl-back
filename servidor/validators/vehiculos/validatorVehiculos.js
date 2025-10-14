import { query, param } from "express-validator";
import { regexInyeccion, queryValidaVehiculos } from "../validatorInjection.js";

const queryParamVacio = (valor) =>
  typeof valor === "undefined" || valor.length === 0;
const esObjeto = (valor) => typeof valor === "object" && valor !== null;

// Validador que usa la regex
const noInjection = (valor) => {
  if (queryParamVacio(valor)) return true;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  return !regexInyeccion.test(valor);
};

const isNumberFilter = (valor) => {
  /* no se permiten arrays ni objetos*/
  if (esObjeto(valor) || Array.isArray(valor)) return false;
  return queryParamVacio(valor) || !isNaN(parseInt(valor));
};

const anyoValido = (valor) => {
  if (esObjeto(valor) || isNaN(valor)) return false;
  const valorNumerico = parseInt(valor);
  return valorNumerico === 0 || valorNumerico <= new Date().getFullYear();
};

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

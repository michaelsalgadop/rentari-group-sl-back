import { body } from "express-validator";
import {
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
} from "../validatorInjection.js";
import { noInjection } from "../validatorGeneral.js";
import { getLlavesVehiculos } from "../../../bd/controladores/vehiculo.js";

const testCamposValidosUsuarios = async (peticion) => {
  try {
    const clavesValidas = await getLlavesVehiculos();
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};

const bodyValidaUsuarios = body().custom(async (_, { req }) => {
  const peticion = req.body;
  if (testGeneral(peticion)) {
    if (await testCamposValidosUsuarios(peticion))
      throw new Error(mensajeParametrosNoPermitidos);
  }
  return true;
});

const validateUsuariosRegistro = [
  bodyValidaUsuarios,
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

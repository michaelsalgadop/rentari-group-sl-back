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
const testCamposValidosRentings = (peticion, clavesValidas) => {
  try {
    return rastrearClaveInvalida(peticion, clavesValidas);
  } catch (error) {
    throw new Error(error.message);
  }
};

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

const validateRentingsConfirmar = [
  body("idUsuario").exists().isMongoId().withMessage("ID de usuario no válido"),
];

export {
  validateRentingsPendientes,
  validateRentingsCrear,
  validateRentingsConfirmar,
};

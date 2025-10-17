import express from "express";
import {
  comprobarRentingsPendientes,
  crearRentingPendiente,
  eliminarRentingTemporal,
} from "../../bd/controladores/rentingPendiente.js";
import {
  alquilarVehiculo,
  getVehiculoPorId,
  reservarVehiculo,
} from "../../bd/controladores/vehiculo.js";
import { agregarVehiculoAlPresupuesto } from "../../bd/controladores/presupuesto.js";
import {
  validateRentingsConfirmar,
  validateRentingsCrear,
  validateRentingsPendientes,
} from "../validators/rentings/validatorRentings.js";

import { validateRequest } from "../validators/validatorRequest.js";

const router = express.Router();
const procesarRenting = async ({
  idUsuario,
  id_vehiculo,
  meses,
  cuota,
  total,
}) => {
  const presupuestoModificado = await agregarVehiculoAlPresupuesto({
    idUsuario,
    id_vehiculo,
    meses,
    cuota,
    total,
  });
  const resultadoAlquiler = await alquilarVehiculo(idUsuario, id_vehiculo);
  if (!resultadoAlquiler)
    throw new Error("No se ha podido alquilar el vehículo");
  return presupuestoModificado && resultadoAlquiler;
};
router.post(
  "/pending",
  validateRentingsPendientes,
  validateRequest,
  async (req, res, next) => {
    try {
      const rentingRealizar = req.body;
      const sessionId = req.sessionId; // del middleware de cookies
      const { idVehiculo } = rentingRealizar;
      await getVehiculoPorId(idVehiculo); // comprobar si existe el vehiculo
      const rentingsPendientes = await comprobarRentingsPendientes(sessionId);
      if (rentingsPendientes) {
        const error = new Error(
          "Tienes un renting anterior pendiente de confirmar! Inicia sesión o regístrate para confirmarlo primero y después vuelve si también quieres realizar un renting de este vehículo."
        );
        error.status = 409;
        return next(error);
      }
      const rentingCreado = await crearRentingPendiente(
        sessionId,
        rentingRealizar
      );
      if (!rentingCreado) {
        const error = new Error("No ha sido posible realizar el renting!");
        error.status = 500;
        return next(error);
      }
      const vehiculoReservado = await reservarVehiculo(
        rentingRealizar.idVehiculo
      );
      res.json({
        ok: vehiculoReservado,
        messageTitle: "Reserva realizada.",
        messageBody:
          "Debes iniciar sesión o registrarte para continuar con la operación. Tienes un plazo de unos 15 minutos aproximadamente para hacerlo, de lo contrario el vehículo volverá a estar disponible en el mercado.",
      });
    } catch (err) {
      const error = new Error(err.message);
      error.status = 500;
      return next(err.codigo ? err : error);
    }
  }
);
router.get("/checkPendings", async (req, res, next) => {
  try {
    const sessionId = req.sessionId; // del middleware de cookies
    const rentingsPendientes = await comprobarRentingsPendientes(sessionId);
    const message = rentingsPendientes
      ? "Tienes un renting pendiente de confirmación. Inicia sesión o regístrate para confirmarlo y terminar el proceso."
      : "";
    res.json({
      rentingsPendientes: !!rentingsPendientes,
      message,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(err.codigo ? err : error);
  }
});
router.post(
  "/confirm",
  validateRentingsConfirmar,
  validateRequest,
  async (req, res, next) => {
    try {
      const { idUsuario } = req.body;
      const sessionId = req.sessionId; // del middleware de cookies
      const rentingsPendientes = await comprobarRentingsPendientes(sessionId);
      if (!rentingsPendientes) {
        const error = new Error(
          "No se han encontrado rentings pendientes, vuelve a intentar hacer el renting del vehículo deseado!"
        );
        error.status = 500;
        return next(error);
      }
      const { id_vehiculo, meses, cuota, total } = rentingsPendientes;
      const nuevoPresupuesto = { id_vehiculo, meses, cuota, total, idUsuario };
      const operacionCorrecta = await procesarRenting(nuevoPresupuesto);
      await eliminarRentingTemporal(sessionId);
      res.json({
        ok: operacionCorrecta,
        messageTitle: "Se ha realizado el renting del vehículo correctamente!",
        messageBody:
          "Disfruta de tu nuevo vehiculo! Ahora puedes consultar todos tus gastos(incluidos los del nuevo vehículo), en tu perfil de usuario.",
      });
    } catch (err) {
      const error = new Error(err.message);
      error.status = 500;
      return next(err.codigo ? err : error);
    }
  }
);

router.post(
  "/create",
  validateRentingsCrear,
  validateRequest,
  async (req, res, next) => {
    try {
      const datosRenting = req.body;
      const operacionCorrecta = await procesarRenting(datosRenting);
      res.json({
        ok: operacionCorrecta,
        messageTitle: "Se ha realizado el renting del vehículo correctamente!",
        messageBody:
          "Disfruta de tu nuevo vehiculo! Ahora puedes consultar todos tus gastos(incluidos los del nuevo vehículo), en tu perfil de usuario.",
      });
    } catch (err) {
      const error = new Error(err.message);
      error.status = 500;
      return next(err.codigo ? err : error);
    }
  }
);
export default router;

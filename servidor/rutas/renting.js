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
/**
 * Función reutilizable para la operación de alquilar vehículo.
 * Agregamos el vehículo al presupuesto del usuario y marcamos el vehículo como alquilado.
 * @param {Object} params - Parámetros de la operación.
 * @param {string} params.idUsuario - ID del usuario que alquila el vehículo.
 * @param {string} params.id_vehiculo - ID del vehículo a alquilar.
 * @param {number} params.meses - Cantidad de meses del alquiler.
 * @param {number} params.cuota - Monto de la cuota mensual.
 * @param {number} params.total - Total del contrato.
 * @returns {Boolean} - Si el presupuesto ha podido ser modificado y el vehiculo alquilado.
 */
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
/**
 * @route POST /pending
 * @description Se encarga de realizar la reserva de un vehiculo y ponerlo como renting pendiente de confirmación.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.body - Datos del renting.
 * @param {string} req.body.idVehiculo - ID del vehículo a reservar.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar errores al middleware de manejo.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con el estado de la reserva(si ha sido
 * reservado y el mensaje correspondiente de reserva) o lanza un error en caso de que no se haya realizado.
 */
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
/**
 * @route GET /checkPendings
 * @description Se encarga de comprobar si una id de sesión, que está intentando realizar la reserva de un vehículo,
 * ya tiene vehiculos pendientes de confirmar. Osea que si los tiene, no puede reservar más hasta que confirme el que
 * ya tiene pendiente.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {string} req.sessionId - Sesión id del usuario.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar errores al middleware de manejo.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con el resultado de si ha encontrado rentings pendientes o si ha fallado.
 */
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
/**
 * @route POST /confirm
 * @description Se encarga de comprobar si una id de sesión, que está intentando realizar la confirmación de un vehículo,
 * ya tiene vehiculos pendientes de confirmar, para luego después confirmarlo y eliminarlo de la colección de rentings pendientes,
 * ya que ha sido confirmado.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.body - Datos del renting.
 * @param {string} req.body.idUsuario - ID del usuario que realizará el renting.
 * @param {string} req.sessionId - Sesión id del usuario.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar errores al middleware de manejo.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con el resultado de si ha podido confirmar el renting o si ha fallado.
 */
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
/**
 * @route POST /create
 * @description Se encarga de realizar una creación de un renting de un usuario, el cual ya tiene cuenta registrada.
 * No ha sido necesario id de sesión.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.body - Datos del renting a crear.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar errores al middleware de manejo.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con el resultado de si ha podido crear el renting o si ha fallado.
 */
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

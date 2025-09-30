import { RentingPendiente } from "../schemas/RentingPendiente.js";

const crearRentingPendiente = async (session_id, renting) => {
  try {
    const { idVehiculo, meses, cuota, total } = renting;
    const rentingCreado = await RentingPendiente.create({
      session_id,
      id_vehiculo: idVehiculo,
      meses,
      cuota,
      total,
    });
    return rentingCreado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido crear el renting: ${error.message}`
    );
    nuevoError.codigo = 500;
    throw nuevoError;
  }
};
const comprobarRentingsPendientes = async (session_id) => {
  try {
    const rentingsPendientes = await RentingPendiente.findOne({
      session_id,
    });
    return rentingsPendientes;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido crear el renting: ${error.message}`
    );
    nuevoError.codigo = 500;
    throw nuevoError;
  }
};
const eliminarRentingTemporal = async (session_id) => {
  try {
    const rentingTemporalEliminado = await RentingPendiente.findOneAndDelete({
      session_id,
    });
    return !!rentingTemporalEliminado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido eliminar el renting temporal: ${error.message}`
    );
    nuevoError.codigo = 500;
    throw nuevoError;
  }
};
export {
  crearRentingPendiente,
  comprobarRentingsPendientes,
  eliminarRentingTemporal,
};

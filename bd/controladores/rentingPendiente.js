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
const getLlavesRentings = async () => {
  try {
    const result = await RentingPendiente.aggregate([
      {
        $project: {
          data: { $objectToArray: "$$ROOT" },
        },
      },
      { $project: { data: "$data.k" } },
      { $unwind: "$data" },
      {
        $group: {
          _id: null,
          keys: { $addToSet: "$data" },
        },
      },
      {
        $project: {
          _id: 0,
          keys: 1,
        },
      },
    ]);
    if (!result || result?.length === 0) {
      const nuevoError = new Error(
        `Error en la comprobación de campos. Consulte con el departamento técnico.`
      );
      nuevoError.codigo = 500;
      throw nuevoError;
    }
    const clavesRentings = result[0].keys
      .filter(
        (key) => key !== "session_id" && key !== "creadoEn" && key != "_id"
      )
      .map((key) => {
        return key === "id_vehiculo" ? "idVehiculo" : key;
      });
    return clavesRentings;
  } catch (error) {
    const nuevoError = new Error(
      `No se han podido realizar validaciones: ${error.message}`
    );
    throw nuevoError;
  }
};
export {
  crearRentingPendiente,
  comprobarRentingsPendientes,
  eliminarRentingTemporal,
  getLlavesRentings,
};

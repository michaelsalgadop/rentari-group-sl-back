import { RentingPendiente } from "../schemas/RentingPendiente.js";
/**
 *
 * @param {String} session_id cadena de 36 caracteres que incluye guiones generada por
 * la randomUUID
 * @param {Object} renting Objeto renting que contiene los atributos necesarios para
 * crear un renting pendiente.
 * Entre ellos { idVehiculo, meses, cuota, total }.
 * @returns {Promise<Object>} objeto renting pendiente creado
 */
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
/**
 * Método que comprueba si hay rentings pendientes a la id de sesión pasada por parámetro.
 * @param {String} session_id cadena de 36 caracteres que incluye guiones generada por
 * la randomUUID
 * @returns {Promise<Object>} devuelve si hay algun renting pendiente de la session pasada por parámetro.
 */
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
/**
 * Método que se utiliza para eliminar un renting pendiente. Normalmente se utiliza para cuando el renting
 * ya ha sido confirmado y digamos que este método se utiliza de "limpieza" de la colección de rentings pendientes.
 * @param {String} session_id cadena de 36 caracteres que incluye guiones generada por
 * la randomUUID
 * @returns {Promise<Boolean>} al eliminar el renting pendiente, debe devolver primero el objeto eliminado,
 * y nosotros validamos si ese rentingTemporalEliminado tenia valor, si tiene valor es que ha sido
 * eliminado correctamente y devolverá true sino false(por eso las dos exclamaciones !!).
 */
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
/**
 * Devolvemos todos los nombres de las claves de nuestra colección de Rentings pendientes.
 * Ej: id_vehiculo, meses, cuota, total...
 * @returns {Promise<Array>} array de claves de rentings pendientes.
 */
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

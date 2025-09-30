import { vehiculos } from "../schemas/Vehiculo.js";

const getVehiculos = async () => {
  try {
    const listado = await vehiculos
      .find({ id_usuario: null, estado: "disponible" })
      .populate("tipo_vehiculo_id", "tipo -_id") // quitamos el _id de tipoVehiculo y nos devuelve solo el tipo
      .populate("combustible_id", "tipo -_id");
    const listaVehiculos = listado.map(
      ({
        _id,
        nombre,
        anio,
        precio_renting,
        kilometraje,
        cv,
        imagen,
        tipo_vehiculo_id,
        combustible_id,
      }) => ({
        _id,
        nombre,
        anyo: anio,
        precio: precio_renting,
        kilometros: kilometraje,
        cv,
        urlImagen: imagen,
        tipoVehiculo: tipo_vehiculo_id?.tipo, // por si acaso viene alguno sin haberse asignado bien el id de tipo vehiculo
        combustible: combustible_id?.tipo, // lo mismo que tipo de vehiculo
      })
    );
    if (listaVehiculos?.length === 0) {
      const nuevoError = new Error(
        `No hay ningún vehiculo registrado en la base de datos.`
      );
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return listaVehiculos;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido obtener ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const getVehiculoPorId = async (idVehiculo) => {
  try {
    const vehiculo = await vehiculos
      .findById(idVehiculo)
      .populate("tipo_vehiculo_id", "tipo -_id") // quitamos el _id de tipoVehiculo y nos devuelve solo el tipo
      .populate("combustible_id", "tipo -_id");
    if (!vehiculo) {
      const nuevoError = new Error(
        `No se ha podido encontrar el vehiculo solicitado.`
      );
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    const {
      _id,
      nombre,
      anio: anyo,
      precio_renting: precio,
      kilometraje: kilometros,
      cv,
      imagen: urlImagen,
      tipo_vehiculo_id,
      combustible_id,
    } = vehiculo;

    const vehiculoEncontrado = {
      _id,
      nombre,
      anyo,
      precio,
      kilometros,
      cv,
      urlImagen,
      tipoVehiculo: tipo_vehiculo_id?.tipo,
      combustible: combustible_id?.tipo,
    };

    return vehiculoEncontrado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido obtener ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const reservarVehiculo = async (idVehiculo) => {
  try {
    const vehiculoReservado = await vehiculos.findByIdAndUpdate(idVehiculo, {
      estado: "reservado",
      reservadoHasta: Date.now() + 1 * 60 * 1000,
    });
    if (!vehiculoReservado) {
      const nuevoError = new Error(
        `No se ha podido reservar el vehiculo solicitado.`
      );
      nuevoError.codigo = 500;
      throw nuevoError;
    }
    return true;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido reservar ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const liberarVehiculos = async () => {
  try {
    const result = await vehiculos.updateMany(
      { estado: "reservado", reservadoHasta: { $lte: new Date() } },
      { $set: { estado: "disponible", reservadoHasta: null } }
    );
    return result;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido liberar ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const alquilarVehiculo = async (idUsuario, idVehiculo) => {
  try {
    const result = await vehiculos.findByIdAndUpdate(idVehiculo, {
      $set: {
        id_usuario: idUsuario,
        estado: "alquilado",
        reservadoHasta: null,
      },
    });
    return result;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido liberar ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
export {
  getVehiculos,
  getVehiculoPorId,
  reservarVehiculo,
  liberarVehiculos,
  alquilarVehiculo,
};

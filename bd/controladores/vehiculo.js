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
      // Establecemos fecha límite de 15 minutos. En la próxima vuelta de Cors, se eliminará
      reservadoHasta: new Date(Date.now() + 15 * 60 * 1000), // Date.now() no acepta argumentos dentro, debe ser new Date(argumentos...)
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
const desvincularVehiculosDeUsuario = async (idUsuario) => {
  try {
    const result = await vehiculos.updateMany(
      { id_usuario: idUsuario },
      { $set: { estado: "disponible", id_usuario: null } }
    );
    return result;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido liberar ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const filtrarVehiculos = async (datosFiltro) => {
  try {
    const { buscadorVehiculos, kilometros, orden, precio, anyo } = datosFiltro;
    const filtros = {
      id_usuario: null,
      estado: "disponible",
      ...(buscadorVehiculos && {
        nombre: new RegExp(buscadorVehiculos, "i"),
      }), // <== búsqueda parcial por nombre
      ...(anyo && { anio: { $gte: Number(anyo) } }),
      ...(precio && { precio_renting: { $lte: Number(precio) } }),
      ...(kilometros && { kilometraje: { $gte: Number(kilometros) } }),
    };
    let findOrder = orden;
    switch (findOrder) {
      case "nuevosCoches":
        findOrder = [["anio", -1]];
        break;
      case "menosKm":
        findOrder = "kilometraje";
        break;
      case "masKm":
        findOrder = [["kilometraje", -1]];
        break;
      case "rentingsBajos":
        findOrder = "precio_renting";
        break;
      case "rentingsAltos":
        findOrder = [["precio_renting", -1]];
        break;
      default:
        findOrder = "_id";
        break;
    }
    const listado = await vehiculos
      .find(filtros)
      .populate("tipo_vehiculo_id", "tipo -_id") // quitamos el _id de tipoVehiculo y nos devuelve solo el tipo
      .populate("combustible_id", "tipo -_id")
      .sort(findOrder);
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
        `No hay ningún vehiculo de esas características.`
      );
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return listaVehiculos;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido filtrar ningún vehiculo: ${error.message}`
    );
    throw nuevoError;
  }
};
const getLlavesVehiculos = async () => {
  try {
    const result = await vehiculos.aggregate([
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
    const clavesVehiculos = result[0].keys
      .filter(
        (key) =>
          key !== "_id" &&
          key !== "id_usuario" &&
          key !== "estado" &&
          key !== "reservadoHasta" &&
          key !== "imagen"
      )
      .map((key) => {
        switch (key) {
          case "combustible_id":
            return "combustible";
          case "precio_renting":
            return "precio";
          case "kilometraje":
            return "kilometros";
          case "tipo_vehiculo_id":
            return "tipoVehiculo";
          case "anio":
            return "anyo";
          case "kilometraje":
            return "kilometros";
          case "nombre":
            return "buscadorVehiculos";
          default:
            return key;
        }
      });
    clavesVehiculos.push("orden");
    return clavesVehiculos;
  } catch (error) {
    const nuevoError = new Error(
      `No se han podido realizar validaciones: ${error.message}`
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
  desvincularVehiculosDeUsuario,
  filtrarVehiculos,
  getLlavesVehiculos,
};

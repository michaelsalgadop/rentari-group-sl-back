import { Usuario as usuarios } from "../schemas/Usuario.js";
/**
 * Devuelve un usuario por el correo pasado por parámetro, en caso de que exista.
 * @param {String} correo Correo de un usuario a comprobar.
 * @returns {Object} Usuario encontrado.
 */
const getUsuario = async (correo) => {
  try {
    const usuarioEncontrado = await usuarios.findOne({
      correo: correo,
    });
    if (!usuarioEncontrado) {
      const nuevoError = new Error(`Email incorrecto!`);
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return usuarioEncontrado;
  } catch (err) {
    const nuevoError = new Error("No se ha podido obtener ningún usuario");
    throw err.codigo ? err : nuevoError;
  }
};
/**
 * Comprobar si existe el usuario a comprobar.
 * @param {Object} usuario Usuario con mínimo nombre de usuario y correo.
 * @returns {Object} usuario encontrado, en caso de haberlo encontrado.
 */
const checkearExisteUsuario = async (usuario) => {
  try {
    const usuarioEncontrado = await usuarios.findOne({
      $or: [
        {
          nombreUsuario: usuario.nombreUsuario,
        },
        {
          correo: usuario.correo,
        },
      ],
    });
    return usuarioEncontrado;
  } catch (err) {
    const nuevoError = new Error("No se ha podido obtener ningún usuario");
    throw err.codigo ? err : nuevoError;
  }
};
/**
 * Método para crear un usuario.
 * @param {Object} usuario Usuario a crear.
 * @returns {Object} usuario creado.
 */
const crearUsuario = async (usuario) => {
  try {
    const usuarioCreado = await usuarios.create(usuario);
    return usuarioCreado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido crear el usuario: ${error.message}`
    );
    if (error.name === "ValidationError") {
      nuevoError.codigo = 400;
    } else {
      nuevoError.codigo = 500;
    }
    throw nuevoError;
  }
};
/**
 * Método para eliminar un usuario.
 * @param {ObjectId} idUsuario ObjectId del usuario a eliminar.
 * @returns {Object} usuario eliminado.
 */
const eliminarUsuario = async (idUsuario) => {
  try {
    const usuarioEliminado = await usuarios.findOneAndDelete({
      _id: idUsuario,
    });
    return usuarioEliminado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido eliminar el usuario: ${error.message}`
    );
    if (error.name === "ValidationError") {
      nuevoError.codigo = 400;
    } else {
      nuevoError.codigo = 500;
    }
    throw nuevoError;
  }
};
/**
 * Método para "anonimizar" usuario, el cual ha tenido rentings, pero ya vencieron
 * y ha decidido eliminarlo.
 * @param {ObjectId} idUsuario ObjectId del usuario a desactivar.
 * @returns {Object} usuario desactivado.
 */
const desactivarAnonimizarUsuario = async (idUsuario) => {
  try {
    const usuarioDesactivado = await usuarios.findOneAndUpdate(
      {
        _id: idUsuario,
      },
      [
        /**
         * usando pipeline de actualización (Mongo >= 4.2)
         * $$NOW se usa para asignar la fecha actual
         * Estamos usando un pipeline de actualización ([ {...} ]) que permite usar los valores
         * del documento ($_id, etc.) dentro de la actualización.
         * Esto hace que el correo y el nombre de usuario se anonimicen automáticamente usando el _id
         * del usuario, todo en un solo paso.
         */
        {
          $set: {
            activo: false,
            deletedAt: "$$NOW",
            nombreUsuario: {
              $concat: ["usuario_eliminado_", { $toString: "$_id" }],
            },
            correo: {
              $concat: ["deleted_", { $toString: "$_id" }, "@rentari.com"],
            },
          },
        },
      ],
      { new: true } // devuelve el documento actualizado
    );
    return usuarioDesactivado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido desactivar el usuario: ${error.message}`
    );
    if (error.name === "ValidationError") {
      nuevoError.codigo = 400;
    } else {
      nuevoError.codigo = 500;
    }
    throw nuevoError;
  }
};
/**
 * Método para listar los datos del usuario con el id de usuario pasado por parámetro.
 * @param {ObjectId} idUsuario ObjectId del usuario para obtener sus datos.
 * @returns {Object} usuario con sus datos correspondientes.
 */
const listarDatosUsuario = async (idUsuario) => {
  try {
    const usuarioEncontrado = await usuarios.findById(idUsuario);
    if (!usuarioEncontrado) {
      const nuevoError = new Error(
        `No hay ningún usuario en la base de datos con el usuario actual.`
      );
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return usuarioEncontrado;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido buscar el usuario: ${error.message}`
    );
    if (error.name === "ValidationError") {
      nuevoError.codigo = 400;
    } else {
      nuevoError.codigo = 500;
    }
    throw nuevoError;
  }
};
/**
 * Método para obtener las claves de la colección de usuarios.
 * Ejemplo: id, nombre, correo,...
 * @returns {Array} Array con las claves de la colección.
 */
const getLlavesUsuarios = async () => {
  try {
    const result = await usuarios.aggregate([
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
    const clavesUsuarios = result[0].keys.filter(
      (key) =>
        key !== "_id" &&
        key !== "role" &&
        key !== "activo" &&
        key !== "deletedAt" &&
        key !== "__v"
    );
    return clavesUsuarios;
  } catch (error) {
    const nuevoError = new Error(
      `No se han podido realizar validaciones: ${error.message}`
    );
    throw nuevoError;
  }
};

export {
  getUsuario,
  checkearExisteUsuario,
  crearUsuario,
  eliminarUsuario,
  desactivarAnonimizarUsuario,
  listarDatosUsuario,
  getLlavesUsuarios,
};

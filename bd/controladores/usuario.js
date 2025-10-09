import { Usuario as usuarios } from "../schemas/Usuario.js";

const getUsuario = async (correo) => {
  try {
    const usuarioEncontrado = await usuarios.findOne({
      correo: correo,
    });
    if (!usuarioEncontrado) {
      const nuevoError = new Error(`Email o contraseña incorrectos!`);
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return usuarioEncontrado;
  } catch (err) {
    const nuevoError = new Error("No se ha podido obtener ningún usuario");
    throw err.codigo ? err : nuevoError;
  }
};

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
            contrasenya: null,
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

export {
  getUsuario,
  checkearExisteUsuario,
  crearUsuario,
  eliminarUsuario,
  desactivarAnonimizarUsuario,
  listarDatosUsuario,
};

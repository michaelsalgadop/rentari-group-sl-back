import { Usuario as usuarios } from "../schemas/Usuario.js";

const getUsuario = async (correo) => {
  try {
    const usuarioEncontrado = await usuarios.findOne({
      correo: correo,
    });
    if (!usuarioEncontrado) {
      const nuevoError = new Error(
        `No hay ningún usuario en la base de datos con el correo ${correo}.`
      );
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
  listarDatosUsuario,
};

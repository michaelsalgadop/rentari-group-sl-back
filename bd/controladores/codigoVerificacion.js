import { CodigosVerificacion } from "../schemas/CodigosVerificacion.js";

const crearCodigoVerificacion = async (correoUsuario) => {
  try {
    const codigo = Math.floor(1000 + Math.random() * 9000); // código de 4 dígitos
    const codigoVerificacion = await CodigosVerificacion.create({
      correo: correoUsuario,
      codigo: codigo,
      creadoEn: new Date(),
    });
    return codigoVerificacion;
  } catch (error) {
    const nuevoError = new Error(
      `No se ha podido crear el codigo de verificación: ${error.message}`
    );
    if (error.name === "ValidationError") {
      nuevoError.codigo = 400;
    } else {
      nuevoError.codigo = 500;
    }
    throw nuevoError;
  }
};
export { crearCodigoVerificacion };

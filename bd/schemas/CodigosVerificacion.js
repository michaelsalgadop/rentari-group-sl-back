import { model, Schema } from "mongoose";

const codigosVerificacionSchema = new Schema({
  correo: {
    type: String,
    required: true,
  },
  codigo: {
    type: Number,
    required: true,
  },
  creadoEn: { type: Date, default: Date.now, index: { expires: 900 } }, // 15 min
});
const CodigosVerificacion = model(
  "CodigosVerificacion",
  codigosVerificacionSchema,
  "codigosVerificacion"
);

export { CodigosVerificacion };

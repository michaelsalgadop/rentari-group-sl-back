import { model, Schema } from "mongoose";

const rentingPendienteSchema = new Schema({
  id_vehiculo: {
    type: Schema.Types.ObjectId,
    ref: "vehiculos",
    required: true,
  },
  session_id: {
    type: String, // viene de la cookie (UUID generado con crypto)
    required: true,
    index: true,
  },
  meses: {
    type: Number,
    required: true,
  },
  cuota: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
    index: { expires: 900 }, // 15 minutos
  },
});

const RentingPendiente = model(
  "RentingPendiente",
  rentingPendienteSchema,
  "rentingsPendientes"
);
export { RentingPendiente };

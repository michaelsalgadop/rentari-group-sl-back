import { model, Schema } from "mongoose";

const rentingPendienteSchema = new Schema({
  id_vehiculo: {
    type: Schema.Types.ObjectId,
    ref: "vehiculos",
    required: true,
  },
  session_id: {
    type: String, // viene de tu cookie (UUID generado con crypto)
    required: true,
    index: true,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
    index: { expires: 300 }, // 5 minutos
  },
});

const RentingPendiente = model(
  "RentingPendiente",
  rentingPendienteSchema,
  "rentingsPendientes"
);
export { RentingPendiente };

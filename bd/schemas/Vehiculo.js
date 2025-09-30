import { model, Schema } from "mongoose";
import { TipoVehiculo } from "./TipoVehiculo.js";
import { Combustible } from "./Combustible.js";
import { Usuario } from "./Usuario.js";

const vehiculoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  anio: {
    type: Number,
    required: true,
  },
  tipo_vehiculo_id: {
    type: Schema.Types.ObjectId,
    ref: "TipoVehiculo",
    required: true,
  },
  combustible_id: {
    type: Schema.Types.ObjectId,
    ref: "Combustible",
    required: true,
  },
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    default: null,
  },
  precio_renting: {
    type: Number,
    required: true,
  },
  kilometraje: {
    type: Number,
    required: true,
  },
  cv: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    enum: ["disponible", "reservado", "alquilado"],
    default: "disponible",
  },
  reservadoHasta: Date, // opcional, para caducar reservas
});
const vehiculos = model("vehiculos", vehiculoSchema, "vehiculos");

export { vehiculos };

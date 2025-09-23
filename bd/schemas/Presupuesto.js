import { model, Schema } from "mongoose";
import { Usuario } from "./Usuario.js";
const presupuestoSchema = new Schema({
  total_rentings: {
    type: Number,
    required: true,
  },
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  gasto_total: {
    type: Number,
    required: true,
  },
  gasto_mensual: {
    type: Number,
    required: true,
  },
  coches_rentados: [
    {
      id_vehiculo: {
        type: Schema.Types.ObjectId,
        ref: "vehiculos",
        required: true,
      },
      fecha_inicio: {
        type: Date,
        required: true,
      },
      fecha_fin: {
        type: Date,
      },
      precio_mensual: {
        type: Number,
        required: true,
      },
      meses: {
        type: Number,
        required: true,
      },
      coste_total: {
        type: Number,
        required: true,
      },
      km_contratados_anyo: {
        type: Number,
        required: true,
      },
      km_extra_contratados: {
        type: Number,
        required: true,
      },
      costes_extra: {
        type: Number,
        required: true,
      },
    },
  ],
  fecha_ultimo_renting: {
    type: Date,
  },
});
const Presupuesto = model("Presupuesto", presupuestoSchema, "presupuestos");

export { Presupuesto };

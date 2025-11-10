import { model, Schema } from "mongoose";
import { Usuario } from "./Usuario.js";

/**
 * Esquema de Mongoose para los presupuestos de los usuarios.
 *
 * Representa el estado financiero del usuario en relación con los rentings realizados,
 * incluyendo información agregada (gasto total, mensual, número de rentings)
 * y el detalle de cada vehículo rentado.
 *
 * @schema Presupuesto
 *
 * @property {number} total_rentings - Número total de rentings realizados por el usuario.
 * @property {import('mongoose').Types.ObjectId} id_usuario - Referencia al usuario propietario del presupuesto.
 * @property {number} gasto_total - Gasto total acumulado en todos los rentings del usuario.
 * @property {number} gasto_mensual - Gasto mensual actual sumando todos los rentings activos.
 * @property {Array<Object>} coches_rentados - Lista de vehículos rentados asociados al usuario.
 * @property {import('mongoose').Types.ObjectId} coches_rentados[].id_vehiculo - Referencia al vehículo rentado.
 * @property {Date} coches_rentados[].fecha_inicio - Fecha de inicio del contrato de renting.
 * @property {Date} coches_rentados[].fecha_fin - Fecha de finalización del contrato de renting.
 * @property {number} coches_rentados[].precio_mensual - Precio mensual del renting.
 * @property {number} coches_rentados[].meses - Duración total del contrato (en meses).
 * @property {number} coches_rentados[].coste_total - Coste total del contrato de renting.
 * @property {number} coches_rentados[].km_contratados_anyo - Kilómetros contratados por año.
 * @property {number} coches_rentados[].km_extra_contratados - Kilómetros adicionales contratados.
 * @property {number} coches_rentados[].costes_extra - Costes adicionales asociados al contrato.
 * @property {Date} fecha_ultimo_renting - Fecha del último renting realizado.
 *
 * @collection presupuestos
 *
 * @example
 * // Ejemplo de documento en la colección "presupuestos":
 * {
 *   "_id": ObjectId("672ac8b97cda3b1f9e83a211"),
 *   "id_usuario": ObjectId("672ac8b97cda3b1f9e83a210"),
 *   "total_rentings": 3,
 *   "gasto_total": 18500,
 *   "gasto_mensual": 950,
 *   "coches_rentados": [
 *     {
 *       "id_vehiculo": ObjectId("672ac8b97cda3b1f9e83a201"),
 *       "fecha_inicio": "2025-01-01T00:00:00Z",
 *       "fecha_fin": "2026-01-01T00:00:00Z",
 *       "precio_mensual": 300,
 *       "meses": 12,
 *       "coste_total": 3600,
 *       "km_contratados_anyo": 15000,
 *       "km_extra_contratados": 2000,
 *       "costes_extra": 100
 *     }
 *   ],
 *   "fecha_ultimo_renting": "2025-09-20T00:00:00Z"
 * }
 */
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
        required: true,
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

/**
 * Modelo de Mongoose para interactuar con la colección `presupuestos`.
 *
 * @type {import('mongoose').Model}
 */
const Presupuesto = model("Presupuesto", presupuestoSchema, "presupuestos");

export { Presupuesto };

import { model, Schema } from "mongoose";

/**
 * Esquema de Mongoose para los *rentings pendientes*.
 *
 * Representa un renting temporal que ha sido iniciado por un usuario,
 * pero aún no confirmado. Se almacena durante un tiempo limitado
 * (15 minutos) gracias al índice TTL del campo `creadoEn`.
 *
 * Este modelo permite gestionar procesos intermedios (por ejemplo,
 * selección de vehículo, cálculo de cuotas o validaciones antes del pago final).
 *
 * @schema RentingPendiente
 *
 * @property {import('mongoose').Types.ObjectId} id_vehiculo - Referencia al vehículo que el usuario desea rentar.
 * @property {string} session_id - Identificador único de sesión (UUID generado y guardado en una cookie).
 * @property {number} meses - Duración del renting en meses.
 * @property {number} cuota - Cuota mensual del renting.
 * @property {number} total - Coste total del renting (cuota × meses, incluyendo extras si los hubiera).
 * @property {Date} creadoEn - Fecha de creación del documento; se usa como referencia para el TTL (expira a los 15 minutos).
 *
 * @index session_id - Índice para búsquedas rápidas por sesión.
 * @index creadoEn - Índice TTL de 15 minutos que elimina automáticamente los documentos expirados.
 *
 * @collection rentingsPendientes
 *
 * @example
 * // Ejemplo de documento en la colección "rentingsPendientes":
 * {
 *   "_id": ObjectId("672b0acb9ef41f2f6b1a1e33"),
 *   "id_vehiculo": ObjectId("672ac8b97cda3b1f9e83a201"),
 *   "session_id": "cc3bdf62-741b-4e12-b9a7-91ad8bbfdf62",
 *   "meses": 12,
 *   "cuota": 350,
 *   "total": 4200,
 *   "creadoEn": "2025-11-08T14:30:00.000Z"
 * }
 */
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
    index: { expires: 900 }, // Índice TTL de 15 minutos
  },
});
/**
 * Modelo de Mongoose para interactuar con la colección `rentingsPendientes`.
 *
 * @type {import('mongoose').Model}
 */
const RentingPendiente = model(
  "RentingPendiente",
  rentingPendienteSchema,
  "rentingsPendientes"
);
export { RentingPendiente };

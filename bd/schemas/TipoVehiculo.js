import { model, Schema } from "mongoose";
/**
 * Esquema de Mongoose para los tipos de vehículos disponibles en la base de datos.
 *
 * Representa el tipo de vehículo asociado a un vehículo (por ejemplo: "Familiar", "SUV", "Berlina", etc.).
 *
 * @schema TipoVehiculo
 *
 * @property {string} tipo - Tipo de vehículo. Campo obligatorio.
 *
 * @collection tiposVehiculo
 *
 * @example
 * // Ejemplo de documento en la colección "tiposVehiculo":
 * {
 *  "_id": ObjectId("68879a21a4be4243d06fa3b1"),
 *  "tipo": "Familiar"
 * }
 */
const tipoVehiculoSchema = new Schema({
  tipo: {
    type: String,
    required: true,
  },
});
/**
 * Modelo de Mongoose para interactuar con la colección `tiposVehiculo`.
 *
 * @type {import('mongoose').Model}
 */
const TipoVehiculo = model("TipoVehiculo", tipoVehiculoSchema, "tiposVehiculo");

export { TipoVehiculo };

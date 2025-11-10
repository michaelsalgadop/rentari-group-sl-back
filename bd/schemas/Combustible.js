import { model, Schema } from "mongoose";
/**
 * Esquema de Mongoose para los tipos de combustible disponibles en la base de datos.
 *
 * Representa el tipo de combustible asociado a un vehículo (por ejemplo: "Gasolina", "Diésel", "Eléctrico", etc.).
 *
 * @schema Combustible
 *
 * @property {string} tipo - Tipo de combustible. Campo obligatorio.
 *
 * @collection combustibles
 *
 * @example
 * // Ejemplo de documento en la colección "combustibles":
 * {
 *  "_id": ObjectId("68879d4aa4be4243d06fa3b6"),
 *  "tipo": "Diesel"
 * }
 */
const combustibleSchema = new Schema({
  tipo: {
    type: String,
    required: true,
  },
});
/**
 * Modelo de Mongoose para interactuar con la colección `combustibles`.
 *
 * @type {import('mongoose').Model}
 */
const Combustible = model("Combustible", combustibleSchema, "combustibles");

export { Combustible };

import { model, Schema } from "mongoose";
import { TipoVehiculo } from "./TipoVehiculo.js";
import { Combustible } from "./Combustible.js";
import { Usuario } from "./Usuario.js";
/**
 * Esquema de Mongoose para la colección de **vehículos**.
 *
 * Representa todos los vehículos del sistema de renting, junto con su información
 * técnica, estado de disponibilidad y relaciones con otros modelos.
 *
 * Cada vehículo puede estar asociado a un tipo de vehículo, tipo de combustible
 * y, opcionalmente, a un usuario si está reservado o alquilado.
 *
 * @schema Vehiculo
 *
 * @property {string} nombre - Nombre o modelo del vehículo (por ejemplo: `"Tesla Model 3"`).
 * @property {number} anio - Año de fabricación del vehículo.
 * @property {import('mongoose').Types.ObjectId} tipo_vehiculo_id - Referencia al documento de `TipoVehiculo`.
 * @property {import('mongoose').Types.ObjectId} combustible_id - Referencia al documento de `Combustible`.
 * @property {import('mongoose').Types.ObjectId|null} [id_usuario=null] - Referencia al `Usuario` que tiene el vehículo reservado o alquilado.
 * @property {number} precio_renting - Precio mensual del renting del vehículo.
 * @property {number} kilometraje - Kilometraje actual del vehículo.
 * @property {number} cv - Potencia del vehículo en caballos de vapor (CV).
 * @property {string} imagen - URL o nombre del archivo de imagen representativo del vehículo.
 * @property {"disponible"|"reservado"|"alquilado"} [estado="disponible"] - Estado actual del vehículo.
 * @property {Date} [reservadoHasta] - Fecha límite hasta la que el vehículo permanece reservado.
 *
 * @index tipo_vehiculo_id - Índice de referencia al tipo de vehículo.
 * @index combustible_id - Índice de referencia al tipo de combustible.
 * @index id_usuario - Índice opcional de usuario (para buscar sus vehículos activos).
 *
 * @collection vehiculos
 *
 * @example
 * // Ejemplo de documento en la colección "vehiculos":
 * {
 *   "_id": ObjectId("672b0acb9ef41f2f6b1a1e33"),
 *   "nombre": "Toyota Corolla Hybrid",
 *   "anio": 2023,
 *   "tipo_vehiculo_id": ObjectId("672af9c29bcd1e48c94b3fa5"),
 *   "combustible_id": ObjectId("672af9e09bcd1e48c94b3fa7"),
 *   "id_usuario": null,
 *   "precio_renting": 420,
 *   "kilometraje": 15000,
 *   "cv": 140,
 *   "imagen": "https://example.com/img/corolla.png",
 *   "estado": "disponible",
 *   "reservadoHasta": null
 * }
 */
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
/**
 * Modelo de Mongoose para interactuar con la colección `vehiculos`.
 *
 * @type {import('mongoose').Model}
 */
const vehiculos = model("vehiculos", vehiculoSchema, "vehiculos");

export { vehiculos };

import { model, Schema } from "mongoose";
/**
 * Esquema de Mongoose para los codigos de verificación de usuarios, el cual se aplicará en el futuro.
 *
 * Representa el código de verificación de cada usuario al registrar un nuevo usuario (correo, codigo)
 *
 * @schema CodigosVerificacion
 *
 * @property {string} correo - Correo del usuario a verificar.
 * @property {number} codigo - Código de verificación aleatorio de 4 cifras.
 * @property {Date} creadoEn - Fecha de creación del código. Se usa para el TTL de expiración (15 minutos).
 *
 * @collection codigosVerificacion
 *
 * @example
 * // Ejemplo de documento en la colección "combustibles":
 * {
 *  "_id": ObjectId("68879d4aa4be4243d06fa3b6"),
 *  "correo": "juan@gmail.com",
 *  "codigo": 1234,
 *  "creadoEn": "2025-10-28T12:44:37.638Z"
 * }
 */
const codigosVerificacionSchema = new Schema({
  correo: {
    type: String,
    required: true,
  },
  codigo: {
    type: Number,
    required: true,
  },
  creadoEn: { type: Date, default: Date.now, index: { expires: 900 } }, // Índice TTL de 15 min
});
/**
 * Modelo de Mongoose para interactuar con la colección `codigosVerificacion`.
 *
 * @type {import('mongoose').Model}
 */
const CodigosVerificacion = model(
  "CodigosVerificacion",
  codigosVerificacionSchema,
  "codigosVerificacion"
);

export { CodigosVerificacion };

import { model, Schema } from "mongoose";
/**
 * Esquema de Mongoose para la colección de **usuarios**.
 *
 * Representa a los usuarios registrados en la aplicación, incluyendo
 * su nombre de usuario, correo electrónico, rol asignado y estado de actividad.
 *
 * Este esquema soporta **soft delete** mediante el campo `deletedAt`
 * y un flag booleano `activo`, que permiten desactivar cuentas sin
 * eliminarlas físicamente de la base de datos.
 *
 * @schema Usuario
 *
 * @property {string} nombreUsuario - Nombre único del usuario dentro de la plataforma.
 * @property {string} correo - Correo electrónico único del usuario (usado para autenticación y contacto).
 * @property {string} role - Rol del usuario (por ejemplo: `"user"`, `"admin"`).
 * @property {boolean} [activo=true] - Indica si la cuenta está activa o desactivada.
 * @property {Date|null} [deletedAt=null] - Marca temporal opcional que indica cuándo se desactivó o eliminó la cuenta (para soft delete).
 *
 * @index nombreUsuario - Índice único para garantizar que no se repita el nombre de usuario.
 * @index correo - Índice único para evitar correos duplicados.
 *
 * @collection usuarios
 *
 * @example
 * // Ejemplo de documento en la colección "usuarios":
 * {
 *   "_id": ObjectId("672b0acb9ef41f2f6b1a1e33"),
 *   "nombreUsuario": "juanperez",
 *   "correo": "juanperez@example.com",
 *   "role": "user",
 *   "activo": true,
 *   "deletedAt": null
 * }
 */
const usuarioSchema = new Schema({
  nombreUsuario: {
    type: String,
    required: true,
    unique: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  activo: { type: Boolean, default: true }, // si la cuenta está activa
  deletedAt: { type: Date, default: null }, // timestamp de eliminación
});
/**
 * Modelo de Mongoose para interactuar con la colección `usuarios`.
 *
 * @type {import('mongoose').Model}
 */
const Usuario = model("Usuario", usuarioSchema, "usuarios");

export { Usuario };

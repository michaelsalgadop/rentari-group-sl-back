import { model, Schema } from "mongoose";

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
const Usuario = model("Usuario", usuarioSchema, "usuarios");

export { Usuario };

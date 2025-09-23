import { model, Schema } from "mongoose";

const usuarioSchema = new Schema({
  nombreUsuario: {
    type: String,
    required: true,
    unique: true,
  },
  contrasenya: {
    type: String,
    required: true,
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
});
const Usuario = model("Usuario", usuarioSchema, "usuarios");

export { Usuario };

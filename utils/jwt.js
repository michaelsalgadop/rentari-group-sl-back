import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SECRET_JWT = process.env.SECRET_JWT;

/**
 * Genera un token JWT firmado con la información proporcionada.
 *
 * @param {Object} infoToken - Información a incluir en el payload del token.
 * @param {string} infoToken.idUsuario - ID del usuario (Mongo ObjectId).
 * @param {string} [infoToken.nombreUsuario] - Nombre del usuario.
 * @param {string} [infoToken.role] - Rol del usuario (default: 'user').
 * @returns {string} Token JWT con validez de 2 días.
 *
 * @example
 * const token = crearToken({ idUsuario: "64f1...", nombreUsuario: "Juan", role: "user" });
 */
const crearToken = (infoToken) =>
  jwt.sign({ infoToken }, SECRET_JWT, { expiresIn: "2d" });
/**
 * Valida un token JWT y devuelve la información del payload.
 *
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Información contenida en el payload del token.
 * @throws {Error} Si el token es inválido o ha expirado.
 */
const validarToken = (token) => jwt.verify(token, SECRET_JWT);
/**
 * Middleware de autenticación para rutas protegidas.
 *
 * Comprueba:
 * 1. Que la cabecera Authorization esté presente.
 * 2. Que el token sea válido y no esté caducado.
 * 3. Que la estructura del token contenga `infoToken` y `idUsuario` válido.
 *
 * Inyecta en `req`:
 * - `req.idUsuario` → ObjectId del usuario.
 * - `req.role` → Rol del usuario (por defecto 'user').
 *
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @throws {Error} Con status 403 si la petición no tiene token, el token es inválido o ha caducado.
 *
 * @example
 * router.get("/perfil", authMiddleware, controladorPerfil);
 */
const authMiddleware = (req, res, next) => {
  if (!req.header("Authorization")) {
    const error = new Error("Petición no autorizada");
    error.status = 403;
    return next(error);
  }
  try {
    const token = req.header("Authorization").split(" ")[1];
    const datosToken = validarToken(token);
    const { infoToken } = datosToken;
    // Comprobar que no nos introducen un token inválido
    if (!infoToken || typeof infoToken !== "object") {
      const error = new Error("Token inválido: estructura corrupta");
      error.status = 403;
      return next(error);
    }
    // Validar que idUsuario existe y es un ObjectId válido
    if (
      !infoToken.idUsuario ||
      !mongoose.Types.ObjectId.isValid(infoToken.idUsuario)
    ) {
      const error = new Error("Token inválido: ID de usuario no válido");
      error.status = 403;
      return next(error);
    }
    req.idUsuario = infoToken.idUsuario;
    req.role = infoToken.role ?? "user";
    next();
  } catch (err) {
    if (err.message.includes("expired")) {
      const error = new Error(
        "Token caducado. En caso de tener una sesión abierta, cierre sesión y vuelva a iniciarla. De lo contrario, solamente inicie sesión."
      );
      error.status = 403;
      return next(error);
    }
    next(err);
  }
};
export { crearToken, validarToken, authMiddleware };

import crypto from "crypto";

/**
 * Middleware para crear o reutilizar una cookie de sesión (`sessionId`) para cada usuario.
 *
 * Si el usuario no tiene cookie `sessionId`, se genera un UUID y se establece la cookie
 * con las siguientes opciones:
 * - httpOnly: true (no accesible desde JavaScript en el cliente)
 * - sameSite: 'none' en producción, 'lax' en desarrollo
 * - secure: true en producción, false en desarrollo
 * - path: '/'
 * - maxAge: 20 minutos
 *
 * Si la cookie ya existe, simplemente se asigna `req.sessionId` con su valor.
 *
 * @param {import('express').Request} req - Objeto de la solicitud HTTP.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @example
 * // Uso en el servidor Express:
 * app.use(createCookies);
 */
const createCookies = (req, res, next) => {
  if (!req.cookies.sessionId) {
    const sessionId = crypto.randomUUID();
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 1000 * 60 * 20, //La cookie caduca en 20 minutos
    });
    req.sessionId = sessionId;
  } else {
    req.sessionId = req.cookies.sessionId;
  }
  next();
};
export { createCookies };

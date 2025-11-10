import rateLimit from "express-rate-limit";
// Límite global (protege toda la API)
/**
 * Limitador global para toda la API.
 *
 * Protege contra demasiadas solicitudes desde una misma IP en un período de 15 minutos.
 * Máximo 300 solicitudes por IP por ventana.
 *
 * Devuelve un JSON con mensaje de error si se excede el límite.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 *
 * @example
 * app.use(globalLimiter); // aplicar a toda la API
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: "Demasiadas solicitudes desde esta IP, inténtalo más tarde.",
  },
});
// Límite estricto (login/register,...)
/**
 * Limitador estricto para endpoints de autenticación (login, register, etc.).
 *
 * Protege contra ataques de fuerza bruta limitando a 10 solicitudes por IP cada 5 minutos.
 * Excepción: se ignora la ruta `/profile`.
 *
 * Devuelve un JSON con mensaje de error si se excede el límite.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 *
 * @example
 * app.use("/usuarios", authLimiter, rutasUsuarios); // aplicar solo a rutas de usuarios
 */
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 10, // máximo 10 intentos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message:
      "Demasiados intentos de autenticación, inténtalo de nuevo en unos minutos.",
  },
  skip: (req) => req.path === "/profile", // ignora el middleware /profile
});

export { globalLimiter, authLimiter };

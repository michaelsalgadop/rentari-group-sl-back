import rateLimit from "express-rate-limit";
// Límite global (protege toda la API)
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
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 10 minutos
  limit: 10, // máximo 5 intentos
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

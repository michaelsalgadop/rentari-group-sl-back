import { validationResult } from "express-validator";
/**
 * Middleware para procesar los resultados de validaciones realizadas con `express-validator`.
 *
 * Comprueba si existen errores en la validación de la solicitud (`req`) y,
 * en caso afirmativo, lanza un error con status 400. Si no hay errores, llama a `next()`.
 *
 * Este middleware se debe colocar **después de los validadores** en la cadena de middlewares.
 *
 * @param {import('express').Request} req - Objeto de la solicitud HTTP.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @throws {Error} Con mensaje "Datos de credenciales no válidos! Introduce datos válidos!" y status 400 si hay errores de validación.
 *
 * @example
 * // Uso en una ruta:
 * router.post(
 *   "/pending",
 *   validateRentingsPendientes, // array de validadores
 *   validateRequest,       // este middleware procesa los errores
 *   controladorPending // toda la lógica => (req,res,next) => ...
 * );
 */
const validateRequest = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error(
      "Datos de credenciales no válidos! Introduce datos válidos!"
    );
    error.status = 400;
    return next(error);
  }
  next();
};
export { validateRequest };

import { validationResult } from "express-validator";
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

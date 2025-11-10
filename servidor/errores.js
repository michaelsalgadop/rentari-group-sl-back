import chalk from "chalk";

/**
 * Manejador de errores de servidor al iniciar la aplicación.
 *
 * Comprueba el código del error y muestra un mensaje en consola:
 * - `EADDRINUSE`: el puerto ya está en uso.
 * - Otro error: muestra el mensaje del error.
 *
 * @param {Error} error - Error capturado al iniciar el servidor.
 * @param {number} puerto - Puerto en el que intentaba escuchar el servidor.
 */
const errorServidor = (error, puerto) => {
  if (error.code === "EADDRINUSE") {
    console.error(chalk.bold.red(`El puerto ${puerto} está en uso!`));
  } else {
    console.error(chalk.bold.red(error.message));
  }
};
/**
 * Middleware para manejar rutas no encontradas (404).
 *
 * Devuelve un JSON indicando que la ruta solicitada no existe.
 *
 * @param {import('express').Request} req - Objeto de la solicitud HTTP.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @example
 * // Se debe colocar después de todas las rutas definidas:
 * app.use(error404);
 */
const error404 = (req, res, next) => {
  res
    .status(404)
    .json({ error: true, mensaje: "No se ha encontrado esta ruta" });
};
/**
 * Middleware para manejar errores generales de la aplicación.
 *
 * Captura errores lanzados en la aplicación y devuelve un JSON con
 * el código y mensaje del error. Si no se especifica status, devuelve 500.
 *
 * @param {Error} err - Objeto de error lanzado.
 * @param {import('express').Request} req - Objeto de la solicitud HTTP.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware.
 *
 * @example
 * // Se debe colocar como último middleware:
 * app.use(errorGeneral);
 */
const errorGeneral = (err, req, res, next) => {
  const codigo = err.status || 500;
  const mensaje = err.message || "Error general";
  res.status(codigo).json({ error: true, message: mensaje });
};

export { errorServidor, error404, errorGeneral };

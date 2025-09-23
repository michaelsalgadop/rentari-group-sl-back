import chalk from "chalk";

const errorServidor = (error, puerto) => {
  if (error.code === "EADDRINUSE") {
    console.error(chalk.bold.red(`El puerto ${puerto} está en uso!`));
  } else {
    console.error(chalk.bold.red(error.message));
  }
};

const error404 = (req, res, next) => {
  res
    .status(404)
    .json({ error: true, mensaje: "No se ha encontrado esta ruta" });
};

const errorGeneral = (err, req, res, next) => {
  const codigo = err.status || 500;
  const mensaje = err.message || "Error general";
  res.status(codigo).json({ error: true, message: mensaje });
};

export { errorServidor, error404, errorGeneral };

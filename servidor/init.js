import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import chalk from "chalk";
import pkg from "debug";
import express from "express";
import { errorServidor } from "./errores.js";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("Rentari:Init-Server");

const app = express();

const puerto = process.env.PORT || 4000;

const server = app.listen(puerto, () =>
  debug(chalk.bold.green(`Servidor escuchando puerto ${puerto}`))
);

server.on("error", (error) => errorServidor(error, puerto));

export { app };

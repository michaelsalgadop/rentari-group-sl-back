import chalk from "chalk";
import pkg from "debug";

import { iniciarConexionBBDD } from "./init.js";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("Rentari:Index");

const controladorMain = async () => {
  try {
    const bbddIniciada = await iniciarConexionBBDD();
    if (!bbddIniciada) throw new Error("No se ha podido iniciar la BBDD!");
  } catch (error) {
    debug(chalk.bold.red(error.message));
    process.exit(1);
  }
};
controladorMain();

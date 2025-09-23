import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import chalk from "chalk";
import pkg from "debug";
import mongoose from "mongoose";
const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("Rentari:Init");
const iniciarConexionBBDD = async () => {
  try {
    if (!process.env.URL_CONEXION)
      throw new Error("No se ha encontrado la URL de conexión!");
    await mongoose.connect(process.env.URL_CONEXION);
    debug(chalk.bold.greenBright("BBDD iniciada!"));
    return true;
  } catch (error) {
    debug(chalk.bold.red(`Error al conectar con la BBDD: ${error.message}`));
    return false;
  }
};
export { iniciarConexionBBDD };

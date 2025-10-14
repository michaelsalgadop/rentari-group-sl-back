import { query } from "express-validator";
import { getLlavesVehiculos } from "../../bd/controladores/vehiculo.js";
// Expresión regular antiinyección
const regexInyeccion =
  /('(?!\w)|`|\/\*|\*\/|´|"|;|=|<|>|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b|%|\(|\)|\*|\$|\.(?!\w)|\{|\}|\||\[|\]|\n|:)/i;
const peticionVacia = (peticion) => Object.keys(peticion).length === 0;
const testInyeccion = (peticion) => {
  const invalido = Object.keys(peticion).filter((k) => regexInyeccion.test(k));
  return invalido.length > 0;
};
const testCamposValidosVehiculos = async (peticion) => {
  try {
    const clavesValidas = await getLlavesVehiculos();
    const claveInvalida = Object.keys(peticion).some(
      (llave) => !clavesValidas.find((claveValida) => claveValida === llave)
    );
    return claveInvalida;
  } catch (error) {
    throw new Error(error.message);
  }
};
const queryValidaVehiculos = query().custom(async (_, { req }) => {
  const peticion = req.query;
  if (peticionVacia(peticion))
    throw new Error("Petición inválida. Haga una petición correcta!");
  if (testInyeccion(peticion))
    throw new Error(`Parámetros no permitidos. Introduzca parámetros válidos!`);
  if (await testCamposValidosVehiculos(peticion))
    throw new Error("Parámetros no permitidos. Introduzca parámetros válidos!");
  return true;
});
export { regexInyeccion, queryValidaVehiculos };

// Expresión regular antiinyección
const regexInyeccion =
  /('(?!\w)|`|\/\*|\*\/|´|"|;|=|<|>|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b|%|\(|\)|\*|\$|\.(?!\w)|\{|\}|\||\[|\]|\n|:)/i;

const mensajeParametrosNoPermitidos =
  "Parámetros no permitidos. Introduzca parámetros válidos!";

const peticionVacia = (peticion) => Object.keys(peticion).length === 0;

const testInyeccion = (peticion) => {
  const invalido = Object.keys(peticion).filter((k) => regexInyeccion.test(k));
  return invalido.length > 0;
};

const testGeneral = (peticion) => {
  if (peticionVacia(peticion))
    throw new Error("Petición inválida. Haga una petición correcta!");
  if (testInyeccion(peticion)) throw new Error(mensajeParametrosNoPermitidos);
  return true;
};

const rastrearClaveInvalida = (peticion, arrayClavesValidas) => {
  if (!peticion || !Array.isArray(arrayClavesValidas))
    throw new Error(
      "Se ha producido un error. O la petición no es válida o no se ha recibido un array de claves correctamente."
    );
  const claveInvalida = Object.keys(peticion).some(
    (llave) => !arrayClavesValidas.find((claveValida) => claveValida === llave)
  );
  return claveInvalida;
};

export {
  regexInyeccion,
  mensajeParametrosNoPermitidos,
  testGeneral,
  rastrearClaveInvalida,
};

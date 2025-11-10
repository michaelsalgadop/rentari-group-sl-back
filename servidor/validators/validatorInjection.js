// Expresión regular antiinyección
/**
 * Expresión regular para detectar patrones de inyección de código
 * en strings o claves de objetos. Detecta comillas, backticks, comentarios,
 * operadores SQL y caracteres especiales.
 * @type {RegExp}
 */
const regexInyeccion =
  /('(?!\w)|`|\/\*|\*\/|´|"|;|=|<|>|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b|%|\(|\)|\*|\$|\.(?!\w)|\{|\}|\||\[|\]|\n|:)/i;
/**
 * Mensaje de error estándar para parámetros no permitidos.
 * @type {string}
 */
const mensajeParametrosNoPermitidos =
  "Parámetros no permitidos. Introduzca parámetros válidos!";
/**
 * Comprueba si nos han pasado una petición vacía.
 *
 * @param {Object} peticion - Objeto petición a evaluar.
 * @returns {boolean} true si está vacío, false en caso contrario.
 */
const peticionVacia = (peticion) => Object.keys(peticion).length === 0;
/**
 * Comprueba si alguna clave de la petición contiene patrones de inyección.
 *
 * @param {Object} peticion - Objeto a evaluar.
 * @returns {boolean} true si se detecta inyección, false en caso contrario.
 */
const testInyeccion = (peticion) => {
  const invalido = Object.keys(peticion).filter((k) => regexInyeccion.test(k));
  return invalido.length > 0;
};
/**
 * Validación general de seguridad para una petición.
 * Comprueba que la petición no esté vacía y que no contenga patrones de inyección.
 *
 * @param {Object} peticion - Objeto de la petición (req.body, req.query, etc.)
 * @throws {Error} Si la petición está vacía o contiene parámetros no permitidos.
 * @returns {boolean} true si la petición pasa todas las comprobaciones.
 */
const testGeneral = (peticion) => {
  if (peticionVacia(peticion))
    throw new Error("Petición inválida. Haga una petición correcta!");
  if (testInyeccion(peticion)) throw new Error(mensajeParametrosNoPermitidos);
  return true;
};
/**
 * Comprueba si la petición contiene alguna clave que no esté en el array de claves válidas.
 *
 * @param {Object} peticion - Objeto de la petición (req.body, req.query, etc.)
 * @param {string[]} arrayClavesValidas - Lista de claves permitidas.
 * @throws {Error} Si no se proporciona un objeto de petición o un array de claves válido.
 * @returns {boolean} true si hay al menos una clave inválida, false si todas son válidas.
 */
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

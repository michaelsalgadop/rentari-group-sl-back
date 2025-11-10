import { regexInyeccion } from "./validatorInjection.js";
/**
 * Comprueba si un parámetro de query está vacío o es undefined.
 *
 * @param {*} valor - Valor a evaluar.
 * @returns {boolean} true si está vacío o undefined, false en caso contrario.
 */
const queryParamVacio = (valor) =>
  typeof valor === "undefined" || valor.length === 0;
/**
 * Comprueba si un valor es un objeto válido (no nulo).
 *
 * @param {*} valor - Valor a evaluar.
 * @returns {boolean} true si es objeto y no null, false en caso contrario.
 */
const esObjeto = (valor) => typeof valor === "object" && valor !== null;

// Validador que usa la regex
/**
 * Validador que rechaza inyecciones de código en strings.
 *
 * @param {*} valor - Valor a validar.
 * @returns {boolean} true si es seguro o vacío, false si contiene patrones de inyección.
 */
const noInjection = (valor) => {
  if (queryParamVacio(valor)) return true;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  return !regexInyeccion.test(valor);
};
/**
 * Comprueba si un valor es un número válido (para filtros opcionales).
 * No permite objetos ni arrays.
 *
 * @param {*} valor - Valor a validar.
 * @returns {boolean} true si es un número o vacío, false en caso contrario.
 */
const isNumberFilter = (valor) => {
  /* no se permiten arrays ni objetos*/
  if (esObjeto(valor) || Array.isArray(valor)) return false;
  return queryParamVacio(valor) || !isNaN(parseInt(valor));
};
/**
 * Comprueba si un valor es un número entero obligatorio.
 * No permite objetos ni arrays.
 *
 * @param {*} valor - Valor a validar.
 * @returns {boolean} true si es un entero válido, false en caso contrario.
 */
const isObligatoriIntNumber = (valor) => {
  /* no se permiten arrays ni objetos*/
  if (esObjeto(valor) || Array.isArray(valor)) return false;
  return !isNaN(parseInt(valor));
};
/**
 * Comprueba si un valor es un número float obligatorio.
 * No permite objetos ni arrays.
 *
 * @param {*} valor - Valor a validar.
 * @returns {boolean} true si es un float válido, false en caso contrario.
 */
const isObligatoriFloatNumber = (valor) => {
  /* no se permiten arrays ni objetos*/
  if (esObjeto(valor) || Array.isArray(valor)) return false;
  return !isNaN(parseFloat(valor));
};
/**
 * Comprueba si un año es válido.
 *
 * @param {*} valor - Año a validar.
 * @returns {boolean} true si es 0 o menor o igual al año actual, false en caso contrario.
 */
const anyoValido = (valor) => {
  if (esObjeto(valor) || isNaN(valor)) return false;
  const valorNumerico = parseInt(valor);
  return valorNumerico === 0 || valorNumerico <= new Date().getFullYear();
};
/**
 * Comprueba si un correo electrónico es válido y pertenece a dominios permitidos.
 *
 * @param {*} valor - Correo a validar.
 * @returns {boolean} true si es válido, false en caso contrario.
 */
const correoValido = (valor) => {
  if (queryParamVacio(valor)) return false;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  const regexValido =
    /^[a-zA-Z0-9._%+-]+@(outlook|gmail|yahoo|hotmail){1}\.[a-zA-Z]{2,}$/;
  return regexValido.test(valor);
};
/**
 * Comprueba si un nombre de usuario es válido.
 *
 * @param {*} valor - Nombre de usuario a validar.
 * @returns {boolean} true si solo contiene letras, números, guiones o guiones bajos; false en caso contrario.
 */
const nombreUsuarioValido = (valor) => {
  if (queryParamVacio(valor)) return false;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  const regexValido = /^[a-zA-Z0-9_-]+$/;
  return regexValido.test(valor);
};
export {
  queryParamVacio,
  esObjeto,
  noInjection,
  isNumberFilter,
  isObligatoriIntNumber,
  isObligatoriFloatNumber,
  anyoValido,
  correoValido,
  nombreUsuarioValido,
};

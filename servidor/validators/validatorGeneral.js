import { regexInyeccion } from "./validatorInjection.js";

const queryParamVacio = (valor) =>
  typeof valor === "undefined" || valor.length === 0;
const esObjeto = (valor) => typeof valor === "object" && valor !== null;

// Validador que usa la regex
const noInjection = (valor) => {
  if (queryParamVacio(valor)) return true;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  return !regexInyeccion.test(valor);
};

const isNumberFilter = (valor) => {
  /* no se permiten arrays ni objetos*/
  if (esObjeto(valor) || Array.isArray(valor)) return false;
  return queryParamVacio(valor) || !isNaN(parseInt(valor));
};

const anyoValido = (valor) => {
  if (esObjeto(valor) || isNaN(valor)) return false;
  const valorNumerico = parseInt(valor);
  return valorNumerico === 0 || valorNumerico <= new Date().getFullYear();
};

const correoValido = (valor) => {
  if (queryParamVacio(valor)) return false;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  const regexValido =
    /^[a-zA-Z0-9._%+-]+@(outlook|gmail|yahoo|hotmail){1}\.[a-zA-Z]{2,}$/;
  return regexValido.test(valor);
};
const nombreUsuarioValido = (valor) => {
  if (queryParamVacio(valor)) return false;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  const regexValido = /^[a-zA-Z0-9_-]{3,20}$/;
  return regexValido.test(valor);
};
const contrasenyaValida = (valor) => {
  if (queryParamVacio(valor)) return false;
  if (esObjeto(valor) || typeof valor !== "string") return false; // no aplica si no es string
  const regexValido =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!¡%*&])[A-Za-z\d@$!¡%*&]{8,}$/;
  return regexValido.test(valor);
};
export {
  queryParamVacio,
  esObjeto,
  noInjection,
  isNumberFilter,
  anyoValido,
  correoValido,
  nombreUsuarioValido,
  contrasenyaValida,
};

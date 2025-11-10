import express from "express";
import {
  filtrarVehiculos,
  getVehiculoPorId,
  getVehiculos,
} from "../../bd/controladores/vehiculo.js";
import { validateRequest } from "../validators/validatorRequest.js";
import {
  validateVehiculoFilter,
  validateVehiculoId,
} from "../validators/vehiculos/validatorVehiculos.js";

const router = express.Router();
/**
 * @route GET /vehiculos
 * @description
 * Obtiene el listado completo de vehículos disponibles en la base de datos.
 * Esta ruta no requiere autenticación y devuelve un arreglo con los vehículos y sus datos relevantes.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con el listado de vehículos.
 *
 * @example
 * // Respuesta exitosa:
 * {
 *   "listadoVehiculos": [
 *     {
 *       "_id": "6728b9c4c4a0d1f4d83e9b21",
 *       "nombre": "Tesla",
 *       "anio": 2012,
 *       "precio_renting": 500,
 *       "estado": "disponible",
 *        ...
 *     },
 *     {
 *       "_id": "6728b9c4c4a0d1f4d83e9b22",
 *       "nombre": "BMW",
 *       "anio": 2015,
 *       "precio_renting": 670,
 *       "estado": "disponible",
 *        ...
 *     }
 *   ]
 * }
 *
 * @throws {Error} 500 - Si ocurre un error al obtener el listado de vehículos desde la base de datos.
 */
router.get("/vehiculos", async (req, res, next) => {
  try {
    const listadoVehiculos = await getVehiculos();

    res.json({ listadoVehiculos });
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(err.codigo ? err : error);
  }
});
/**
 * @route GET /vehiculo/:idVehiculo
 * @description
 * Obtiene la información detallada de un vehículo específico según su ID.
 * Si el vehículo no existe, el middleware de validación se encarga de manejar el error antes de llegar a esta lógica.
 *
 * @middleware
 * - `validateVehiculoId`: Verifica que el parámetro `idVehiculo` sea válido y exista en la base de datos.
 * - `validateRequest`: Gestiona los errores de validación si los hay.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {string} req.params.idVehiculo - ID del vehículo a consultar.
 *
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con los datos del vehículo encontrado.
 *
 * @example
 * // Solicitud:
 * GET /vehiculo/6728b9c4c4a0d1f4d83e9b21
 *
 * // Respuesta exitosa:
 *   "vehiculoEncontrado": {
 *     "_id": "6728b9c4c4a0d1f4d83e9b21",
 *     "nombre": "BMW",
 *     "anio": 2015,
 *     "precio_renting": 670,
 *     "estado": "disponible",
 *     ...
 *   }
 *
 * @throws {Error} 400 - Si el ID proporcionado no es válido (detectado por el middleware).
 * @throws {Error} 404 - Si no se encuentra ningún vehículo con el ID especificado.
 * @throws {Error} 500 - Si ocurre un error inesperado al recuperar los datos.
 */
router.get(
  "/vehiculo/:idVehiculo",
  validateVehiculoId,
  validateRequest,
  async (req, res, next) => {
    try {
      const { idVehiculo } = req.params;
      const vehiculoEncontrado = await getVehiculoPorId(idVehiculo);
      res.json({ vehiculoEncontrado });
    } catch (err) {
      const error = new Error(err.message);
      error.status = 500;
      return next(err.codigo ? err : error);
    }
  }
);
/**
 * @route GET /vehiculos/filter
 * @description
 * Filtra el listado de vehículos según los parámetros de consulta recibidos.
 * Permite obtener vehículos que coincidan con criterios como buscadorVehiculos(incluye nombre,
 * modelo o por ejemplo serie del vehículo), precio, año, entre otros.
 * Si no se pasan filtros, devuelve todos los vehículos disponibles.
 *
 * @middleware
 * - `validateVehiculoFilter`: Valida los parámetros de filtrado permitidos.
 * - `validateRequest`: Gestiona errores de validación antes de ejecutar la lógica principal.
 *
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {Object} req.query - Parámetros de filtro enviados por query string.
 * @param {string} [req.query.buscadorVehiculos] - Marca del vehículo, nombre... (opcional).
 * @param {string} [req.query.precio] - Precio de renting del vehículo mínimo (opcional).
 * @param {number} [req.query.anyo] - Año del vehículo mínimo (opcional).
 * @param {number} [req.query.kilometros] - Kilometros mínimos del vehículo (opcional).
 * @param {string} [req.query.orden] - Orden del listado (por ejemplo: "nuevosCoches", "menosKm", "masKm", "rentingsBajos").
 *
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware o manejador de errores.
 *
 * @returns {Promise<void>} Envía una respuesta JSON con la lista de vehículos filtrados.
 *
 * @example
 * // Solicitud:
 * GET /vehiculos/filter?buscadorVehiculos=Tesla&precio=400
 *
 * // Respuesta exitosa:
 * {
 *   "listadoVehiculos": [
 *     {
 *       "_id": "6728b9c4c4a0d1f4d83e9b21",
 *       "nombre": "Tesla...",
 *       "precio": 550,
 *       "anyo": 2020,
 *       "estado": "disponible",
 *        ...
 *     }
 *   ]
 * }
 *
 * @throws {Error} 400 - Si alguno de los parámetros de filtro no es válido.
 * @throws {Error} 500 - Si ocurre un error al realizar la búsqueda o al acceder a la base de datos.
 */
router.get(
  "/vehiculos/filter",
  validateVehiculoFilter,
  validateRequest,
  async (req, res, next) => {
    try {
      const datosFiltro = req.query;
      const listadoVehiculos = await filtrarVehiculos(datosFiltro);
      res.json({ listadoVehiculos });
    } catch (err) {
      const error = new Error(err.message);
      error.status = 500;
      return next(err.codigo ? err : error);
    }
  }
);
export default router;

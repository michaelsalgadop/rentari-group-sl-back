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

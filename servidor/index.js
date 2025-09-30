import morgan from "morgan";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { app } from "./init.js";
import rutasUsuarios from "./rutas/usuario.js";
import rutasVehiculos from "./rutas/vehiculo.js";
import rutasRentings from "./rutas/renting.js";
import { error404, errorGeneral } from "./errores.js";
import { createCookies } from "../utils/cookies.js";
import { liberarVehiculos } from "../bd/controladores/vehiculo.js";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(morgan("dev"));
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // 👈 clave para que las cookies viajen
  })
);
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(createCookies);
// Tarea: cada minuto libera vehículos cuyo reservadoHasta ya expiró
cron.schedule("*/15 * * * *", async () => {
  try {
    const result = await liberarVehiculos();
    if (result.modifiedCount > 0)
      console.log(`Liberados ${result.modifiedCount} vehículos.`);
  } catch (err) {
    console.error("Error liberando vehículos:", err);
  }
});
app.use("/usuarios", rutasUsuarios);
app.use("/search", rutasVehiculos);
app.use("/rentings", rutasRentings);

app.use(error404);
app.use(errorGeneral);

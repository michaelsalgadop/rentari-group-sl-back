import morgan from "morgan";
import express from "express";
import cors from "cors";

import { app } from "./init.js";
import rutasUsuarios from "./rutas/usuario.js";
import rutasVehiculos from "./rutas/vehiculo.js";
import { error404, errorGeneral } from "./errores.js";

app.use(morgan("dev"));
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use("/usuarios", rutasUsuarios);
app.use("/search", rutasVehiculos);

app.use(error404);
app.use(errorGeneral);

import { model, Schema } from "mongoose";

const tipoVehiculoSchema = new Schema({
  tipo: {
    type: String,
    required: true,
  },
});
const TipoVehiculo = model("TipoVehiculo", tipoVehiculoSchema, "tiposVehiculo");

export { TipoVehiculo };

import { model, Schema } from "mongoose";

const combustibleSchema = new Schema({
  tipo: {
    type: String,
    required: true,
  },
});
const Combustible = model("Combustible", combustibleSchema, "combustibles");

export { Combustible };

import { Presupuesto as presupuestos } from "../schemas/Presupuesto.js";
const getPresupuestoUsuario = async (idUsuario) => {
  try {
    const presupuestoEncontrado = await presupuestos.findOne({
      id_usuario: idUsuario,
    });
    if (!presupuestoEncontrado) {
      const nuevoError = new Error(
        `No hay ningún presupuesto en la base de datos con el usuario actual.`
      );
      nuevoError.codigo = 404;
      throw nuevoError;
    }
    return presupuestoEncontrado;
  } catch (error) {
    const nuevoError = new Error("No se ha podido obtener ningún presupuesto");
    throw error.codigo ? error : nuevoError;
  }
};
const crearNuevoPresupuesto = async (idUsuario) => {
  try {
    const presupuestoCreado = await presupuestos.create({
      total_rentings: 0,
      id_usuario: idUsuario,
      gasto_total: 0,
      gasto_mensual: 0,
      coches_rentados: [],
      fecha_ultimo_renting: null,
    });
    return presupuestoCreado;
  } catch (error) {
    const nuevoError = new Error("No se ha podido crear ningún presupuesto");
    throw error.codigo ? error : nuevoError;
  }
};
const eliminarPresupuesto = async (idUsuario) => {
  try {
    const presupuestoEliminado = await presupuestos.findOneAndDelete({
      id_usuario: idUsuario,
    });
    return presupuestoEliminado;
  } catch (error) {
    const nuevoError = new Error("No se ha podido eliminar el presupuesto");
    throw error.codigo ? error : nuevoError;
  }
};
const agregarVehiculoAlPresupuesto = async (datosPresupuesto) => {
  try {
    const { id_vehiculo, meses, cuota, total, idUsuario } = datosPresupuesto;
    const presupuestoModificado = await presupuestos.findOneAndUpdate(
      {
        id_usuario: idUsuario,
      },
      {
        $inc: { total_rentings: 1, gasto_total: total, gasto_mensual: cuota },
        $push: {
          coches_rentados: {
            id_vehiculo,
            fecha_inicio: new Date(),
            fecha_fin: null,
            precio_mensual: cuota,
            meses,
            coste_total: total,
            km_contratados_anyo: 20000,
            km_extra_contratados: 0,
            costes_extra: 0,
          },
        },
        fecha_ultimo_renting: new Date(),
      }
    );
    if (!presupuestoModificado) {
      const nuevoError = new Error(`No se pudo modificar el vehículo.`);
      nuevoError.codigo = 500;
      throw nuevoError;
    }
    return presupuestoModificado;
  } catch (error) {
    const nuevoError = new Error("No se ha podido modificar el presupuesto");
    throw error.codigo ? error : nuevoError;
  }
};
export {
  getPresupuestoUsuario,
  crearNuevoPresupuesto,
  eliminarPresupuesto,
  agregarVehiculoAlPresupuesto,
};

import { Presupuesto as presupuestos } from "../schemas/Presupuesto.js";
const MODOS_RENTING = {
  NO_HAY: 0,
  HAY_ACTIVOS: 1,
  HA_HABIDO: 2,
};
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
    const fechaActual = new Date();
    const fechaFinRenting = new Date(fechaActual);
    fechaFinRenting.setMonth(fechaFinRenting.getMonth() + parseInt(meses));
    const presupuestoModificado = await presupuestos.findOneAndUpdate(
      {
        id_usuario: idUsuario,
      },
      {
        $inc: { total_rentings: 1, gasto_total: total, gasto_mensual: cuota },
        $push: {
          coches_rentados: {
            id_vehiculo,
            fecha_inicio: fechaActual,
            fecha_fin: fechaFinRenting,
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
const hayRentingsActivos = async (idUsuario) => {
  try {
    const presupuestoUsuario = await presupuestos.findOne({
      id_usuario: idUsuario,
    });
    if (!presupuestoUsuario) {
      const nuevoError = new Error(
        `No se encontró la ficha del usuario al revisar rentings activos.`
      );
      nuevoError.codigo = 500;
      throw nuevoError;
    }
    if (presupuestoUsuario.coches_rentados?.length === 0)
      return MODOS_RENTING.NO_HAY;

    const fechaRentingMasAlta = Math.max(
      ...presupuestoUsuario.coches_rentados.map(({ fecha_fin }) =>
        new Date(fecha_fin).getTime()
      )
    );
    return fechaRentingMasAlta >= new Date().getTime()
      ? MODOS_RENTING.HAY_ACTIVOS
      : MODOS_RENTING.HA_HABIDO;
  } catch (error) {
    const nuevoError = new Error(
      "No se ha podido comprobar si habían rentings activos"
    );
    throw error.codigo ? error : nuevoError;
  }
};

export {
  getPresupuestoUsuario,
  crearNuevoPresupuesto,
  eliminarPresupuesto,
  agregarVehiculoAlPresupuesto,
  hayRentingsActivos,
  MODOS_RENTING,
};

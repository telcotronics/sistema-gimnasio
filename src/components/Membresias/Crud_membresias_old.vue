<template>
  <div class="membresias-container">
    <div class="encabezado">
      <h1>Gestión de Membresías</h1>
      <router-link to="/crear_planes" class="boton crear">
        <i class="fas fa-plus"></i> Nueva Membresía
      </router-link>
    </div>
    
    <!-- Alerta para mostrar mensajes -->
    <div v-if="mensaje" :class="['alerta', mensaje.tipo]">
      {{ mensaje.texto }}
    </div>
    
    <!-- Tabla de membresías -->
    <div class="tabla-container">
      <table class="tabla-membresias">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Grupo</th>
            <th>Valor</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="membresia in membresias" :key="membresia.ID" :class="{'inactiva': membresia.Estado === 'Inactiva'}">
            <td>{{ membresia.ID }}</td>
            <td>{{ membresia.Nombre }}</td>
            <td>{{ formatearFecha(membresia.Fecha_Inicio) }}</td>
            <td>{{ formatearFecha(membresia.Fecha_Fin) }}</td>
            <td>{{ membresia.Grupo }}</td>
            <td>${{ formatearValor(membresia.Valor) }}</td>
            <td><span :class="'estado ' + membresia.Estado.toLowerCase()">{{ membresia.Estado }}</span></td>
            <td>{{ formatearFecha(membresia.Fecha_Creacion) }}</td>
            <td>{{ formatearFecha(membresia.Fecha_Modificacion) }}</td>
            <td class="acciones">
              <button @click="editarMembresia(membresia)" class="boton editar">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button @click="confirmarEliminar(membresia.ID)" class="boton eliminar">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para editar o crear membresía -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-contenido">
        <h2>{{ modoEdicion ? 'Editar' : 'Crear' }} Membresía</h2>
        <form @submit.prevent="guardarCambios">
          <div class="form-grupo">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" v-model="membresiaEditando.Nombre" required>
          </div>
          
          <div class="form-grupo">
            <label for="fechaInicio">Fecha Inicio:</label>
            <input type="date" id="fechaInicio" v-model="membresiaEditando.Fecha_Inicio" required>
          </div>
          
          <div class="form-grupo">
            <label for="fechaFin">Fecha Fin:</label>
            <input type="date" id="fechaFin" v-model="membresiaEditando.Fecha_Fin" required>
          </div>
          
          <div class="form-grupo">
            <label for="grupo">Grupo:</label>
            <input type="text" id="grupo" v-model="membresiaEditando.Grupo">
          </div>
          
          <div class="form-grupo">
            <label for="valor">Valor:</label>
            <input type="number" id="valor" v-model="membresiaEditando.Valor" required step="0.01">
          </div>
          
          <div class="form-grupo">
            <label for="estado">Estado:</label>
            <select id="estado" v-model="membresiaEditando.Estado">
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
          
          <div class="botones-modal">
            <button type="button" @click="cerrarModal" class="boton cancelar">Cancelar</button>
            <button type="submit" class="boton guardar">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para confirmar eliminación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal-contenido confirmacion">
        <h2>Confirmar Eliminación</h2>
        <p>¿Está seguro que desea eliminar esta membresía? Esta acción no se puede deshacer.</p>
        <div class="botones-modal">
          <button @click="mostrarConfirmacion = false" class="boton cancelar">Cancelar</button>
          <button @click="eliminarMembresia" class="boton eliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MembresiasTabla',
  data() {
    return {
      membresias: [],
      membresiaEditando: null,
      mostrarModal: false,
      mostrarConfirmacion: false,
      idEliminar: null,
      mensaje: null,
      modoEdicion: true // true para editar, false para crear
    }
  },
  created() {
    this.cargarMembresias();
  },
  methods: {
    // Cargar datos de membresías desde la API
    async cargarMembresias() {
      try {
        // Reemplazar URL con la correcta de tu API
        const response = await axios.get('/api/membresias');
        this.membresias = response.data;
      } catch (error) {
        this.mostrarMensaje('Error al cargar las membresías', 'error');
        console.error('Error al cargar los datos:', error);
      }
    },
    
    // Formatear fecha para mostrar en formato legible
    formatearFecha(fecha) {
      if (!fecha) return '-';
      const date = new Date(fecha);
      return date.toLocaleDateString();
    },
    
    // Formatear valor para mostrar con formato de moneda
    formatearValor(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Abrir modal para editar membresía
    editarMembresia(membresia) {
      // Clonar la membresía para evitar cambios directos en el objeto original
      this.membresiaEditando = { ...membresia };
      // Formatear fechas para input type="date"
      if (this.membresiaEditando.Fecha_Inicio) {
        this.membresiaEditando.Fecha_Inicio = this.formatearFechaInput(this.membresiaEditando.Fecha_Inicio);
      }
      if (this.membresiaEditando.Fecha_Fin) {
        this.membresiaEditando.Fecha_Fin = this.formatearFechaInput(this.membresiaEditando.Fecha_Fin);
      }
      this.modoEdicion = true;
      this.mostrarModal = true;
    },
    
    // Cerrar modal de edición o creación
    cerrarModal() {
      this.mostrarModal = false;
      this.membresiaEditando = null;
    },
    
    // Formatear fecha para input type="date" (YYYY-MM-DD)
    formatearFechaInput(fecha) {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    },
    
    // Crear nueva membresía
    crearNuevaMembresia() {
      // Crear objeto con valores por defecto
      const fechaActual = new Date().toISOString().split('T')[0];
      this.membresiaEditando = {
        Nombre: '',
        Fecha_Inicio: fechaActual,
        Fecha_Fin: '',
        Grupo: '',
        Valor: 0,
        Estado: 'Activa',
        Fecha_Creacion: fechaActual,
        Fecha_Modificacion: fechaActual
      };
      this.modoEdicion = false;
      this.mostrarModal = true;
    },
    
    // Guardar cambios de la membresía editada o crear nueva
    async guardarCambios() {
      try {
        if (this.modoEdicion) {
          // Editar membresía existente
          await axios.put(`/api/membresias/${this.membresiaEditando.ID}`, this.membresiaEditando);
          
          // Actualizar la membresía en el array local
          const index = this.membresias.findIndex(m => m.ID === this.membresiaEditando.ID);
          if (index !== -1) {
            this.membresias[index] = { ...this.membresiaEditando };
          }
          
          this.mostrarMensaje('Membresía actualizada con éxito', 'exito');
        } else {
          // Crear nueva membresía
          const response = await axios.post('/api/membresias', this.membresiaEditando);
          
          // Añadir la nueva membresía al array local con el ID asignado por el servidor
          const nuevaMembresia = { ...this.membresiaEditando, ID: response.data.id };
          this.membresias.push(nuevaMembresia);
          
          this.mostrarMensaje('Membresía creada con éxito', 'exito');
        }
        
        this.cerrarModal();
      } catch (error) {
        const accion = this.modoEdicion ? 'actualizar' : 'crear';
        this.mostrarMensaje(`Error al ${accion} la membresía`, 'error');
        console.error(`Error al ${accion}:`, error);
      }
    },
    
    // Mostrar confirmación antes de eliminar
    confirmarEliminar(id) {
      this.idEliminar = id;
      this.mostrarConfirmacion = true;
    },
    
    // Eliminar membresía
    async eliminarMembresia() {
      try {
        // Reemplazar URL con la correcta de tu API
        await axios.delete(`/api/membresias/${this.idEliminar}`);
        
        // Eliminar del array local
        this.membresias = this.membresias.filter(m => m.ID !== this.idEliminar);
        
        this.mostrarMensaje('Membresía eliminada con éxito', 'exito');
        this.mostrarConfirmacion = false;
        this.idEliminar = null;
      } catch (error) {
        this.mostrarMensaje('Error al eliminar la membresía', 'error');
        console.error('Error al eliminar:', error);
      }
    },
    
    // Mostrar mensaje temporal
    mostrarMensaje(texto, tipo) {
      this.mensaje = { texto, tipo };
      setTimeout(() => {
        this.mensaje = null;
      }, 3000);
    }
  }
}
</script>

<style scoped>
/* Estilos generales */
.membresias-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 10px;
}

h1 {
  color: #333;
  margin: 0;
}

.boton.crear {
  background-color: #27ae60;
  color: white;
  padding: 10px 16px;
  font-size: 16px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.boton.crear:hover {
  background-color: #219653;
}

/* Estilos para la tabla */
.tabla-container {
  overflow-x: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 30px;
}

.tabla-membresias {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.tabla-membresias th {
  background-color: #2c3e50;
  color: white;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.tabla-membresias td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.tabla-membresias tbody tr:hover {
  background-color: #f5f7fa;
}

.tabla-membresias tbody tr.inactiva {
  opacity: 0.7;
  background-color: #f9f9f9;
}

/* Estilo para estados */
.estado {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  display: inline-block;
}

.estado.activa {
  background-color: #e3f8e7;
  color: #28a745;
}

.estado.inactiva {
  background-color: #feeaea;
  color: #dc3545;
}

.estado.pendiente {
  background-color: #fff7e0;
  color: #ffc107;
}

/* Estilos para botones */
.acciones {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.boton {
  cursor: pointer;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.boton i {
  font-size: 14px;
}

.boton.editar {
  background-color: #3498db;
  color: white;
}

.boton.editar:hover {
  background-color: #2980b9;
}

.boton.eliminar {
  background-color: #e74c3c;
  color: white;
}

.boton.eliminar:hover {
  background-color: #c0392b;
}

.boton.guardar {
  background-color: #2ecc71;
  color: white;
}

.boton.guardar:hover {
  background-color: #27ae60;
}

.boton.cancelar {
  background-color: #95a5a6;
  color: white;
}

.boton.cancelar:hover {
  background-color: #7f8c8d;
}

/* Estilos para modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  width: 95%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-contenido h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.form-grupo {
  margin-bottom: 15px;
}

.form-grupo label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-grupo input,
.form-grupo select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.botones-modal {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-contenido.confirmacion {
  max-width: 400px;
}

.modal-contenido.confirmacion p {
  margin-bottom: 20px;
  color: #555;
}

/* Estilos para alertas */
.alerta {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alerta.exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alerta.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Estilos responsivos */
@media screen and (max-width: 768px) {
  .acciones {
    flex-direction: column;
  }
  
  .tabla-membresias th,
  .tabla-membresias td {
    padding: 8px;
  }
  
  .boton {
    width: 100%;
    justify-content: center;
  }
}
</style>
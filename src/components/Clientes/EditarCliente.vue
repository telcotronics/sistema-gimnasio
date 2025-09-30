<template>
  <div class="editar-cliente-container">
    <div class="form-header">
      <h3 class="form-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
          <path d="M18 2 4 16v4h4L22 6zm-5 5L17 3l4 4-4 4z"></path>
        </svg>
        Editar Cliente
      </h3>
      <p class="form-subtitle">Actualiza la información del cliente seleccionado.</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos del cliente...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-4a1 1 0 0 1-1-1V9a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1z"></path>
      </svg>
      <p>Error al cargar los datos del cliente: {{ error }}</p>
      <button @click="cargarCliente" class="btn btn-retry">Reintentar</button>
    </div>

    <form v-else @submit.prevent="actualizarCliente" class="cliente-form">
      <div class="form-row">
        <div class="form-group">
          <label for="client_rucCed">RUC/Cédula *</label>
          <input 
            type="text" 
            id="client_rucCed" 
            v-model="cliente.client_rucCed"
            readonly
            class="form-control readonly"
            placeholder="RUC/Cédula del cliente"
          >
          <small class="form-text">Este campo no se puede modificar</small>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="client_nombre">Nombre Completo *</label>
          <input 
            type="text" 
            id="client_nombre" 
            v-model="cliente.client_nombre"
            required
            class="form-control"
            placeholder="Ingrese el nombre completo del cliente"
          >
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="client_direccion">Dirección *</label>
          <textarea 
            id="client_direccion" 
            v-model="cliente.client_direccion"
            required
            class="form-control textarea"
            placeholder="Ingrese la dirección del cliente"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="client_celular">Teléfono/Celular *</label>
          <input 
            type="tel" 
            id="client_celular" 
            v-model="cliente.client_celular"
            required
            class="form-control"
            placeholder="Ej: 0999999999"
          >
        </div>
        <div class="form-group half">
          <label for="client_email">Email *</label>
          <input 
            type="email" 
            id="client_email" 
            v-model="cliente.client_email"
            required
            class="form-control"
            placeholder="cliente@example.com"
          >
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="client_estado">Estado *</label>
          <select 
            id="client_estado" 
            v-model="cliente.client_estado"
            required
            class="form-control"
          >
            <option value="">Seleccionar estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div class="form-group half">
          <label for="client_fechaReg">Fecha de Registro</label>
          <input 
            type="date" 
            id="client_fechaReg" 
            v-model="fechaFormateada"
            readonly
            class="form-control readonly"
          >
          <small class="form-text">Fecha de registro original</small>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          @click="volverALista" 
          class="btn btn-secondary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
            <path d="M19 12H5m7-7l-7 7 7 7"></path>
          </svg>
          Volver a la Lista
        </button>
        <button 
          type="submit" 
          :disabled="saving"
          class="btn btn-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8h10zM17 3H7v5h10V3z"></path>
          </svg>
          {{ saving ? 'Guardando...' : 'Actualizar Cliente' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

// Definir la URL base de la API
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  name: 'EditarCliente',
  data() {
    return {
      cliente: {
        client_id: null,
        client_nombre: '',
        client_rucCed: '',
        client_direccion: '',
        client_celular: '',
        client_email: '',
        client_fechaReg: '',
        client_estado: 'activo' // Manténlo como string para el v-model del select
      },
      loading: true,
      saving: false,
      error: null
    };
  },
  computed: {
    /**
     * Formatea la fecha para mostrar en el campo de fecha
     */
    fechaFormateada: {
      get: function() {
        if (!this.cliente.client_fechaReg) return '';
        // Convertir la fecha a formato YYYY-MM-DD para el input de tipo date
        const fecha = new Date(this.cliente.client_fechaReg);
        return fecha.toISOString().split('T')[0];
      },
      set: function(value) {
        // No permitir modificar la fecha
        return;
      }
    }
  },
  mounted: function() {
    // Cargar los datos del cliente al montar el componente
    this.cargarCliente();
  },
  methods: {
    /**
     * Carga los datos del cliente desde la API usando el RUC/Cédula de la ruta
     */
    cargarCliente: function() {
      var self = this;
      self.loading = true;
      self.error = null;
      
      // Obtener el RUC/Cédula de los parámetros de la ruta
      var clientRucCed = self.$route.params.client_rucCed;
      
      if (!clientRucCed) {
        self.error = 'No se especificó el RUC/Cédula del cliente a editar.';
        self.loading = false;
        return;
      }

      axios.get(API_BASE_URL + '/api/clientes/' + clientRucCed, {
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(response) {
        // Al cargar, asegúrate de que el estado se mapee de int a string si es necesario
        // Asumiendo que tu backend devuelve 1 para 'activo' y 0 para 'inactivo'
        if (response.data.client_estado === 1) {
          response.data.client_estado = 'activo';
        } else if (response.data.client_estado === 0) {
          response.data.client_estado = 'inactivo';
        }
        self.cliente = response.data;
      })
      .catch(function(err) {
        console.error('Error al cargar cliente:', err);
        if (err.response) {
          if (err.response.status === 404) {
            self.error = 'Cliente no encontrado con el RUC/Cédula especificado.';
          } else {
            self.error = 'Error HTTP: ' + err.response.status + ' - ' + (err.response.data.mensaje || err.response.data || 'Error desconocido del servidor');
          }
        } else if (err.request) {
          self.error = 'No se recibió respuesta del servidor. Verifique su conexión.';
        } else {
          self.error = err.message || 'Error desconocido al cargar el cliente.';
        }
      })
      .finally(function() {
        self.loading = false;
      });
    },

    /**
     * Actualiza los datos del cliente en la base de datos
     */
    actualizarCliente: function() {
      var self = this;
      self.saving = true;

      const rucCedulaAActualizar = self.cliente.client_rucCed;

      // ************************************************************
      // CAMBIO CLAVE: Mapear 'activo'/'inactivo' a 1/0 para la base de datos
      let estadoParaDB = 0; // Por defecto a inactivo
      if (self.cliente.client_estado === 'activo') {
        estadoParaDB = 1;
      } 
      // ************************************************************

      const datosActualizacion = {
        client_nombre: self.cliente.client_nombre.trim(),
        client_direccion: self.cliente.client_direccion.trim(),
        client_celular: self.cliente.client_celular.trim(),
        client_email: self.cliente.client_email.trim(),
        client_estado: estadoParaDB // Usar el valor numérico aquí
      };

      axios.put(API_BASE_URL + '/api/clientes/' + rucCedulaAActualizar, datosActualizacion, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function(response) {
        var result = response.data;

        if (response.status === 200 && result && result.mensaje === 'Cliente actualizado exitosamente.') {
          alert('Cliente actualizado exitosamente.');
          // Redirigir a la lista de clientes
          self.$router.push('/clientes');
        } else {
          console.error('Respuesta inesperada al actualizar cliente:', result);
          alert('Error al actualizar el cliente. Respuesta del servidor inesperada.');
        }
      })
      .catch(function(error) {
        console.error('Error al actualizar cliente:', error);
        if (error.response) {
          alert('Error ' + error.response.status + ' al actualizar el cliente: ' + (error.response.data.mensaje || error.response.data || 'Error desconocido.'));
        } else if (error.request) {
          alert('Error de conexión al actualizar cliente. No se recibió respuesta del servidor.');
        } else {
          alert('Error al configurar la solicitud de actualización: ' + error.message);
        }
      })
      .finally(function() {
        self.saving = false;
      });
    },

    /**
     * Vuelve a la lista de clientes
     */
    volverALista: function() {
      this.$router.push('/clientes');
    }
  }
};
</script>

<style scoped>
/* Estilos existentes... no se modifican */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Ubuntu', sans-serif;
}

.editar-cliente-container {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.editar-cliente-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #2a2185, #162447, #1f4287, #71b7e6);
  border-radius: 20px 20px 0 0;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-title {
  font-size: 2rem;
  color: #2a2185;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Estilo para los iconos SVG */
.form-title .icon {
  width: 32px; /* Ajusta el tamaño del icono según sea necesario */
  height: 32px;
  color: #71b7e6; /* Color del icono */
  stroke-width: 2; /* Grosor del trazo si el icono es un path */
}

.form-subtitle {
  color: #666;
  font-size: 0.95rem;
}

/* Estados de carga y error */
.loading-state, .error-state {
  text-align: center;
  padding: 50px 20px;
  color: #555;
}

.loading-state p, .error-state p {
  font-size: 1.1rem;
  margin-top: 15px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2a2185;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .icon { /* Estilo para el icono de error SVG */
  width: 48px; /* Ajusta el tamaño del icono según sea necesario */
  height: 48px;
  color: #dc3545; /* Color del icono */
  stroke-width: 2;
}

/* Estilos del formulario */
.cliente-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 250px;
}

.form-group.half {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: all 0.3s ease;
  outline: none;
  color: #333;
}

.form-control:focus {
  border-color: #2a2185;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(42, 33, 133, 0.1);
}

.form-control.readonly {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-control.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-text {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

/* Botones */
.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #2a2185, #1f4287);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(42, 33, 133, 0.2);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.2);
}

.btn-retry {
  background-color: #ffc107;
  color: #333;
}

.btn-retry:hover {
  background-color: #e0a800;
}

/* Acciones del formulario */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* Estilo para los iconos SVG dentro de botones */
.btn .icon {
  width: 18px; /* Tamaño más pequeño para iconos dentro de botones */
  height: 18px;
  color: white; /* El color del icono debe ser el del texto del botón */
  stroke-width: 2;
}

/* Responsive */
@media (max-width: 768px) {
  .editar-cliente-container {
    padding: 20px;
    margin: 10px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-group {
    min-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
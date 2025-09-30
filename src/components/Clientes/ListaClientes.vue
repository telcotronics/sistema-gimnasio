<template>
  <div class="clientes-list-container">
    <div class="list-header">
      <h3 class="list-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
        </svg>
        Lista de Clientes
      </h3>
      <p class="list-subtitle">Visualiza y gestiona tus clientes registrados.</p>
    </div>

    <div class="action-bar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="debouncedSearch" 
          placeholder="Buscar por nombre o RUC/Cédula..."
          class="search-input"
        >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="search-icon">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
        </svg>
      </div>
      <button @click="navigateToNuevoCliente" class="btn btn-primary-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
        </svg>
        Crear Nuevo Cliente
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando clientes...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-4a1 1 0 0 1-1-1V9a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1z"></path>
      </svg>
      <p>Error al cargar los clientes: {{ error }}</p>
      <button @click="fetchClientes" class="btn btn-retry">Reintentar</button>
    </div>

    <div v-else-if="clientes.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
      </svg>
      <p>No hay clientes registrados que coincidan con tu búsqueda.</p>
      <p v-if="!searchQuery">O no hay clientes registrados en el sistema.</p>
    </div>

    <div v-else class="table-responsive">
      <table class="clientes-table">
        <thead>
          <tr>
            <th>Cédula/RUC</th>
            <th>Nombre Completo</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th class="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.client_rucCed">
            <td>{{ cliente.client_rucCed }}</td>
            <td>{{ cliente.client_nombre }}</td>
            <td>{{ cliente.client_direccion }}</td>
            <td>{{ cliente.client_celular }}</td>
            <td>{{ cliente.client_email }}</td>
            <td class="actions-column">
              <button @click="editCliente(cliente.client_rucCed)" class="btn btn-action edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-small">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                </svg>
              </button>
              <button @click="deleteCliente(cliente.client_rucCed)" class="btn btn-action delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-small">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  name: 'ListaClientes',
  data() {
    return {
      clientes: [],
      loading: true,
      error: null,
      searchQuery: '',
      searchTimeout: null,
    };
  },
  mounted() {
    this.fetchClientes();
  },
  methods: {
    async fetchClientes() {
      this.loading = true;
      this.error = null;
      let url = `${API_BASE_URL}/verClientesJsonApp`;

      if (this.searchQuery) {
        url = `${API_BASE_URL}/consultaClientesJson?consulta=${encodeURIComponent(this.searchQuery)}`;
      }

      try {
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = response.data;
        
        if (this.searchQuery) { 
          if (Array.isArray(data)) {
            this.clientes = data;
          } else {
            throw new Error('Formato de datos inesperado de la API de búsqueda.');
          }
        } else { 
          if (data && data.Clientes && Array.isArray(data.Clientes)) {
            this.clientes = data.Clientes;
          } else {
            throw new Error('Formato de datos inesperado de la API de clientes.');
          }
        }
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        if (err.response) {
          this.error = `Error HTTP: ${err.response.status} - ${err.response.data.mensaje || err.response.data || 'Error desconocido del servidor'}`;
        } else if (err.request) {
          this.error = 'No se recibió respuesta del servidor. Verifique su conexión o la URL de la API.';
        } else {
          this.error = err.message || 'Error desconocido al configurar la solicitud.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchClientes();
      }, 300);
    },

    navigateToNuevoCliente() {
      this.$router.push('/Crear_cliente');
    },
    
    editCliente(rucCedula) {
      this.$router.push(`/editar-cliente/${rucCedula}`);
      console.log('Editar cliente con RUC/Cédula:', rucCedula);
    },
    
    async deleteCliente(rucCedula) {
      if (confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/clientes/${rucCedula}`);

          const result = response.data;
          
          if (response.status === 200 && result && result.mensaje === 'Cliente eliminado exitosamente.') {
            alert('Cliente eliminado exitosamente.');
            this.fetchClientes();
          } else {
            console.error('Respuesta inesperada al eliminar cliente:', result);
            alert('Error al eliminar el cliente. Respuesta del servidor inesperada.');
          }
        } catch (error) {
          console.error('Error al eliminar cliente:', error);
          if (error.response) {
            alert(`Error ${error.response.status} al eliminar el cliente: ${error.response.data.mensaje || error.response.data || 'Error desconocido.'}`);
          } else if (error.request) {
            alert('Error de conexión al eliminar cliente. No se recibió respuesta del servidor.');
          } else {
            alert(`Error al configurar la solicitud de eliminación: ${error.message}`);
          }
        }
      }
    }
  }
};
</script>

<style scoped>
/* Estilos generales (mantén los mismos que ya tienes, no los repito por brevedad aquí) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Ubuntu', sans-serif;
}

.clientes-list-container {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  width: 100%; /* Modificado para ocupar todo el ancho */
  position: relative;
  overflow: hidden;
}

.clientes-list-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #2a2185, #162447, #1f4287, #71b7e6);
  border-radius: 20px 20px 0 0;
}

.list-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.list-title {
  font-size: 2rem;
  color: #2a2185;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Estilo para los iconos SVG en el título */
.list-title .icon {
  width: 32px; /* Ajusta el tamaño del icono según sea necesario */
  height: 32px;
  color: #71b7e6; /* Color del icono */
  stroke-width: 2; /* Grosor del trazo si el icono es un path */
}

.list-subtitle {
  color: #666;
  font-size: 0.95rem;
}

/* Barra de acciones (botón "Crear Nuevo Cliente" y caja de búsqueda) */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

/* Estilos de la caja de búsqueda */
.search-box {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #fafafa;
  transition: all 0.3s ease;
  outline: none;
  color: #333;
}

.search-input:focus {
  border-color: #2a2185;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(42, 33, 133, 0.1);
}

.search-input::placeholder {
  color: #999;
}

/* Estilo para el icono SVG de búsqueda */
.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  width: 20px; /* Tamaño del icono */
  height: 20px;
  stroke-width: 2;
  pointer-events: none;
}

/* Estilos para el botón de añadir cliente */
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
}

.btn-primary-add {
  background: linear-gradient(135deg, #2a2185, #1f4287);
  color: white;
  white-space: nowrap;
}

.btn-primary-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(42, 33, 133, 0.2);
}

/* Estilo para el icono SVG dentro del botón de añadir */
.btn-primary-add .icon {
  width: 18px;
  height: 18px;
  color: white;
  stroke-width: 2;
}

/* Estados de carga, error y vacío */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #555;
}

.loading-state p, .error-state p, .empty-state p {
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

/* Estilo para el icono SVG en el estado de error */
.error-state .icon {
  font-size: 3rem; /* Este no se aplica directamente al SVG, se usa width/height */
  width: 48px;
  height: 48px;
  color: #dc3545;
  stroke-width: 2;
}

/* Estilo para el icono SVG en el estado vacío */
.empty-state .icon {
  font-size: 3rem; /* Este no se aplica directamente al SVG, se usa width/height */
  width: 48px;
  height: 48px;
  color: #71b7e6;
  stroke-width: 2;
}

.btn-retry {
  background-color: #ffc107;
  color: #333;
}

.btn-retry:hover {
  background-color: #e0a800;
}

/* Tabla de Clientes con desplazamiento */
.table-responsive {
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.clientes-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
}

.clientes-table th,
.clientes-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.clientes-table th {
  background-color: #2a2185;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.clientes-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.clientes-table tbody tr:hover {
  background-color: #f0f8ff;
  cursor: default;
}

/* Estilos para la columna de acciones */
.actions-column {
  width: 120px;
  text-align: center;
  white-space: nowrap;
}

.btn-action {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.btn-action.edit {
  background-color: #007bff;
  color: white;
}

.btn-action.edit:hover {
  background-color: #0056b3;
}

.btn-action.delete {
  background-color: #dc3545;
  color: white;
}

.btn-action.delete:hover {
  background-color: #c82333;
}

/* Estilo para los iconos SVG dentro de botones de acción */
.btn-action .icon-small {
  width: 16px; /* Tamaño más pequeño para iconos de acción */
  height: 16px;
  color: white; /* El color del icono debe ser el del texto del botón */
  stroke-width: 2;
}

/* Responsive */
@media (max-width: 768px) {
  .clientes-list-container {
    padding: 20px;
    margin: 10px;
  }
  .list-title {
    font-size: 1.5rem;
  }
  .clientes-table th, .clientes-table td {
    padding: 10px;
    font-size: 0.85rem;
  }
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100%;
  }
  .btn-primary-add {
    width: 100%;
  }
  .actions-column {
    width: auto;
    padding: 8px 5px;
  }
  .btn-action {
    padding: 6px 8px;
    margin: 0 2px;
  }
}
</style>
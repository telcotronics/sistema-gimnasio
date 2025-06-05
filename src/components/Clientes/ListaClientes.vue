<template>
    <div class="clientes-list-container">
      <div class="list-header">
        <h3 class="list-title">
          <i class="fa fa-users"></i>
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
          <i class="fa fa-search search-icon"></i>
        </div>
        <button @click="navigateToNuevoCliente" class="btn btn-primary-add">
          <i class="fa fa-user-plus"></i> Crear Nuevo Cliente
        </button>
      </div>
  
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
  
      <div v-else-if="error" class="error-state">
        <i class="fa fa-exclamation-triangle"></i>
        <p>Error al cargar los clientes: {{ error }}</p>
        <button @click="fetchClientes" class="btn btn-retry">Reintentar</button>
      </div>
  
      <div v-else-if="clientes.length === 0" class="empty-state">
        <i class="fa fa-info-circle"></i>
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
                <button @click="editCliente(cliente.client_id)" class="btn btn-action edit">
                  <i class="fa fa-edit"></i>
                </button>
                <button @click="deleteCliente(cliente.client_id)" class="btn btn-action delete">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ListaClientes',
    data() {
      return {
        clientes: [],
        loading: true,
        error: null,
        searchQuery: '', // Nuevo: Para el valor de la caja de búsqueda
        searchTimeout: null, // Nuevo: Para el debounce
        apiBaseUrl: process.env.VUE_APP_SERV_API || '/api_proxy' 
      };
    },
    mounted() {
      // Cuando el componente se monta, carga todos los clientes inicialmente
      this.fetchClientes();
    },
    methods: {
      // Función para obtener todos los clientes o los resultados de la búsqueda
      async fetchClientes() {
        this.loading = true;
        this.error = null;
        let url = `${this.apiBaseUrl}/verClientesJsonApp`; // Ruta para obtener todos los clientes
  
        if (this.searchQuery) {
          // Si hay una consulta de búsqueda, usa la ruta de búsqueda
          url = `${this.apiBaseUrl}/consultaClientesJson?consulta=${encodeURIComponent(this.searchQuery)}`;
        }
  
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
          }
  
          const data = await response.json();
          
          // Manejo de la respuesta basado en la ruta:
          // 'verClientesJsonApp' devuelve { Clientes: [...] }
          // 'consultaClientesJson' devuelve directamente [...]
          if (this.searchQuery) { // Si estamos en modo búsqueda, la respuesta es un array directo
            if (Array.isArray(data)) {
              this.clientes = data;
            } else {
              throw new Error('Formato de datos inesperado de la API de búsqueda.');
            }
          } else { // Si estamos obteniendo todos los clientes, esperamos { Clientes: [...] }
            if (data && data.Clientes && Array.isArray(data.Clientes)) {
              this.clientes = data.Clientes;
            } else {
              throw new Error('Formato de datos inesperado de la API de clientes.');
            }
          }
        } catch (err) {
          console.error('Error al obtener clientes:', err);
          this.error = err.message || 'Error desconocido';
        } finally {
          this.loading = false;
        }
      },
      
      // Nuevo: Debounce para la función de búsqueda
      debouncedSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.fetchClientes(); // Llama a fetchClientes después de un breve retraso
        }, 300); // Espera 300ms después de la última pulsación
      },
  
      navigateToNuevoCliente() {
        this.$router.push('/Crear_cliente');
      },
      editCliente(clientId) {
        this.$router.push(`/editar-cliente/${clientId}`);
        console.log('Editar cliente con ID:', clientId);
      },
      async deleteCliente(clientId) {
        if (confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción es irreversible.')) {
          try {
            const response = await fetch(`${this.apiBaseUrl}/eliminarCliente/${clientId}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });
  
            if (response.ok) {
              const result = await response.json();
              // Asegúrate de que el mensaje o la estructura de la respuesta de tu backend sea consistente
              if (result && result.message === 'Cliente eliminado' || response.status === 200) { // Ajustar según tu backend
                alert('Cliente eliminado exitosamente.');
                this.fetchClientes();
              } else {
                console.error('Respuesta inesperada al eliminar cliente:', result);
                alert('Error al eliminar el cliente. Respuesta del servidor inesperada.');
              }
            } else {
              const errorText = await response.text();
              console.error('Error al eliminar cliente (respuesta no OK):', response.status, errorText);
              alert(`Error ${response.status} al eliminar el cliente. Intente nuevamente.`);
            }
          } catch (error) {
            console.error('Error de red al eliminar cliente:', error);
            alert('Error de conexión al eliminar cliente. Verifique su conexión.');
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
    max-width: 900px;
    margin: 0 auto;
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
  
  .list-title i {
    color: #71b7e6;
  }
  
  .list-subtitle {
    color: #666;
    font-size: 0.95rem;
  }
  
  /* Barra de acciones (botón "Crear Nuevo Cliente" y caja de búsqueda) */
  .action-bar {
    display: flex;
    justify-content: space-between; /* Alinea items a los extremos */
    align-items: center; /* Centra verticalmente los items */
    margin-bottom: 25px;
    flex-wrap: wrap; /* Permite que los elementos se envuelvan en pantallas pequeñas */
    gap: 15px; /* Espacio entre los elementos cuando se envuelven */
  }
  
  /* Estilos de la caja de búsqueda */
  .search-box {
    position: relative;
    flex-grow: 1; /* Permite que la caja de búsqueda ocupe el espacio disponible */
    max-width: 400px; /* Ancho máximo para la caja de búsqueda */
  }
  
  .search-input {
    width: 100%;
    padding: 12px 40px 12px 15px; /* Más padding a la derecha para el icono */
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
  
  .search-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 1.1rem;
    pointer-events: none; /* Asegura que el icono no intercepte clics */
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
    gap: 8px;
    text-decoration: none;
  }
  
  .btn-primary-add {
    background: linear-gradient(135deg, #2a2185, #1f4287);
    color: white;
    white-space: nowrap; /* Evita que el texto del botón se envuelva */
  }
  
  .btn-primary-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(42, 33, 133, 0.2);
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
  
  .error-state i {
    font-size: 3rem;
    color: #dc3545;
  }
  
  .empty-state i {
    font-size: 3rem;
    color: #71b7e6;
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
      flex-direction: column; /* Apila los elementos verticalmente */
      align-items: stretch; /* Estira los elementos para ocupar el ancho completo */
    }
    .search-box {
      max-width: 100%; /* Permite que la caja de búsqueda ocupe todo el ancho */
    }
    .btn-primary-add {
      width: 100%; /* Botón de añadir ocupa todo el ancho */
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
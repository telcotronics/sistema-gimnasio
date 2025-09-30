<template>
    <div class="areas-admin-container">
      <h1 class="title">Administración de Áreas de Acceso</h1>
      <hr class="divider">
  
      <div class="controls-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar área por nombre o descripción..."
          @input="filterAreas"
          class="search-input"
        >
        <select v-model="selectedStatusFilter" @change="filterAreas" class="status-filter-select">
          <option value="">Todos los Estados</option>
          <option value="ACTIVA">Activa</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
        <button @click="openFormModal(false)" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-plus">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Área
        </button>
      </div>
  
      <p v-if="loading" class="loading-message">Cargando áreas...</p>
      <p v-else-if="error" class="error-message">Error al cargar áreas: {{ error }}</p>
      <p v-else-if="filteredAreas.length === 0" class="no-results-message">
        No se encontraron áreas con los criterios de búsqueda/filtro.
      </p>
  
      <div v-else class="areas-table-container">
        <table class="areas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Área</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="area in filteredAreas" :key="area.id_area">
              <td>{{ area.id_area }}</td>
              <td>{{ area.nombre_area }}</td>
              <td>{{ area.descripcion || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(area.estado_area)]">
                  {{ area.estado_area }}
                </span>
              </td>
              <td>
                <button @click="openFormModal(true, area)" class="btn-secondary edit-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-edit">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
                <button
                  @click="confirmDelete(area.id_area, area.nombre_area)"
                  :disabled="area.estado_area === 'INACTIVA'"
                  :class="['btn-danger', { 'disabled-btn': area.estado_area === 'INACTIVA' }]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-trash">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Inactivar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para el formulario de Creación/Edición -->
      <div v-if="showFormModal" class="modal-overlay">
        <div class="modal-content">
          <h3>{{ isEditMode ? 'Editar Área de Acceso' : 'Crear Nueva Área de Acceso' }}</h3>
          <form @submit.prevent="saveArea">
            <div class="form-group">
              <label for="areaName">Nombre del Área:</label>
              <input type="text" id="areaName" v-model="currentArea.nombre_area" required>
              <span v-if="formErrors.nombre_area" class="error-message">{{ formErrors.nombre_area }}</span>
            </div>
            <div class="form-group">
              <label for="areaDescription">Descripción:</label>
              <textarea id="areaDescription" v-model="currentArea.descripcion"></textarea>
            </div>
            <div class="form-group" v-if="isEditMode">
              <label for="areaStatus">Estado:</label>
              <select id="areaStatus" v-model="currentArea.estado_area">
                <option value="ACTIVA">ACTIVA</option>
                <option value="INACTIVA">INACTIVA</option>
              </select>
            </div>
  
            <div class="modal-actions">
              <button type="submit" class="btn-submit" :disabled="loadingForm">
                {{ loadingForm ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" @click="closeFormModal" class="btn-cancel">Cancelar</button>
            </div>
            <p v-if="formFeedbackMessage" :class="['feedback-message', formFeedbackType]">{{ formFeedbackMessage }}</p>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  // Define la URL base de la API externa usando una variable de entorno de Vue CLI
  const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net'; // Fallback
  
  export default {
    name: 'CRUD_Areas',
    data() {
      return {
        areas: [],
        filteredAreas: [],
        loading: false,
        error: null,
        searchQuery: '',
        selectedStatusFilter: '', // 'ACTIVA', 'INACTIVA', o '' para todos
  
        showFormModal: false,
        isEditMode: false,
        currentArea: {
          id_area: null,
          nombre_area: '',
          descripcion: '',
          estado_area: 'ACTIVA', // Por defecto para nuevas áreas
        },
        loadingForm: false,
        formFeedbackMessage: '',
        formFeedbackType: '',
        formErrors: {}, // Para errores de validación del formulario del modal
      };
    },
    created() {
      this.fetchAreas();
    },
    methods: {
      /**
       * @description Carga la lista de áreas de acceso desde la API.
       */
      async fetchAreas() {
        this.loading = true;
        this.error = null;
        try {
          const response = await axios.get(`${API_BASE_URL}/api/areas`);
          this.areas = response.data;
          this.filterAreas(); // Aplicar filtros después de cargar
        } catch (err) {
          console.error('Error al cargar áreas:', err);
          this.error = 'No se pudieron cargar las áreas de acceso.';
        } finally {
          this.loading = false;
        }
      },
  
      /**
       * @description Filtra las áreas basándose en la búsqueda y el estado seleccionado.
       */
      filterAreas() {
        let tempAreas = this.areas;
  
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          tempAreas = tempAreas.filter(area =>
            area.nombre_area.toLowerCase().includes(query) ||
            (area.descripcion && area.descripcion.toLowerCase().includes(query))
          );
        }
  
        if (this.selectedStatusFilter) {
          tempAreas = tempAreas.filter(area => area.estado_area === this.selectedStatusFilter);
        }
  
        this.filteredAreas = tempAreas;
      },
  
      /**
       * @description Abre el modal del formulario para crear o editar un área.
       * @param {boolean} edit - True si es modo edición, false para creación.
       * @param {Object} area - El objeto área a editar (solo si `edit` es true).
       */
      openFormModal(edit, area = null) {
        this.isEditMode = edit;
        this.formErrors = {}; // Limpiar errores previos
        this.formFeedbackMessage = ''; // Limpiar feedback previo
        if (edit && area) {
          this.currentArea = { ...area }; // Copiar el objeto para evitar mutaciones directas
        } else {
          this.currentArea = {
            id_area: null,
            nombre_area: '',
            descripcion: '',
            estado_area: 'ACTIVA',
          };
        }
        this.showFormModal = true;
      },
  
      /**
       * @description Cierra el modal del formulario.
       */
      closeFormModal() {
        this.showFormModal = false;
        this.resetForm();
      },
  
      /**
       * @description Valida el formulario del modal.
       * @returns {boolean} True si es válido, false en caso contrario.
       */
      validateFormModal() {
        this.formErrors = {};
        let isValid = true;
        if (!this.currentArea.nombre_area) {
          this.formErrors.nombre_area = 'El nombre del área es obligatorio.';
          isValid = false;
        }
        return isValid;
      },
  
      /**
       * @description Guarda (crea o actualiza) el área a través de la API.
       */
      async saveArea() {
        if (!this.validateFormModal()) {
          this.formFeedbackMessage = 'Por favor, corrige los errores del formulario.';
          this.formFeedbackType = 'error';
          return;
        }
  
        this.loadingForm = true;
        this.formFeedbackMessage = '';
        this.formFeedbackType = '';
  
        try {
          let response;
          if (this.isEditMode) {
            response = await axios.put(`${API_BASE_URL}/api/areas/${this.currentArea.id_area}`, this.currentArea);
          } else {
            response = await axios.post(`${API_BASE_URL}/api/areas`, this.currentArea);
          }
          this.formFeedbackMessage = response.data.mensaje || 'Operación exitosa.';
          this.formFeedbackType = 'success';
          await this.fetchAreas(); // Recargar la lista
          setTimeout(() => {
            this.closeFormModal();
          }, 1500);
        } catch (error) {
          console.error('Error al guardar área:', error);
          this.formFeedbackMessage = error.response && error.response.data && error.response.data.mensaje
            ? `Error: ${error.response.data.mensaje}`
            : `Error al guardar el área. Intenta de nuevo.`;
          this.formFeedbackType = 'error';
        } finally {
          this.loadingForm = false;
        }
      },
  
      /**
       * @description Confirma y realiza la eliminación lógica de un área.
       * @param {number} id - ID del área a eliminar.
       * @param {string} nombre - Nombre del área para la confirmación.
       */
      async confirmDelete(id, nombre) {
        if (confirm(`¿Estás seguro de INACTIVAR el área "${nombre}"? No se eliminará físicamente.`)) {
          try {
            // Cambiar estado a 'INACTIVA'
            const response = await axios.put(`${API_BASE_URL}/api/areas/${id}/inactivar`); // Nueva ruta para inactivar
            // O si el PUT de actualizar ya maneja el estado:
            // await axios.put(`${API_BASE_URL}/api/areas/${id}`, { estado_area: 'INACTIVA' });
  
            alert(response.data.mensaje || `Área "${nombre}" inactivada exitosamente.`);
            await this.fetchAreas(); // Recargar la lista
          } catch (error) {
            console.error('Error al inactivar área:', error);
            const errorMessage = error.response && error.response.data && error.response.data.mensaje
              ? error.response.data.mensaje
              : 'Error al inactivar el área. Por favor, inténtalo de nuevo.';
            alert(errorMessage);
          }
        }
      },
  
      /**
       * @description Devuelve la clase CSS para el badge de estado.
       * @param {string} status - Estado del área ('ACTIVA', 'INACTIVA').
       * @returns {string} - Clase CSS.
       */
      getStatusClass(status) {
        switch (status) {
          case 'ACTIVA': return 'status-active-badge';
          case 'INACTIVA': return 'status-inactive-badge';
          default: return '';
        }
      },
  
      /**
       * @description Reinicia el formulario modal.
       */
      resetForm() {
        this.currentArea = {
          id_area: null,
          nombre_area: '',
          descripcion: '',
          estado_area: 'ACTIVA',
        };
        this.formErrors = {};
        this.formFeedbackMessage = '';
        this.formFeedbackType = '';
      }
    },
  };
  </script>
  
  <style scoped>
  .areas-admin-container {
    max-width: 1000px;
    margin: 30px auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-family: 'Arial', sans-serif;
    color: #333;
  }
  
  .title {
    text-align: center;
    color: #2c3e50;
    font-size: 2.2rem;
    margin-bottom: 15px;
  }
  
  .divider {
    border: 0;
    height: 2px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), #3498db, rgba(0, 0, 0, 0));
    margin-bottom: 30px;
  }
  
  .controls-section {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .search-input, .status-filter-select {
    flex-grow: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }
  
  .icon-plus {
    width: 18px;
    height: 18px;
  }
  
  .loading-message, .error-message, .no-results-message {
    text-align: center;
    padding: 20px;
    font-size: 1.1rem;
    color: #555;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  .areas-table-container {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #e0e0e0;
  }
  
  .areas-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
  }
  
  .areas-table th, .areas-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .areas-table th {
    background-color: #f0f4f8;
    color: #2c3e50;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
  }
  
  .areas-table tbody tr:hover {
    background-color: #f5fafd;
  }
  
  .status-badge {
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.8rem;
    color: white;
    text-transform: uppercase;
  }
  
  .status-active-badge {
    background-color: #28a745; /* Verde */
  }
  
  .status-inactive-badge {
    background-color: #6c757d; /* Gris */
  }
  
  .btn-secondary, .btn-danger {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: bold;
    transition: background-color 0.2s ease, transform 0.1s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-right: 5px; /* Espacio entre botones de acción */
  }
  
  .btn-secondary {
    background-color: #17a2b8; /* Info Blue */
    color: white;
  }
  
  .btn-secondary:hover {
    background-color: #138496;
    transform: translateY(-1px);
  }
  
  .btn-danger {
    background-color: #dc3545; /* Danger Red */
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background-color: #c82333;
    transform: translateY(-1px);
  }
  
  .btn-danger.disabled-btn {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .icon-edit, .icon-trash {
    width: 16px;
    height: 16px;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    transform: translateY(-20px);
    animation: modal-fade-in 0.3s ease-out forwards;
  }
  
  @keyframes modal-fade-in {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .modal-content h3 {
    margin-top: 0;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 25px;
    font-size: 1.8rem;
  }
  
  .modal-content .form-group {
    margin-bottom: 20px;
  }
  
  .modal-content label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }
  
  .modal-content input[type="text"],
  .modal-content textarea,
  .modal-content select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
  }
  
  .modal-content input:focus,
  .modal-content textarea:focus,
  .modal-content select:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
  
  .modal-content textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
  }
  
  .btn-submit {
    background-color: #2ecc71; /* Verde */
    color: white;
  }
  
  .btn-submit:hover:not(:disabled) {
    background-color: #27ae60;
  }
  
  .btn-cancel {
    background-color: #e74c3c; /* Rojo */
    color: white;
  }
  
  .btn-cancel:hover {
    background-color: #c0392b;
  }
  
  .feedback-message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .feedback-message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 5px;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .controls-section {
      flex-direction: column;
      align-items: stretch;
    }
    .search-input, .status-filter-select, .btn-primary {
      width: 100%;
    }
    .areas-table-container {
      padding: 0;
    }
    .areas-table th, .areas-table td {
      padding: 10px;
      font-size: 0.9rem;
    }
    .btn-secondary, .btn-danger {
      width: 100%;
      margin-right: 0;
      margin-bottom: 5px;
      justify-content: center;
    }
    .areas-table td:last-child {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }
  </style>
  
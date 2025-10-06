<template>
  <div class="miembro-form-container">
    <h1 class="title">{{ isEditMode ? 'Editar Miembro' : 'Crear Nuevo Miembro' }}</h1>
    <hr class="divider">

    <form @submit.prevent="submitForm" class="miembro-form">
      <!-- The matricula field is hidden as requested. It will be generated automatically in the backend. -->
      <!-- If you were in edit mode and wanted to display it as informative text (non-editable), you would use something like this:
      <div v-if="isEditMode" class="form-group">
        <label>Matrícula:</label>
        <input type="text" :value="miembro.matricula" readonly class="read-only-input">
      </div>
      -->

      <!-- Client search and selection field -->
      <div class="form-group">
        <label for="clienteSearch">Cliente:</label>
        <input
          type="text"
          id="clienteSearch"
          v-model="clienteSearchText"
          @input="debouncedSearchClientes"
          @keydown.up.prevent="navigateResults('cliente', -1)"
          @keydown.down.prevent="navigateResults('cliente', 1)"
          @keydown.enter.prevent="selectHighlighted('cliente')"
          placeholder="Buscar cliente por nombre, RUC o cédula..."
          required
        >
        <span v-if="formErrors.client_id" class="error-message">{{ formErrors.client_id }}</span>
        <div v-if="clientesFiltered.length > 0 && clienteSearchText && !miembro.client_id" class="autocomplete-results">
          <div
            v-for="(cliente, index) in clientesFiltered"
            :key="cliente.client_id"
            :class="{ 'autocomplete-item': true, 'active': index === activeClientIndex }"
            @click="selectCliente(cliente)"
          >
            {{ cliente.client_nombre }} ({{ cliente.client_rucCed }})
          </div>
        </div>
        <p v-if="miembro.client_id && selectedClientName" class="selected-info">
          Cliente Seleccionado: <strong>{{ selectedClientName }}</strong> (ID: {{ miembro.client_id }})
          <button type="button" @click="clearClienteSelection" class="clear-selection-btn">x</button>
        </p>
      </div>

      <!-- Membership Type search and selection field -->
      <div class="form-group">
        <label for="tipoMembresiaSearch">Tipo de Membresía:</label>
        <input
          type="text"
          id="tipoMembresiaSearch"
          v-model="tipoMembresiaSearchText"
          @input="debouncedSearchTiposMembresia"
          @keydown.up.prevent="navigateResults('membresia', -1)"
          @keydown.down.prevent="navigateResults('membresia', 1)"
          @keydown.enter.prevent="selectHighlighted('membresia')"
          placeholder="Buscar tipo de membresía..."
          required
        >
        <span v-if="formErrors.id_tipo_membresia" class="error-message">{{ formErrors.id_tipo_membresia }}</span>
        <div v-if="tiposMembresiaFiltered.length > 0 && tipoMembresiaSearchText && !miembro.id_tipo_membresia" class="autocomplete-results">
          <div
            v-for="(tipo, index) in tiposMembresiaFiltered"
            :key="tipo.id_tipo_membresia"
            :class="{ 'autocomplete-item': true, 'active': index === activeMembresiaIndex }"
            @click="selectTipoMembresia(tipo)"
          >
            {{ tipo.nombre_tipo }} ({{ tipo.categoria_membresia }}) - ${{ tipo.valor }}
          </div>
        </div>
        <p v-if="miembro.id_tipo_membresia && selectedMembresiaName" class="selected-info">
          Membresía Seleccionada: <strong>{{ selectedMembresiaName }}</strong> (ID: {{ miembro.id_tipo_membresia }})
          <button type="button" @click="clearMembresiaSelection" class="clear-selection-btn">x</button>
        </p>
      </div>

      <div class="form-group">
        <label for="estado">Estado:</label>
        <select id="estado" v-model="miembro.estado" :disabled="!isEditMode">
          <option value="ACTIVO">ACTIVO</option>
          <option value="VENCIDO">VENCIDO</option>
          <option value="SUSPENDIDO">SUSPENDIDO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
        <span v-if="formErrors.estado" class="error-message">{{ formErrors.estado }}</span>
      </div>

      <div class="form-group">
        <label for="fecha_inicio">Fecha de Inicio:</label>
        <input type="date" id="fecha_inicio" v-model="miembro.fecha_inicio" required>
        <span v-if="formErrors.fecha_inicio" class="error-message">{{ formErrors.fecha_inicio }}</span>
      </div>

      <div class="form-group">
        <label for="fecha_fin">Fecha de Fin:</label>
        <input type="date" id="fecha_fin" v-model="miembro.fecha_fin" required>
        <span v-if="formErrors.fecha_fin" class="error-message">{{ formErrors.fecha_fin }}</span>
      </div>

      <div class="form-group">
        <label for="observaciones">Observaciones:</label>
        <textarea id="observaciones" v-model="miembro.observaciones"></textarea>
      </div>

      <div class="form-group">
        <label for="creado_por">Creado Por:</label>
        <input type="text" id="creado_por" v-model="miembro.creado_por">
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar Miembro' : 'Crear Miembro') }}
        </button>
        <button type="button" class="btn-cancel" @click="cancel">Cancelar</button>
      </div>

      <p v-if="feedbackMessage" :class="['feedback-message', feedbackType]">{{ feedbackMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

// Define the base URL of the external API using a Vue CLI environment variable
// The variable name must start with VUE_APP_
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net'; // Fallback for local development

export default {
  name: 'CRUD_MiembroForm',
  props: {
    id: { // The member ID if in edit mode
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      miembro: {
        id_miembro: null,
        matricula: '', // Keep the property for edit mode, even if hidden in UI
        client_id: null,
        id_tipo_membresia: null,
        estado: 'ACTIVO',
        fecha_inicio: '',
        fecha_fin: '',
        observaciones: '',
        creado_por: '',
      },
      clientesFiltered: [], // Filtered clients for the search autocomplete
      clienteSearchText: '',
      selectedClientName: '', // To display the selected client's name

      tiposMembresia: [], // Full list of membership types (useful for local search and validation)
      tiposMembresiaFiltered: [], // Filtered membership types for the autocomplete
      tipoMembresiaSearchText: '',
      selectedMembresiaName: '', // To display the selected membership type's name

      isEditMode: false,
      loading: false,
      feedbackMessage: '',
      feedbackType: '', // 'success' or 'error'
      formErrors: {}, // To store form validation errors

      activeClientIndex: -1, // Index of the currently highlighted client in autocomplete
      activeMembresiaIndex: -1, // Index of the currently highlighted membership type in autocomplete

      // Debounce timers
      searchClientDebounce: null,
      searchMembresiaDebounce: null,
    };
  },
  watch: {
    // Watch for changes in the route ID to enter edit or create mode
    '$route.params.id': {
      immediate: true, // Execute the function immediately when the component is mounted
      handler(newId) {
        this.isEditMode = !!newId;
        if (this.isEditMode) {
          this.miembro.id_miembro = newId;
          this.fetchMiembro(newId);
        } else {
          this.resetForm();
        }
      }
    }
  },
  async created() {
    // Load all membership types initially for local search
    await this.fetchTiposMembresia();
  },
  methods: {
    /**
     * @description Loads existing member data in edit mode from the external API.
     * @param {number} id - ID of the member to load.
     */
    async fetchMiembro(id) {
      this.loading = true;
      this.feedbackMessage = '';
      try {
        // GET operation for a single member is also from the external API
        const response = await axios.get(`${API_BASE_URL}/api/miembros/${id}`);
        const data = response.data;

        // Format dates for 'date' type fields
        data.fecha_inicio = data.fecha_inicio ? new Date(data.fecha_inicio).toISOString().slice(0, 10) : '';
        data.fecha_fin = data.fecha_fin ? new Date(data.fecha_fin).toISOString().slice(0, 10) : '';

        // Copy data to the member object, ensuring matricula is kept if it exists
        this.miembro = { ...data };

        // Initialize search and selection fields for edit mode
        // Assumes `obtenerMiembroPorId` returns `client_nombre` and `nombre_tipo_membresia`
        if (data.client_id) {
            this.selectedClientName = data.client_nombre || 'Cliente seleccionado';
            this.clienteSearchText = this.selectedClientName; // To display the name in the search input
        }

        if (data.id_tipo_membresia) {
            const foundMembresia = this.tiposMembresia.find(tm => tm.id_tipo_membresia === data.id_tipo_membresia);
            if (foundMembresia) {
                this.tipoMembresiaSearchText = foundMembresia.nombre_tipo;
                this.selectedMembresiaName = foundMembresia.nombre_tipo;
            } else {
                 // Fallback if not found in the preloaded list (could be if the list is incomplete)
                 this.selectedMembresiaName = data.nombre_tipo_membresia || 'Membresía seleccionada';
                 this.tipoMembresiaSearchText = this.selectedMembresiaName;
            }
        }

      } catch (error) {
        console.error('Error loading member:', error);
        this.feedbackMessage = 'Error loading member data.';
        this.feedbackType = 'error';
        // Redirect if member not found or an error occurs during loading
        this.$router.push('/crud_miembros_card');
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Debounces the client search to avoid excessive API calls.
     */
    debouncedSearchClientes() {
      clearTimeout(this.searchClientDebounce);
      this.searchClientDebounce = setTimeout(() => {
        this.searchClientes();
      }, 300); // Wait 300ms after user stops typing
    },


    /**
     * @description Performs a client search using the external API.
     */
    async searchClientes() {
        // Reset active index on new search input
        this.activeClientIndex = -1;
        // Only search if text has at least 2 characters
        if (this.clienteSearchText.length > 1) {
            const lowerCaseSearch = this.clienteSearchText.toLowerCase();
            try {
                // Use the full URL of the external API for clients
                const response = await axios.get(`${API_BASE_URL}/consulta_clientesApps?consulta=${encodeURIComponent(lowerCaseSearch)}`);
                // Limit results to 10 to avoid overloading the frontend
                this.clientesFiltered = response.data.slice(0, 10);
            } catch (error) {
                console.error('Error in client search request:', error.message);
                // If there's an HTTP response error, you can see the status and data:
                if (error.response) {
                    console.error('HTTP Status:', error.response.status);
                    console.error('Error Data:', error.response.data);
                }
                this.clientesFiltered = []; // Clear results on error
                this.feedbackMessage = 'Error searching for clients. Please try again.';
                this.feedbackType = 'error';
            }
        } else {
            this.clientesFiltered = []; // Clear results if text is too short
            this.miembro.client_id = null; // Deselect client if text is cleared
            this.selectedClientName = '';
        }
    },

    /**
     * @description Selects a client from the search results.
     * @param {Object} cliente - Selected client object.
     */
    selectCliente(cliente) {
        this.miembro.client_id = cliente.client_id;
        this.clienteSearchText = cliente.client_nombre; // Display name in input
        this.selectedClientName = cliente.client_nombre; // Store name to display below
        this.clientesFiltered = []; // Hide results after selection
        this.activeClientIndex = -1; // Reset active index
    },

    /**
     * @description Clears the current client selection.
     */
    clearClienteSelection() {
      this.miembro.client_id = null;
      this.clienteSearchText = '';
      this.selectedClientName = '';
      this.clientesFiltered = [];
      this.activeClientIndex = -1;
    },

    /**
     * @description Loads all membership types from the external API.
     * These will be used for local search.
     */
    async fetchTiposMembresia() {
        try {
            // Use the full URL of the external API for membership types
            const response = await axios.get(`${API_BASE_URL}/api/tipos-membresia`);
            this.tiposMembresia = response.data;
        } catch (error) {
            console.error('Error loading membership types:', error.message);
            if (error.response) {
                console.error('HTTP Status:', error.response.status);
                console.error('Error Data:', error.response.data);
            }
            this.feedbackMessage = 'Could not load membership types for search.';
            this.feedbackType = 'error';
        }
    },

    /**
     * @description Debounces the membership type search.
     */
    debouncedSearchTiposMembresia() {
      clearTimeout(this.searchMembresiaDebounce);
      this.searchMembresiaDebounce = setTimeout(() => {
        this.searchTiposMembresia();
      }, 300); // Local search can also be debounced for better UX
    },

    /**
     * @description Performs a local search of membership types (filtering preloaded ones).
     */
    searchTiposMembresia() {
        // Reset active index on new search input
        this.activeMembresiaIndex = -1;
        // Clear previous selection if user starts typing again
        if (this.miembro.id_tipo_membresia && this.tipoMembresiaSearchText !== this.selectedMembresiaName) {
            this.miembro.id_tipo_membresia = null;
            this.selectedMembresiaName = '';
        }
        // Only search if text has at least 2 characters
        if (this.tipoMembresiaSearchText.length > 1) {
            const lowerCaseSearch = this.tipoMembresiaSearchText.toLowerCase();
            this.tiposMembresiaFiltered = this.tiposMembresia.filter(tipo =>
                (tipo.nombre_tipo && tipo.nombre_tipo.toLowerCase().includes(lowerCaseSearch)) ||
                (tipo.categoria_membresia && tipo.categoria_membresia.toLowerCase().includes(lowerCaseSearch))
            ).slice(0, 10); // Limit results
        } else {
            this.tiposMembresiaFiltered = []; // Clear results if text is too short
            this.miembro.id_tipo_membresia = null; // Deselect membership type
            this.selectedMembresiaName = '';
        }
    },

    /**
     * @description Selects a membership type from the search results.
     * @param {Object} tipo - Selected membership type object.
     */
    selectTipoMembresia(tipo) {
        this.miembro.id_tipo_membresia = tipo.id_tipo_membresia;
        this.tipoMembresiaSearchText = tipo.nombre_tipo;
        this.selectedMembresiaName = tipo.nombre_tipo;
        this.tiposMembresiaFiltered = [];
        this.activeMembresiaIndex = -1; // Reset active index
    },

    /**
     * @description Clears the current membership type selection.
     */
    clearMembresiaSelection() {
      this.miembro.id_tipo_membresia = null;
      this.tipoMembresiaSearchText = '';
      this.selectedMembresiaName = '';
      this.tiposMembresiaFiltered = [];
      this.activeMembresiaIndex = -1;
    },

    /**
     * @description Navigates autocomplete results using arrow keys.
     * @param {string} type - 'cliente' or 'membresia'.
     * @param {number} direction - 1 for down, -1 for up.
     */
    navigateResults(type, direction) {
      let activeIndexProp = type === 'cliente' ? 'activeClientIndex' : 'activeMembresiaIndex';
      let filteredList = type === 'cliente' ? this.clientesFiltered : this.tiposMembresiaFiltered;

      if (!filteredList.length) return;

      this[activeIndexProp] += direction;

      // Wrap around logic
      if (this[activeIndexProp] < 0) {
        this[activeIndexProp] = filteredList.length - 1;
      } else if (this[activeIndexProp] >= filteredList.length) {
        this[activeIndexProp] = 0;
      }

      // Optional: Scroll the active item into view
      // You might need a ref on the autocomplete results container and its items
      // Example: this.$refs.autocompleteResults.children[this[activeIndexProp]].scrollIntoView();
    },

    /**
     * @description Selects the currently highlighted item in autocomplete.
     * @param {string} type - 'cliente' or 'membresia'.
     */
    selectHighlighted(type) {
      let activeIndexProp = type === 'cliente' ? 'activeClientIndex' : 'activeMembresiaIndex';
      let filteredList = type === 'cliente' ? this.clientesFiltered : this.tiposMembresiaFiltered;

      if (this[activeIndexProp] > -1 && filteredList[this[activeIndexProp]]) {
        if (type === 'cliente') {
          this.selectCliente(filteredList[this[activeIndexProp]]);
        } else {
          this.selectTipoMembresia(filteredList[this[activeIndexProp]]);
        }
      }
    },


    /**
     * @description Validates form fields before submission.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    validateForm() {
      this.formErrors = {}; // Clear previous errors
      let isValid = true;

      if (!this.miembro.client_id) {
        this.formErrors.client_id = 'Debe seleccionar un cliente.';
        isValid = false;
      }

      if (!this.miembro.id_tipo_membresia) {
        this.formErrors.id_tipo_membresia = 'Debe seleccionar un tipo de membresía.';
        isValid = false;
      }

      if (!this.miembro.fecha_inicio) {
        this.formErrors.fecha_inicio = 'La fecha de inicio es obligatoria.';
        isValid = false;
      }
      if (!this.miembro.fecha_fin) {
        this.formErrors.fecha_fin = 'La fecha de fin es obligatoria.';
        isValid = false;
      }

      // Validate that end date is not before start date
      if (this.miembro.fecha_inicio && this.miembro.fecha_fin) {
        // Ensure dates are compared correctly without timezone issues
        const start = new Date(this.miembro.fecha_inicio + 'T00:00:00');
        const end = new Date(this.miembro.fecha_fin + 'T00:00:00');
        if (start > end) {
          this.formErrors.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
          isValid = false;
        }
      }

      // Status is only mandatory in edit mode
      if (this.isEditMode && !this.miembro.estado) {
        this.formErrors.estado = 'El estado es obligatorio.';
        isValid = false;
      }

      return isValid;
    },

    /**
     * @description Submits the form to create or update a member.
     */
    async submitForm() {
      if (!this.validateForm()) {
        this.feedbackMessage = 'Por favor, corrige los errores del formulario.';
        this.feedbackType = 'error';
        return;
      }

      this.loading = true;
      this.feedbackMessage = '';
      this.feedbackType = '';

      // Create a copy of the member to send
      const memberDataToSend = { ...this.miembro };

      if (!this.isEditMode) {
        // Remove fields that are generated/handled in the backend or are not editable during creation
        delete memberDataToSend.matricula; // Matricula will be generated in the backend
        delete memberDataToSend.id_miembro;
        delete memberDataToSend.fecha_registro;
        delete memberDataToSend.fecha_ultimo_acceso;
        delete memberDataToSend.visitas_realizadas_hoy;
        delete memberDataToSend.fecha_creacion;
        delete memberDataToSend.fecha_actualizacion;
      } else {
        // In edit mode, INCLUDE matricula for the backend (as backend validation expects it).
        // Only remove other non-editable fields that the backend doesn't need or handles on its own.
        delete memberDataToSend.fecha_registro;
        delete memberDataToSend.fecha_creacion;
        delete memberDataToSend.fecha_actualizacion;
        // If the backend doesn't want these fields in the PUT, they can also be removed here:
        // delete memberDataToSend.fecha_ultimo_acceso;
        // delete memberDataToSend.visitas_realizadas_hoy;
      }

      // *** CRITICAL DEBUG CONSOLE ***
      console.log('--- DEBUG: Data to send for UPDATE/CREATE (memberDataToSend) ---');
      console.log(memberDataToSend);
      console.log('Type of memberDataToSend.fecha_inicio:', typeof memberDataToSend.fecha_inicio, 'Value:', memberDataToSend.fecha_inicio);
      console.log('Type of memberDataToSend.fecha_fin:', typeof memberDataToSend.fecha_fin, 'Value:', memberDataToSend.fecha_fin);
      console.log('Type of memberDataToSend.matricula:', typeof memberDataToSend.matricula, 'Value:', memberDataToSend.matricula);
      console.log('Type of memberDataToSend.client_id:', typeof memberDataToSend.client_id, 'Value:', memberDataToSend.client_id);
      console.log('Type of memberDataToSend.id_tipo_membresia:', typeof memberDataToSend.id_tipo_membresia, 'Value:', memberDataToSend.id_tipo_membresia);
      console.log('Type of memberDataToSend.estado:', typeof memberDataToSend.estado, 'Value:', memberDataToSend.estado);
      console.log('----------------------------------------------------------');


      try {
        let response;
        // All member operations (GET, POST, PUT, DELETE) now point to the external API
        if (this.isEditMode) {
          response = await axios.put(`${API_BASE_URL}/api/miembros/${this.miembro.id_miembro}`, memberDataToSend);
        } else {
          response = await axios.post(`${API_BASE_URL}/api/miembros`, memberDataToSend);
        }
        this.feedbackMessage = response.data.mensaje || 'Operación exitosa.';
        this.feedbackType = 'success';

        // If it was a creation, the backend will return the generated matricula
        if (!this.isEditMode && response.data.matricula) {
            console.log('Matrícula generada:', response.data.matricula);
        }

        // Redirect to member list after a short delay
        setTimeout(() => {
          this.$router.push('/crud_miembros_card');
        }, 2000);
      } catch (error) {
        console.error('Error saving member:', error);
        // Display more detailed error message from the API
        this.feedbackMessage = error.response && error.response.data && error.response.data.mensaje
          ? `Error: ${error.response.data.mensaje}`
          : `Error saving member: ${error.message}. Please try again.`;
        this.feedbackType = 'error';
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Resets the form to its initial state.
     */
    resetForm() {
      this.miembro = {
        id_miembro: null,
        matricula: '',
        client_id: null,
        id_tipo_membresia: null,
        estado: 'ACTIVO',
        fecha_inicio: '',
        fecha_fin: '',
        observaciones: '',
        creado_por: '',
      };
      this.clienteSearchText = '';
      this.selectedClientName = '';
      this.tiposMembresiaFiltered = [];
      this.tipoMembresiaSearchText = '';
      this.selectedMembresiaName = '';
      this.clientesFiltered = [];
      this.formErrors = {};
      this.feedbackMessage = '';
      this.feedbackType = '';
      this.activeClientIndex = -1;
      this.activeMembresiaIndex = -1;
      clearTimeout(this.searchClientDebounce);
      clearTimeout(this.searchMembresiaDebounce);
    },

    /**
     * @description Cancels the operation and returns to the member list.
     */
    cancel() {
      this.$router.push('/crud_miembros_card');
    }
  }
};
</script>

<style scoped>
/* General form container styles */
.miembro-form-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
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

/* Form grid styles */
.miembro-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Form group styles (label + input/select/textarea) */
.form-group {
  display: flex;
  flex-direction: column;
  position: relative; /* Necessary to position autocomplete results */
}

.form-group label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  font-size: 0.95rem;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box; /* Ensures padding does not increase total width */
}

/* Style for read-only inputs */
.form-group input[readonly] {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

/* Focus style for inputs/selects/textareas */
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

/* Make some fields span the full row in the grid */
.form-group:has(textarea),
.form-group:has(#estado) {
    grid-column: 1 / -1;
}

/* Autocomplete results styles */
.autocomplete-results {
  position: absolute;
  top: calc(100% + 5px); /* Position below the input with a small margin */
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px; /* Rounded borders for the results container */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px; /* Limit height and allow scrolling */
  overflow-y: auto;
  z-index: 100; /* Ensure it's above other elements */
}

.autocomplete-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee; /* Separator between items */
  transition: background-color 0.2s ease;
}

.autocomplete-item:last-child {
  border-bottom: none; /* No separator on the last item */
}

.autocomplete-item:hover,
.autocomplete-item.active { /* Style for highlighted item */
  background-color: #f0f0f0; /* Background on hover */
}

/* Styles for selected item information (client/membership) */
.selected-info {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #eaf6ff; /* Soft blue background */
  border-left: 4px solid #3498db; /* Blue side bar */
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Styles for clear selection button */
.clear-selection-btn {
  background: none;
  border: none;
  color: #c0392b; /* Red to indicate removal */
  font-weight: bold;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1; /* Ensures icon is vertically centered */
}
.clear-selection-btn:hover {
  color: #e74c3c; /* Darker red on hover */
}

/* Styles for form action buttons */
.form-actions {
  grid-column: 1 / -1; /* Spans the full width of the grid */
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 15px; /* Space between buttons */
  margin-top: 20px;
}

.btn-submit,
.btn-cancel {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.btn-submit {
  background-color: #2ecc71; /* Emerald green */
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #e74c3c; /* Red */
  color: white;
}

.btn-cancel:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
}

/* Feedback messages (success/error) */
.feedback-message {
  grid-column: 1 / -1;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
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

/* Validation error messages */
.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Responsive adjustments for small screens */
@media (max-width: 768px) {
  .miembro-form {
    grid-template-columns: 1fr; /* Single column on small screens */
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
  }
}
</style>

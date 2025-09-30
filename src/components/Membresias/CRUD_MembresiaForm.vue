<template>
  <div class="membresia-form-container">
    <h1 class="title">{{ isEditMode ? 'Editar Tipo de Membresía' : 'Crear Nuevo Tipo de Membresía' }}</h1>
    <hr class="divider">

    <form @submit.prevent="submitForm" class="membresia-form">
      <div class="form-group">
        <label for="nombre_tipo">Nombre del Tipo:</label>
        <input type="text" id="nombre_tipo" v-model="membresia.nombre_tipo" required>
        <span v-if="formErrors.nombre_tipo" class="error-message">{{ formErrors.nombre_tipo }}</span>
      </div>

      <div class="form-group">
        <label for="categoria_membresia">Categoría:</label>
        <input type="text" id="categoria_membresia" v-model="membresia.categoria_membresia">
      </div>

      <div class="form-group radio-group">
        <label>Es Grupal:</label>
        <div>
          <label>
            <input type="radio" v-model="membresia.es_grupal" :value="true"> Sí
          </label>
          <label>
            <input type="radio" v-model="membresia.es_grupal" :value="false"> No
          </label>
        </div>
        <span v-if="formErrors.es_grupal" class="error-message">{{ formErrors.es_grupal }}</span>
      </div>

      <div class="form-group">
        <label for="capacidad_maxima_miembros">Capacidad Máxima Miembros:</label>
        <input
          type="number"
          id="capacidad_maxima_miembros"
          v-model.number="membresia.capacidad_maxima_miembros"
          min="1"
          :disabled="!membresia.es_grupal"
          :class="{ 'disabled-field': !membresia.es_grupal }"
        >
      </div>

      <div class="form-group">
        <label for="valor">Valor:</label>
        <input type="number" id="valor" v-model.number="membresia.valor" step="0.01" required min="0">
        <span v-if="formErrors.valor" class="error-message">{{ formErrors.valor }}</span>
      </div>

      <div class="form-group full-width">
        <label for="descripcion">Descripción:</label>
        <textarea id="descripcion" v-model="membresia.descripcion"></textarea>
      </div>

      <div class="form-group">
        <label for="duracion_dias">Duración (Días):</label>
        <input type="number" id="duracion_dias" v-model.number="membresia.duracion_dias" min="1">
      </div>

      <div class="form-group">
        <label for="visitas_maximas_diarias">Visitas Máximas Diarias:</label>
        <input type="number" id="visitas_maximas_diarias" v-model.number="membresia.visitas_maximas_diarias" min="0">
      </div>

      <!-- Campo de selección de Áreas de Acceso -->
      <div class="form-group full-width access-areas-group">
        <label>Áreas de Acceso:</label>
        <div v-if="loadingAreas" class="loading-areas">Cargando áreas disponibles...</div>
        <div v-else-if="areasError" class="error-message">Error al cargar áreas: {{ areasError }}</div>
        <div v-else-if="allAvailableAreas.length > 0" class="areas-checkbox-grid">
          <label v-for="area in allAvailableAreas" :key="area.id_area" class="checkbox-item">
            <input type="checkbox" :value="area.nombre_area" v-model="selectedAreas">
            {{ area.nombre_area }}
          </label>
        </div>
        <p v-else class="no-areas-message">No hay áreas de acceso disponibles. Configúralas en el backend.</p>
      </div>

      <!-- Campo de búsqueda y selección de Combo/Ensamblado Incluido -->
      <div class="form-group">
        <label for="productoSearch">ID Combo/Ensamblado Incluido:</label>
        <input
          type="text"
          id="productoSearch"
          v-model="productoSearchText"
          @input="searchProducts"
          @keydown.up.prevent="navigateResults('product', -1)"
          @keydown.down.prevent="navigateResults('product', 1)"
          @keydown.enter.prevent="selectHighlighted('product')"
          placeholder="Buscar producto por código..."
        >
        <div v-if="productosFiltered.length > 0 && productoSearchText && !membresia.id_combo_ensamblado_incluido" class="autocomplete-results">
          <div
            v-for="(producto, index) in productosFiltered"
            :key="producto.PdctEnsb_ID"
            :class="{ 'autocomplete-item': true, 'active': index === activeProductIndex }"
            @click="selectProduct(producto)"
          >
            {{ producto.PdctEnsb_codigoEnsamble }} (ID: {{ producto.PdctEnsb_ID }})
          </div>
        </div>
        <p v-if="membresia.id_combo_ensamblado_incluido && selectedProductName" class="selected-info">
          Producto Seleccionado: <strong>{{ selectedProductName }}</strong> (ID: {{ membresia.id_combo_ensamblado_incluido }})
          <button type="button" @click="clearProductSelection" class="clear-selection-btn">x</button>
        </p>
      </div>


      <div class="form-group">
        <label for="cantidad_combo_incluido">Cantidad Combo Incluido:</label>
        <input
          type="number"
          id="cantidad_combo_incluido"
          v-model.number="membresia.cantidad_combo_incluido"
          min="1"
          :disabled="!membresia.id_combo_ensamblado_incluido"
          :class="{ 'disabled-field': !membresia.id_combo_ensamblado_incluido }"
        >
      </div>

      <div class="form-group">
        <label for="estado_tipo">Estado del Tipo:</label>
        <select id="estado_tipo" v-model="membresia.estado_tipo">
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
          <option value="ELIMINADO">ELIMINADO</option>
        </select>
        <span v-if="formErrors.estado_tipo" class="error-message">{{ formErrors.estado_tipo }}</span>
      </div>

      <div class="form-actions full-width">
        <button type="submit" class="btn-submit" :disabled="loading || loadingAreas || loadingProducts">
          {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar Membresía' : 'Crear Membresía') }}
        </button>
        <button type="button" @click="cancel" class="btn-cancel">Cancelar</button>
      </div>

      <p v-if="feedbackMessage" :class="['feedback-message', feedbackType]">{{ feedbackMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

// Define the base URL of the external API using a Vue CLI environment variable
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net'; // Fallback

export default {
  name: 'CRUD_MembresiaForm',
  props: {
    id: { // The ID of the membership type if in edit mode
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      membresia: {
        id_tipo_membresia: null,
        nombre_tipo: '',
        categoria_membresia: '',
        es_grupal: false,
        capacidad_maxima_miembros: 1,
        valor: 0.00,
        descripcion: '',
        duracion_dias: null,
        visitas_maximas_diarias: null,
        areas_de_acceso: '', // This will be handled internally as a CSV string
        id_combo_ensamblado_incluido: null,
        cantidad_combo_incluido: 1,
        estado_tipo: 'ACTIVO',
      },
      allAvailableAreas: [], // Master list of all areas from the DB
      selectedAreas: [],     // Array of selected area names (for checkboxes)

      allAvailableProducts: [], // Master list of all assembled products from the DB
      productosFiltered: [],    // Filtered products for the autocomplete search
      productoSearchText: '',
      selectedProductName: '',  // To display the selected product's name

      loading: false,
      loadingAreas: true,
      loadingProducts: true, // New loading state for products
      isEditMode: false,
      feedbackMessage: '',
      feedbackType: '',
      formErrors: {},
      areasError: null,
      productsError: null, // New error state for products

      activeProductIndex: -1, // Index of the currently highlighted product in autocomplete
    };
  },
  watch: {
    // Watch the route ID to determine mode (create/edit)
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.isEditMode = !!newId;
        if (this.isEditMode) {
          this.membresia.id_tipo_membresia = newId;
          this.fetchMembresia(newId);
        } else {
          this.resetForm();
        }
      }
    },
    // Watch 'es_grupal' to disable 'capacidad_maxima_miembros'
    'membresia.es_grupal'(newValue) {
      if (!newValue) {
        this.membresia.capacidad_maxima_miembros = 1; // Reset to 1 if not group
      }
    },
    // Watch 'id_combo_ensamblado_incluido' to disable 'cantidad_combo_incluido'
    'membresia.id_combo_ensamblado_incluido'(newValue) {
      if (!newValue) {
        this.membresia.cantidad_combo_incluido = 1; // Reset to 1 if no product selected
      }
    }
  },
  async created() {
    // Load all available areas and products when the component is created
    await Promise.all([
      this.fetchAllAvailableAreas(),
      this.fetchAllAvailableProducts()
    ]);
  },
  methods: {
    /**
     * @description Loads existing membership type data for editing.
     * @param {number} id - ID of the membership type.
     */
    async fetchMembresia(id) {
      this.loading = true;
      this.feedbackMessage = '';
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tipos-membresia/${id}`);
        const data = response.data;

        // Assign data to membership, converting booleans and numbers if necessary
        this.membresia = {
          ...data,
          es_grupal: data.es_grupal === 1 || data.es_grupal === true, // Convert TINYINT(1) to boolean
          capacidad_maxima_miembros: data.capacidad_maxima_miembros !== null ? Number(data.capacidad_maxima_miembros) : 1,
          valor: data.valor !== null ? Number(data.valor) : 0.00,
          duracion_dias: data.duracion_dias !== null ? Number(data.duracion_dias) : null,
          visitas_maximas_diarias: data.visitas_maximas_diarias !== null ? Number(data.visitas_maximas_diarias) : null,
          id_combo_ensamblado_incluido: data.id_combo_ensamblado_incluido !== null ? Number(data.id_combo_ensamblado_incluido) : null,
          cantidad_combo_incluido: data.cantidad_combo_incluido !== null ? Number(data.cantidad_combo_incluido) : 1,
        };

        // Convert the comma-separated area string to an array for checkboxes
        this.selectedAreas = data.areas_de_acceso ? data.areas_de_acceso.split(',').map(area => area.trim()) : [];

        // For assembled product, populate search text and selected name
        if (data.id_combo_ensamblado_incluido) {
          const foundProduct = this.allAvailableProducts.find(p => p.PdctEnsb_ID === data.id_combo_ensamblado_incluido);
          if (foundProduct) {
            this.productoSearchText = foundProduct.PdctEnsb_codigoEnsamble;
            this.selectedProductName = foundProduct.PdctEnsb_codigoEnsamble;
          }
        }

      } catch (error) {
        console.error('Error loading membership type:', error);
        this.feedbackMessage = 'Error loading membership type data.';
        this.feedbackType = 'error';
        this.$router.push('/crud_membresias'); // Redirect to list if error occurs
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Loads the master list of all available access areas.
     */
    async fetchAllAvailableAreas() {
      this.loadingAreas = true;
      this.areasError = null;
      try {
        // Call the new endpoint to list configuration areas
        const response = await axios.get(`${API_BASE_URL}/api/areas`);
        this.allAvailableAreas = response.data;
      } catch (error) {
        console.error('Error loading master list of areas:', error);
        // Replace optional chaining with a compatible check for ES5/ES6
        this.areasError = (error.response && error.response.data && error.response.data.mensaje) ? error.response.data.mensaje : 'Unknown error loading areas.';
        this.feedbackMessage = 'Could not load available areas.';
        this.feedbackType = 'error';
      } finally {
        this.loadingAreas = false;
      }
    },

    /**
     * @description Loads the master list of all available assembled products.
     */
    async fetchAllAvailableProducts() {
      this.loadingProducts = true;
      this.productsError = null;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/productos-ensamblados`);
        this.allAvailableProducts = response.data;
      } catch (error) {
        console.error('Error loading assembled products:', error);
        this.productsError = (error.response && error.response.data && error.response.data.mensaje) ? error.response.data.mensaje : 'Unknown error loading products.';
        this.feedbackMessage = 'Could not load assembled products.';
        this.feedbackType = 'error';
      } finally {
        this.loadingProducts = false;
      }
    },

    /**
     * @description Performs a local search of assembled products (filtering preloaded ones).
     */
    searchProducts() {
        this.activeProductIndex = -1; // Reset active index on new search input
        // Clear previous selection if user starts typing again
        if (this.membresia.id_combo_ensamblado_incluido && this.productoSearchText !== this.selectedProductName) {
            this.membresia.id_combo_ensamblado_incluido = null;
            this.selectedProductName = '';
        }
        if (this.productoSearchText.length > 1) { // Search from 2 characters
            const lowerCaseSearch = this.productoSearchText.toLowerCase();
            this.productosFiltered = this.allAvailableProducts.filter(product =>
                (product.PdctEnsb_codigoEnsamble && product.PdctEnsb_codigoEnsamble.toLowerCase().includes(lowerCaseSearch)) ||
                (product.PdctEnsb_codigoProducto && product.PdctEnsb_codigoProducto.toLowerCase().includes(lowerCaseSearch)) // Also search by PdctEnsb_codigoProducto if relevant
            ).slice(0, 10); // Limit results
        } else {
            this.productosFiltered = []; // Clear results if text is too short
        }
    },

    /**
     * @description Selects a product from the search results.
     * @param {Object} product - Selected product object.
     */
    selectProduct(product) {
        this.membresia.id_combo_ensamblado_incluido = product.PdctEnsb_ID;
        this.productoSearchText = product.PdctEnsb_codigoEnsamble;
        this.selectedProductName = product.PdctEnsb_codigoEnsamble;
        this.productosFiltered = []; // Hide results after selection
        this.activeProductIndex = -1; // Reset active index
    },

    /**
     * @description Clears the current product selection.
     */
    clearProductSelection() {
      this.membresia.id_combo_ensamblado_incluido = null;
      this.membresia.cantidad_combo_incluido = 1; // Reset quantity when clearing product
      this.productoSearchText = '';
      this.selectedProductName = '';
      this.productosFiltered = [];
      this.activeProductIndex = -1;
    },

    /**
     * @description Navigates autocomplete results using arrow keys.
     * @param {string} type - 'product' for product search.
     * @param {number} direction - 1 for down, -1 for up.
     */
    navigateResults(type, direction) {
      let activeIndexProp;
      let filteredList;

      if (type === 'product') {
        activeIndexProp = 'activeProductIndex';
        filteredList = this.productosFiltered;
      } else {
        return; // No other types supported here for keyboard navigation yet
      }

      if (!filteredList.length) return;

      this[activeIndexProp] += direction;

      // Wrap around logic
      if (this[activeIndexProp] < 0) {
        this[activeIndexProp] = filteredList.length - 1;
      } else if (this[activeIndexProp] >= filteredList.length) {
        this[activeIndexProp] = 0;
      }
    },

    /**
     * @description Selects the currently highlighted item in autocomplete.
     * @param {string} type - 'product' for product search.
     */
    selectHighlighted(type) {
      let activeIndexProp;
      let filteredList;

      if (type === 'product') {
        activeIndexProp = 'activeProductIndex';
        filteredList = this.productosFiltered;
      } else {
        return;
      }

      if (this[activeIndexProp] > -1 && filteredList[this[activeIndexProp]]) {
        if (type === 'product') {
          this.selectProduct(filteredList[this[activeIndexProp]]);
        }
      }
    },

    /**
     * @description Validates form fields before submission.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    validateForm() {
      this.formErrors = {};
      let isValid = true;

      if (!this.membresia.nombre_tipo) {
        this.formErrors.nombre_tipo = 'El nombre del tipo de membresía es obligatorio.';
        isValid = false;
      }
      if (this.membresia.es_grupal === undefined) {
        this.formErrors.es_grupal = 'Debe especificar si la membresía es grupal.';
        isValid = false;
      }
      if (this.membresia.valor === undefined || this.membresia.valor < 0) {
        this.formErrors.valor = 'El valor es obligatorio y debe ser mayor o igual a 0.';
        isValid = false;
      }
      if (!this.membresia.estado_tipo) {
        this.formErrors.estado_tipo = 'El estado del tipo es obligatorio.';
        isValid = false;
      }
      // If group membership is true, capacity should be > 1
      if (this.membresia.es_grupal && (this.membresia.capacidad_maxima_miembros === null || this.membresia.capacidad_maxima_miembros <= 1)) {
        this.formErrors.capacidad_maxima_miembros = 'La capacidad debe ser mayor a 1 para membresías grupales.';
        isValid = false;
      }
      // If a combo is included, quantity must be > 0
      if (this.membresia.id_combo_ensamblado_incluido && (this.membresia.cantidad_combo_incluido === null || this.membresia.cantidad_combo_incluido <= 0)) {
        this.formErrors.cantidad_combo_incluido = 'La cantidad del combo debe ser mayor a 0.';
        isValid = false;
      }


      return isValid;
    },

    /**
     * @description Submits the form to create or update a membership type.
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

      // Create a copy of the object to send, adjusting types and fields
      const dataToSend = { ...this.membresia };

      // Convert array of selected areas to a CSV string
      dataToSend.areas_de_acceso = this.selectedAreas.join(',');

      // Ensure numeric fields are null if empty or non-numeric
      dataToSend.capacidad_maxima_miembros = dataToSend.capacidad_maxima_miembros || (dataToSend.es_grupal ? 1 : null); // If not group, can be null
      dataToSend.duracion_dias = dataToSend.duracion_dias || null;
      dataToSend.visitas_maximas_diarias = dataToSend.visitas_maximas_diarias || null;
      dataToSend.id_combo_ensamblado_incluido = dataToSend.id_combo_ensamblado_incluido || null;
      dataToSend.cantidad_combo_incluido = dataToSend.cantidad_combo_incluido || (dataToSend.id_combo_ensamblado_incluido ? 1 : null); // If combo exists, default to 1


      dataToSend.es_grupal = dataToSend.es_grupal ? 1 : 0; // Convert boolean to 0/1 for MySQL TINYINT(1)


      try {
        let response;
        if (this.isEditMode) {
          response = await axios.put(`${API_BASE_URL}/api/tipos-membresia/${this.membresia.id_tipo_membresia}`, dataToSend);
        } else {
          response = await axios.post(`${API_BASE_URL}/api/tipos-membresia`, dataToSend);
        }
        this.feedbackMessage = response.data.mensaje || 'Operación exitosa.';
        this.feedbackType = 'success';

        setTimeout(() => {
          this.$router.push('/crud_membresias'); // Redirect to membership types list
        }, 2000);
      } catch (error) {
        console.error('Error saving membership type:', error);
        this.feedbackMessage = error.response && error.response.data && error.response.data.mensaje
          ? `Error: ${error.response.data.mensaje}`
          : `Error saving membership type: ${error.message}. Please try again.`;
        this.feedbackType = 'error';
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Resets the form to its initial state.
     */
    resetForm() {
      this.membresia = {
        id_tipo_membresia: null,
        nombre_tipo: '',
        categoria_membresia: '',
        es_grupal: false,
        capacidad_maxima_miembros: 1,
        valor: 0.00,
        descripcion: '',
        duracion_dias: null,
        visitas_maximas_diarias: null,
        areas_de_acceso: '',
        id_combo_ensamblado_incluido: null,
        cantidad_combo_incluido: 1,
        estado_tipo: 'ACTIVO',
      };
      this.selectedAreas = [];
      this.allAvailableProducts = []; // Clear products on reset
      this.productoSearchText = '';
      this.selectedProductName = '';
      this.productosFiltered = [];
      this.formErrors = {};
      this.feedbackMessage = '';
      this.feedbackType = '';
      this.activeProductIndex = -1;
    },

    /**
     * @description Cancels the operation and returns to the membership types list.
     */
    cancel() {
      this.$router.push('/crud_membresias');
    }
  }
};
</script>

<style scoped>
.membresia-form-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 15px;
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

.membresia-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative; /* For autocomplete */
}

.form-group label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  font-size: 0.95rem;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.form-group input.disabled-field {
  background-color: #f0f0f0;
  cursor: not-allowed;
}


.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.radio-group div {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}

.radio-group label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 5px;
}

.radio-group input[type="radio"] {
  transform: scale(1.1);
}

/* Access Areas Checkbox Grid */
.access-areas-group {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.access-areas-group label {
  margin-bottom: 10px;
  color: #333;
}

.areas-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #444;
  cursor: pointer;
  padding: 8px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}

.checkbox-item:hover {
  background-color: #eef;
}

.checkbox-item input[type="checkbox"] {
  transform: scale(1.1);
  cursor: pointer;
}

.loading-areas, .no-areas-message {
  text-align: center;
  color: #777;
  padding: 10px;
}

/* Autocomplete styles (for products) */
.autocomplete-results {
  position: absolute;
  top: calc(100% + 5px); /* Position below the input with a small margin */
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.autocomplete-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover,
.autocomplete-item.active { /* Style for highlighted item */
  background-color: #f0f0f0;
}

.selected-info {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #eaf6ff;
  border-left: 4px solid #3498db;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-selection-btn {
  background: none;
  border: none;
  color: #c0392b;
  font-weight: bold;
  font-size: 1.2em;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}

.clear-selection-btn:hover {
  color: #e74c3c;
}


.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
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
  background-color: #2ecc71;
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
  background-color: #e74c3c;
  color: white;
}

.btn-cancel:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
}

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

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .membresia-form {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: auto; /* Allow full-width elements to collapse to single column */
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-submit, .btn-cancel {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .areas-checkbox-grid {
    grid-template-columns: 1fr; /* One column for areas on very small mobiles */
  }
}
</style>

<template>
    <div class="access-card-container">
      <div class="card-header-section">
        <h2 class="card-title">Tarjeta de Acceso del Miembro</h2>
        <button @click="goBack" class="back-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-arrow-left">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Volver a Miembros
        </button>
      </div>
  
      <p v-if="loading" class="loading-message">Cargando datos del miembro...</p>
      <p v-else-if="error" class="error-message">Error: {{ error }}</p>
  
      <div v-else-if="miembro" class="access-card">
        <div class="member-info">
          <div class="avatar">{{ getInitials(miembro.client_nombre) }}</div>
          <div class="details">
            <h3>{{ miembro.client_nombre }}</h3>
            <p><strong>Matrícula:</strong> {{ miembro.matricula }}</p>
            <p><strong>Membresía:</strong> {{ miembro.nombre_tipo_membresia }}</p>
            <p><strong>Estado:</strong> <span :class="['status-text', getStatusClass(miembro.estado)]">{{ miembro.estado }}</span></p>
            <p><strong>Válida hasta:</strong> {{ formatDate(miembro.fecha_fin) }}</p>
          </div>
        </div>
  
        <div class="code-display">
          <div class="code-type-selector">
            <label class="radio-label">
              <input type="radio" v-model="codeType" value="barcode"> Código de Barras
            </label>
            <label class="radio-label">
              <input type="radio" v-model="codeType" value="qr"> Código QR
            </label>
          </div>
  
          <div v-if="miembro.matricula">
            <div v-if="codeType === 'barcode'" class="barcode-container">
              <svg id="barcodeCanvas" class="barcode-svg"></svg>
              <p class="barcode-text">{{ miembro.matricula }}</p>
            </div>
            <div v-else class="qr-code-container">
              <qrcode-vue :value="miembro.matricula" :size="qrSize" level="H"></qrcode-vue>
            </div>
          </div>
          <p v-else class="no-code-message">Matrícula no disponible para generar código.</p>
        </div>
  
        <div class="access-area-selection">
          <h4>Simular Acceso a Área:</h4>
          <select v-model="selectedAreaId" class="area-select">
            <option value="">Selecciona un área</option>
            <option v-for="area in areas" :key="area.id_area" :value="area.id_area">
              {{ area.nombre_area }}
            </option>
          </select>
          <button @click="simulateAccess" :disabled="!selectedAreaId || simulatingAccess" class="simulate-access-button">
            {{ simulatingAccess ? 'Accediendo...' : 'Acceder' }}
          </button>
          <p v-if="accessMessage" :class="['access-feedback', accessFeedbackType]">{{ accessMessage }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import JsBarcode from 'jsbarcode';
  import QrcodeVue from 'qrcode.vue';
  
  // Define la URL base de la API externa usando una variable de entorno de Vue CLI
  const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'http://localhost:3000';
  
  export default {
    name: 'MiembroAccessCard',
    components: {
      QrcodeVue,
    },
    props: {
      id: { // El ID del miembro pasado por la ruta (ej. /access-card/:id)
        type: [String, Number],
        required: true
      }
    },
    data() {
      return {
        miembro: null,
        areas: [], // Lista de áreas de acceso
        loading: true,
        error: null,
        codeType: 'barcode', // 'barcode' o 'qr'
        qrSize: 200, // Tamaño del QR
        selectedAreaId: '', // ID del área seleccionada para simular acceso
        simulatingAccess: false,
        accessMessage: '',
        accessFeedbackType: '', // 'success' o 'error'
      };
    },
    watch: {
      miembro: {
        handler(newMiembro) {
          // Regenerar el código de barras cuando el miembro cambie o se cargue por primera vez
          if (newMiembro && newMiembro.matricula && this.codeType === 'barcode') {
            this.$nextTick(() => {
              this.generateBarcode();
            });
          }
        },
        immediate: true, // Ejecutar el handler inmediatamente al montar
      },
      codeType(newType) {
        // Regenerar el código de barras si se selecciona ese tipo
        if (newType === 'barcode' && this.miembro && this.miembro.matricula) {
          this.$nextTick(() => {
            this.generateBarcode();
          });
        }
      }
    },
    async created() {
      await this.fetchMiembro();
      await this.fetchAreas();
    },
    methods: {
      /**
       * @description Fetches member data from the external API based on the route ID.
       */
      async fetchMiembro() {
        this.loading = true;
        this.error = null;
        try {
          const response = await axios.get(`${API_BASE_URL}/api/miembros/${this.id}`);
          this.miembro = response.data;
        } catch (err) {
          console.error('Error fetching member for access card:', err);
          this.error = 'No se pudo cargar la información del miembro.';
          // Optional: Redirect if member is not found
          // this.$router.push('/crud_miembros_card');
        } finally {
          this.loading = false;
        }
      },
  
      /**
       * @description Fetches access areas from the API.
       * Assumes an endpoint /api/areas (you might need to create this in your backend).
       */
      async fetchAreas() {
          try {
              // NOTE: You'll need to implement this API endpoint in your backend
              // For now, it will likely return an empty array or an error if not implemented.
              const response = await axios.get(`${API_BASE_URL}/api/areas`);
              this.areas = response.data;
          } catch (error) {
              console.error('Error fetching areas:', error);
              // This error might be expected if the /api/areas endpoint doesn't exist yet.
              // this.error = 'No se pudieron cargar las áreas de acceso.';
          }
      },
  
      /**
       * @description Generates a barcode using JsBarcode library.
       */
      generateBarcode() {
        if (this.miembro && this.miembro.matricula) {
          try {
            JsBarcode("#barcodeCanvas", this.miembro.matricula, {
              format: "CODE128", // Common barcode format
              displayValue: false, // Don't display the number below, we'll add it ourselves
              width: 2,
              height: 100,
              margin: 10,
            });
          } catch (e) {
            console.error("Error generating barcode:", e);
            // Fallback message for barcode generation error
            const barcodeElement = document.getElementById('barcodeCanvas');
            if (barcodeElement) {
              barcodeElement.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="red">Error al generar código de barras</text>';
            }
          }
        }
      },
  
      /**
       * @description Generates initials for the avatar.
       * @param {string} nombre - Full name.
       * @returns {string} - Uppercase initials.
       */
      getInitials(nombre) {
        if (!nombre) return 'N/A';
        const parts = nombre.split(' ').filter(n => n.length > 0).map(n => n[0]);
        if (parts.length >= 2) {
          return (parts[0] + parts[1]).substring(0, 2).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          return parts[0].substring(0, 2).toUpperCase();
        }
        return nombre.substring(0, 1).toUpperCase();
      },
  
      /**
       * @description Formats a date string to a readable format.
       * @param {string} dateString - Date in string format (e.g., from DB).
       * @returns {string} - Formatted date.
       */
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      },
  
      /**
       * @description Returns the CSS class based on member status.
       * @param {string} estado - Member status ('ACTIVO', 'VENCIDO', 'SUSPENDIDO', 'CANCELADO').
       * @returns {string} - Corresponding CSS class.
       */
      getStatusClass(estado) {
        switch (estado) {
          case 'ACTIVO': return 'status-active';
          case 'VENCIDO': return 'status-expired';
          case 'SUSPENDIDO': return 'status-suspended';
          case 'CANCELADO': return 'status-canceled';
          default: return '';
        }
      },
  
      /**
       * @description Simulates an access attempt by logging the member and area.
       * In a real scenario, this would call a backend API.
       */
      async simulateAccess() {
        if (!this.selectedAreaId || !this.miembro || !this.miembro.id_miembro) {
          this.accessMessage = 'Por favor, selecciona un área y asegúrate de que el miembro esté cargado.';
          this.accessFeedbackType = 'error';
          return;
        }
  
        this.simulatingAccess = true;
        this.accessMessage = '';
        this.accessFeedbackType = '';
  
        const areaName = this.areas.find(a => a.id_area === this.selectedAreaId)?.nombre_area || 'Área Desconocida';
  
        try {
          // En un escenario real, harías una llamada POST a tu API de backend
          // (ej. /api/visitas) para registrar la visita.
          // Ejemplo de lo que enviarías:
          const visitData = {
            id_miembro: this.miembro.id_miembro,
            area_acceso: areaName,
            registrado_por: 'Sistema de Acceso', // O el usuario logeado
            observaciones: `Acceso simulado a ${areaName}`
          };
  
          // NOTA: Necesitarás crear un endpoint en tu backend para esto, por ejemplo:
          // rutas.post('/api/visitas', controladorVisitas.registrarVisita);
          const response = await axios.post(`${API_BASE_URL}/api/visitas`, visitData); // Este endpoint NO existe aún en tu API externa
  
          this.accessMessage = `Acceso exitoso a ${areaName} para ${this.miembro.client_nombre}!`;
          this.accessFeedbackType = 'success';
          console.log('Visita registrada (simulado):', response.data);
  
          // Opcional: Actualizar el campo visitas_realizadas_hoy en la DB del miembro
          // Esto requeriría una llamada PUT adicional o que el registro de visita lo haga.
  
        } catch (error) {
          console.error('Error al simular acceso:', error);
          this.accessMessage = `Error al acceder a ${areaName}. Por favor, inténtalo de nuevo.`;
          this.accessFeedbackType = 'error';
          if (error.response && error.response.data && error.response.data.mensaje) {
            this.accessMessage = `Error de Acceso: ${error.response.data.mensaje}`;
          }
        } finally {
          this.simulatingAccess = false;
          setTimeout(() => { this.accessMessage = ''; }, 5000); // Clear message after 5 seconds
        }
      },
  
      /**
       * @description Navigates back to the members list.
       */
      goBack() {
        this.$router.push('/crud_miembros_card');
      }
    },
  };
  </script>
  
  <style scoped>
  .access-card-container {
    max-width: 600px;
    margin: 30px auto;
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  }
  
  .card-header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .card-title {
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .back-button {
    background: #e0e0e0;
    color: #555;
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }
  
  .back-button:hover {
    background-color: #c0c0c0;
  }
  
  .icon-arrow-left {
    width: 18px;
    height: 18px;
  }
  
  .loading-message, .error-message {
    text-align: center;
    padding: 20px;
    font-size: 1.1rem;
    color: #555;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  .access-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .member-info {
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.8rem;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .details h3 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1.8rem;
    font-weight: 600;
  }
  
  .details p {
    margin: 5px 0;
    font-size: 1rem;
    color: #555;
  }
  
  .status-text {
    font-weight: bold;
  }
  
  .status-active { color: #28a745; } /* Green */
  .status-expired { color: #ffc107; } /* Yellow/Orange */
  .status-suspended { color: #6c757d; } /* Gray */
  .status-canceled { color: #dc3545; } /* Red */
  
  .code-display {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .code-type-selector {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    cursor: pointer;
    color: #555;
  }
  
  .radio-label input[type="radio"] {
    transform: scale(1.2);
    cursor: pointer;
  }
  
  .barcode-container, .qr-code-container {
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    display: inline-block; /* To center the container */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .barcode-svg {
    width: 100%;
    max-width: 300px; /* Limit barcode width */
    height: auto;
  }
  
  .barcode-text {
    font-family: 'Consolas', monospace;
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: 10px;
    color: #333;
  }
  
  .qr-code-container canvas {
    display: block; /* Remove extra space below canvas */
    margin: 0 auto;
  }
  
  .no-code-message {
    color: #dc3545;
    font-size: 1rem;
    padding: 10px;
    border: 1px dashed #dc3545;
    border-radius: 8px;
  }
  
  .access-area-selection {
    border-top: 1px solid #eee;
    padding-top: 20px;
    text-align: center;
  }
  
  .access-area-selection h4 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.2rem;
  }
  
  .area-select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin-right: 10px;
    width: calc(100% - 100px); /* Adjust width for button */
    max-width: 250px;
  }
  
  .simulate-access-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .simulate-access-button:hover:not(:disabled) {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  
  .simulate-access-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .access-feedback {
    margin-top: 15px;
    padding: 10px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.95rem;
  }
  
  .access-feedback.success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .access-feedback.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  /* Responsive adjustments */
  @media (max-width: 480px) {
    .access-card-container {
      padding: 20px;
    }
    .card-title {
      font-size: 1.6rem;
    }
    .member-info {
      flex-direction: column;
      text-align: center;
    }
    .area-select {
      width: 100%;
      margin-right: 0;
      margin-bottom: 10px;
    }
    .simulate-access-button {
      width: 100%;
    }
  }
  </style>
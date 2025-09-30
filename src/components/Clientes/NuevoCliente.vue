<template>
  <div class="form-container">
    <div class="form-header">
      <h3 class="form-title">
        <!-- Icono de Nuevo Cliente (fa fa-user-plus) a Material Design (mdi-account-plus) -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
        </svg>
        Nuevo Cliente
      </h3>
      <p class="form-subtitle">Registra la información del cliente en el sistema</p>
    </div>
    
    <form @submit.prevent="submitForm" id="clientForm">
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label" for="txt_nombre">Nombre Completo</label>
          <input 
            v-model="client.nombre"
            type="text" 
            class="form-control"
            :class="{ error: errors.nombre, 'success-pulse': validFields.nombre }"
            placeholder="Ingrese el nombre completo del cliente" 
            id="txt_nombre" 
            required
            @blur="validateField('nombre')"
            @input="clearError('nombre')"
          >
          <!-- Icono de Usuario (fa fa-user) a Material Design (mdi-account) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <div class="status-indicator"></div>
          <div class="error-message" v-show="errors.nombre">Por favor ingrese un nombre válido</div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="txt_idRuc">Cédula/RUC</label>
          <input 
            v-model="client.rucCed"
            type="text" 
            class="form-control"
            :class="{ error: errors.rucCed, 'success-pulse': validFields.rucCed }"
            placeholder="Cédula o RUC" 
            id="txt_idRuc" 
            required
            @blur="validateField('rucCed')"
            @input="clearError('rucCed')"
          >
          <!-- Icono de ID Card (fa fa-id-card) a Material Design (mdi-card-account-details) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M20 2H4c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 18H4V4h16v16zM10 9c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm6 0c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-6 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm6 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
          </svg>
          <div class="status-indicator"></div>
          <div class="error-message" v-show="errors.rucCed">Formato de cédula/RUC inválido</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="txt_telf">Teléfono</label>
          <input 
            v-model="client.telefono"
            type="tel" 
            class="form-control"
            :class="{ error: errors.telefono, 'success-pulse': validFields.telefono }"
            placeholder="Número telefónico" 
            id="txt_telf" 
            required
            @blur="validateField('telefono')"
            @input="formatPhone"
          >
          <!-- Icono de Teléfono (fa fa-phone) a Material Design (mdi-phone) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.75-.25 1.02l-2.2 2.2z"></path>
          </svg>
          <div class="status-indicator"></div>
          <div class="error-message" v-show="errors.telefono">Número de teléfono inválido</div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label" for="txt_direc">Dirección</label>
          <input 
            v-model="client.direccion"
            type="text" 
            class="form-control"
            :class="{ error: errors.direccion, 'success-pulse': validFields.direccion }"
            placeholder="Dirección completa del cliente" 
            id="txt_direc" 
            required
            @blur="validateField('direccion')"
            @input="clearError('direccion')"
          >
          <!-- Icono de Mapa (fa fa-map-marker) a Material Design (mdi-map-marker) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"></path>
          </svg>
          <div class="status-indicator"></div>
          <div class="error-message" v-show="errors.direccion">Por favor ingrese una dirección válida</div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="txt_mail">Correo Electrónico</label>
          <input 
            v-model="client.email"
            type="email" 
            class="form-control"
            :class="{ error: errors.email, 'success-pulse': validFields.email }"
            placeholder="ejemplo@correo.com" 
            id="txt_mail" 
            required
            @blur="validateField('email')"
            @input="clearError('email')"
          >
          <!-- Icono de Email (fa fa-envelope) a Material Design (mdi-email) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
          </svg>
          <div class="status-indicator"></div>
          <div class="error-message" v-show="errors.email">Formato de correo inválido</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="reg">Fecha de Registro</label>
          <input 
            v-model="client.fechaReg"
            type="datetime-local" 
            class="form-control" 
            id="reg" 
            required
          >
          <!-- Icono de Calendario (fa fa-calendar) a Material Design (mdi-calendar) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="input-icon">
            <path d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z"></path>
          </svg>
          <div class="status-indicator"></div>
        </div>
      </div>
      
      <div class="button-group">
        <button type="submit" class="btn btn-primary" :class="{ loading: isSubmitting }" :disabled="isSubmitting">
          <div class="loading-spinner"></div>
          <span class="btn-text">
            <!-- Icono de Guardar (fa fa-save) a Material Design (mdi-content-save) -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8h10zM17 3H7v5h10V3z"></path>
            </svg> Guardar Cliente
          </span>
        </button>
        <button type="button" class="btn btn-secondary" @click="cancelForm">
          <span class="btn-text">
            <!-- Icono de Cancelar (fa fa-times) a Material Design (mdi-close) -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg> Cancelar
          </span>
        </button>
      </div>
      
      <button 
        type="button" 
        class="btn btn-cloud" 
        :class="{ loading: isConsulting }" 
        :disabled="isConsulting"
        @click="consultaCliente"
      >
        <div class="loading-spinner"></div>
        <span class="btn-text">
          <!-- Icono de Nube (fa fa-cloud) a Material Design (mdi-cloud) -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="btn-icon">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.86 2.65-7.48 6.04C2.7 10.74 0 13.32 0 16c0 3.31 2.69 6 6 6h13c3.31 0 6-2.69 6-6 0-2.97-2.16-5.43-5.65-5.96zM19 20H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71c.96-1.81 2.82-3 4.88-3 2.14 0 4.08 1.22 5.06 3.04.14.02.28.05.42.05 2.21 0 4 1.79 4 4s-1.79 4-4 4z"></path>
          </svg> Consultar Cliente Cloud
        </span>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'NuevoCliente',
  data() {
    return {
      client: {
        nombre: '',
        rucCed: '',
        telefono: '',
        direccion: '',
        email: '',
        fechaReg: '',
        estado: 1
      },
      errors: {
        nombre: false,
        rucCed: false,
        telefono: false,
        direccion: false,
        email: false
      },
      validFields: {
        nombre: false,
        rucCed: false,
        telefono: false,
        direccion: false,
        email: false
      },
      isSubmitting: false,
      isConsulting: false,
      // URL base de la API desde variables de entorno
      apiBaseUrl: process.env.VUE_APP_SERV_API || 'https://app.factura-e.net'
    }
  },
  mounted() {
    this.setCurrentDateTime();
  },
  methods: {
    setCurrentDateTime() {
      const now = new Date();
      const datetime = now.toISOString().slice(0, 16);
      this.client.fechaReg = datetime;
    },
    
    validateField(fieldName) {
      const value = this.client[fieldName].trim();
      let isValid = true;

      switch(fieldName) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(value);
          break;
        case 'telefono':
          const phoneRegex = /^[0-9\-\+\s\(\)]{10,}$/;
          isValid = phoneRegex.test(value.replace(/\s/g, ''));
          break;
        default:
          isValid = value.length >= 2;
      }

      this.errors[fieldName] = !isValid && value !== '';
      this.validFields[fieldName] = isValid && value !== '';
      
      if (this.validFields[fieldName]) {
        setTimeout(() => {
          this.validFields[fieldName] = false;
        }, 600);
      }

      return isValid;
    },
    
    clearError(fieldName) {
      if (this.errors[fieldName]) {
        this.validateField(fieldName);
      }
    },
    
    formatPhone() {
      let value = this.client.telefono.replace(/\D/g, '');
      if (value.length > 0) {
        if (value.length <= 3) {
          value = value;
        } else if (value.length <= 6) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
      }
      this.client.telefono = value;
      this.clearError('telefono');
    },
    
    validateAllFields() {
      let allValid = true;
      Object.keys(this.client).forEach(key => {
        if (key !== 'estado' && key !== 'fechaReg' && !this.validateField(key)) {
          allValid = false;
        }
      });
      return allValid;
    },
    
    async submitForm() {
      if (!this.validateAllFields()) {
        alert('Por favor corrija los errores en el formulario');
        return;
      }

      this.isSubmitting = true;
      
      try {
        // Preparar los datos para enviar al servidor
        const data = {
          client_nombre: this.client.nombre,
          client_rucCed: this.client.rucCed,
          client_telefono: this.client.telefono,
          client_direccion: this.client.direccion,
          client_email: this.client.email,
          client_fechaReg: this.client.fechaReg,
          client_estado: this.client.estado
        };

        // ************************************************************
        // CAMBIO CLAVE: Usando la nueva ruta RESTful POST /api/clientes
        const response = await fetch(`${this.apiBaseUrl}/api/clientes`, {
        // ************************************************************
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          alert('Cliente guardado exitosamente');
          this.$emit('cliente-guardado', data);
          this.resetForm();
        } else {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          alert('Error al guardar el cliente. Intente nuevamente.');
        }
        
      } catch (error) {
        console.error('Error de red:', error);
        alert('Error de conexión. Verifique su conexión a internet.');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async consultaCliente() {
      if (!this.client.rucCed) {
        alert('Por favor ingrese primero un RUC/Cédula');
        return;
      }
      
      this.isConsulting = true;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/api_consultaClientes?id=${this.client.rucCed}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data && Array.isArray(data) && data.length > 0) {
            const clienteData = data[0];
            
            this.client.nombre = clienteData.nombre || '';
            this.client.direccion = clienteData.direccion || '';
            this.client.email = clienteData.email || '';
            this.client.telefono = clienteData.telefono || '';
            
            this.validateField('nombre');
            this.validateField('direccion');
            this.validateField('email');
            this.validateField('telefono');
            
            alert('Datos consultados exitosamente desde la nube');
            
          } else if (data && data.RESP === "DATA NO ENCONTRADA") {
            alert('No se encontraron datos para el RUC/Cédula ingresado');
          } else {
            alert('No se encontraron datos para el RUC/Cédula ingresado');
          }
          
        } else {
          console.error('Error en la respuesta del servidor:', response.status);
          alert('Error al consultar los datos. Intente nuevamente.');
        }
        
      } catch (error) {
        console.error('Error de red en consulta:', error);
        alert('Error de conexión al consultar los datos. Verifique su conexión a internet.');
      } finally {
        this.isConsulting = false;
      }
    },
    
    cancelForm() {
      this.$emit('cancelar');
      this.resetForm();
      this.$router.push('/clientes');
    },
    
    resetForm() {
      this.client = {
        nombre: '',
        rucCed: '',
        telefono: '',
        direccion: '',
        email: '',
        fechaReg: '',
        estado: 1
      };
      this.errors = {
        nombre: false,
        rucCed: false,
        telefono: false,
        direccion: false,
        email: false
      };
      this.validFields = {
        nombre: false,
        rucCed: false,
        telefono: false,
        direccion: false,
        email: false
      };
      this.setCurrentDateTime();
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Ubuntu', sans-serif;
}

.form-container {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.form-container::before {
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

/* Estilo para los iconos SVG en el título */
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 15px 45px 15px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafafa;
  transition: all 0.3s ease;
  outline: none;
  color: #333;
}

.form-control:focus {
  border-color: #2a2185;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(42, 33, 133, 0.1);
  transform: translateY(-1px);
}

.form-control:valid:not(:placeholder-shown) {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9, #f0fff4);
}

.form-control::placeholder {
  color: #999;
}

/* Estilo para los iconos SVG dentro de los inputs */
.input-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
  width: 20px; /* Tamaño del icono */
  height: 20px;
  stroke-width: 2;
}

.form-group:has(.form-control:focus) .input-icon {
  color: #2a2185;
  transform: translateY(-50%) scale(1.1);
}

.form-group:has(.form-control:valid:not(:placeholder-shown)) .input-icon {
  color: #28a745;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 150px;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #2a2185, #162447);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(42, 33, 133, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e5e7eb;
  flex: 1;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-cloud {
  background: linear-gradient(135deg, #1f4287, #71b7e6);
  color: white;
  width: 100%;
  margin-top: 15px;
}

.btn-cloud:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(113, 183, 230, 0.3);
}

/* Estilo para los iconos SVG dentro de los botones */
.btn-icon {
  width: 18px; /* Tamaño del icono */
  height: 18px;
  color: white; /* El color del icono debe ser el del texto del botón */
  stroke-width: 2;
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.form-control:valid:not(:placeholder-shown) + .input-icon + .status-indicator {
  opacity: 1;
  transform: scale(1);
}

.loading-spinner {
  display: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn.loading .loading-spinner {
  display: inline-block;
}

.btn.loading .btn-text {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
    margin: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .button-group {
    flex-direction: column;
  }
}

/* Validation styles */
.form-control.error {
  border-color: #dc3545;
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Success animation */
.success-pulse {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}
</style>
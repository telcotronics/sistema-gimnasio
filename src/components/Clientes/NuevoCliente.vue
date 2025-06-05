<template>
  <div class="form-container">
    <div class="form-header">
      <h3 class="form-title">
        <i class="fa fa-user-plus"></i>
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
          <i class="fa fa-user input-icon"></i>
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
          <i class="fa fa-id-card input-icon"></i>
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
          <i class="fa fa-phone input-icon"></i>
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
          <i class="fa fa-map-marker input-icon"></i>
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
          <i class="fa fa-envelope input-icon"></i>
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
          <i class="fa fa-calendar input-icon"></i>
          <div class="status-indicator"></div>
        </div>
      </div>
      
      <div class="button-group">
        <button type="submit" class="btn btn-primary" :class="{ loading: isSubmitting }" :disabled="isSubmitting">
          <div class="loading-spinner"></div>
          <span class="btn-text">
            <i class="fa fa-save"></i> Guardar Cliente
          </span>
        </button>
        <button type="button" class="btn btn-secondary" @click="cancelForm">
          <i class="fa fa-times"></i> Cancelar
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
          <i class="fa fa-cloud"></i> Consultar Cliente Cloud
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
      apiBaseUrl: process.env.VUE_APP_SERV_API || '/api_proxy'
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

        const response = await fetch(`${this.apiBaseUrl}/addCliente`, {
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
          
          // Si el servidor hace redirect, podemos manejarlo desde el frontend
          // O redirigir manualmente:
          // window.location.href = '/clientes';
          
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
          
          // Verificar si hay datos válidos
          if (data && Array.isArray(data) && data.length > 0) {
            const clienteData = data[0];
            
            // Mapear los datos recibidos al formulario
            this.client.nombre = clienteData.nombre || '';
            this.client.direccion = clienteData.direccion || '';
            this.client.email = clienteData.email || '';
            this.client.telefono = clienteData.telefono || '';
            
            // Revalidar los campos que fueron actualizados
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

.form-title i {
  color: #71b7e6;
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

.input-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
  font-size: 1.1rem;
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
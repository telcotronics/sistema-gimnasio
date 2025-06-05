<template>
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <i class="fa fa-user-edit"></i>
          Editar Cliente
        </h3>
        <p class="form-subtitle">Actualiza la información del cliente</p>
      </div>
  
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos del cliente...</p>
      </div>
  
      <div v-else-if="error" class="error-state">
        <i class="fa fa-exclamation-triangle"></i>
        <p>Error al cargar el cliente: {{ error }}</p>
        <button @click="fetchClienteData" class="btn btn-retry">Reintentar</button>
      </div>
  
      <form @submit.prevent="submitUpdate" id="editClientForm" v-else>
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label" for="txt_nombre_edit">Nombre Completo</label>
            <input 
              v-model="client.client_nombre"
              type="text" 
              class="form-control"
              :class="{ error: errors.client_nombre }"
              placeholder="Ingrese el nombre completo del cliente" 
              id="txt_nombre_edit" 
              required
              @blur="validateField('client_nombre')"
              @input="clearError('client_nombre')"
            >
            <i class="fa fa-user input-icon"></i>
            <div class="error-message" v-show="errors.client_nombre">Por favor ingrese un nombre válido</div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="txt_idRuc_edit">Cédula/RUC</label>
            <input 
              v-model="client.client_rucCed"
              type="text" 
              class="form-control"
              :class="{ error: errors.client_rucCed }"
              placeholder="Cédula o RUC" 
              id="txt_idRuc_edit" 
              required
              @blur="validateField('client_rucCed')"
              @input="clearError('client_rucCed')"
            >
            <i class="fa fa-id-card input-icon"></i>
            <div class="error-message" v-show="errors.client_rucCed">Formato de cédula/RUC inválido</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="txt_telf_edit">Teléfono</label>
            <input 
              v-model="client.client_celular"
              type="tel" 
              class="form-control"
              :class="{ error: errors.client_celular }"
              placeholder="Número telefónico" 
              id="txt_telf_edit" 
              required
              @blur="validateField('client_celular')"
              @input="formatPhone"
            >
            <i class="fa fa-phone input-icon"></i>
            <div class="error-message" v-show="errors.client_celular">Número de teléfono inválido</div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label class="form-label" for="txt_direc_edit">Dirección</label>
            <input 
              v-model="client.client_direccion"
              type="text" 
              class="form-control"
              :class="{ error: errors.client_direccion }"
              placeholder="Dirección completa del cliente" 
              id="txt_direc_edit" 
              required
              @blur="validateField('client_direccion')"
              @input="clearError('client_direccion')"
            >
            <i class="fa fa-map-marker input-icon"></i>
            <div class="error-message" v-show="errors.client_direccion">Por favor ingrese una dirección válida</div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="txt_mail_edit">Correo Electrónico</label>
            <input 
              v-model="client.client_email"
              type="email" 
              class="form-control"
              :class="{ error: errors.client_email }"
              placeholder="ejemplo@correo.com" 
              id="txt_mail_edit" 
              required
              @blur="validateField('client_email')"
              @input="clearError('client_email')"
            >
            <i class="fa fa-envelope input-icon"></i>
            <div class="error-message" v-show="errors.client_email">Formato de correo inválido</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="reg_edit">Fecha de Registro</label>
            <input 
              v-model="client.client_fechaReg"
              type="datetime-local" 
              class="form-control" 
              id="reg_edit" 
              required
            >
            <i class="fa fa-calendar input-icon"></i>
          </div>
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn btn-primary" :class="{ loading: isSubmitting }" :disabled="isSubmitting">
            <div class="loading-spinner"></div>
            <span class="btn-text">
              <i class="fa fa-save"></i> Actualizar Cliente
            </span>
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelEdit">
            <i class="fa fa-times"></i> Cancelar
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EditarCliente',
    props: ['id'], // Recibe el ID del cliente de la URL
    data() {
      return {
        client: {
          client_id: null,
          client_nombre: '',
          client_rucCed: '',
          client_celular: '', // Asegúrate de que el nombre de la propiedad coincida con el backend
          client_direccion: '',
          client_email: '',
          client_fechaReg: '',
          client_estado: 1 // Asumiendo que el estado se mantiene o es 1 por defecto
        },
        errors: {
          client_nombre: false,
          client_rucCed: false,
          client_celular: false,
          client_direccion: false,
          client_email: false
        },
        loading: true,
        error: null,
        isSubmitting: false,
        apiBaseUrl: process.env.VUE_APP_SERV_API || '/api_proxy'
      }
    },
    mounted() {
      // Cuando el componente se monta, carga los datos del cliente
      this.client.client_id = this.id; // Asigna el ID de la prop al data
      this.fetchClienteData();
    },
    methods: {
      async fetchClienteData() {
        this.loading = true;
        this.error = null;
        try {
          // Petición GET para obtener los datos del cliente
          const response = await fetch(`${this.apiBaseUrl}/actCliente/${this.client.client_id}`, {
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
          
          // Asumiendo que el backend devuelve un array con el cliente como primer elemento
          if (data && Array.isArray(data) && data.length > 0) {
            const fetchedClient = data[0];
            // Mapear los datos de la API a las propiedades del formulario
            this.client.client_nombre = fetchedClient.client_nombre || '';
            this.client.client_rucCed = fetchedClient.client_rucCed || '';
            this.client.client_celular = fetchedClient.client_celular || ''; // Coincide con tu BD
            this.client.client_direccion = fetchedClient.client_direccion || '';
            this.client.client_email = fetchedClient.client_email || '';
            
            // Formatear la fecha de registro para el input datetime-local
            if (fetchedClient.client_fechaReg) {
              const date = new Date(fetchedClient.client_fechaReg);
              this.client.client_fechaReg = date.toISOString().slice(0, 16);
            } else {
              this.client.client_fechaReg = '';
            }
            // Puedes añadir otras propiedades si las necesitas, como client_estado
            this.client.client_estado = fetchedClient.client_estado || 1; 
  
          } else {
            this.error = 'Cliente no encontrado o formato de datos inesperado.';
          }
        } catch (err) {
          console.error('Error al cargar datos del cliente:', err);
          this.error = err.message || 'Error desconocido al cargar cliente.';
        } finally {
          this.loading = false;
        }
      },
      
      validateField(fieldName) {
        const value = this.client[fieldName].trim();
        let isValid = true;
  
        switch(fieldName) {
          case 'client_email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            break;
          case 'client_celular': // Asegúrate de que el nombre de campo sea correcto
            const phoneRegex = /^[0-9\-\+\s\(\)]{10,}$/;
            isValid = phoneRegex.test(value.replace(/\s/g, ''));
            break;
          default:
            isValid = value.length >= 2;
        }
  
        this.errors[fieldName] = !isValid && value !== '';
        return isValid;
      },
      
      clearError(fieldName) {
        if (this.errors[fieldName]) {
          this.validateField(fieldName); // Revalidar al escribir para limpiar error
        }
      },
      
      formatPhone() {
        let value = this.client.client_celular.replace(/\D/g, '');
        if (value.length > 0) {
          if (value.length <= 3) {
            value = value;
          } else if (value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
          } else {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
          }
        }
        this.client.client_celular = value;
        this.clearError('client_celular');
      },
      
      validateAllFields() {
        let allValid = true;
        // Validar todos los campos del formulario
        const fieldsToValidate = ['client_nombre', 'client_rucCed', 'client_celular', 'client_direccion', 'client_email'];
        fieldsToValidate.forEach(key => {
          if (!this.validateField(key)) {
            allValid = false;
          }
        });
        return allValid;
      },
      
      async submitUpdate() {
        if (!this.validateAllFields()) {
          alert('Por favor corrija los errores en el formulario antes de actualizar.');
          return;
        }
  
        this.isSubmitting = true;
        
        try {
          // Los datos a enviar deben coincidir con lo que tu backend espera para UPDATE
          const dataToUpdate = {
            client_nombre: this.client.client_nombre,
            client_rucCed: this.client.client_rucCed,
            client_celular: this.client.client_celular, // Coincide con tu BD
            client_direccion: this.client.client_direccion,
            client_email: this.client.client_email,
            client_fechaReg: this.client.client_fechaReg, // Mantenemos la fecha original o la actualizamos
            client_estado: this.client.client_estado // Mantener el estado
          };
  
          // Petición POST para actualizar el cliente
          const response = await fetch(`${this.apiBaseUrl}/actCliente/${this.client.client_id}`, {
            method: 'POST', // Tu backend usa POST para la actualización
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(dataToUpdate)
          });
  
          if (response.ok) {
            alert('Cliente actualizado exitosamente.');
            this.cancelEdit(); // Volver a la lista de clientes
          } else {
            const errorData = await response.json();
            console.error('Error del servidor al actualizar:', errorData);
            alert('Error al actualizar el cliente. Intente nuevamente.');
          }
          
        } catch (error) {
          console.error('Error de red al actualizar:', error);
          alert('Error de conexión al actualizar. Verifique su conexión a internet.');
        } finally {
          this.isSubmitting = false;
        }
      },
      
      cancelEdit() {
        // Redirigir de vuelta a la lista de clientes
        this.$router.push('/clientes');
      }
    }
  }
  </script>
  
  <style scoped>
  /* Copia y pega todos los estilos de `NuevoCliente.vue` aquí. */
  /* Asegúrate de que los estilos como .form-container, .form-header, .form-title,
     .form-row, .form-group, .form-control, .input-icon, .button-group, .btn,
     .btn-primary, .btn-secondary, .loading-spinner, etc., estén presentes.
     También incluye los estilos para .error, .error-message, .loading-state,
     .error-state, .spinner, .btn-retry. */
  
  /* Aquí van todos tus estilos de NuevoCliente.vue */
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
  
  /* Loading, Error States (similar a ListaClientes) */
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
  
  .error-state i {
    font-size: 3rem;
    color: #dc3545;
  }
  
  .btn-retry {
    margin-top: 20px;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #ffc107;
    color: #333;
    border: none;
  }
  
  .btn-retry:hover {
    background-color: #e0a800;
  }
  </style>
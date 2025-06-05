<template>
    <div class="formulario-editar">
      <div class="header">
        <button @click="volver" class="btn-back">
          <span class="back-icon">←</span>
          Atrás
        </button>
        <h2>✏️ Editar Membresía</h2>
        <div class="header-line"></div>
      </div>
      
      <form v-if="membresia" @submit.prevent="actualizarMembresia" class="form-container">
        <div class="form-grid">
          <div class="form-group">
            <label for="Nombre">
              <span class="label-icon">👤</span>
              Nombre
            </label>
            <input 
              v-model="membresia.Nombre" 
              id="Nombre" 
              type="text" 
              required 
              class="form-input"
              placeholder="Ingrese el nombre"
            />
          </div>
  
          <div class="form-group">
            <label for="Grupo">
              <span class="label-icon">👥</span>
              Grupo
            </label>
            <input 
              v-model="membresia.Grupo" 
              id="Grupo" 
              type="text" 
              class="form-input"
              placeholder="Ingrese el grupo"
            />
          </div>
  
          <div class="form-group">
            <label for="Fecha_Inicio">
              <span class="label-icon">📅</span>
              Fecha de Inicio
            </label>
            <input 
              v-model="membresia.Fecha_Inicio" 
              id="Fecha_Inicio" 
              type="date" 
              class="form-input"
            />
          </div>
  
          <div class="form-group">
            <label for="Fecha_Fin">
              <span class="label-icon">🏁</span>
              Fecha de Fin
            </label>
            <input 
              v-model="membresia.Fecha_Fin" 
              id="Fecha_Fin" 
              type="date" 
              class="form-input"
            />
          </div>
  
          <div class="form-group">
            <label for="Valor">
              <span class="label-icon">💰</span>
              Valor
            </label>
            <input 
              v-model.number="membresia.Valor" 
              id="Valor" 
              type="number" 
              step="0.01" 
              class="form-input"
              placeholder="0.00"
            />
          </div>
  
          <div class="form-group">
            <label for="Estado">
              <span class="label-icon">⚡</span>
              Estado
            </label>
            <select v-model="membresia.Estado" id="Estado" class="form-select">
              <option disabled value="">Seleccione estado</option>
              <option value="Activo">✅ Activo</option>
              <option value="Inactivo">❌ Inactivo</option>
            </select>
          </div>
        </div>
  
        <div class="button-container">
          <button @click="volver" type="button" class="btn-secondary">
            <span class="btn-icon">←</span>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="enviando">
            <span class="btn-icon">💾</span>
            <span v-if="!enviando">Guardar Cambios</span>
            <span v-else>Guardando...</span>
          </button>
        </div>
      </form>
  
      <!-- Estados de carga y mensajes -->
      <div v-if="!membresia && !error" class="loading">
        <div class="spinner"></div>
        <p>Cargando membresía...</p>
      </div>
  
      <transition name="alert">
        <div v-if="mensaje" class="alert alert-success">
          <span class="alert-icon">✅</span>
          {{ mensaje }}
        </div>
      </transition>
  
      <transition name="alert">
        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">❌</span>
          {{ error }}
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'MembresiaEditar',
    data: function() {
      return {
        membresia: null,
        mensaje: '',
        error: '',
        enviando: false
      };
    },
    mounted: function() {
      this.cargarMembresia();
    },
    methods: {
      cargarMembresia: function() {
        var self = this;
        var id = this.$route.params.id;
        
        axios.get('https://app.factura-e.net/api/membresias/' + id)
          .then(function(response) {
            self.membresia = response.data;
          })
          .catch(function(err) {
            self.error = err.response && err.response.data && err.response.data.error 
              ? err.response.data.error 
              : 'Error al cargar los datos';
          });
      },
      
      actualizarMembresia: function() {
        var self = this;
        var id = this.$route.params.id;
        
        this.mensaje = '';
        this.error = '';
        this.enviando = true;
        
        axios.put('https://app.factura-e.net/api/membresias/' + id, this.membresia)
          .then(function(response) {
            self.mensaje = 'Membresía actualizada correctamente';
            self.enviando = false;
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(function() {
              self.mensaje = '';
            }, 3000);
          })
          .catch(function(err) {
            self.error = err.response && err.response.data && err.response.data.error 
              ? err.response.data.error 
              : 'Error al actualizar membresía';
            self.enviando = false;
          });
      },
  
      volver: function() {
        // Opción 1: Volver a la página anterior
        this.$router.go(-1);
        
        // Opción 2: Ir a una ruta específica (descomenta la línea de abajo si prefieres esta opción)
        // this.$router.push('/membresias');
      }
    }
  };
  </script>
  
  <style scoped>
  * {
    box-sizing: border-box;
  }
  
  .formulario-editar {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0;
    background: #667eea;
    background: -webkit-linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
    background: linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
  }
  
  .formulario-editar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }
  
  .header {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    text-align: center;
    position: relative;
  }
  
  .btn-back {
    position: absolute;
    top: 2rem;
    left: 2rem;
    background: rgba(45, 55, 72, 0.1);
    color: #2d3748;
    border: 2px solid rgba(45, 55, 72, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .btn-back:hover {
    background: rgba(45, 55, 72, 0.2);
    -webkit-transform: translateX(-3px);
    transform: translateX(-3px);
    box-shadow: 0 4px 12px rgba(45, 55, 72, 0.2);
  }
  
  .back-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .header h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header-line {
    width: 60px;
    height: 4px;
    background: #667eea;
    background: -webkit-linear-gradient(left, #667eea, #764ba2);
    background: linear-gradient(to right, #667eea, #764ba2);
    margin: 1rem auto 0;
    border-radius: 2px;
  }
  
  .form-container {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.95);
    margin: 0;
  }
  
  .form-grid {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin: -0.75rem;
    margin-bottom: 2rem;
  }
  
  .form-group {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 300px;
    flex: 1 1 300px;
    min-width: 300px;
    padding: 0.75rem;
    position: relative;
  }
  
  .form-group label {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .label-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  .form-input,
  .form-select {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    background: #fff;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    -webkit-transform: translateY(-2px);
    transform: translateY(-2px);
  }
  
  .form-input::-webkit-input-placeholder {
    color: #a0aec0;
    font-style: italic;
  }
  
  .form-input::-moz-placeholder {
    color: #a0aec0;
    font-style: italic;
  }
  
  .form-input:-ms-input-placeholder {
    color: #a0aec0;
    font-style: italic;
  }
  
  .form-input::placeholder {
    color: #a0aec0;
    font-style: italic;
  }
  
  .form-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 1rem center;
    background-repeat: no-repeat;
    background-size: 1rem;
    padding-right: 3rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  
  .button-container {
    text-align: center;
    margin-top: 2rem;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    gap: 1rem;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
  }
  
  .btn-primary {
    background: #667eea;
    background: -webkit-linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
    background: linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  .btn-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 2px solid rgba(108, 117, 125, 0.3);
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .btn-secondary:hover {
    background: rgba(108, 117, 125, 0.2);
    -webkit-transform: translateY(-2px);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  }
  
  .btn-primary:hover:not(:disabled) {
    -webkit-transform: translateY(-3px);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }
  
  .btn-primary:active:not(:disabled) {
    -webkit-transform: translateY(-1px);
    transform: translateY(-1px);
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  .loading {
    text-align: center;
    padding: 3rem;
    color: #2d3748;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    -webkit-animation: spin 1s linear infinite;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .alert {
    margin: 1rem 2rem;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-weight: 500;
  }
  
  .alert-success {
    background: #48bb78;
    background: -webkit-linear-gradient(-45deg, #48bb78, #38a169);
    background: linear-gradient(-45deg, #48bb78, #38a169);
    color: white;
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  }
  
  .alert-error {
    background: #f56565;
    background: -webkit-linear-gradient(-45deg, #f56565, #e53e3e);
    background: linear-gradient(-45deg, #f56565, #e53e3e);
    color: white;
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
  }
  
  .alert-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  /* Transiciones para Vue 2.0 */
  .alert-enter-active, .alert-leave-active {
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }
  
  .alert-enter, .alert-leave-to {
    opacity: 0;
    -webkit-transform: translateY(-10px);
    transform: translateY(-10px);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .formulario-editar {
      margin: 1rem;
      border-radius: 16px;
    }
    
    .form-grid {
      display: block;
    }
    
    .form-group {
      min-width: auto;
      padding: 0.5rem 0;
    }
    
    .header h2 {
      font-size: 1.5rem;
    }
    
    .form-container {
      padding: 1.5rem;
    }
  
    .btn-back {
      position: static;
      margin-bottom: 1rem;
      width: 100%;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
    }
  
    .button-container {
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .btn-primary,
    .btn-secondary {
      width: 100%;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
    }
  }
  
  /* Animaciones progresivas */
  .form-group {
    -webkit-animation: fadeInUp 0.6s ease forwards;
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
    -webkit-transform: translateY(20px);
    transform: translateY(20px);
  }
  
  .form-group:nth-child(1) { -webkit-animation-delay: 0.1s; animation-delay: 0.1s; }
  .form-group:nth-child(2) { -webkit-animation-delay: 0.2s; animation-delay: 0.2s; }
  .form-group:nth-child(3) { -webkit-animation-delay: 0.3s; animation-delay: 0.3s; }
  .form-group:nth-child(4) { -webkit-animation-delay: 0.4s; animation-delay: 0.4s; }
  .form-group:nth-child(5) { -webkit-animation-delay: 0.5s; animation-delay: 0.5s; }
  .form-group:nth-child(6) { -webkit-animation-delay: 0.6s; animation-delay: 0.6s; }
  
  @-webkit-keyframes fadeInUp {
    to {
      opacity: 1;
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }
  }
  
  .button-container {
    -webkit-animation: fadeInUp 0.6s ease 0.7s forwards;
    animation: fadeInUp 0.6s ease 0.7s forwards;
    opacity: 0;
    -webkit-transform: translateY(20px);
    transform: translateY(20px);
  }
  </style>
<template>
  <div class="form-container">
    <div class="form-card">
      <div class="form-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 class="form-title">Crear Nuevo Tipo de Membresía</h2>
        <p class="form-subtitle">Define las características de un nuevo plan de membresía</p>
      </div>

      <form @submit.prevent="crearTipoMembresia" class="member-form">
        <div class="form-section">
          <h3 class="section-title">Información del Plan</h3>
          
          <div class="form-group">
            <label for="nombre_tipo" class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Nombre del Tipo de Membresía
            </label>
            <input 
              id="nombre_tipo" 
              v-model="tipoMembresia.nombre_tipo" 
              type="text" 
              class="form-input"
              placeholder="Ej: Membresía Anual VIP"
              required 
            />
          </div>

          <div class="form-row">
              <div class="form-group">
                  <label for="categoria_membresia" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                          <line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                      Categoría
                  </label>
                  <input 
                      id="categoria_membresia" 
                      v-model="tipoMembresia.categoria_membresia" 
                      type="text" 
                      class="form-input"
                      placeholder="Ej: Premium, Básico, Familiar"
                  />
              </div>

              <div class="form-group">
                  <label for="es_grupal" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Modalidad
                  </label>
                  <select id="es_grupal" v-model="tipoMembresia.es_grupal" class="form-select" required>
                      <option disabled value="">Seleccione modalidad</option>
                      <option :value="false">Individual</option>
                      <option :value="true">Grupal</option>
                  </select>
              </div>
          </div>

          <div class="form-group" v-if="tipoMembresia.es_grupal">
              <label for="capacidad_maxima_miembros" class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Capacidad Máxima de Miembros
              </label>
              <input 
                  id="capacidad_maxima_miembros" 
                  v-model.number="tipoMembresia.capacidad_maxima_miembros" 
                  type="number" 
                  class="form-input"
                  min="1"
                  required 
              />
          </div>
          
        </div>

        <div class="form-section">
          <h3 class="section-title">Características del Privilegio</h3>
          
          <div class="form-row">
              <div class="form-group">
                  <label for="valor" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      Valor ($)
                  </label>
                  <input 
                      id="valor" 
                      v-model.number="tipoMembresia.valor" 
                      type="number" 
                      step="0.01" 
                      class="form-input"
                      placeholder="0.00"
                      required
                  />
              </div>

              <div class="form-group">
                  <label for="duracion_dias" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Duración (Días)
                  </label>
                  <input 
                      id="duracion_dias" 
                      v-model.number="tipoMembresia.duracion_dias" 
                      type="number" 
                      class="form-input"
                      placeholder="Ej: 365 para anual, 30 para mensual"
                      min="1"
                  />
              </div>
          </div>

          <div class="form-row">
              <div class="form-group">
                  <label for="visitas_maximas_diarias" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Visitas Máximas Diarias (opcional)
                  </label>
                  <input 
                      id="visitas_maximas_diarias" 
                      v-model.number="tipoMembresia.visitas_maximas_diarias" 
                      type="number" 
                      class="form-input"
                      placeholder="0 para ilimitado, ej: 1, 2"
                      min="0"
                  />
              </div>

              <div class="form-group">
                  <label for="areas_de_acceso" class="form-label">
                      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5"/>
                          <path d="M2 12l10 5 10-5"/>
                      </svg>
                      Áreas de Acceso (separadas por coma)
                  </label>
                  <input 
                      id="areas_de_acceso" 
                      v-model="tipoMembresia.areas_de_acceso" 
                      type="text" 
                      class="form-input"
                      placeholder="Ej: Gimnasio, Piscina, Canchas"
                  />
              </div>
          </div>

          <div class="form-group">
              <label for="id_combo_ensamblado_incluido" class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15s-2 1-4 1-4-2-8-2-4 1-4 1V3s2-1 4-1 4 2 8 2 4-1 4-1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  Combo Ensamblado Incluido (opcional)
              </label>
              <select 
                  id="id_combo_ensamblado_incluido" 
                  v-model="tipoMembresia.id_combo_ensamblado_incluido" 
                  class="form-select"
              >
                  <option :value="null">Ninguno</option>
                  <option 
                      v-for="combo in combosDisponibles" 
                      :key="combo.PdctEnsb_ID" 
                      :value="combo.PdctEnsb_ID"
                  >
                      {{ combo.PdctEnsb_codigoEnsamble }} - ${{ formatValue(combo.PdctEnsb_valor) }}
                  </option>
              </select>
          </div>

          <div class="form-group" v-if="tipoMembresia.id_combo_ensamblado_incluido">
              <label for="cantidad_combo_incluido" class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Cantidad de Combo Incluido
              </label>
              <input 
                  id="cantidad_combo_incluido" 
                  v-model.number="tipoMembresia.cantidad_combo_incluido" 
                  type="number" 
                  class="form-input"
                  min="1"
                  required
              />
          </div>

          <div class="form-group">
              <label for="descripcion" class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Descripción del Plan
              </label>
              <textarea 
                  id="descripcion" 
                  v-model="tipoMembresia.descripcion" 
                  class="form-input"
                  placeholder="Descripción detallada del tipo de membresía, beneficios, etc."
                  rows="3"
              ></textarea>
          </div>

          <div class="form-group">
              <label for="estado_tipo" class="form-label">
                  <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9,11 12,14 22,4"/>
                      <path d="M21,12v7a2,2 0 0,1-2,2H5a2,2 0 0,1-2-2V5a2,2 0 0,1,2-2h11"/>
                  </svg>
                  Estado del Tipo de Membresía
              </label>
              <select id="estado_tipo" v-model="tipoMembresia.estado_tipo" class="form-select" required>
                  <option disabled value="">Seleccione estado</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="DESCONTINUADO">DESCONTINUADO</option>
                  <option value="ELIMINADO">ELIMINADO</option>
              </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" @click="volverAtras">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            Atrás
          </button>
          <div class="action-buttons">
            <button type="button" class="btn-secondary" @click="resetFormulario">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="1,4 1,10 7,10"/>
                <path d="M3.51,15a9,9 0 1,0,2.13-9.36L1,10"/>
              </svg>
              Limpiar
            </button>
            <button type="submit" class="btn-primary">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Crear Tipo de Membresía
            </button>
          </div>
        </div>
      </form>

      <div v-if="mensaje" class="alert alert-success">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        <div class="alert-content">
          <strong>¡Éxito!</strong>
          <p>{{ mensaje }}</p>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <div class="alert-content">
          <strong>Error</strong>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TipoMembresiaCrear', // Nombre actualizado del componente
  data() {
    return {
      tipoMembresia: { // Cambiado a tipoMembresia para reflejar los campos de clientes_membresias
        nombre_tipo: '',
        categoria_membresia: '',
        es_grupal: false, // Por defecto, una membresía individual
        capacidad_maxima_miembros: 1, // Por defecto 1 si es individual
        valor: null,
        descripcion: '',
        duracion_dias: null,
        visitas_maximas_diarias: null,
        areas_de_acceso: '',
        id_combo_ensamblado_incluido: null, // Asumimos null si no se selecciona combo
        cantidad_combo_incluido: 1, // Por defecto 1 unidad del combo si se selecciona
        estado_tipo: 'ACTIVO' // Estado inicial al crear
      },
      combosDisponibles: [], // Para almacenar los combos de productos_Ensamblados
      mensaje: '',
      error: ''
    };
  },
  watch: {
      'tipoMembresia.es_grupal'(newVal) {
          // Si cambia a individual, la capacidad debe ser 1
          if (!newVal) {
              this.tipoMembresia.capacidad_maxima_miembros = 1;
          }
      }
  },
  created() {
      this.cargarCombosDisponibles();
  },
  methods: {
      async cargarCombosDisponibles() {
          try {
              // Asume que tienes un endpoint para listar tus productos_Ensamblados
              // Si no existe, deberías crearlo en controlador_Items.js o controlador_General.js
              // Por ejemplo: GET /api/productos-ensamblados
              const response = await axios.get('https://app.factura-e.net/api/productos-ensamblados'); 
              this.combosDisponibles = response.data;
          } catch (err) {
              console.error('Error al cargar combos ensamblados:', err);
              alert('No se pudieron cargar los combos de productos. Por favor, recargue la página.');
          }
      },
    async crearTipoMembresia() {
      this.mensaje = '';
      this.error = '';

      // Ajuste para capacidad_maxima_miembros si es individual
      if (!this.tipoMembresia.es_grupal) {
          this.tipoMembresia.capacidad_maxima_miembros = 1;
      }
      // Asegura que cantidad_combo_incluido sea 1 si se selecciona un combo, o null si no
      if (!this.tipoMembresia.id_combo_ensamblado_incluido) {
          this.tipoMembresia.cantidad_combo_incluido = null;
      } else if (this.tipoMembresia.cantidad_combo_incluido === null || this.tipoMembresia.cantidad_combo_incluido <= 0) {
          this.tipoMembresia.cantidad_combo_incluido = 1; // Asegura al menos 1 si el combo está seleccionado
      }


      try {
        // **Endpoint actualizado para TIPOS de membresía (POST)**
        const response = await axios.post('https://app.factura-e.net/api/tipos-membresia', this.tipoMembresia);
        this.mensaje = response.data.mensaje || 'Tipo de membresía creado exitosamente';
        this.resetFormulario();
        // Opcional: Navegar a la lista de tipos de membresía después de crear
        // this.$router.push('/crud_membresias'); 
      } catch (err) {
        console.error('Error al crear el tipo de membresía:', err);
        // Solución para el SyntaxError: Reemplazar encadenamiento opcional '?. '
        if (err.response && err.response.data && err.response.data.mensaje) {
          this.error = err.response.data.mensaje;
        } else {
          this.error = 'Error al crear el tipo de membresía. Intente de nuevo.';
        }
      }
    },
    resetFormulario() {
      this.tipoMembresia = {
        nombre_tipo: '',
        categoria_membresia: '',
        es_grupal: false,
        capacidad_maxima_miembros: 1,
        valor: null,
        descripcion: '',
        duracion_dias: null,
        visitas_maximas_diarias: null,
        areas_de_acceso: '',
        id_combo_ensamblado_incluido: null,
        cantidad_combo_incluido: 1,
        estado_tipo: 'ACTIVO'
      };
      this.mensaje = '';
      this.error = '';
    },
    volverAtras() {
      this.$router.go(-1);
    },
    formatValue(valor) {
      return parseFloat(valor || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
};
</script>

<style scoped>
/* TU CSS ORIGINAL SE MANTIENE ÍNTEGRO AQUÍ */
.form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* Header */
.form-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.form-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-20px) translateY(-20px); }
  50% { transform: translateX(20px) translateY(20px); }
}

.header-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-icon svg {
  width: 30px;
  height: 30px;
  stroke-width: 2;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

/* Form */
.member-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.label-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
  stroke-width: 2;
  color: #667eea;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #a0aec0;
}

.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  appearance: none;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary, .btn-back {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.btn-back {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin: 1.5rem 2rem 0;
  border-radius: 12px;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background: #f0fff4;
  border-left-color: #48bb78;
  color: #22543d;
}

.alert-error {
  background: #fff5f5;
  border-left-color: #f56565;
  color: #742a2a;
}

.alert-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content strong {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-content p {
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }
  
  .form-header {
    padding: 2rem 1.5rem;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .member-form {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: column-reverse;
  }
  
  .btn-primary, .btn-secondary, .btn-back {
    width: 100%;
  }
  
  .alert {
    margin: 1.5rem 1rem 0;
  }
}

@media (max-width: 480px) {
  .form-header {
    padding: 1.5rem 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .member-form {
    padding: 1rem;
  }
}
</style>
<template>
  <div class="container">
    <div class="header">
      <div class="title-section">
        <h2 class="title">Tipos de Membresías Disponibles</h2>
        <p class="subtitle">Gestiona los planes y privilegios de membresía que ofreces</p>
      </div>
      <button class="btn-primary" @click="crearTipoMembresia">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Nuevo Tipo de Membresía
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ tiposMembresia.length }}</div>
        <div class="stat-label">Total Tipos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ tiposMembresiaActivos }}</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${{ valorPromedioTipos }}</div>
        <div class="stat-label">Valor Promedio</div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper">
        <table class="members-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Tipo</th>
              <th>Categoría</th>
              <th>Modalidad</th>
              <th>Capacidad</th>
              <th>Duración</th>
              <th>Valor</th>
              <th>Estado</th>
              <th class="actions-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tipoMembresia in tiposMembresia" :key="tipoMembresia.id_tipo_membresia" class="table-row">
              <td class="id-cell">
                <span class="id-badge">#{{ tipoMembresia.id_tipo_membresia }}</span>
              </td>
              <td class="member-cell">
                <div class="member-info">
                  <div class="member-avatar">
                    {{ getInitials(tipoMembresia.nombre_tipo) }}
                  </div>
                  <div class="member-details">
                    <div class="member-name">{{ tipoMembresia.nombre_tipo }}</div>
                    <div class="member-details-secondary" v-if="tipoMembresia.codigo_combo_ensamblado">
                        Combo: {{ tipoMembresia.codigo_combo_ensamblado }} (x{{ tipoMembresia.cantidad_combo_incluido }})
                    </div>
                     <div class="member-details-secondary" v-else>
                        Sin Combo Incluido
                    </div>
                  </div>
                </div>
              </td>
              <td class="category-cell">
                <span class="group-tag">{{ tipoMembresia.categoria_membresia || 'N/A' }}</span>
              </td>
              <td class="group-cell">
                <span :class="['group-tag', tipoMembresia.es_grupal ? 'group-tag-grupal' : 'group-tag-unico']">
                  {{ tipoMembresia.es_grupal ? 'Grupal' : 'Único' }}
                </span>
              </td>
              <td class="capacity-cell">
                {{ tipoMembresia.es_grupal ? tipoMembresia.capacidad_maxima_miembros : '1' }}
              </td>
              <td class="duration-cell">
                {{ tipoMembresia.duracion_dias ? `${tipoMembresia.duracion_dias} días` : 'Duración Variable' }}
              </td>
              <td class="value-cell">
                <span class="value-amount">${{ formatValue(tipoMembresia.valor) }}</span>
              </td>
              <td class="status-cell">
                <span :class="['status-badge', getStatusClass(tipoMembresia.estado_tipo)]">
                  <span class="status-dot"></span>
                  {{ tipoMembresia.estado_tipo || 'Sin estado' }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button class="btn-secondary" @click="editarTipoMembresia(tipoMembresia.id_tipo_membresia)" title="Editar">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m18 2 4 4-4 4-4-4 4-4z"/>
                      <path d="M10.5 12.5 2 21l-1-1 8.5-8.5"/>
                    </svg>
                  </button>
                  <button class="btn-danger" @click="eliminarTipoMembresia(tipoMembresia.id_tipo_membresia)" title="Eliminar">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="tiposMembresia.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h3>No hay tipos de membresía registrados</h3>
        <p>Comienza agregando tu primer plan de membresía a la plataforma</p>
        <button class="btn-primary" @click="crearTipoMembresia">
          Agregar Primer Plan de Membresía
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CrudMembresias',
  data() {
    return {
      tiposMembresia: []
    }
  },
  computed: {
    tiposMembresiaActivos() {
      return this.tiposMembresia.filter(t => t.estado_tipo === 'ACTIVO').length
    },
    valorPromedioTipos() {
      if (this.tiposMembresia.length === 0) return '0.00'
      const total = this.tiposMembresia.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0)
      return (total / this.tiposMembresia.length).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  },
  created() {
    this.cargarTiposMembresia()
  },
  methods: {
    cargarTiposMembresia() {
      axios.get('https://app.factura-e.net/api/tipos-membresia') 
        .then(response => {
          this.tiposMembresia = response.data
        })
        .catch(error => {
          console.error('Error al cargar los tipos de membresía:', error)
          alert('No se pudieron cargar los tipos de membresía. Intente de nuevo más tarde.')
        })
    },
    crearTipoMembresia() {
      this.$router.push('/CRUD_MembresiaForm') 
    },
    editarTipoMembresia(id) {
      this.$router.push(`/CRUD_MembresiaForm/${id}`) 
    },
    eliminarTipoMembresia(id) {
      if (confirm('¿Estás seguro de ELIMINAR este tipo de membresía? (Su estado se cambiará a ELIMINADO)')) {
        axios.delete(`https://app.factura-e.net/api/tipos-membresia/${id}`) 
          .then(() => {
            this.cargarTiposMembresia() 
            alert('Tipo de membresía eliminado lógicamente (estado cambiado a ELIMINADO).')
          })
          .catch(error => {
            console.error('Error al eliminar tipo de membresía:', error)
            // Solución para el SyntaxError: Reemplazar encadenamiento opcional '?. '
            alert('Error al eliminar el tipo de membresía: ' + (error.response && error.response.data && error.response.data.mensaje ? error.response.data.mensaje : error.message))
          })
      }
    },
    getInitials(nombre) {
      if (!nombre) return 'N/A'
      // Asegura que siempre haya al menos una letra si el nombre es muy corto
      const parts = nombre.split(' ').map(n => n[0]);
      if (parts.length > 1) {
          return (parts[0] + parts[1]).substring(0, 2).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
          return parts[0].substring(0, 2).toUpperCase(); // Toma las dos primeras del único componente
      }
      return nombre.substring(0,1).toUpperCase(); // Fallback para nombres muy cortos o vacíos
    },
    formatValue(valor) {
      return parseFloat(valor || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    getStatusClass(estado) {
      return estado === 'ACTIVO' ? 'status-active' : 'status-inactive'
    }
  }
}
</script>

<style scoped>
/* TU CSS ORIGINAL SE MANTIENE ÍNTEGRO AQUÍ */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.table-wrapper {
  overflow-x: auto;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.members-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.actions-header {
  text-align: center;
}

.table-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: scale(1.001);
}

.members-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* Cell Styles */
.id-cell {
  width: 80px;
}

.id-badge {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.member-cell {
  min-width: 200px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.member-name {
  font-weight: 600;
  color: #2d3748;
}

.member-details-secondary { /* Nuevo estilo para la línea de combo */
  font-size: 0.8em; /* Más pequeño que el nombre principal */
  color: #718096; /* Color más tenue */
}


/* Period Cell is now Duration Cell, no date range */
.duration-cell {
  min-width: 120px;
}
/* Removed .period-cell, .date-range, .start-date, .date-separator, .end-date styles */

.group-tag {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  color: #2d3748;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Nuevos estilos para los tags de modalidad (único/grupal) */
.group-tag-unico {
  background: linear-gradient(135deg, #b2f5ea 0%, #81e6d9 100%); /* Color para 'Único' */
  color: #2d3748;
}
.group-tag-grupal {
  background: linear-gradient(135deg, #a7eaff 0%, #a0cbf5 100%); /* Color para 'Grupal' */
  color: #2d3748;
}


.value-cell {
  text-align: right;
}

.value-amount {
  font-weight: 600;
  color: #22543d;
  font-size: 1rem;
}

.status-cell {
  min-width: 120px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-active {
  background: rgba(72, 187, 120, 0.1);
  color: #22543d;
}

.status-active .status-dot {
  background: #48bb78;
}

.status-inactive { /* Usado para ELIMINADO u otros estados no activos */
  background: rgba(245, 101, 101, 0.1);
  color: #742a2a;
}

.status-inactive .status-dot {
  background: #f56565;
}

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-secondary, .btn-danger {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.btn-danger {
  background: #fed7d7;
  color: #c53030;
}

.btn-danger:hover {
  background: #feb2b2;
  transform: translateY(-1px);
}

.icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #718096;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  opacity: 0.3;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 1.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .member-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  /* Eliminar estilos de rango de fecha si no se usan */
  /* .date-range {
    flex-direction: column;
    gap: 0.25rem;
  } */
}
</style>
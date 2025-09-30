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

    <div class="cards-container">
      <div v-if="tiposMembresia.length > 0" class="membership-cards-grid">
        <div v-for="tipoMembresia in tiposMembresia" :key="tipoMembresia.id_tipo_membresia" class="membership-card">
          <div class="card-header">
            <div class="member-avatar">{{ getInitials(tipoMembresia.nombre_tipo) }}</div>
            <div class="card-title-group">
              <h3 class="card-title">{{ tipoMembresia.nombre_tipo }}</h3>
              <span class="id-badge">#{{ tipoMembresia.id_tipo_membresia }}</span>
            </div>
            <span :class="['status-badge', getStatusClass(tipoMembresia.estado_tipo)]">
              <span class="status-dot"></span>
              {{ tipoMembresia.estado_tipo || 'Sin estado' }}
            </span>
          </div>

          <div class="card-body">
            <div class="card-detail-item">
              <span class="detail-label">Categoría:</span>
              <span class="detail-value group-tag">{{ tipoMembresia.categoria_membresia || 'N/A' }}</span>
            </div>
            <div class="card-detail-item">
              <span class="detail-label">Modalidad:</span>
              <span :class="['detail-value', 'group-tag', tipoMembresia.es_grupal ? 'group-tag-grupal' : 'group-tag-unico']">
                {{ tipoMembresia.es_grupal ? 'Grupal' : 'Único' }}
              </span>
            </div>
            <div class="card-detail-item">
              <span class="detail-label">Capacidad:</span>
              <span class="detail-value">{{ tipoMembresia.es_grupal ? tipoMembresia.capacidad_maxima_miembros : '1' }}</span>
            </div>
            <div class="card-detail-item">
              <span class="detail-label">Duración:</span>
              <span class="detail-value">{{ tipoMembresia.duracion_dias ? `${tipoMembresia.duracion_dias} días` : 'Duración Variable' }}</span>
            </div>
            <div class="card-detail-item">
              <span class="detail-label">Valor:</span>
              <span class="detail-value value-amount">${{ formatValue(tipoMembresia.valor) }}</span>
            </div>
            <div class="card-detail-item" v-if="tipoMembresia.codigo_combo_ensamblado">
              <span class="detail-label">Combo Incluido:</span>
              <span class="detail-value">{{ tipoMembresia.codigo_combo_ensamblado }} (x{{ tipoMembresia.cantidad_combo_incluido }})</span>
            </div>
            <div class="card-detail-item" v-else>
              <span class="detail-label">Combo Incluido:</span>
              <span class="detail-value">Sin Combo</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-secondary" @click="editarTipoMembresia(tipoMembresia.id_tipo_membresia)" title="Editar">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m18 2 4 4-4 4-4-4 4-4z"/>
                <path d="M10.5 12.5 2 21l-1-1 8.5-8.5"/>
              </svg>
              Editar
            </button>
            <button class="btn-danger" @click="eliminarTipoMembresia(tipoMembresia.id_tipo_membresia)" title="Eliminar">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
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
            alert('Error al eliminar el tipo de membresía: ' + (error.response && error.response.data && error.response.data.mensaje ? error.response.data.mensaje : error.message))
          })
      }
    },
    getInitials(nombre) {
      if (!nombre) return 'N/A'
      const parts = nombre.split(' ').map(n => n[0]);
      if (parts.length > 1) {
          return (parts[0] + parts[1]).substring(0, 2).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
          return parts[0].substring(0, 2).toUpperCase();
      }
      return nombre.substring(0,1).toUpperCase();
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

/* --- Nuevos Estilos para las Tarjetas (Cards) --- */
.cards-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 1.5rem; /* Añade un padding general al contenedor de tarjetas */
}

.membership-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Columnas responsivas */
  gap: 1.5rem; /* Espacio entre tarjetas */
}

.membership-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.membership-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap; /* Permite que los elementos se envuelvan en pantallas pequeñas */
}

.card-title-group {
  flex-grow: 1; /* Permite que el título ocupe el espacio restante */
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

/* El .id-badge se mueve al header de la tarjeta */
.id-badge {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem; /* Un poco más pequeño para el ID */
  font-weight: 600;
  margin-top: 0.25rem; /* Espacio debajo del título si se envuelve */
  display: inline-block; /* Para que ocupe solo el espacio necesario */
}

/* member-avatar reutilizado */
.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0; /* Evita que se encoja */
}

/* status-badge reutilizado */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  flex-shrink: 0; /* Evita que se encoja */
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

.status-inactive {
  background: rgba(245, 101, 101, 0.1);
  color: #742a2a;
}

.status-inactive .status-dot {
  background: #f56565;
}

.card-body {
  flex-grow: 1; /* Permite que el cuerpo ocupe el espacio disponible */
  margin-bottom: 1.5rem;
  border-top: 1px solid #edf2f7; /* Separador sutil */
  padding-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr; /* Una columna por defecto */
  gap: 0.75rem; /* Espacio entre los ítems de detalle */
}

@media (min-width: 500px) { /* Dos columnas para pantallas un poco más grandes */
  .card-body {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

.card-detail-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.detail-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
}

/* Reutilizando estilos de tags */
.group-tag {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  color: #2d3748;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block; /* Para que el padding se aplique correctamente */
}

.group-tag-unico {
  background: linear-gradient(135deg, #b2f5ea 0%, #81e6d9 100%);
  color: #2d3748;
}
.group-tag-grupal {
  background: linear-gradient(135deg, #a7eaff 0%, #a0cbf5 100%);
  color: #2d3748;
}

.value-amount {
  font-weight: 700; /* Más prominente */
  color: #22543d;
  font-size: 1.1rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end; /* Alinea los botones a la derecha */
  border-top: 1px solid #edf2f7; /* Separador sutil */
  padding-top: 1.5rem;
  margin-top: auto; /* Empuja los botones hacia abajo */
}

.btn-secondary, .btn-danger {
  padding: 0.6rem 1.2rem; /* Ajusta el padding para los botones de la tarjeta */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Espacio entre icono y texto */
  font-weight: 600;
  font-size: 0.9rem;
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
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-title-group {
    width: 100%; /* Asegura que el título ocupe todo el ancho disponible */
  }

  .status-badge {
    width: fit-content; /* Se ajusta al contenido */
  }

  .card-actions {
    flex-direction: column;
    align-items: stretch; /* Estira los botones para que ocupen todo el ancho */
  }
}
</style>
<template>
    <div class="container">
        <div class="header">
            <div class="title-section">
                <h2 class="title">Gestión de Miembros</h2>
                <p class="subtitle">Administra los miembros y sus membresías</p>
            </div>
            <button class="btn-primary" @click="crearNuevoMiembro">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Nuevo Miembro
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">{{ miembros.length }}</div>
                <div class="stat-label">Total Miembros</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ miembrosActivos }}</div>
                <div class="stat-label">Miembros Activos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ miembrosVencidos }}</div>
                <div class="stat-label">Miembros Vencidos</div>
            </div>
        </div>

        <div class="cards-container">
            <div v-if="miembros.length > 0" class="member-cards-grid">
                <div class="member-card create-new-card" @click="crearNuevoMiembro">
                    <div class="create-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <p class="create-text">Crear Nuevo Miembro</p>
                </div>

                <div v-for="miembro in miembros" :key="miembro.id_miembro" class="member-card">
                    <div class="card-header">
                        <div class="member-avatar">{{ getInitials(miembro.client_nombre) }}</div>
                        <div class="card-title-group">
                            <h3 class="card-title">{{ miembro.client_nombre }}</h3>
                            <span class="id-badge">#{{ miembro.matricula }}</span>
                        </div>
                        <span :class="['status-badge', getStatusClass(miembro.estado)]">
                            <span class="status-dot"></span>
                            {{ miembro.estado }}
                        </span>
                    </div>

                    <div class="card-body">
                        <div class="card-detail-item">
                            <span class="detail-label">Membresía:</span>
                            <span class="detail-value group-tag">{{ miembro.nombre_tipo_membresia || 'N/A' }}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">RUC/Cédula:</span>
                            <span class="detail-value">{{ miembro.client_rucCed || 'N/A' }}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Inicio:</span>
                            <span class="detail-value">{{ formatDate(miembro.fecha_inicio) }}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Fin:</span>
                            <span class="detail-value">{{ formatDate(miembro.fecha_fin) }}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Último Acceso:</span>
                            <span class="detail-value">{{ miembro.fecha_ultimo_acceso ?
                                formatDate(miembro.fecha_ultimo_acceso) : 'Nunca' }}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Visitas Hoy:</span>
                            <span class="detail-value">{{ miembro.visitas_realizadas_hoy }}</span>
                        </div>
                        <div class="card-detail-item full-width-detail">
                            <span class="detail-label">Observaciones:</span>
                            <span class="detail-value small-text">{{ miembro.observaciones || 'Sin observaciones'
                                }}</span>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button class="btn-secondary" @click="editarMiembro(miembro.id_miembro)" title="Editar Miembro">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 2 4 16v4h4L22 6zm-5 5L17 3l4 4-4 4z" />
                            </svg>
                            Editar
                        </button>
                        <button class="btn-danger"
                            @click="confirmarEliminarMiembro(miembro.id_miembro, miembro.client_nombre)"
                            title="Eliminar Miembro">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                </path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <!-- Path corregido para el ícono de "usuarios" o "personas" -->
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <h3>No hay miembros registrados</h3>
                <p>Comienza agregando el primer miembro a la plataforma</p>
                <button class="btn-primary" @click="crearNuevoMiembro">
                    Agregar Primer Miembro
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API externa usando una variable de entorno de Vue CLI
// El nombre de la variable debe empezar con VUE_APP_
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net'; // Fallback para desarrollo local

export default {
    name: 'CrudMiembros',
    data() {
        return {
            miembros: []
        };
    },
    computed: {
        miembrosActivos() {
            return this.miembros.filter(m => m.estado === 'ACTIVO').length;
        },
        miembrosVencidos() {
            // Un miembro se considera vencido si su estado es 'VENCIDO'
            // O si es 'ACTIVO' pero su fecha_fin ya pasó (lo ideal es que el backend actualice el estado)
            const now = new Date();
            return this.miembros.filter(m =>
                m.estado === 'VENCIDO' ||
                (m.estado === 'ACTIVO' && new Date(m.fecha_fin) < now)
            ).length;
        }
        // Puedes añadir más computed properties para otras estadísticas
    },
    created() {
        this.cargarMiembros();
    },
    methods: {
        /**
         * @description Carga la lista de miembros desde la API externa.
         */
        cargarMiembros() {
            console.log(`Cargando miembros desde: ${API_BASE_URL}/api/miembros`); // Log de depuración
            axios.get(`${API_BASE_URL}/api/miembros`) // Usamos la URL base de la API externa
                .then(response => {
                    this.miembros = response.data;
                })
                .catch(error => {
                    console.error('Error al cargar miembros:', error);
                    // Muestra el mensaje de error de la API si está disponible
                    const errorMessage = error.response && error.response.data && error.response.data.mensaje
                        ? error.response.data.mensaje
                        : 'No se pudieron cargar los miembros. Intente de nuevo más tarde.';
                    alert(errorMessage);
                });
        },

        /**
         * @description Navega al formulario para crear un nuevo miembro.
         * Asume que la ruta del formulario de creación/edición de miembros es '/crud_miembrosForm'.
         */
        crearNuevoMiembro() {
            this.$router.push('/crud_miembrosForm');
        },

        /**
         * @description Navega al formulario para editar un miembro existente.
         * Asume que la ruta del formulario de creación/edición de miembros es '/crud_miembrosForm/:id'.
         * @param {number} id - ID del miembro a editar.
         */
        editarMiembro(id) {
            this.$router.push(`/crud_miembrosForm/${id}`);
        },

        /**
         * @description Muestra una confirmación y llama a la API externa para eliminar (lógicamente) un miembro.
         * La eliminación es lógica, cambiando el estado a 'CANCELADO' en el backend.
         * @param {number} id - ID del miembro a eliminar.
         * @param {string} nombre - Nombre del miembro para la confirmación.
         */
        confirmarEliminarMiembro(id, nombre) {
            if (confirm(`¿Estás seguro de CANCELAR la membresía de ${nombre}? (Su estado se cambiará a CANCELADO)`)) {
                console.log(`Eliminando miembro ${id} desde: ${API_BASE_URL}/api/miembros/${id}`); // Log de depuración
                axios.delete(`${API_BASE_URL}/api/miembros/${id}`) // Apunta a la API externa
                    .then(() => {
                        this.cargarMiembros(); // Recarga la lista después de la eliminación lógica
                        alert(`Membresía de ${nombre} cancelada exitosamente.`);
                    })
                    .catch(error => {
                        console.error('Error al cancelar miembro:', error);
                        const errorMessage = error.response && error.response.data && error.response.data.mensaje
                            ? error.response.data.mensaje
                            : 'Error al cancelar la membresía. Por favor, inténtalo de nuevo.';
                        alert(errorMessage);
                    });
            }
        },

        /**
         * @description Genera las iniciales de un nombre para el avatar.
         * @param {string} nombre - Nombre completo.
         * @returns {string} - Iniciales en mayúsculas.
         */
        getInitials(nombre) {
            if (!nombre) return 'N/A';
            const parts = nombre.split(' ').filter(n => n.length > 0).map(n => n[0]);
            if (parts.length >= 2) {
                return (parts[0] + parts[1]).substring(0, 2).toUpperCase();
            } else if (parts.length === 1 && parts[0].length > 0) {
                return parts[0].substring(0, 2).toUpperCase();
            }
            return nombre.substring(0, 1).toUpperCase(); // Fallback para nombres muy cortos o vacíos
        },

        /**
         * @description Formatea una fecha a un string legible.
         * @param {string} dateString - Fecha en formato string (ej. de la DB).
         * @returns {string} - Fecha formateada.
         */
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        },

        /**
         * @description Devuelve la clase CSS según el estado del miembro.
         * @param {string} estado - Estado del miembro ('ACTIVO', 'VENCIDO', 'SUSPENDIDO', 'CANCELADO').
         * @returns {string} - Clase CSS correspondiente.
         */
        getStatusClass(estado) {
            switch (estado) {
                case 'ACTIVO':
                    return 'status-active';
                case 'VENCIDO':
                    return 'status-inactive status-expired'; // Puedes añadir una clase específica para vencido si quieres
                case 'SUSPENDIDO':
                    return 'status-inactive status-suspended';
                case 'CANCELADO':
                    return 'status-inactive status-cancelled';
                default:
                    return 'status-inactive';
            }
        }
    }
};
</script>

<style scoped>
/* Estilos generales reutilizados */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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

/* Contenedor de Tarjetas */
.cards-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
}

.member-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

/* Estilos para la tarjeta individual de miembro */
.member-card {
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

.member-card:hover:not(.create-new-card) {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.card-title-group {
    flex-grow: 1;
}

.card-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0;
}

.id-badge {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    color: #4a5568;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.25rem;
    display: inline-block;
}

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
    flex-shrink: 0;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    flex-shrink: 0;
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

/* Clases para estados específicos de miembro */
.status-expired {
    background: rgba(255, 165, 0, 0.1);
    /* Naranja */
    color: #a0522d;
}

.status-expired .status-dot {
    background: #ffa500;
}

.status-suspended {
    background: rgba(255, 193, 7, 0.1);
    /* Amarillo */
    color: #8b6d00;
}

.status-suspended .status-dot {
    background: #ffc107;
}

.status-cancelled {
    background: rgba(108, 117, 125, 0.1);
    /* Gris oscuro */
    color: #495057;
}

.status-cancelled .status-dot {
    background: #6c757d;
}


.card-body {
    flex-grow: 1;
    margin-bottom: 1.5rem;
    border-top: 1px solid #edf2f7;
    padding-top: 1.5rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

@media (min-width: 500px) {
    .card-body {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    .full-width-detail {
        grid-column: 1 / -1;
        /* Ocupa todo el ancho en pantallas más grandes */
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

.small-text {
    font-size: 0.9rem;
    color: #4a5568;
}

.group-tag {
    background: linear-gradient(135deg, #b2f5ea 0%, #81e6d9 100%);
    color: #2d3748;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    display: inline-block;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    border-top: 1px solid #edf2f7;
    padding-top: 1.5rem;
    margin-top: auto;
}

.btn-secondary,
.btn-danger {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

/* Estilos para la tarjeta "Crear Nuevo Miembro" */
.create-new-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: 2px dashed #a0aec0;
    background-color: #f7fafc;
    color: #718096;
    cursor: pointer;
    min-height: 200px;
    /* Asegura que tenga un tamaño decente */
}

.create-new-card:hover {
    background-color: #ebf4ff;
    border-color: #667eea;
    color: #667eea;
    transform: scale(1.02);
}

.create-icon {
    width: 60px;
    height: 60px;
    color: #a0aec0;
    margin-bottom: 0.75rem;
}

.create-new-card:hover .create-icon {
    color: #667eea;
}

.create-icon svg {
    width: 100%;
    height: 100%;
}

.create-text {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
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

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .card-title-group {
        width: 100%;
    }

    .status-badge {
        width: fit-content;
    }

    .card-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .create-new-card {
        min-height: 180px;
        /* Ajuste para móviles */
    }
}
</style>

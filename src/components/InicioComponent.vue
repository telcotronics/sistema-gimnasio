<template>
  <div class="dashboard-container">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <v-icon color="primary" size="32">mdi-view-dashboard</v-icon>
        Panel de Control
      </h1>
      <p class="dashboard-subtitle">Resumen general de actividades del gimnasio</p>
    </div>

    <!-- Sección de Visitas -->
    <div class="section-container visits-section">
      <div class="section-header">
        <h2 class="section-title">
          <v-icon color="purple">mdi-calendar-star</v-icon>
          Estadísticas de Visitas
        </h2>
        <div class="section-divider"></div>
      </div>
      
      <cartas-personalizadas 
        :cartas="datosVisitas" 
        class="enhanced-cards"
      />
      
      <div class="charts-container">
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasVisitasHora"
            :valores="valoresVisitasHora"
            :color="'#E91E63'"
            :titulo="'Visitas por Hora'"
            :subtitulo="'Distribución de visitas durante el día'"
            class="enhanced-sparkline"
          />
        </div>
        
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasVisitasSemana"
            :valores="valoresVisitasSemana"
            :color="'#F44336'"
            :titulo="'Visitas Semanales'"
            :subtitulo="'Tendencia de visitas en la semana actual'"
            class="enhanced-sparkline"
          />
        </div>
        
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasVisitasMes"
            :valores="valoresVisitasMes"
            :color="'#3F51B5'"
            :titulo="'Visitas Mensuales'"
            :subtitulo="'Registro diario del mes en curso'"
            class="enhanced-sparkline"
          />
        </div>
      </div>
    </div>

    <!-- Sección de Pagos -->
    <div class="section-container payments-section">
      <div class="section-header">
        <h2 class="section-title">
          <v-icon color="green">mdi-currency-usd</v-icon>
          Estadísticas de Pagos
        </h2>
        <div class="section-divider"></div>
      </div>
      
      <cartas-personalizadas 
        :cartas="datosPagos" 
        class="enhanced-cards mt-4"
      />
      
      <div class="charts-container">
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasPagosSemana"
            :valores="valoresPagosSemana"
            :color="'#4CAF50'"
            :titulo="'Pagos Semanales'"
            :subtitulo="'Ingresos registrados esta semana'"
            class="enhanced-sparkline"
          />
        </div>
        
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasPagosMes"
            :valores="valoresPagosMes"
            :color="'#FF9800'"
            :titulo="'Pagos Mensuales'"
            :subtitulo="'Ingresos del mes actual'"
            class="enhanced-sparkline"
          />
        </div>
        
        <div class="chart-card">
          <sparkline-component
            :etiquetas="etiquetasPagosMeses"
            :valores="valoresPagosMeses"
            :color="'#2196F3'"
            :titulo="'Evolución Anual'"
            :subtitulo="'Comparativa de ingresos por mes'"
            class="enhanced-sparkline"
          />
        </div>
      </div>
    </div>

    <!-- Overlay de carga mejorado -->
    <v-overlay :value="cargando" class="loading-overlay">
      <div class="loading-container">
        <v-progress-circular 
          size="80" 
          width="6"
          color="primary"
          indeterminate
          class="loading-spinner"
        ></v-progress-circular>
        <p class="loading-text">Cargando datos del dashboard...</p>
      </div>
    </v-overlay>
  </div>
</template>

<script>
import HttpService from "../Servicios/HttpService";
import Utiles from "../Servicios/Utiles";
import CartasPersonalizadas from "./Dialogos/CartasPersonalizadas.vue";
import SparklineComponent from "./Dialogos/SparklineComponent.vue";

export default {
  name: "InicioComponent",
  components: { CartasPersonalizadas, SparklineComponent },

  data: () => ({
    cargando: false,
    datosVisitas: [],
    datosPagos: [],
    etiquetasVisitasHora: [],
    valoresVisitasHora: [],
    etiquetasVisitasSemana: [],
    valoresVisitasSemana: [],
    etiquetasVisitasMes: [],
    valoresVisitasMes: [],
    etiquetasPagosSemana: [],
    valoresPagosSemana: [],
    etiquetasPagosMes: [],
    valoresPagosMes: [],
    etiquetasPagosMeses: [],
    valoresPagosMeses: [],
  }),

  mounted() {
    this.obtenerDatos();
  },

  methods: {
    obtenerDatos() {
      this.cargando = true;
      HttpService.obtenerConDatos(
        {
          metodo: "obtener",
        },
        "inicio.php"
      ).then((resultado) => {
        this.crearCartas(resultado.datosVisitas, resultado.datosPagos);
        this.etiquetasVisitasHora = Utiles.obtenerClaves(resultado.visitasHora);
        this.valoresVisitasHora = Utiles.obtenerValores(resultado.visitasHora);
        let visitasSemana = Utiles.cambiarDiaSemana(resultado.visitasSemana);
        this.etiquetasVisitasSemana = Utiles.obtenerClaves(visitasSemana);
        this.valoresVisitasSemana = Utiles.obtenerValores(visitasSemana);
        this.etiquetasVisitasMes = Utiles.obtenerClaves(resultado.visitasMes);
        this.valoresVisitasMes = Utiles.obtenerValores(resultado.visitasMes);
        let pagosSemana = Utiles.cambiarDiaSemana(resultado.pagosSemana);
        this.etiquetasPagosSemana = Utiles.obtenerClaves(pagosSemana);
        this.valoresPagosSemana = Utiles.obtenerValoresPagos(pagosSemana);
        this.etiquetasPagosMes = Utiles.obtenerClaves(resultado.pagosMes);
        this.valoresPagosMes = Utiles.obtenerValoresPagos(resultado.pagosMes);
        let pagosMeses = Utiles.cambiarNumeroANombreMes(resultado.pagosMeses);
        this.etiquetasPagosMeses = Utiles.obtenerClaves(pagosMeses);
        this.valoresPagosMeses = Utiles.obtenerValoresPagos(pagosMeses);
        this.cargando = false;
      });
    },

    crearCartas(visitas, pagos) {
      this.datosVisitas = [
        {
          color: "purple darken-1",
          icono: "mdi-calendar-star",
          nombre: "Total visitas",
          total: visitas.totalVisitas,
        },
        {
          color: "pink darken-1",
          icono: "mdi-calendar",
          nombre: "Visitas hoy",
          total: visitas.visitasHoy,
        },
        {
          color: "red darken-1",
          icono: "mdi-calendar-range",
          nombre: "Visitas semana",
          total: visitas.visitasSemana,
        },
        {
          color: "indigo darken-1",
          icono: "mdi-calendar-month",
          nombre: "Visitas mes",
          total: visitas.visitasMes,
        },
      ];
      this.datosPagos = [
        {
          color: "blue darken-1",
          icono: "mdi-currency-usd",
          nombre: "Total pagos",
          total: "$" + pagos.totalPagos,
        },
        {
          color: "teal darken-1",
          icono: "mdi-calendar",
          nombre: "Pagos hoy",
          total: "$" + pagos.pagosHoy,
        },
        {
          color: "green darken-1",
          icono: "mdi-calendar-range",
          nombre: "Pagos semana",
          total: "$" + pagos.pagosSemana,
        },
        {
          color: "orange darken-1",
          icono: "mdi-calendar-month",
          nombre: "Pagos mes",
          total: "$" + pagos.pagosMes,
        },
      ];
    },
  },
};
</script>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  position: relative;
}

/* Dashboard Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 32px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.1;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 8px 0 0 0;
  font-weight: 300;
  position: relative;
  z-index: 1;
}

/* Section Containers */
.section-container {
  margin-bottom: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
}

.visits-section {
  border-left: 6px solid #9C27B0;
}

.payments-section {
  border-left: 6px solid #4CAF50;
}

/* Section Headers */
.section-header {
  margin-bottom: 32px;
  position: relative;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.section-divider {
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-top: 12px;
  width: 80px;
}

/* Charts Container */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.chart-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.chart-card:hover::before {
  transform: scaleX(1);
}

.chart-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Enhanced Cards */
.enhanced-cards {
  animation: fadeInUp 0.6s ease-out;
}

/* Enhanced Sparklines */
.enhanced-sparkline {
  position: relative;
  z-index: 1;
}

/* Loading Overlay */
.loading-overlay {
  background: rgba(0, 0, 0, 0.226) !important;
  backdrop-filter: blur(8px);
  display: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
}

.loading-text {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .dashboard-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }
  
  .section-container {
    padding: 20px;
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 24px 16px;
    margin-bottom: 24px;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .dashboard-subtitle {
    font-size: 1rem;
  }
  
  .section-container {
    padding: 16px;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}

/* Hover Effects for Better UX */
.section-container {
  cursor: default;
}

.chart-card {
  cursor: pointer;
}

.chart-card:active {
  transform: translateY(-4px) scale(0.98);
}

/* Gradient Backgrounds for Sections */
.visits-section {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.03) 0%, rgba(233, 30, 99, 0.03) 100%);
}

.payments-section {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(33, 150, 243, 0.03) 100%);
}

/* Subtle animations on scroll */
.section-container {
  animation: fadeInUp 0.6s ease-out;
}

.section-container:nth-child(2) {
  animation-delay: 0.1s;
}

.section-container:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
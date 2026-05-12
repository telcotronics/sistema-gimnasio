<template>
  <div class="gym-dashboard">
    <!-- Header >
    <header class="header">
      <div class="header-user">
        <div class="avatar-wrapper">
          <div class="avatar" :style="{ backgroundImage: `url(${userProfile.avatar})` }"></div>
        </div>
        <div>
          <h1 class="greeting">Hola, {{ userProfile.name }}</h1>
          <h2 class="page-title">Dashboard</h2>
        </div>
      </div>
      <button class="notification-btn" @click="handleNotifications">
        <span class="material-symbols-outlined">notifications</span>
      </button>
    </header-->

    <!-- Main Content -->
    <main class="main-content">
      <!-- Member Activity Section -->
      <section class="section">
        <div class="section-header">
          <h3 class="section-title">Actividad de Miembros</h3>
          <span class="live-badge">En tiempo real</span>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div v-for="stat in memberStats" :key="stat.label" class="stat-card">
            <div class="stat-header">
              <span class="stat-label">{{ stat.label }}</span>
              <span v-if="stat.icon" class="material-symbols-outlined stat-icon">{{ stat.icon }}</span>
            </div>
            <p class="stat-value" :class="stat.large ? 'large' : ''">{{ stat.value }}</p>
            <div v-if="stat.trend" class="stat-footer trend" :class="stat.trendUp ? 'positive' : ''">
              <span class="material-symbols-outlined">{{ stat.trendUp ? 'trending_up' : 'trending_down' }}</span>
              <span>{{ stat.trend }}</span>
            </div>
            <p v-else class="stat-footer">{{ stat.footer }}</p>
          </div>
        </div>

        <!-- Peak Hours Chart - Linear -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <p class="chart-title">Afluencia por Hora</p>
              <p class="chart-subtitle">Hora pico: {{ peakHour }}</p>
            </div>
            <div class="segmented-control">
              <button 
                v-for="option in viewOptions" 
                :key="option" 
                :class="['segment-btn', { active: activeView === option }]"
                @click="activeView = option"
              >
                {{ option }}
              </button>
            </div>
          </div>
          
          <div class="line-chart">
            <svg viewBox="0 0 300 120" preserveAspectRatio="none" class="line-chart-svg">
              <!-- Área bajo la línea -->
              <polygon
                :points="areaPoints"
                fill="url(#gradient)"
              />
              <!-- Línea principal -->
              <polyline
                :points="linePoints"
                fill="none"
                stroke="#13ec13"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <!-- Puntos -->
              <circle
                v-for="(point, index) in pointsArray"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="4"
                :fill="hourlyData[index].isPeak ? '#13ec13' : 'white'"
                :stroke="hourlyData[index].isPeak ? 'white' : '#13ec13'"
                stroke-width="2"
                class="chart-point"
              />
              <!-- Gradiente -->
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(19, 236, 19, 0.3)" />
                  <stop offset="100%" stop-color="rgba(19, 236, 19, 0)" />
                </linearGradient>
              </defs>
            </svg>
            
            <!-- Labels -->
            <div class="line-chart-labels">
              <span v-for="hour in hourlyData" :key="hour.time" 
                    class="line-label" 
                    :class="{ peak: hour.isPeak }">
                {{ hour.time }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Financial Section -->
      <section class="section">
        <h3 class="section-title">Resumen Financiero</h3>

        <!-- Revenue Cards Scroll -->
        <div class="revenue-scroll">
          <div v-for="revenue in revenueData" :key="revenue.label" class="revenue-card">
            <span class="revenue-label">{{ revenue.label }}</span>
            <p class="revenue-value">{{ formatCurrency(revenue.value) }}</p>
            <span class="revenue-trend" :class="revenue.positive ? 'positive' : 'negative'">
              {{ revenue.trend }}
            </span>
          </div>
        </div>

        <!-- Annual Evolution Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <p class="chart-title">Evolución Anual</p>
              <p class="chart-subtitle">Ingresos Totales 2023</p>
            </div>
            <button class="more-btn" @click="handleMoreOptions">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div class="annual-chart">
            <div v-for="month in annualData" :key="month.label" class="month-bar-wrapper">
              <div class="month-bar-container">
                <div 
                  class="month-bar" 
                  :class="{ current: month.isCurrent }"
                  :style="{ height: month.percentage + '%' }"
                ></div>
              </div>
              <span class="month-label" :class="{ current: month.isCurrent }">{{ month.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    
  </div>
</template>

<script>
// TODO TAREA-02: conectar con el endpoint real de la nueva API (app.factura-e.net).
// La estructura esperada de la respuesta y el mapeo ya están documentados en plan_proyecto.md.
// El método _mapearHoras y _mapearMeses están listos para usarse cuando se conozca el endpoint.

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default {
  name: 'GymDashboard',
  data() {
    return {
      activeNav: 'home',
      activeView: 'Día',
      peakHour: '18:00 - 19:00',
      memberStats: [
        { label: 'Visitas Hoy',     value: '—', trend: '',             trendUp: true,  icon: 'groups',         large: true },
        { label: 'Total Mes',       value: '—', trend: '',             trendUp: true,  icon: 'calendar_month', large: true },
        { label: 'Esta Semana',     value: '—', footer: '' },
        { label: 'Total Histórico', value: '—', footer: 'Acumulado' }
      ],
      hourlyData: [
        { time: '6am',  percentage: 30, isPeak: false },
        { time: '9am',  percentage: 50, isPeak: false },
        { time: '12pm', percentage: 40, isPeak: false },
        { time: '3pm',  percentage: 35, isPeak: false },
        { time: '6pm',  percentage: 90, isPeak: true  },
        { time: '9pm',  percentage: 70, isPeak: false }
      ],
      revenueData: [
        { label: 'Ingresos Hoy',  value: 0, trend: '', positive: true },
        { label: 'Esta Semana',   value: 0, trend: '', positive: true },
        { label: 'Este Mes',      value: 0, trend: '', positive: true }
      ],
      annualData: [
        { label: 'Ene', percentage: 40, isCurrent: false },
        { label: 'Feb', percentage: 55, isCurrent: false },
        { label: 'Mar', percentage: 45, isCurrent: false },
        { label: 'Abr', percentage: 70, isCurrent: false },
        { label: 'May', percentage: 60, isCurrent: false },
        { label: 'Jun', percentage: 85, isCurrent: true  }
      ],
      viewOptions: ['Día', 'Sem'],
      navItems: [
        { id: 'home',     icon: 'home',     label: 'Inicio' },
        { id: 'members',  icon: 'groups',   label: 'Miembros' },
        { id: 'payments', icon: 'payments', label: 'Pagos' },
        { id: 'settings', icon: 'settings', label: 'Ajustes' }
      ]
    };
  },
  computed: {
    pointsArray() {
      const width = 300, height = 120, padding = 10
      const stepX = (width - padding * 2) / (this.hourlyData.length - 1)
      return this.hourlyData.map((item, index) => ({
        x: padding + index * stepX,
        y: height - padding - (item.percentage / 100) * (height - padding * 2)
      }))
    },
    linePoints() {
      return this.pointsArray.map(p => `${p.x},${p.y}`).join(' ')
    },
    areaPoints() {
      const points = this.pointsArray.map(p => `${p.x},${p.y}`).join(' ')
      return `${points} 300,120 0,120`
    }
  },
  methods: {
    // Listo para usar cuando se conozca el endpoint del dashboard en la nueva API.
    // Recibe la respuesta y actualiza memberStats, hourlyData, annualData y revenueData.
    aplicarDatos(res) {
      const v = res.datosVisitas
      const p = res.datosPagos
      this.memberStats[0].value = String(v.visitasHoy)
      this.memberStats[1].value = String(v.visitasMes)
      this.memberStats[2].value = String(v.visitasSemana)
      this.memberStats[2].footer = `Promedio: ${Math.round(v.visitasSemana / 7)}/día`
      this.memberStats[3].value = String(v.totalVisitas)
      this.revenueData[0].value = Number(p.pagosHoy)
      this.revenueData[1].value = Number(p.pagosSemana)
      this.revenueData[2].value = Number(p.pagosMes)
      this.hourlyData = this._mapearHoras(res.visitasHora || [])
      this.annualData  = this._mapearMeses(res.pagosMeses || [])
    },

    _mapearHoras(visitasHora) {
      if (!visitasHora.length) return this.hourlyData
      const maxVisitas = Math.max(...visitasHora.map(h => h.numeroVisitas), 1)
      let peakIdx = 0
      visitasHora.forEach((h, i) => {
        if (h.numeroVisitas > visitasHora[peakIdx].numeroVisitas) peakIdx = i
      })
      if (visitasHora[peakIdx]) {
        const h = parseInt(visitasHora[peakIdx].hora)
        this.peakHour = `${String(h).padStart(2,'0')}:00 - ${String(h+1).padStart(2,'0')}:00`
      }
      return visitasHora.map((h, i) => {
        const hNum = parseInt(h.hora)
        const label = hNum === 0 ? '12am' : hNum < 12 ? `${hNum}am` : hNum === 12 ? '12pm' : `${hNum-12}pm`
        return { time: label, percentage: Math.round((h.numeroVisitas / maxVisitas) * 100), isPeak: i === peakIdx }
      })
    },

    _mapearMeses(pagosMeses) {
      if (!pagosMeses.length) return this.annualData
      const mesActual = new Date().getMonth() + 1
      const maxTotal = Math.max(...pagosMeses.map(m => Number(m.total)), 1)
      return pagosMeses.map(m => ({
        label: MESES_CORTOS[m.mes - 1] || String(m.mes),
        percentage: Math.round((Number(m.total) / maxTotal) * 100),
        isCurrent: m.mes === mesActual
      }))
    },

    formatCurrency(amount) {
      return `$${Number(amount).toLocaleString('es-EC', { minimumFractionDigits: 0 })}`
    },
    handleMoreOptions() {}
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.gym-dashboard {
  font-family: 'Lexend', sans-serif;
  background: #102210;
  min-height: 100vh;
  color: white;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.gym-dashboard > * {
  width: 100%;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(16, 34, 16, 0.9);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
}

@media (min-width: 640px) {
  .header {
    padding: 1rem 2rem;
  }
}

@media (min-width: 1024px) {
  .header {
    padding: 1rem 4rem;
  }
}

@media (min-width: 1280px) {
  .header {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem 2rem;
  }
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-wrapper {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  background: #2a402a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
}

.greeting {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  line-height: 1.2;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.notification-btn {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1c2e1c;
  color: white;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.notification-btn:active {
  transform: scale(0.95);
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  padding-bottom: 6rem;
  width: 100%;
  max-width: 100%;
}

@media (min-width: 640px) {
  .main-content {
    padding: 1.5rem 2rem;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding: 2rem 4rem;
  }
}

@media (min-width: 1280px) {
  .main-content {
    padding: 2rem;
    max-width: 1280px;
    margin: 0 auto;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.live-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #13ec13;
  background: rgba(19, 236, 19, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    gap: 1.5rem;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 1rem;
  background: #1c2e1c;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
}

.stat-icon {
  color: #13ec13;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
}

.stat-value.large {
  font-size: 1.875rem;
}

.stat-footer {
  font-size: 0.75rem;
  color: #6b7280;
}

.stat-footer.trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: #13ec13;
}

.stat-footer.trend.positive {
  color: #13ec13;
}

.stat-footer.trend .material-symbols-outlined {
  font-size: 0.875rem;
}

/* Chart Card */
.chart-card {
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background: #1c2e1c;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.chart-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.segmented-control {
  display: flex;
  height: 2rem;
  align-items: center;
  border-radius: 0.5rem;
  background: rgba(16, 34, 16, 0.5);
  padding: 0.25rem;
}

.segment-btn {
  height: 100%;
  padding: 0 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-btn.active {
  background: #1c2e1c;
  color: white;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.segment-btn:hover:not(.active) {
  color: white;
}

/* Line Chart */
.line-chart {
  position: relative;
  width: 100%;
  height: 10rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-point {
  cursor: pointer;
  transition: all 0.3s;
}

.chart-point:hover {
  r: 6;
  filter: drop-shadow(0 0 6px rgba(19, 236, 19, 0.6));
}

.line-chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.line-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: lowercase;
}

.line-label.peak {
  font-weight: 700;
  color: #13ec13;
}

/* Divider */
.divider {
  height: 1px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

/* Revenue Scroll */
.revenue-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin: 0 -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.revenue-scroll::-webkit-scrollbar {
  display: none;
}

.revenue-card {
  scroll-snap-align: start;
  flex-shrink: 0;
  min-width: 10rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 1rem;
  background: #1c2e1c;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.revenue-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
}

.revenue-value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
}

.revenue-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.revenue-trend.positive {
  color: #13ec13;
}

.revenue-trend.negative {
  color: #ef4444;
}

.more-btn {
  border-radius: 50%;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: background 0.2s;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Annual Chart */
.annual-chart {
  margin-top: 1rem;
  display: flex;
  height: 12rem;
  align-items: flex-end;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .annual-chart {
    gap: 1rem;
    height: 14rem;
  }
}

@media (min-width: 1024px) {
  .annual-chart {
    gap: 1.5rem;
    height: 16rem;
  }
}

.month-bar-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
}

.month-bar-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.125rem;
  position: relative;
  height: 8rem;
  overflow: hidden;
}

.month-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(19, 236, 19, 0.8);
  transition: all 0.3s;
}

.month-bar-wrapper:hover .month-bar:not(.current) {
  background: #13ec13;
}

.month-bar.current {
  background: #13ec13;
  box-shadow: 0 0 15px rgba(19, 236, 19, 0.3);
}

.month-label {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
}

.month-label.current {
  font-weight: 700;
  color: #13ec13;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 30;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(16, 34, 16, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-around;
  padding: 0 0.5rem;
}

@media (min-width: 1280px) {
  .bottom-nav {
    max-width: 1280px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 1rem 1rem 0 0;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  color: white;
}

.nav-item.active {
  color: #13ec13;
}

.nav-item .material-symbols-outlined {
  font-size: 1.5rem;
}

.nav-item .material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1;
}

.nav-label {
  font-size: 0.625rem;
  font-weight: 500;
}

.fab-container {
  position: relative;
  top: -1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab {
  display: flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #13ec13;
  color: black;
  border: none;
  box-shadow: 0 4px 20px rgba(19, 236, 19, 0.4);
  cursor: pointer;
  transition: transform 0.2s;
}

.fab:active {
  transform: scale(0.95);
}

.fab .material-symbols-outlined {
  font-size: 1.875rem;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
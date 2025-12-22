<template>
  <v-app>
    <!-- Header -->
    <v-app-bar app color="surface" flat>
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col>
            <h1 class="text-h5 font-weight-bold">Cuadre de Caja</h1>
          </v-col>
          <v-col class="text-right">
            <v-btn icon>
              <v-icon>mdi-calendar-today</v-icon>
            </v-btn>
            <span class="text-caption mx-2">{{ currentDate }}</span>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <!-- <v-main> -->
      <v-container fluid class="main-content-container">
        <!-- Summary Cards -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-text>
                <div class="text-caption text-grey mb-2">Balance Actual</div>
                <div class="text-h4 font-weight-bold" :class="currentBalance < 0 ? 'error--text' : 'success--text'">
                  ${{ currentBalance.toFixed(2) }}
                </div>
                <div class="mt-3 text-caption" :class="currentBalance < 0 ? 'error--text' : 'success--text'">
                  <v-icon small class="mr-1">{{ currentBalance < 0 ? 'mdi-trending-down' : 'mdi-trending-up' }}</v-icon>
                  {{ currentBalance < 0 ? 'Déficit' : 'Superávit' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6">
            <v-card>
              <v-card-text>
                <div class="text-caption text-grey mb-2">Efectivo Inicial</div>
                <div class="text-h4 font-weight-bold primary--text">
                  ${{ startingCash.toFixed(2) }}
                </div>
                <div class="mt-3 text-caption text-grey">
                  Establecido a las {{ startTime }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <!-- Main Column -->
          <v-col cols="12" md="7">
            <!-- Cash Breakdown Section -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon class="mr-2">mdi-cash-multiple</v-icon>
                Desglose de Efectivo
                <v-spacer></v-spacer>
                <v-chip small>
                  ${{ totalCash.toFixed(2) }}
                </v-chip>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row class="mb-4" dense>
                  <v-col cols="4" class="text-caption font-weight-bold">Denominación</v-col>
                  <v-col cols="4" class="text-center text-caption font-weight-bold">Cantidad</v-col>
                  <v-col cols="4" class="text-right text-caption font-weight-bold">Total</v-col>
                </v-row>

                <div v-for="(denom, index) in denominations" :key="index" class="mb-2">
                  <v-row align="center" dense>
                    <v-col cols="4">
                      <div class="font-weight-bold">${{ denom.value.toFixed(2) }}</div>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        v-model.number="denom.count"
                        type="number"
                        dense
                        outlined
                        class="text-center"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4" class="text-right">
                      <div class="font-weight-medium">${{ (denom.value * denom.count).toFixed(2) }}</div>
                    </v-col>
                  </v-row>
                </div>

                <v-btn
                  @click="showSmallDenominations = !showSmallDenominations"
                  text
                  color="primary"
                  class="mt-4"
                >
                  <v-icon small class="mr-1">{{ showSmallDenominations ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  {{ showSmallDenominations ? 'Ocultar' : 'Mostrar' }} Denominaciones Menores
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Daily Log Section -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon class="mr-2">mdi-receipt</v-icon>
                Registro Diario
                <v-spacer></v-spacer>
                <v-btn icon small @click="showLogModal = true">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>

              <v-data-table
                v-if="transactions.length > 0"
                :headers="logHeaders"
                :items="transactions"
                hide-default-footer
                disable-pagination
              >
                <template v-slot:item.value="{ item }">
                  <span :class="item.value > 0 ? 'success--text' : 'error--text'">
                    {{ item.value > 0 ? '+' : '' }}${{ item.value.toFixed(2) }}
                  </span>
                </template>
              </v-data-table>

              <div v-else class="text-center py-8">
                <v-icon size="48" class="text-grey mb-2">mdi-history</v-icon>
                <p class="text-caption text-grey">Aún no se han registrado transacciones hoy.</p>
              </div>

              <v-divider></v-divider>
              <v-card-text class="d-flex justify-space-between align-center py-3">
                <span class="font-weight-medium">Total Registrado</span>
                <span class="text-h6 font-weight-bold">${{ totalLogged.toFixed(2) }}</span>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Sidebar Column -->
          <v-col cols="12" md="5">
            <!-- Summary & Adjustments -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Resumen y Ajustes
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense class="mb-4">
                  <v-col cols="6">
                    <div class="d-flex align-center">
                      <v-icon small color="success" class="mr-2">mdi-circle</v-icon>
                      <span class="text-caption">Transferencia</span>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="d-flex align-center">
                      <v-icon small color="warning" class="mr-2">mdi-circle</v-icon>
                      <span class="text-caption">Valores Atrasados</span>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="d-flex align-center">
                      <v-icon small color="info" class="mr-2">mdi-circle</v-icon>
                      <span class="text-caption">Valor PVP</span>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="d-flex align-center">
                      <v-icon small color="error" class="mr-2">mdi-circle</v-icon>
                      <span class="text-caption">Error / Loss</span>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-2"></v-divider>

                <v-row dense class="mb-3">
                  <v-col cols="12">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption">Monedas</span>
                      <span class="font-weight-medium">${{ cashTotals.coins.toFixed(2) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption">Billetes</span>
                      <span class="font-weight-medium">${{ cashTotals.bills.toFixed(2) }}</span>
                    </div>
                  </v-col>
                </v-row>

                <div v-if="transfers.length > 0">
                  <v-alert
                    v-for="(transfer, index) in transfers"
                    :key="'transfer-' + index"
                    type="success"
                    class="mt-2"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-bold text-caption">TRANSFERENCIA</div>
                        <div class="text-caption">{{ transfer.name }} ({{ transfer.time }})</div>
                      </div>
                      <div class="font-weight-bold">${{ transfer.amount.toFixed(2) }}</div>
                    </div>
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>

            <!-- Observations -->
            <v-card class="mb-4">
              <v-card-title>
                <v-icon class="mr-2">mdi-note-text</v-icon>
                Observaciones
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-textarea
                  v-model="observations"
                  outlined
                  dense
                  rows="4"
                  placeholder="Añada notas o comentarios importantes sobre el cuadre..."
                ></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    <!-- </v-main> -->

    <!-- Floating Save Button -->
    <v-speed-dial
      v-model="fab"
      bottom
      right
      direction="up"
      open-on-hover
      class="mb-16"
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="primary"
          dark
          fab
          @click="saveReconciliation"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </template>
    </v-speed-dial>

    <!-- Add Transaction Modal -->
    <AddTransactionModal
      :show="showLogModal"
      @close="showLogModal = false"
      @save="addTransaction"
    />

  </v-app>
</template>

<script>
export default {
  name: 'CuadreDeCaja',
  data() {
    // Importar el componente del modal
    const AddTransactionModal = () => import('./AddTransactionModal.vue');
    return {
      fab: false,
      currentDate: 'Oct 24',
      startingCash: 25.95,
      startTime: '08:00 AM',
      showSmallDenominations: false,
      showLogModal: false,
      observations: '',
      logHeaders: [
        { text: 'Hora', value: 'time', align: 'start', sortable: false },
        { text: 'Detalles', value: 'details', sortable: false },
        { text: 'Valor', value: 'value', align: 'end', sortable: false }
      ],
      denominations: [
        { value: 10, count: 0 },
        { value: 5, count: 2 },
        { value: 1, count: 11 },
        { value: 0.50, count: 4 }
      ],
      transactions: [
        { time: '13:02', details: 'Transferencia', value: 20 }
      ],
      transfers: [
        { name: 'ANTO', time: '13:02', amount: 20 }
      ]
    }
  },
  components: {
    AddTransactionModal: () => import('./AddTransactionModal.vue')
  },
  computed: {
    // Calcula todos los totales de efectivo (general, monedas, billetes) en una sola pasada
    // para mejorar la eficiencia, evitando múltiples iteraciones sobre `denominations`.
    cashTotals() {
      return this.denominations.reduce((totals, denom) => {
        const amount = (denom.value || 0) * (denom.count || 0);
        totals.total += amount;
        if (denom.value < 1) {
          totals.coins += amount;
        } else {
          totals.bills += amount;
        }
        return totals;
      }, { total: 0, coins: 0, bills: 0 });
    },
    totalCash() {
      return this.cashTotals.total;
    },
    totalLogged() {
      return this.transactions.reduce((sum, trans) => sum + trans.value, 0);
    },
    currentBalance() {
      // El balance se calcula con el efectivo contado, más lo registrado, menos el fondo inicial.
      return this.cashTotals.total + this.totalLogged - this.startingCash;
    },
    coinsTotal() {
      return this.cashTotals.coins;
    },
    billsTotal() {
      return this.cashTotals.bills;
    }
  },
  methods: {
    saveReconciliation() {
      // En una aplicación real, aquí se haría una llamada a la API.
      alert('¡Cuadre guardado!');
      console.log({
        totalEfectivo: this.totalCash,
        totalRegistrado: this.totalLogged,
        balance: this.currentBalance,
        observaciones: this.observations,
        desglose: this.denominations
      });
    },
    addTransaction(newTransaction) {
      const now = new Date();
      const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      this.transactions.push({
        ...newTransaction,
        time: time
      });
      this.showLogModal = false;
    }
  },
  mounted() {
    // Establecer la fecha actual en español
    const date = new Date();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.currentDate = `${meses[date.getMonth()]} ${date.getDate()}`;
  }
}
</script>

<style scoped>
/* Color scheme variables */

/*
  Ajuste manual para el contenido principal cuando v-main está deshabilitado.
  Esto evita que el contenido se oculte debajo del v-app-bar.
*/

:root {
  --primary-color: #0ea5e9;
  --success-color: #22c55e;
  --danger-color: #ef4444;
  --warning-color: #eab308;
  --info-color: #3b82f6;
}

/* Tema de la aplicación */
::v-deep .v-app {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

::v-deep .v-app.theme--dark {
  background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
}

/* Estilos de la barra de aplicación */
::v-deep .v-app-bar {
  background: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

::v-deep .theme--dark .v-app-bar {
  background: #1f2937 !important;
  border-bottom: 1px solid #374151;
}

/* Estilos de las tarjetas */
::v-deep .v-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

::v-deep .theme--dark .v-card {
  border-color: #374151;
  background: #1f2937;
}

::v-deep .v-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Estilos del título de la tarjeta */
::v-deep .v-card__title {
  font-weight: 600;
  font-size: 1.1rem;
  padding: 12px 16px;
  color: #1f2937;
}

::v-deep .theme--dark .v-card__title {
  color: #f3f4f6;
}

/* Estilos del divisor */
::v-deep .v-divider {
  border-color: #e5e7eb;
}

::v-deep .theme--dark .v-divider {
  border-color: #374151;
}

/* Estilos del campo de texto */
::v-deep .v-text-field {
  font-family: 'Inter', sans-serif;
}

::v-deep .v-text-field__input {
  text-align: center;
  font-weight: 500;
}

::v-deep .v-text-field.v-input--dense .v-input__control {
  min-height: 36px;
}

::v-deep .v-text-field--outlined .v-input__prepend-inner,
::v-deep .v-text-field--outlined .v-input__append-inner {
  margin-top: 8px;
}

/* Estilos del área de texto */
::v-deep .v-textarea {
  font-family: 'Inter', sans-serif;
}

::v-deep .v-textarea--outlined textarea {
  padding: 12px;
  border-radius: 8px;
}

/* Estilos de los botones */
::v-deep .v-btn {
  font-weight: 500;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

::v-deep .v-btn--primary {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

::v-deep .v-btn--primary:hover {
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
  transform: translateY(-2px);
}

::v-deep .v-btn--primary.v-btn--fab {
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* Estilos de los chips */
::v-deep .v-chip {
  font-weight: 600;
  background: #f3f4f6 !important;
  color: #374151 !important;
}

::v-deep .theme--dark .v-chip {
  background: #374151 !important;
  color: #e5e7eb !important;
}

/* Estilos de las alertas */
::v-deep .v-alert {
  border-radius: 8px;
  border-left: 4px solid;
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: #22c55e !important;
}

::v-deep .v-alert__content {
  padding: 12px;
}

::v-deep .v-alert.v-alert--type-success {
  background: rgba(34, 197, 94, 0.1) !important;
}

::v-deep .v-alert.v-alert--type-error {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

/* Estilos de la tabla de datos */
::v-deep .v-data-table {
  background: transparent !important;
}

::v-deep .v-data-table__wrapper {
  background: transparent !important;
}

::v-deep .v-data-table th {
  background: #f9fafb !important;
  font-weight: 600;
  color: #6b7280 !important;
  border-bottom: 2px solid #e5e7eb;
}

::v-deep .theme--dark .v-data-table th {
  background: #111827 !important;
  color: #9ca3af !important;
  border-color: #374151;
}

::v-deep .v-data-table td {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

::v-deep .theme--dark .v-data-table td {
  border-color: #374151;
}

/* Estilos de la navegación inferior */
::v-deep .v-bottom-navigation {
  background: #ffffff !important;
  border-top: 1px solid #e5e7eb;
}

::v-deep .theme--dark .v-bottom-navigation {
  background: #1f2937 !important;
  border-color: #374151;
}

::v-deep .v-bottom-navigation__btn {
  min-width: 80px;
}

::v-deep .v-bottom-navigation__btn span {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Estilos de los iconos */
::v-deep .v-icon {
  font-family: 'Material Design Icons';
}

/* Estilos del Speed Dial */
::v-deep .v-speed-dial__button {
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

::v-deep .v-speed-dial__button:hover {
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
}

/* 
  NOTA: Para una mejor integración, estos colores deberían definirse en el tema de Vuetify.
  Esto permite usar `color="success"` directamente en los componentes de Vuetify.
*/
/* Colores de progreso y estado */
.success--text {
  color: #22c55e !important;
}

.error--text {
  color: #ef4444 !important;
}

.warning--text {
  color: #eab308 !important;
}

.info--text {
  color: #3b82f6 !important;
}

.primary--text {
  color: #0ea5e9 !important;
}

/* Estilos de la tarjeta de balance */
.balance-card {
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: -40px;
  width: 100px;
  height: 100px;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 50%;
}

/* Ajustes responsivos */
@media (max-width: 600px) {
  ::v-deep .v-card__title {
    padding: 12px;
    font-size: 1rem;
  }

  ::v-deep .v-container {
    padding: 12px;
  }

  ::v-deep .v-bottom-navigation {
    padding-bottom: 8px;
  }
}

/* Transiciones suaves */
::v-deep * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Estados de foco */
::v-deep .v-text-field:focus-within,
::v-deep .v-textarea:focus-within {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* Estilos de texto */
.text-h5 {
  font-weight: 700;
  letter-spacing: -0.5px;
}

.text-h6 {
  font-weight: 600;
}

.font-weight-bold {
  font-weight: 700;
}

.font-weight-medium {
  font-weight: 500;
}

/* Indicadores de estado */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}
</style>
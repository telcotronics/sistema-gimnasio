<template>
  <v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="headline blue-grey lighten-5 py-4">
        <v-icon left color="primary" large>mdi-cash-register</v-icon>
        <div>
          <div class="text-h5 font-weight-bold">Reporte de Sesiones de Caja</div>
          <div class="text-caption grey--text">Historial de movimientos y auditoría contable</div>
        </div>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="busqueda"
          append-icon="mdi-magnify"
          label="Buscar por usuario o ID de caja..."
          single-line hide-details outlined dense class="white"
          style="max-width: 400px;"
        ></v-text-field>
      </v-card-title>

      <v-expansion-panels v-model="panelActivo" multiple class="mt-4 px-2 pb-6">
        <v-expansion-panel
          v-for="(caja, index) in cajasFiltradas"
          :key="`caja-${caja.ccd_idCaja}-${index}`"
          @click="cargarDetalleCaja(caja.ccd_idCaja)"
        >
          <v-expansion-panel-header class="py-3">
            <template v-slot:default="{ open }">
              <v-row no-gutters align="center">
                <v-col cols="2">
                  <v-chip color="primary" label small class="font-weight-bold">
                    ID #{{ caja.ccd_idCaja }}
                  </v-chip>
                </v-col>
                <v-col cols="3">
                  <v-icon small left color="grey darken-1">mdi-account-circle</v-icon>
                  <span class="font-weight-bold indigo--text text--darken-4">
                    {{ caja.ccd_usuario }}
                  </span>
                </v-col>
                <v-col cols="4">
                  <v-chip 
                    x-small 
                    :color="caja.estado === 'ACTIVA' ? 'success' : 'grey lighten-1'" 
                    dark class="mr-2"
                  >
                    {{ caja.estado }}
                  </v-chip>
                  <span class="text-caption grey--text">{{ caja.fecha_apertura }}</span>
                </v-col>
                <v-col cols="3" class="text-right pr-4">
                  <v-btn x-small fab depressed color="blue lighten-4" class="mr-2" @click.stop="abrirModalDetalle(caja.ccd_idCaja)">
                    <v-icon color="blue darken-3" x-small>mdi-launch</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-divider class="mb-4"></v-divider>
            
            <v-row v-if="detallesCajas[caja.ccd_idCaja]" class="mb-6 mx-1">
              <v-col cols="12" sm="3">
                <v-card outlined class="pa-2 text-center grey lighten-4">
                  <div class="text-caption grey--text font-weight-bold">SALDO INICIAL</div>
                  <div class="text-h6">${{ parseFloat(caja.saldo_inicial).toFixed(2) }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="3">
                <v-card outlined class="pa-2 text-center green lighten-5">
                  <div class="text-caption green--text font-weight-bold">(+) ENTRADAS</div>
                  <div class="text-h6 green--text">+${{ calcularTotal(caja.ccd_idCaja, 'ENTRADA') }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="3">
                <v-card outlined class="pa-2 text-center red lighten-5">
                  <div class="text-caption red--text font-weight-bold">(-) SALIDAS</div>
                  <div class="text-h6 red--text">-${{ calcularTotal(caja.ccd_idCaja, 'SALIDA') }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="3">
                <v-card outlined class="pa-2 text-center blue lighten-5 border-blue">
                  <div class="text-caption blue--text font-weight-bold">SALDO FINAL ESPERADO</div>
                  <div class="text-h6 blue--text">${{ calcularSaldoFinal(caja) }}</div>
                </v-card>
              </v-col>
            </v-row>

            <v-simple-table dense class="elevation-1 border-table">
              <template v-slot:default>
                <thead>
                  <tr class="blue-grey lighten-5">
                    <th class="text-left">Hora</th>
                    <th class="text-left">Concepto</th>
                    <th class="text-left">Documento</th>
                    <th class="text-left">Forma Pago</th>
                    <th class="text-right">Monto</th>
                  </tr>
                </thead>
                <tbody v-if="detallesCajas[caja.ccd_idCaja]">
                  <tr v-for="mov in detallesCajas[caja.ccd_idCaja]" :key="mov.ccd_id">
                    <td class="text-caption">{{ extraerHora(mov.ccd_fecha) }}</td>
                    <td>
                      <div class="font-weight-medium">{{ mov.ccd_comcepto }}</div>
                      <div class="text-caption grey--text italic">{{ mov.ccd_observacion }}</div>
                    </td>
                    <td class="text-caption">{{ mov.ccd_tipoDocNom }} #{{ mov.ccd_tipoDocNum }}</td>
                    <td>
                      <v-icon x-small color="grey darken-2" class="mr-1">{{ getIconoPago(mov.ccd_formaPago) }}</v-icon>
                      <span class="text-caption">{{ mov.ccd_formaPago }}</span>
                    </td>
                    <td class="text-right font-weight-bold" :class="mov.ccd_tipoEntSal === 'ENTRADA' ? 'green--text' : 'red--text'">
                      {{ mov.ccd_tipoEntSal === 'ENTRADA' ? '+' : '-' }} ${{ mov.ccd_valorTotal.toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <v-card-actions class="justify-end mt-4">
              <v-btn text color="primary" small @click="imprimirCaja(caja.ccd_idCaja)">
                <v-icon left small>mdi-printer</v-icon> Imprimir Reporte de Caja
              </v-btn>
            </v-card-actions>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-dialog v-model="modalDetalle" max-width="1100px" scrollable>
      <v-card v-if="cajaSeleccionadaId">
        <v-card-title class="primary white--text">
          Auditoría de Caja #{{ cajaSeleccionadaId }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="modalDetalle = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-4" style="height: 70vh;">
          <v-data-table
            :headers="headersDetalle"
            :items="detallesCajas[cajaSeleccionadaId] || []"
            class="elevation-1"
            dense
            :items-per-page="20"
          >
            <template v-slot:item.ccd_tipoEntSal="{ item }">
              <v-chip x-small :color="item.ccd_tipoEntSal === 'ENTRADA' ? 'success' : 'error'" dark>
                {{ item.ccd_tipoEntSal }}
              </v-chip>
            </template>
            <template v-slot:item.ccd_valorTotal="{ item }">
              <span :class="item.ccd_tipoEntSal === 'ENTRADA' ? 'green--text' : 'red--text'" class="font-weight-bold">
                ${{ item.ccd_valorTotal.toFixed(2) }}
              </span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API para producción
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  name: 'EstadoCajas',
  data: () => ({
    busqueda: '',
    panelActivo: [],
    listaCajas: [],
    detallesCajas: {},
    modalDetalle: false,
    cajaSeleccionadaId: null,
    headersDetalle: [
      { text: 'Fecha/Hora', value: 'ccd_fecha' },
      { text: 'Concepto', value: 'ccd_comcepto' },
      { text: 'Tipo', value: 'ccd_tipoEntSal', align: 'center' },
      { text: 'Documento', value: 'ccd_tipoDocNom' },
      { text: 'Forma Pago', value: 'ccd_formaPago' },
      { text: 'Total', value: 'ccd_valorTotal', align: 'end' },
    ]
  }),

  computed: {
    cajasFiltradas() {
      if (!this.busqueda) return this.listaCajas;
      const b = this.busqueda.toLowerCase();
      return this.listaCajas.filter(c => 
        String(c.ccd_usuario).toLowerCase().includes(b) || 
        String(c.ccd_idCaja).includes(b)
      );
    }
  },

  mounted() {
    this.obtenerListaCajas();
  },

  methods: {
    async obtenerListaCajas() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/estado_cajas`);
        this.listaCajas = res.data.data;
      } catch (e) { console.error("Error al cargar listado maestro:", e); }
    },

    async cargarDetalleCaja(idCaja) {
      if (this.detallesCajas[idCaja]) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/estado_cajas_detalle/${idCaja}`);
        this.$set(this.detallesCajas, idCaja, res.data.data);
      } catch (e) { console.error("Error al cargar movimientos:", e); }
    },

    abrirModalDetalle(idCaja) {
      this.cajaSeleccionadaId = idCaja;
      this.modalDetalle = true;
      this.cargarDetalleCaja(idCaja);
    },

    calcularTotal(idCaja, tipo) {
      const movimientos = this.detallesCajas[idCaja] || [];
      const total = movimientos
        .filter(m => m.ccd_tipoEntSal === tipo)
        .reduce((sum, m) => sum + parseFloat(m.ccd_valorTotal || 0), 0);
      return total.toFixed(2);
    },

    calcularSaldoFinal(caja) {
      const inicial = parseFloat(caja.saldo_inicial || 0);
      const entradas = parseFloat(this.calcularTotal(caja.ccd_idCaja, 'ENTRADA'));
      const salidas = parseFloat(this.calcularTotal(caja.ccd_idCaja, 'SALIDA'));
      return (inicial + entradas - salidas).toFixed(2);
    },

    getIconoPago(forma) {
      const f = String(forma || '').toLowerCase();
      if (f.includes('efectivo')) return 'mdi-cash';
      if (f.includes('transferencia') || f.includes('deposito')) return 'mdi-bank';
      if (f.includes('tarjeta')) return 'mdi-credit-card';
      return 'mdi-currency-usd';
    },

    extraerHora(fecha) {
      if (!fecha) return '--:--';
      // Si el formato es 'YYYY-MM-DD HH:MM:SS', tomamos solo HH:MM
      return fecha.includes(' ') ? fecha.split(' ')[1].substring(0, 5) : fecha;
    },

    imprimirCaja(idCaja) {
      console.log("Generando reporte para caja:", idCaja);
      window.print(); // O llamar a una ruta de PDF en el servidor
    }
  }
};
</script>

<style scoped>
.border-blue { border: 1px solid #2196F3 !important; }
.italic { font-style: italic; }
.border-table { border: 1px solid #e0e0e0; }
</style>
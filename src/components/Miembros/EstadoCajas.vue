<template>
    <v-container fluid>
        <v-row dense>
            <v-col cols="12" sm="4">
                <v-card color="success" dark elevation="2">
                    <v-card-text class="text-center">
                        <div class="subtitle-1">Total Entradas</div>
                        <div class="display-1 font-weight-bold">${{ totalEntradas.toFixed(2) }}</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4">
                <v-card color="error" dark elevation="2">
                    <v-card-text class="text-center">
                        <div class="subtitle-1">Total Salidas</div>
                        <div class="display-1 font-weight-bold">${{ totalSalidas.toFixed(2) }}</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4">
                <v-card color="primary" dark elevation="2">
                    <v-card-text class="text-center">
                        <div class="subtitle-1">Saldo Neto (Caja)</div>
                        <div class="display-1 font-weight-bold">${{ (totalEntradas - totalSalidas).toFixed(2) }}</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card class="mt-4" elevation="2">
            <v-card-title class="headline grey lighten-2">
                <v-icon left color="primary">mdi-cash-register</v-icon>
                Reporte: Movimientos de Caja Diaria
                <v-spacer></v-spacer>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Filtrar por concepto o usuario..."
                    single-line hide-details outlined dense class="white"></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="movimientos" :search="search" :loading="loading"
                class="elevation-1">
                <template v-slot:item.ccd_fecha="{ item }">
                    {{ new Date(item.ccd_fecha).toLocaleTimeString() }}
                </template>

                <template v-slot:item.ccd_comcepto="{ item }">
                    <div class="font-weight-medium">{{ item.ccd_comcepto }}</div>
                    <small class="grey--text">{{ item.ccd_tipoDocNom }}: {{ item.ccd_tipoDocNum }}</small>
                </template>

                <template v-slot:item.ccd_tipoEntSal="{ item }">
                    <v-chip small
                        :color="item.ccd_tipoEntSal === 'ENTRADA' ? 'green lighten-5 green--text' : 'red lighten-5 red--text'"
                        class="font-weight-bold">
                        <v-icon x-small left>{{ item.ccd_tipoEntSal === 'ENTRADA' ? 'mdi-arrow-up' : 'mdi-arrow-down'
                            }}</v-icon>
                        {{ item.ccd_tipoEntSal }}
                    </v-chip>
                </template>

                <template v-slot:item.ccd_valorTotal="{ item }">
                    <span :class="item.ccd_tipoEntSal === 'ENTRADA' ? 'green--text font-weight-bold' : 'red--text'">
                        ${{ item.ccd_valorTotal.toFixed(2) }}
                    </span>
                </template>

                <template v-slot:item.ccd_formaPago="{ item }">
                    <v-icon small class="mr-1">{{ getIconoPago(item.ccd_formaPago) }}</v-icon>
                    {{ item.ccd_formaPago }}
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API para producción
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
    name: 'EstadoCajas',
    data() {
        return {
            search: '',
            loading: false,
            movimientos: [],
            headers: [
                { text: 'Hora', value: 'ccd_fecha', width: '100px' },
                { text: 'Concepto / Documento', value: 'ccd_comcepto' },
                { text: 'Tipo', value: 'ccd_tipoEntSal', align: 'center' },
                { text: 'Forma Pago', value: 'ccd_formaPago' },
                { text: 'Usuario', value: 'ccd_usuario' },
                { text: 'Total', value: 'ccd_valorTotal', align: 'end' }
            ]
        }
    },
    computed: {
        totalEntradas() {
            return this.movimientos
                .filter(m => m.ccd_tipoEntSal === 'ENTRADA')
                .reduce((sum, m) => sum + m.ccd_valorTotal, 0);
        },
        totalSalidas() {
            return this.movimientos
                .filter(m => m.ccd_tipoEntSal === 'SALIDA')
                .reduce((sum, m) => sum + m.ccd_valorTotal, 0);
        }
    },
    mounted() {
        this.obtenerMovimientos();
    },
    methods: {
        async obtenerMovimientos() {
            this.loading = true;
            try {
                // Asumiendo que crearás esta ruta en tu Node.js
                const res = await axios.get(`${API_BASE_URL}/api/estado_cajas`);
                console.log("DEBUG - Datos recibidos en EstadoCajas:", res.data);
                this.movimientos = res.data.data;
            } catch (e) {
                console.error("Error cargando caja:", e);
            } finally {
                this.loading = false;
            }
        },
        getIconoPago(forma) {
            // 1. PRIMERO: Si es nulo, indefinido o no es texto, sal de la función de inmediato
            if (!forma || typeof forma !== 'string') {
                return 'mdi-cash-remove'; // Devuelve un icono por defecto y NO ejecuta el .includes()
            }

            // 2. SEGUNDO: Ahora que estamos 100% seguros que es texto, lo procesamos
            const f = forma.toLowerCase();

            if (f.includes('efectivo')) return 'mdi-cash';
            if (f.includes('transferencia') || f.includes('deposito')) return 'mdi-bank';
            if (f.includes('tarjeta')) return 'mdi-credit-card';

            return 'mdi-currency-usd';
        }
    }
}
</script>
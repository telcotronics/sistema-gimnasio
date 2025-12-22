<template>
  <v-container>
    <v-btn color="success" large @click="abrirDialogo" elevation="4">
      <v-icon left>mdi-play-circle</v-icon> Iniciar Turno / Abrir Caja
    </v-btn>

    <v-dialog v-model="dialog" max-width="450px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline primary white--text">
          <v-icon left dark>mdi-cash-register</v-icon> Apertura de Caja
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-alert v-if="errorMsg" type="error" dense text>{{ errorMsg }}</v-alert>
          
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="form.contCaja_caja"
                :items="['CAJA1', 'CAJA2', 'CAJA3']"
                label="Seleccionar Punto de Venta"
                outlined dense
                prepend-inner-icon="mdi-monitor"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="form.contCaja_saldoInicial"
                label="Saldo Inicial en Efectivo"
                prefix="$"
                type="number"
                outlined dense
                prepend-inner-icon="mdi-currency-usd"
                hint="Dinero físico disponible al abrir"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-2">
              <v-textarea
                v-model="form.contCaja_Observacion"
                label="Notas de Apertura"
                outlined dense rows="2"
                placeholder="Ej: Cambio de turno, inicio de semana..."
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pb-4 px-4">
          <v-btn text @click="dialog = false" :disabled="loading">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="enviarApertura" :loading="loading" elevation="2">
            Confirmar e Iniciar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API para producción
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  data: () => ({
    dialog: false,
    loading: false,
    errorMsg: '',
    form: {
      contCaja_caja: 'CAJA1',
      contCaja_usuario: 'admin', // En producción, esto viene del login (this.$store.state.user)
      contCaja_saldoInicial: 0,
      contCaja_Observacion: ''
    }
  }),
  methods: {
    abrirDialogo() {
      this.errorMsg = '';
      this.dialog = true;
    },
    async enviarApertura() {
      if (this.form.contCaja_saldoInicial < 0) {
        this.errorMsg = "El saldo inicial no puede ser negativo";
        return;
      }

      this.loading = true;
      try {
        // URL corregida para coincidir con el backend (rt_clientes.js)
        const res = await axios.post(`${API_BASE_URL}/api/abrir_caja`, this.form);
        if (res.data.success) {
          this.dialog = false;
          // Emitimos un evento para que los otros componentes sepan que hay caja abierta
          this.$emit('cajaAbierta', res.data.idCaja);
          // Opcional: recargar el estado global o navegar al dashboard de cobros
          alert("¡Caja inicializada! Ya puedes registrar pagos.");
        } else {
          this.errorMsg = res.data.message;
        }
      } catch (e) {
        this.errorMsg = "Error de conexión con el servidor";
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
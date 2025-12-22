<template>
  <v-container fluid>
    <v-card elevation="2">
      <v-card-title class="headline grey lighten-2">
        <v-icon left>mdi-account-group</v-icon>
        Estado de Miembros y Clientes
        <v-spacer></v-spacer>
        <v-text-field
          v-model="busqueda"
          append-icon="mdi-magnify"
          label="Buscar por nombre o cédula..."
          single-line hide-details outlined dense class="white"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="listaMiembros"
        :search="busqueda"
        :loading="loading"
        loading-text="Obteniendo información del servidor..."
        class="elevation-1"
        :items-per-page="10"
      >
        <template v-slot:item.nombre_completo="{ item }">
          <div class="py-2">
            <span class="nombre-resaltado">{{ item.nombre_completo }}</span>
            <span class="cedula-sub">C.I.: {{ item.cedula }} | Mat: {{ item.matricula }}</span>
          </div>
        </template>

        <template v-slot:item.membresia_nombre="{ item }">
          <v-chip
            small
            :class="item.membresia_nombre === 'NO MIEMBRO' ? 'grey lighten-2 grey--text' : 'blue lighten-5 blue--text text--darken-4'"
            label
            class="font-weight-bold"
          >
            {{ item.membresia_nombre }}
          </v-chip>
        </template>

        <template v-slot:item.fecha_fin="{ item }">
          <div v-if="item.fecha_fin">
            {{ formatearFecha(item.fecha_fin) }}
            <span :class="claseDiasRestantes(item.dias_restantes)" class="d-block caption font-weight-bold">
              {{ textoDiasRestantes(item.dias_restantes) }}
            </span>
          </div>
          <span v-else class="grey--text italic">---</span>
        </template>

        <template v-slot:item.semaforo_estado="{ item }">
          <v-chip :color="getColorSemaforo(item.semaforo_estado)" dark small class="font-weight-bold">
            <v-icon left x-small>{{ getIconoSemaforo(item.semaforo_estado) }}</v-icon>
            {{ item.semaforo_estado.split(':')[1] || item.semaforo_estado }}
          </v-chip>
        </template>

        <template v-slot:item.saldo_pendiente="{ item }">
          <span :class="item.saldo_pendiente > 0 ? 'red--text font-weight-bold' : 'success--text'">
            ${{ parseFloat(item.saldo_pendiente).toFixed(2) }}
          </span>
        </template>

        <template v-slot:item.acciones="{ item }">
          <v-menu offset-y transition="slide-y-transition">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="primary">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item v-if="item.semaforo_estado.includes('VERDE')" @click="registrarAcceso(item)">
                <v-list-item-icon><v-icon color="success">mdi-door-open</v-icon></v-list-item-icon>
                <v-list-item-title>Registrar Ingreso</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="item.saldo_pendiente > 0" @click="irACaja(item)">
                <v-list-item-icon><v-icon color="warning">mdi-cash-register</v-icon></v-list-item-icon>
                <v-list-item-title>Cobrar Saldo Pendiente</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="item.semaforo_estado.includes('ROJO')" @click="abrirSuscripcion(item)">
                <v-list-item-icon><v-icon color="error">mdi-card-membership</v-icon></v-list-item-icon>
                <v-list-item-title>{{ item.membresia_nombre === 'NO MIEMBRO' ? 'Crear Membresía' : 'Renovar Plan' }}</v-list-item-title>
              </v-list-item>

              <v-divider></v-divider>
              
              <v-list-item @click="verPerfil(item)">
                <v-list-item-icon><v-icon>mdi-account-details</v-icon></v-list-item-icon>
                <v-list-item-title>Ver Ficha</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
  name: 'EstadoMiembros',
  data() {
    return {
      busqueda: '',
      loading: false,
      listaMiembros: [],
      headers: [
        { text: 'Nombre / Cédula', value: 'nombre_completo' },
        { text: 'Plan Actual', value: 'membresia_nombre' },
        { text: 'Vencimiento', value: 'fecha_fin' },
        { text: 'Situación', value: 'semaforo_estado', align: 'center' },
        { text: 'Saldo (CXC)', value: 'saldo_pendiente', align: 'end' },
        { text: 'Acciones', value: 'acciones', sortable: false, align: 'center' }
      ]
    };
  },
  mounted() {
    this.obtenerDatos();
  },
  methods: {
    async obtenerDatos() {
      this.loading = true;
      try {
        const url = `${API_BASE_URL}/api/estado_miembros`;
        const response = await axios.get(url);
        // Ajustamos según tu controlador (que envía { success: true, data: [...] })
        this.listaMiembros = response.data.data;
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        this.loading = false;
      }
    },
    formatearFecha(fecha) {
      if (!fecha) return '';
      return new Date(fecha).toLocaleDateString('es-ES');
    },
    textoDiasRestantes(dias) {
      if (dias === null) return '';
      if (dias < 0) return `Vencido hace ${Math.abs(dias)} días`;
      if (dias === 0) return 'Vence hoy';
      return `Quedan ${dias} días`;
    },
    claseDiasRestantes(dias) {
      if (dias === null) return '';
      return dias < 0 ? 'red--text' : 'green--text';
    },
    getColorSemaforo(estado) {
      if (!estado) return 'grey';
      if (estado.includes('VERDE')) return 'success';
      if (estado.includes('AMARILLO')) return 'warning';
      if (estado.includes('ROJO')) return 'error';
      return 'grey';
    },
    getIconoSemaforo(estado) {
      if (!estado) return 'mdi-help-circle';
      if (estado.includes('VERDE')) return 'mdi-check-circle';
      if (estado.includes('AMARILLO')) return 'mdi-alert-circle';
      if (estado.includes('ROJO')) return 'mdi-close-circle';
      return 'mdi-help-circle';
    },
    // Métodos para acciones (lógica de negocio)
    registrarAcceso(socio) {
      alert(`Acceso registrado para: ${socio.nombre_completo}`);
    },
    irACaja(socio) {
      alert(`Abriendo cobro de CXC para cliente ID: ${socio.client_id} por $${socio.saldo_pendiente}`);
    },
    abrirSuscripcion(socio) {
      alert(`Abriendo catálogo de membresías para: ${socio.nombre_completo}`);
    },
    verPerfil(socio) {
      alert(`Cargando ficha de: ${socio.nombre_completo}`);
    }
  }
};
</script>

<style scoped>
.nombre-resaltado {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a237e;
  text-transform: uppercase;
}
.cedula-sub {
  display: block;
  font-size: 0.7rem;
  color: #757575;
}
.italic {
  font-style: italic;
}
</style>
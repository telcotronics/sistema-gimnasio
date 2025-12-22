<template>
  <div class="registrar-pagos">
    <h2>Registro de Pagos de Miembros</h2>

    <div class="form-group search-client-container">
      <label for="clienteSearch">Buscar Cliente:</label>
      <input type="text" id="clienteSearch" v-model="clienteSearchText" @input="debouncedSearchClientes"
        placeholder="Buscar por nombre o RUC/cédula..." :disabled="!!clienteData" autocomplete="off">
      <div v-if="searchResults.length > 0 && !clienteData" class="autocomplete-results">
        <div v-for="cliente in searchResults" :key="cliente.client_id" class="autocomplete-item"
          @click="selectCliente(cliente)">
          {{ cliente.client_nombre }} ({{ cliente.client_rucCed }})
          <span v-if="cliente.isMember" :class="['member-status-badge', cliente.hasOverdue ? 'overdue' : 'ok']">
            {{ cliente.hasOverdue ? 'VENCIDO' : 'AL DÍA' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="clienteData" class="cliente-info-card">
      <h3>Datos del Cliente</h3>
      <p><strong>Nombre:</strong> {{ clienteData.client_nombre }}</p>
      <p><strong>RUC/Cédula:</strong> {{ clienteData.client_rucCed }}</p>
      <button @click="clearClienteSelection" class="clear-selection-btn">Cambiar Cliente</button>
    </div>

    <hr />

    <div class="tipo-cobro-selector">
      <h3>Seleccionar Tipo de Cobro</h3>
      <button :class="{ 'active': tipoCobroSeleccionado === 'credito' }" @click="setTipoCobro('credito')"
        :disabled="registrando">Crédito</button>
      <button :class="{ 'active': tipoCobroSeleccionado === 'contado' }" @click="setTipoCobro('contado')"
        :disabled="registrando">Contado</button>
      <button :class="{ 'active': tipoCobroSeleccionado === 'mixto' }" @click="setTipoCobro('mixto')"
        :disabled="registrando">Mixto</button>
    </div>

    <hr />

    <div v-if="tipoCobroSeleccionado" class="seccion-comun-pago">
      <h3>Detalles del Cobro</h3>
      <div class="form-group">
        <label for="montoTotal">Monto Total a Cobrar:</label>
        <input type="number" id="montoTotal" v-model.number="montoTotalCobro" step="0.01" :disabled="registrando" />
      </div>

      <div class="form-group">
        <label for="origenTransaccion">Origen de la Transacción:</label>
        <select v-model="origenTransaccion" id="origenTransaccion" :disabled="registrando">
          <option value="">Seleccione el origen</option>
          <option value="VISITA_OCASIONAL">Visita Ocasional</option>
          <option value="MEMBRESIA">Membresía</option>
          <option value="VENTA_PRODUCTO">Venta de Producto</option>
          <option value="ANTICIPO">Anticipo</option>
        </select>
      </div>

      <div class="form-group">
        <label for="documentoTipo">Tipo de Documento:</label>
        <select v-model="documentoCobroTipo" id="documentoTipo" :disabled="registrando">
          <option value="FACTURA">Factura</option>
          <option value="NOTA_VENTA">Nota de Venta</option>
          <option value="TICKET">Ticket</option>
        </select>
      </div>

      <div class="form-group">
        <label for="numeroDocumento">Número de Documento:</label>
        <input type="text" id="numeroDocumento" v-model="numeroDocumento" :disabled="registrando" />
      </div>
    </div>

    <div v-if="tipoCobroSeleccionado === 'contado' || tipoCobroSeleccionado === 'mixto'" class="seccion-contado-mixto">

      <div v-if="!cajaActiva" class="mensaje error">
        <strong>ALERTA:</strong> No tienes una caja abierta.
        <router-link to="/caja_apertura" class="link-apertura">
          Ir a Apertura de Caja
        </router-link>
      </div>

      <div v-else class="mensaje info" style="margin-bottom: 20px; background: #e3f2fd">
        Caja Activa: <strong>{{ cajaActiva.contCaja_caja }}</strong>
      </div>

      <h3>Forma(s) de Pago</h3>
      <div v-for="(fp, index) in formasDePagoMixtas" :key="index" class="forma-pago-item">
        <div class="form-group">
          <label>Método:</label>
          <select v-model="fp.id_forma_pago" :disabled="registrando">
            <option value="">Seleccione</option>
            <option v-for="forma in formasPagoDisponibles" :key="forma.id_tipo_forma_pago"
              :value="forma.id_tipo_forma_pago">
              {{ forma.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Monto:</label>
          <input type="number" v-model.number="fp.monto_detalle" step="0.01" :disabled="registrando" />
        </div>
        <div class="form-group">
          <label>Ref/Banco:</label>
          <input type="text" v-model="fp.referencia_metodo" :disabled="registrando" />
        </div>
        <button v-if="tipoCobroSeleccionado === 'mixto'" @click="removeFormaPago(index)" class="remove-btn">X</button>
      </div>

      <button v-if="tipoCobroSeleccionado === 'mixto'" @click="addFormaPago" :disabled="registrando">Añadir Forma de
        Pago</button>

      <div class="resumen-pago">
        <p>Monto Pagado: <strong>${{ montoPagado.toFixed(2) }}</strong></p>
        <p>Pendiente: <strong :class="{ 'error-msg': montoPendiente > 0 }">${{ montoPendiente.toFixed(2) }}</strong></p>
      </div>
    </div>

    <div class="acciones-finales">
      <button @click="procesarPago" :disabled="!formularioValido || registrando">
        <span v-if="registrando">Procesando...</span>
        <span v-else>Guardar Pago</span>
      </button>
      <button @click="resetFormulario" :disabled="registrando">Cancelar</button>
    </div>

    <div v-if="mensajeExito" class="mensaje exito">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="mensaje error">{{ mensajeError }}</div>
  </div>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API para producción
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  name: 'RegistrarPagos',
  data() {
    return {
      clienteSearchText: '',
      searchResults: [],
      clienteData: null,
      cajaActiva: null, // Agregado
      formasPagoDisponibles: [], // Agregado
      tipoCobroSeleccionado: null,
      montoTotalCobro: 0,
      origenTransaccion: '',
      documentoCobroTipo: '',
      numeroDocumento: '',
      fechaDocumento: new Date().toISOString().slice(0, 10),
      formasDePagoMixtas: [{ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }],
      registrando: false,
      mensajeExito: '',
      mensajeError: '',
      registradoPor: localStorage.getItem('nombreUsuario') || 'admin'
    }
  },
  computed: {
    montoPagado() {
      return this.formasDePagoMixtas.reduce((sum, fp) => sum + (parseFloat(fp.monto_detalle) || 0), 0);
    },
    montoPendiente() {
      return Math.max(0, this.montoTotalCobro - this.montoPagado);
    },
    formularioValido() {
      // Tu validación original reforzada
      if (!this.clienteData || this.montoTotalCobro <= 0) return false;
      if (this.tipoCobroSeleccionado !== 'credito' && !this.cajaActiva) return false;
      return true;
    }
  },
  methods: {
    async fetchInitialData() {
      try {
        // Cargar formas de pago desde tu API nueva
        const resFP = await axios.get(`${API_BASE_URL}/api/pagos/listarFormasPago`);
        this.formasPagoDisponibles = resFP.data.data;

        // Cargar caja activa
        const resCaja = await axios.get(`${API_BASE_URL}/caja/activa/${this.registradoPor}`);
        if (resCaja.data.existe) this.cajaActiva = resCaja.data.caja;
      } catch (e) {
        console.error("Error inicial:", e);
      }
    },
    async procesarPago() {
      if (!this.formularioValido) return;
      this.registrando = true;

      const payload = {
        id_caja: this.cajaActiva ? this.cajaActiva.contCaja_ID : null,
        client_id: this.clienteData.client_id,
        monto_total: this.montoTotalCobro,
        tipo_cobro: this.tipoCobroSeleccionado,
        origen: this.origenTransaccion,
        doc_tipo: this.documentoCobroTipo,
        doc_num: this.numeroDocumento,
        detalles_pago: this.formasDePagoMixtas
      };

      try {
        // NOTA: El endpoint 'procesar_completo' no se encontró en rt_clientes.js. Se apunta a producción.
        const res = await axios.post(`${API_BASE_URL}/api/pagos/procesar_completo`, payload);
        if (res.data.success) {
          this.mensajeExito = "Pago guardado correctamente";
          this.resetFormulario();
        } else {
          this.mensajeError = res.data.message;
        }
      } catch (e) {
        this.mensajeError = "Error al conectar con el servidor";
      } finally {
        this.registrando = false;
      }
    },
    // ... mantén tus otros métodos (search, selectCliente, etc) ...
    setTipoCobro(tipo) { this.tipoCobroSeleccionado = tipo; },
    addFormaPago() { this.formasDePagoMixtas.push({ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }); },
    removeFormaPago(index) { this.formasDePagoMixtas.splice(index, 1); },
    selectCliente(cliente) { this.clienteData = cliente; this.searchResults = []; },
    clearClienteSelection() { this.clienteData = null; this.clienteSearchText = ''; },
    resetFormulario() { location.reload(); }, // Forma rápida de limpiar
    async debouncedSearchClientes() {
      if (this.clienteSearchText.length < 3) return;
      // NOTA: El endpoint 'search-client-member-status' no se encontró en rt_clientes.js. Se apunta a producción.
      //url = `${API_BASE_URL}/consultaClientesJson?consulta=${encodeURIComponent(this.searchQuery)}`;
      const res = await axios.get(`${API_BASE_URL}/consultaClientesJson?consulta=${this.clienteSearchText}`);
      this.searchResults = res.data;
    }
  },
  async mounted() {
    await this.fetchInitialData();
  }
}
</script>


<style scoped>
.registrar-pagos {
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 20px auto;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

h2,
h3 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

hr {
  border: 0;
  height: 1px;
  background-color: #eee;
  margin: 30px 0;
}

.cliente-info-card {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
}

.clear-selection-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.cliente-info-card p {
  margin: 5px 0;
}

.tipo-cobro-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.tipo-cobro-selector button {
  padding: 12px 25px;
  background-color: #f0f0f0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tipo-cobro-selector button:hover:not(.active):not(:disabled) {
  background-color: #e0e0e0;
  border-color: #bbb;
}

.tipo-cobro-selector button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.tipo-cobro-selector button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.seccion-comun-pago,
.seccion-credito,
.seccion-contado-mixto {
  padding: 20px;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  background-color: #fcfcfc;
  margin-bottom: 20px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
input[type="date"],
textarea,
select {
  width: calc(100% - 22px);
  padding: 10px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
}

button {
  padding: 10px 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.acciones-finales {
  text-align: center;
  margin-top: 30px;
}

.acciones-finales button {
  margin: 0 10px;
}

.remove-btn {
  background-color: #dc3545;
  margin-left: 10px;
}

.remove-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.forma-pago-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 5px;
  background-color: #fcf8e3;
}

.forma-pago-item .form-group {
  flex: 1;
  margin-bottom: 0;
}

.forma-pago-item select,
.forma-pago-item input {
  margin-bottom: 0;
}

.resumen-pago {
  margin-top: 20px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 5px;
  font-size: 1.1em;
  font-weight: bold;
}

.resumen-pago p {
  margin: 5px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

table th {
  background-color: #f2f2f2;
}

/* Mensajes */
.mensaje {
  margin-top: 20px;
  padding: 12px;
  border-radius: 5px;
  font-size: 0.95em;
  text-align: center;
}

.mensaje.exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.mensaje.info {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.error-msg {
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 5px;
}

/* Estilos para la nueva caja de búsqueda */
.search-client-container {
  position: relative;
  margin-bottom: 25px;
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
}

.autocomplete-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.autocomplete-item:hover {
  background-color: #f0f8ff;
}

.member-status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  color: white;
}

.member-status-badge.ok {
  background-color: #28a745;
}

.member-status-badge.overdue {
  background-color: #dc3545;
}
</style>
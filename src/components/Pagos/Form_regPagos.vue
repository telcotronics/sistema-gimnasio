<template>
    <div class="registrar-pagos">
      <h2>Registro de Pagos</h2>
  
      <div v-if="loadingInitialData" class="mensaje info">Cargando datos iniciales...</div>
      <div v-else-if="!clienteData" class="mensaje error">No se pudo cargar la información del cliente.</div>
  
      <div v-if="clienteData" class="cliente-info-card">
        <h3>Datos del Cliente</h3>
        <p><strong>Nombre:</strong> {{ clienteData.client_nombre }}</p>
        <p><strong>RUC/Cédula:</strong> {{ clienteData.client_rucCed }}</p>
        <p v-if="visitaId"><strong>ID Visita:</strong> {{ visitaId }}</p>
        <p v-if="modoOrigen === 'visita-ocasional'">Este pago es por una visita ocasional.</p>
      </div>
  
      <hr />
  
      <div class="tipo-cobro-selector">
        <h3>Seleccionar Tipo de Cobro</h3>
        <button :class="{ 'active': tipoCobroSeleccionado === 'credito' }" @click="setTipoCobro('credito')" :disabled="registrando">Crédito</button>
        <button :class="{ 'active': tipoCobroSeleccionado === 'contado' }" @click="setTipoCobro('contado')" :disabled="registrando">Contado</button>
        <button :class="{ 'active': tipoCobroSeleccionado === 'mixto' }" @click="setTipoCobro('mixto')" :disabled="registrando">Mixto</button>
      </div>
  
      <hr />
  
      <div v-if="tipoCobroSeleccionado" class="seccion-comun-pago">
        <h3>Detalles del Cobro</h3>
        <div class="form-group">
          <label for="montoTotal">Monto Total a Cobrar:</label>
          <input type="number" id="montoTotal" v-model.number="montoTotalCobro" @input="calcularCambio" step="0.01" :disabled="registrando || (tipoCobroSeleccionado === 'mixto' && formasDePagoMixtas.length > 0)" />
          <p v-if="!montoTotalCobroValido && intentosEnvio > 0" class="error-msg">El monto total es obligatorio y debe ser mayor que 0.</p>
        </div>
  
        <div class="form-group">
          <label for="origenTransaccion">Origen de la Transacción:</label>
          <select v-model="origenTransaccion" id="origenTransaccion" :disabled="registrando">
            <option value="">Seleccione el origen</option>
            <option value="VISITA_OCASIONAL">Visita Ocasional</option>
            <option value="MEMBRESIA">Membresía</option>
            <option value="VENTA_PRODUCTO">Venta de Producto</option>
            <option value="OTRO_SERVICIO">Otro Servicio</option>
            <option value="ANTICIPO">Anticipo</option>
          </select>
          <p v-if="!origenTransaccion && intentosEnvio > 0" class="error-msg">El origen de la transacción es obligatorio.</p>
        </div>
  
        <div class="form-group">
          <label for="documentoTipo">Tipo de Documento:</label>
          <select v-model="documentoCobroTipo" id="documentoTipo" :disabled="registrando">
            <option value="">Seleccione el tipo de documento</option>
            <option value="FACTURA">Factura</option>
            <option value="RECIBO_ANTICIPO">Recibo de Anticipo</option>
            <option value="NOTA_VENTA">Nota de Venta</option>
            <option value="TICKET">Ticket</option>
            <option value="COMPROBANTE_INTERNO">Comprobante Interno</option>
          </select>
          <p v-if="!documentoCobroTipo && intentosEnvio > 0" class="error-msg">El tipo de documento es obligatorio.</p>
        </div>
        <div class="form-group">
          <label for="numeroDocumento">Número de Documento:</label>
          <input type="text" id="numeroDocumento" v-model="numeroDocumento" :disabled="registrando" />
          <p v-if="!numeroDocumento && intentosEnvio > 0" class="error-msg">El número de documento es obligatorio.</p>
        </div>
        <div class="form-group">
          <label for="fechaDocumento">Fecha del Documento:</label>
          <input type="date" id="fechaDocumento" v-model="fechaDocumento" :disabled="registrando" />
          <p v-if="!fechaDocumento && intentosEnvio > 0" class="error-msg">La fecha del documento es obligatoria.</p>
        </div>
        <div class="form-group">
          <label for="referenciaInterna">Referencia Interna (ID Visita/Venta/Membresía):</label>
          <input type="text" id="referenciaInterna" v-model="referenciaInterna" :disabled="registrando" />
        </div>
        <div class="form-group">
          <label for="observaciones">Observaciones:</label>
          <textarea id="observaciones" v-model="observaciones" :disabled="registrando"></textarea>
        </div>
      </div>
  
      <div v-if="tipoCobroSeleccionado === 'credito'" class="seccion-credito">
        <h3>Detalles de Crédito</h3>
        <div class="form-group">
          <label for="fechaCancelacion">Fecha de Cancelación (Estimada):</label>
          <input type="date" id="fechaCancelacion" v-model="fechaCancelacionCredito" :disabled="registrando" />
          <p v-if="!fechaCancelacionCredito && intentosEnvio > 0" class="error-msg">La fecha de cancelación es obligatoria para crédito.</p>
        </div>
        
        <div class="form-group">
          <label>Plan de Cuotas:</label>
          <select v-model="opcionCuotas" :disabled="registrando">
            <option value="unica">Pago Único (Fecha de Cancelación)</option>
            <option value="mensual">Cuotas Mensuales</option>
            <option value="semanal">Cuotas Semanales</option>
            <option value="diaria">Cuotas Diarias</option>
          </select>
        </div>
  
        <div v-if="opcionCuotas !== 'unica'" class="form-group">
          <label for="numCuotas">Número de Cuotas:</label>
          <input type="number" id="numCuotas" v-model.number="numCuotas" @input="generarCuotas" min="1" :disabled="registrando" />
          <p v-if="numCuotas <= 0 && intentosEnvio > 0" class="error-msg">El número de cuotas debe ser mayor que 0.</p>
        </div>
  
        <div v-if="cuotasGeneradas.length > 0" class="cuotas-list">
          <h4>Cuotas Generadas:</h4>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Monto</th>
                <th>Fecha Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cuota, index) in cuotasGeneradas" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ cuota.monto | formatCurrency }}</td>
                <td>{{ cuota.fecha_vencimiento | formatDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div v-if="tipoCobroSeleccionado === 'contado' || tipoCobroSeleccionado === 'mixto'" class="seccion-contado-mixto">
        <h3>Forma(s) de Pago</h3>
  
        <div v-for="(fp, index) in formasDePagoMixtas" :key="index" class="forma-pago-item">
          <div class="form-group">
            <label :for="'metodoPago-' + index">Método de Pago:</label>
            <select :id="'metodoPago-' + index" v-model="fp.id_forma_pago" @change="calcularCambio" :disabled="registrando">
              <option value="">Seleccione</option>
              <option v-for="forma in formasPagoDisponibles" :key="forma.id_forma_pago" :value="forma.id_forma_pago">
                {{ forma.nombre_forma_pago }} ({{ forma.tipo_categoria_cobro }})
              </option>
            </select>
            <p v-if="!fp.id_forma_pago && intentosEnvio > 0" class="error-msg">Método de pago es obligatorio.</p>
          </div>
          <div class="form-group">
            <label :for="'montoMetodo-' + index">Monto:</label>
            <input type="number" :id="'montoMetodo-' + index" v-model.number="fp.monto_detalle" @input="calcularCambio" step="0.01" :disabled="registrando" />
            <p v-if="fp.monto_detalle <= 0 && intentosEnvio > 0" class="error-msg">Monto debe ser mayor que 0.</p>
          </div>
          <div v-if="getFormaPagoDetalle(fp.id_forma_pago) && getFormaPagoDetalle(fp.id_forma_pago).requiere_conciliacion" class="form-group">
            <label :for="'referenciaMetodo-' + index">Ref. Método (Banco/Tarjeta):</label>
            <input type="text" :id="'referenciaMetodo-' + index" v-model="fp.referencia_metodo" :disabled="registrando" />
          </div>
          <button v-if="tipoCobroSeleccionado === 'mixto' && formasDePagoMixtas.length > 1" @click="removeFormaPago(index)" class="remove-btn" :disabled="registrando">X</button>
        </div>
  
        <button v-if="tipoCobroSeleccionado === 'mixto'" @click="addFormaPago" :disabled="registrando">Añadir Forma de Pago</button>
        
        <div class="resumen-pago">
          <p>Monto Pagado: <strong>{{ montoPagado | formatCurrency }}</strong></p>
          <p>Monto Pendiente: <strong :class="{'error-msg': montoPendiente > 0}">{{ montoPendiente | formatCurrency }}</strong></p>
          <p v-if="montoPendiente < 0">Cambio: <strong>{{ Math.abs(montoPendiente) | formatCurrency }}</strong></p>
        </div>
      </div>
  
      <hr />
  
      <div class="acciones-finales">
        <button @click="procesarPago" :disabled="!formularioValido || registrando">
          <span v-if="registrando">Procesando Pago...</span>
          <span v-else>Guardar Pago</span>
        </button>
        <button @click="resetFormulario" :disabled="registrando">Cancelar</button>
        <button @click="atras" :disabled="registrando">Atrás</button>
        <button v-if="showGenerarFacturaBtn" @click="generarFactura" :disabled="registrando">Generar Factura</button>
      </div>
  
      <div v-if="mensajeExito" class="mensaje exito">{{ mensajeExito }}</div>
      <div v-if="mensajeError" class="mensaje error">{{ mensajeError }}</div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';
  
  export default {
    name: 'RegistrarPagos',
    props: {
      clientId: {
        type: [String, Number],
        required: true
      },
      visitaId: {
        type: [String, Number],
        default: null
      },
      // Podrías pasar el modoOrigen si viene de "Visita Ocasional"
      modoOrigen: {
          type: String,
          default: 'otros' // 'visita-ocasional', 'membresia', 'otros'
      }
    },
    data() {
      return {
        loadingInitialData: true,
        clienteData: null,
        formasPagoDisponibles: [], // Lista de cont_formas_pago desde la API
  
        tipoCobroSeleccionado: null, // 'credito' | 'contado' | 'mixto'
        
        // Datos Comunes de la Transacción
        montoTotalCobro: 0,
        origenTransaccion: '', // VISITA_OCASIONAL, MEMBRESIA, VENTA_PRODUCTO, OTRO_SERVICIO, ANTICIPO
        documentoCobroTipo: '', // FACTURA, RECIBO_ANTICIPO, NOTA_VENTA, TICKET, COMPROBANTE_INTERNO
        numeroDocumento: '',
        fechaDocumento: new Date().toISOString().slice(0,10), // Fecha actual por defecto
        referenciaInterna: this.visitaId, // Puede ser el ID de la visita si viene de ese flujo
        observaciones: '',
        
        // Datos Específicos para Crédito
        fechaCancelacionCredito: null, // Fecha de cancelación para pago único
        opcionCuotas: 'unica', // 'unica', 'mensual', 'semanal', 'diaria'
        numCuotas: 1,
        cuotasGeneradas: [], // Array de objetos { monto, fecha_vencimiento }
  
        // Datos Específicos para Contado / Mixto
        // Array de objetos { id_forma_pago, monto_detalle, referencia_metodo }
        formasDePagoMixtas: [{ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }], 
        
        // Estados de la UI
        registrando: false,
        mensajeExito: '',
        mensajeError: '',
        intentosEnvio: 0, // Para validación visual
      };
    },
    computed: {
      // Calcula el monto pagado para Contado/Mixto
      montoPagado() {
        if (this.tipoCobroSeleccionado === 'contado' || this.tipoCobroSeleccionado === 'mixto') {
          return this.formasDePagoMixtas.reduce((sum, fp) => sum + (fp.monto_detalle || 0), 0);
        }
        return 0;
      },
      // Calcula el monto pendiente (para Contado/Mixto, debería ser 0 o negativo para cambio)
      montoPendiente() {
        if (this.montoTotalCobro <= 0) return 0;
        return this.montoTotalCobro - this.montoPagado;
      },
      // Verifica si el formulario es válido para procesar el pago
      formularioValido() {
        this.intentosEnvio = 1; // Activar validación visual
        let isValid = true;
  
        // Validaciones comunes
        if (this.montoTotalCobro <= 0 || !this.origenTransaccion || !this.documentoCobroTipo || !this.numeroDocumento || !this.fechaDocumento) {
          isValid = false;
        }
  
        if (this.tipoCobroSeleccionado === 'credito') {
          if (!this.fechaCancelacionCredito || this.numCuotas <= 0 || this.montoTotalCobro <= 0) { // numCuotas es para crédito en cuotas
            isValid = false;
          }
        } else if (this.tipoCobroSeleccionado === 'contado' || this.tipoCobroSeleccionado === 'mixto') {
          if (this.montoTotalCobro <= 0 || this.montoPendiente > 0.01) { // Pequeña tolerancia para decimales
            isValid = false;
          }
          if (!this.formasDePagoMixtas.length) {
              isValid = false;
          }
          for (const fp of this.formasDePagoMixtas) {
            if (!fp.id_forma_pago || fp.monto_detalle <= 0) {
              isValid = false;
              break;
            }
            // Si requiere conciliación y no tiene referencia, podría ser una validación extra
            const formaPagoDetalle = this.getFormaPagoDetalle(fp.id_forma_pago);
            if (formaPagoDetalle && formaPagoDetalle.requiere_conciliacion && !fp.referencia_metodo.trim()) {
              // Puedes decidir si la referencia es obligatoria o solo una advertencia
              // isValid = false;
            }
          }
        }
        return isValid;
      },
      showGenerarFacturaBtn() {
        // Mostrar botón generar factura solo si el pago es al contado y no hay pendientes.
        // Y si el tipo de documento es FACTURA
        return (this.tipoCobroSeleccionado === 'contado' || this.tipoCobroSeleccionado === 'mixto') && 
               this.montoPendiente <= 0.01 && this.documentoCobroTipo === 'FACTURA';
      },
      // Propiedad computada para obtener el código de cuenta de ingreso basado en el origen de la transacción
      cuentaIngresoCodigo() {
          // Mapeo simple de origen a cuenta contable de ingreso (ajusta según tus subcuentas reales)
          switch (this.origenTransaccion) {
              case 'VISITA_OCASIONAL':
                  return '4.2.1'; // Ingresos por servicios
              case 'MEMBRESIA':
                  return '4.2.1'; // Ingresos por servicios
              case 'VENTA_PRODUCTO':
                  return '4.2.1'; // O una subcuenta específica para productos, si la tienes
              case 'OTRO_SERVICIO':
                  return '4.2.1'; // Ingresos por servicios
              case 'ANTICIPO':
                  return '2.10.1'; // Cuentas por pagar (anticipos de clientes) - Pasa a ingreso al devengar
              default:
                  return '4.2.1'; // Cuenta por defecto o error
          }
      }
    },
    watch: {
      opcionCuotas() {
        this.generarCuotas();
      },
      montoTotalCobro() {
        // Recalcular cuotas si el monto total cambia
        if (this.tipoCobroSeleccionado === 'credito') {
          this.generarCuotas();
        }
      },
      numCuotas() {
          if (this.numCuotas < 1) this.numCuotas = 1;
          this.generarCuotas();
      }
    },
    filters: {
      formatCurrency(value) {
        if (typeof value !== 'number') return '';
        return value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
      },
      formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-EC');
      }
    },
    methods: {
      async fetchInitialData() {
        this.loadingInitialData = true;
        this.mensajeError = '';
        try {
          // Cargar datos del cliente
          const clientResponse = await axios.get(`<span class="math-inline">\{API\_BASE\_URL\}/api\_consultaClientes/?id\=</span>{this.clientId}`);
          if (clientResponse.data && clientResponse.data.length > 0) {
            this.clienteData = clientResponse.data[0];
            // Asume que la API devuelve client_id, client_nombre, client_rucCed.
            // Ajusta según la estructura real de tu api_consultaClientes
            if (!this.clienteData.client_nombre && this.clienteData.nombre) this.clienteData.client_nombre = this.clienteData.nombre;
            if (!this.clienteData.client_rucCed && this.clienteData.ruc) this.clienteData.client_rucCed = this.clienteData.ruc;
          } else {
            this.mensajeError = 'No se encontró información para el cliente proporcionado.';
          }
  
          // Cargar formas de pago disponibles
          const formasPagoResponse = await axios.get(`${this.baseURL}/formas-pago`); // Asumiendo que tienes una API para esto
          this.formasPagoDisponibles = formasPagoResponse.data;
  
          // Si viene de una visita ocasional, precargar origen y referencia
          if (this.visitaId && this.modoOrigen === 'visita-ocasional') {
              this.origenTransaccion = 'VISITA_OCASIONAL';
              this.referenciaInterna = this.visitaId;
              // Podrías setear un monto por defecto si es una visita ocasional estándar
              // this.montoTotalCobro = 10.00;
          }
  
        } catch (error) {
          console.error('Error cargando datos iniciales:', error);
          this.mensajeError = 'Error al cargar los datos iniciales. Verifique la conexión o el ID del cliente.';
        } finally {
          this.loadingInitialData = false;
        }
      },
      setTipoCobro(tipo) {
        this.tipoCobroSeleccionado = tipo;
        this.resetSpecificForms();
        this.montoTotalCobro = 0; // Resetear monto total al cambiar tipo
        this.formasDePagoMixtas = [{ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }]; // Resetear
      },
      resetSpecificForms() {
        this.fechaCancelacionCredito = null;
        this.opcionCuotas = 'unica';
        this.numCuotas = 1;
        this.cuotasGeneradas = [];
        this.formasDePagoMixtas = [{ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }];
        this.mensajeExito = '';
        this.mensajeError = '';
        this.intentosEnvio = 0;
      },
      addFormaPago() {
        this.formasDePagoMixtas.push({ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' });
      },
      removeFormaPago(index) {
        if (this.formasDePagoMixtas.length > 1) {
          this.formasDePagoMixtas.splice(index, 1);
          this.calcularCambio();
        }
      },
      calcularCambio() {
        // Recalcular monto pendiente/cambio en la UI
        // La lógica principal de validación está en `formularioValido` computed property.
      },
      generarCuotas() {
        if (this.montoTotalCobro <= 0 || this.numCuotas <= 0) {
          this.cuotasGeneradas = [];
          return;
        }
        const montoPorCuota = (this.montoTotalCobro / this.numCuotas);
        this.cuotasGeneradas = [];
        let fechaBase = new Date(this.fechaDocumento || new Date()); // O fecha de inicio del crédito
  
        for (let i = 0; i < this.numCuotas; i++) {
          let fechaVencimiento = new Date(fechaBase);
          if (this.opcionCuotas === 'mensual') {
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i + 1));
          } else if (this.opcionCuotas === 'semanal') {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + (7 * (i + 1)));
          } else if (this.opcionCuotas === 'diaria') {
            fechaVencimiento.setDate(fechaVencimiento.getDate() + (i + 1));
          }
          // Para 'unica', solo una cuota con la fecha de cancelación
          if (this.opcionCuotas === 'unica' && i > 0) break;
  
          this.cuotasGeneradas.push({
            monto: parseFloat(montoPorCuota.toFixed(2)),
            fecha_vencimiento: fechaVencimiento.toISOString().slice(0,10)
          });
        }
        // Asegurar que la última cuota ajuste el monto total si hay diferencias de decimales
        const sumCuotas = this.cuotasGeneradas.reduce((sum, c) => sum + c.monto, 0);
        if (this.cuotasGeneradas.length > 0 && Math.abs(sumCuotas - this.montoTotalCobro) > 0.01) {
            const diff = this.montoTotalCobro - sumCuotas;
            this.cuotasGeneradas[this.cuotasGeneradas.length - 1].monto = parseFloat((this.cuotasGeneradas[this.cuotasGeneradas.length - 1].monto + diff).toFixed(2));
        }
      },
      getFormaPagoDetalle(id) {
        return this.formasPagoDisponibles.find(fp => fp.id_forma_pago === id);
      },
      async procesarPago() {
        this.intentosEnvio++; // Activar validación visual
  
        if (!this.formularioValido) {
          this.mensajeError = 'Por favor, complete todos los campos obligatorios y corrija los errores.';
          return;
        }
  
        this.registrando = true;
        this.mensajeExito = '';
        this.mensajeError = '';
  
        try {
          // Paso 1: Crear la Transacción Principal (cont_pagos_transacciones)
          const transaccionData = {
            monto_total_cobro: this.montoTotalCobro,
            client_id: this.clientId,
            // id_miembro: this.idMiembro, // Si lo necesitas, pasarlo desde props o data
            origen_transaccion: this.origenTransaccion,
            documento_cobro_tipo: this.documentoCobroTipo,
            numero_documento: this.numeroDocumento,
            fecha_documento: this.fechaDocumento,
            referencia_interna: this.referenciaInterna,
            cuenta_contable_ingreso_codigo: this.cuentaIngresoCodigo, // Computed property
            tipo_movimiento_contable: 'Entrada',
            estado_transaccion: this.tipoCobroSeleccionado === 'credito' ? 'Pendiente' : 'Conciliado', // O 'ParcialmentePagado' si es mixto y queda pendiente
            fecha_liquidado_conciliado: this.tipoCobroSeleccionado === 'credito' ? null : new Date().toISOString().slice(0, 19).replace('T', ' '),
            registrado_por: this.registradoPor, // O del usuario logueado
            observaciones: this.observaciones,
          };
  
          const responseTransaccion = await axios.post(`${API_BASE_URL}/api/pagos/transacciones`, transaccionData);
          const idTransaccionCreada = responseTransaccion.data.id_transaccion;
          this.mensajeExito = 'Transacción principal creada exitosamente. ';
  
          // Paso 2: Registrar Detalles de Método de Pago (cont_pagos_detalles_metodo)
          if (this.tipoCobroSeleccionado === 'contado' || this.tipoCobroSeleccionado === 'mixto') {
            for (const fp of this.formasDePagoMixtas) {
              const formaPagoDetalle = this.getFormaPagoDetalle(fp.id_forma_pago);
              const detalleData = {
                id_transaccion: idTransaccionCreada,
                id_forma_pago: fp.id_forma_pago,
                monto_detalle: fp.monto_detalle,
                referencia_metodo: fp.referencia_metodo,
                // Puedes añadir banco_emisor si tu API lo extrae de referencia_metodo o lo recibe como input
                estado_conciliacion_metodo: formaPagoDetalle.requiere_conciliacion ? 'Pendiente' : 'Conciliado',
                fecha_conciliacion_metodo: formaPagoDetalle.requiere_conciliacion ? null : new Date().toISOString().slice(0, 19).replace('T', ' '),
                observaciones_detalle: fp.observaciones_metodo || null, // Si agregas este campo en el formulario
              };
              await axios.post(`${API_BASE_URL}/api/pagos/detalles-metodo`, detalleData); // Necesitas esta API
            }
            this.mensajeExito += 'Detalles de pago registrados. ';
          }
          
          // Paso 3: Registrar Cuotas de Crédito (cont_pagos_creditos_cuotas)
          if (this.tipoCobroSeleccionado === 'credito' && this.cuotasGeneradas.length > 0) {
              for (const cuota of this.cuotasGeneradas) {
                  const cuotaData = {
                      id_transaccion: idTransaccionCreada,
                      monto_cuota: cuota.monto,
                      fecha_vencimiento: cuota.fecha_vencimiento,
                      estado_cuota: 'Pendiente',
                      // Puedes añadir método_pago_cuota, referencia_cuota si son diferentes a la transacción principal
                  };
                  await axios.post(`${API_BASE_URL}/api/pagos/cuotas-credito`, cuotaData); // Necesitas esta API
              }
              this.mensajeExito += 'Plan de cuotas registrado. ';
          }
  
          this.mensajeExito += '¡Proceso de pago completado!';
          this.showGenerarFacturaBtn = true; // Activar botón de factura después del registro exitoso del pago
  
        } catch (error) {
          console.error('Error al procesar pago:', error.response ? error.response.data : error.message);
          this.mensajeError = error.response && error.response.data && error.response.data.mensaje 
                             ? error.response.data.mensaje 
                             : 'Error al registrar el pago. Verifique los datos e intente de nuevo.';
        } finally {
          this.registrando = false;
        }
      },
      resetFormulario() {
        this.tipoCobroSeleccionado = null;
        this.montoTotalCobro = 0;
        this.origenTransaccion = '';
        this.documentoCobroTipo = '';
        this.numeroDocumento = '';
        this.fechaDocumento = new Date().toISOString().slice(0,10);
        this.referenciaInterna = this.visitaId;
        this.observaciones = '';
        this.fechaCancelacionCredito = null;
        this.opcionCuotas = 'unica';
        this.numCuotas = 1;
        this.cuotasGeneradas = [];
        this.formasDePagoMixtas = [{ id_forma_pago: '', monto_detalle: 0, referencia_metodo: '' }];
        this.mensajeExito = '';
        this.mensajeError = '';
        this.registrando = false;
        this.intentosEnvio = 0;
        this.showGenerarFacturaBtn = false;
      },
      atras() {
        this.$router.go(-1); // Regresar a la página anterior
      },
      generarFactura() {
        // Redirigir al componente de factura con el client_id y la id_transaccion si es necesario
        this.$router.push({
          name: 'facturaForm',
          params: { clientId: this.clientId, transaccionId: this.idTransaccionCreada } // Pasar el ID de la transacción
        });
      },
    },
    async mounted() {
      // Si viene de una visita ocasional, el ID de la visita ya está en props.
      // Asignar el client_id de props directamente.
      // La visitaId ya es parte de data.
      // Asegurarse de que el client_id de props se use.
      if (this.clientId) {
        await this.fetchInitialData();
      } else {
        this.mensajeError = "No se proporcionó un ID de cliente válido para registrar el pago.";
        this.loadingInitialData = false;
      }
    },
  };
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
  
  h2, h3 {
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
  
  .seccion-comun-pago, .seccion-credito, .seccion-contado-mixto {
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
  
  input[type="text"], input[type="number"], input[type="date"], textarea, select {
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
    background-color: #fcf8e3; /* Light yellow for mixed payments */
  }
  .forma-pago-item .form-group {
    flex: 1;
    margin-bottom: 0;
  }
  .forma-pago-item select, .forma-pago-item input {
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
  table th, table td {
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
  </style>
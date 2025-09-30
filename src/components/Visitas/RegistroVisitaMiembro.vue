<template>
  <div class="registro-visita-unificado">
    <h2>Registro de Visitas</h2>

    <div class="modo-selector">
      <button :class="{ 'active': modoSeleccionado === 'miembro' }" @click="setModo('miembro')">Soy Miembro / Buscar</button>
      <button @click="redirigir('/crud_miembrosForm')">Registrarme como Miembro</button>
      <button :class="{ 'active': modoSeleccionado === 'ocasional' }" @click="setModo('ocasional')">Visita Ocasional / Pago por Uso</button>
    </div>

    <hr />

    <div class="busqueda-seleccion">
      <h3 v-if="modoSeleccionado === 'miembro'">Buscar Miembro</h3>
      <h3 v-else-if="modoSeleccionado === 'ocasional'">Buscar Cliente (Visita Ocasional)</h3>

      <input
        type="text"
        v-model="busquedaTexto"
        @input="debouncedBuscar"
        :placeholder="modoSeleccionado === 'miembro' ? 'Buscar por Matrícula, Cédula/RUC o Nombre de Cliente...' : 'Buscar cliente por Nombre o Cédula/RUC...'"
        :disabled="buscando"
      />
      <button @click="buscarEntidad" :disabled="buscando">
        <span v-if="buscando">Buscando...</span>
        <span v-else>Buscar</span>
      </button>

      <div v-if="buscando" class="mensaje info">Cargando resultados...</div>
      <div v-else-if="resultadosBusqueda.length > 0" class="resultados-busqueda">
        <h4>Resultados:</h4>
        <ul>
          <li v-for="item in resultadosBusqueda" :key="modoSeleccionado === 'miembro' ? item.id_miembro : item.client_id">
            <template v-if="modoSeleccionado === 'miembro'">
              Matrícula: **{{ item.matricula }}** | Cliente: **{{ item.client_nombre }}** ({{ item.client_rucCed }}) | Membresía: {{ item.nombre_tipo_membresia }} | Estado:
              <span :class="{'estado-activo': item.estado === 'ACTIVO', 'estado-vencido': item.estado === 'VENCIDO', 'estado-suspendido': item.estado === 'SUSPENDIDO', 'estado-cancelado': item.estado === 'CANCELADO'}">
                {{ item.estado }}
              </span>
              <button @click="seleccionarMiembro(item)" :disabled="item.estado !== 'ACTIVO'">
                {{ item.estado === 'ACTIVO' ? 'Seleccionar Miembro' : 'Inactivo' }}
              </button>
            </template>
            <template v-else-if="modoSeleccionado === 'ocasional'">
              Cliente: **{{ item.client_nombre }}** ({{ item.client_rucCed }})
              <button @click="seleccionarClienteOcasional(item)">Seleccionar Cliente</button>
            </template>
          </li>
        </ul>
        <div v-if="modoSeleccionado === 'ocasional' && resultadosBusqueda.length === 0 && busquedaRealizada && busquedaTexto.trim()">
          <p class="mensaje info">Cliente no encontrado. ¿Desea crear un nuevo cliente?</p>
          <button @click="redirigir('/Crear_cliente')">Crear Nuevo Cliente</button>
        </div>
      </div>
      <div v-else-if="busquedaRealizada" class="mensaje info">
        No se encontraron {{ modoSeleccionado === 'miembro' ? 'miembros' : 'clientes' }} para "{{ busquedaTexto }}".
        <template v-if="modoSeleccionado === 'ocasional'">
          <p>¿Desea crear un nuevo cliente?</p>
          <button @click="redirigir('/Crear_cliente')">Crear Nuevo Cliente</button>
          <p>O usar un cliente genérico:</p>
          <button @click="seleccionarClienteConsumidorFinal">Usar Consumidor Final</button>
        </template>
      </div>
    </div>

    <hr />

    <div v-if="entidadSeleccionada" class="formulario-visita">
      <h3>Registrar Visita para:</h3>
      <template v-if="modoSeleccionado === 'miembro'">
        <p>Matrícula: **{{ entidadSeleccionada.matricula }}**</p>
        <p>Cliente: **{{ entidadSeleccionada.client_nombre }}** ({{ entidadSeleccionada.client_rucCed }})</p>
        <p>Tipo Membresía: {{ entidadSeleccionada.nombre_tipo_membresia }}</p>
        <p>Estado Actual: <span :class="{'estado-activo': entidadSeleccionada.estado === 'ACTIVO', 'estado-vencido': entidadSeleccionada.estado === 'VENCIDO', 'estado-suspendido': entidadSeleccionada.estado === 'SUSPENDIDO', 'estado-cancelado': entidadSeleccionada.estado === 'CANCELADO'}">{{ entidadSeleccionada.estado }}</span></p>
        <p v-if="entidadSeleccionada.estado !== 'ACTIVO'" class="alerta">¡ATENCIÓN! Membresía Inactiva o Vencida.</p>
      </template>
      <template v-else-if="modoSeleccionado === 'ocasional'">
        <p>Cliente Ocasional: **{{ entidadSeleccionada.client_nombre }}** ({{ entidadSeleccionada.client_rucCed }})</p>
      </template>

      <div class="form-group">
        <label for="areaAcceso">Área de Acceso:</label>
        <template v-if="modoSeleccionado === 'miembro'">
          <input 
            type="text" 
            id="areaAccesoMiembro" 
            :value="areasDisponiblesNombres" 
            readonly 
            disabled 
            class="input-readonly"
          />
          <p class="info-msg">Este miembro tiene acceso a todas las áreas listadas.</p>
        </template>

        <template v-else-if="modoSeleccionado === 'ocasional'">
          <div class="areas-checkbox-grid">
            <template v-if="areasDisponibles.length === 0">
              <p class="mensaje info">Cargando áreas disponibles...</p>
            </template>
            <label class="checkbox-item" v-for="area in areasDisponibles" :key="area.id_area">
              <input type="checkbox" :value="area.nombre_area" v-model="areasSeleccionadasOcasional" :disabled="registrando">
              {{ area.nombre_area }}
            </label>
          </div>
          <p v-if="!areaAccesoValida && intentosEnvio > 0" class="error-msg">Debe seleccionar al menos un área de acceso.</p>
        </template>
      </div>

      <div class="form-group">
        <label for="estadoAcceso">Estado de Acceso:</label>
        <select v-model="estadoAcceso" id="estadoAcceso" :disabled="registrando">
          <option value="CONCEDIDO">Concedido</option>
          <option value="DENEGADO">Denegado</option>
        </select>
      </div>

      <div v-if="estadoAcceso === 'DENEGADO'" class="form-group">
        <label for="motivoDenegacion">Motivo de Denegación:</label>
        <textarea v-model="motivoDenegacion" id="motivoDenegacion" :disabled="registrando"></textarea>
      </div>

      <div class="form-group">
        <label for="registradoPor">Registrado Por:</label>
        <input type="text" v-model="registradoPor" id="registradoPor" placeholder="Usuario o sistema" :disabled="registrando" />
      </div>

      <div class="form-group">
        <label for="observacionesVisita">Observaciones (Visita):</label>
        <textarea v-model="observacionesVisita" id="observacionesVisita" :disabled="registrando"></textarea>
      </div>

      <button @click="registrarVisita" :disabled="registrando || !areaAccesoValida">
        <span v-if="registrando">Registrando...</span>
        <span v-else>Registrar Visita</span>
      </button>
      <button @click="limpiarSeleccion" :disabled="registrando">Cancelar</button>

      <div v-if="mensajeExito" class="mensaje exito">{{ mensajeExito }}</div>
      <div v-if="mensajeError" class="mensaje error">{{ mensajeError }}</div>
    </div>
    <div v-else class="mensaje-info">
      Seleccione un modo de visita y busque una entidad para continuar.
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// Define la URL base de la API con un fallback robusto.
// Asegúrate de que tu archivo .env (o .env.development) en la raíz de tu proyecto Vue
// contenga la línea: VUE_APP_URL_SERVIDOR_API="https://app.factura-e.net"
const API_BASE_URL = process.env.VUE_APP_URL_SERVIDOR_API || 'https://app.factura-e.net';

export default {
  name: 'RegistroVisitaUnificado',
  data() {
    return {
      // Modos de operación
      modoSeleccionado: 'miembro', // 'miembro' | 'ocasional'

      // Búsqueda
      busquedaTexto: '',
      buscando: false,
      busquedaRealizada: false,
      resultadosBusqueda: [], // Almacena miembros o clientes según el modo
      busquedaTimeout: null,

      // Entidad seleccionada para la visita (miembro o cliente ocasional)
      entidadSeleccionada: null, // Contendrá el objeto completo del miembro o cliente

      // Datos del Formulario de Visita
      // 'areasDisponiblesNombres' (computed property) para miembros
      // 'areasSeleccionadasOcasional' (array) para ocasionales
      areasSeleccionadasOcasional: [], 
      estadoAcceso: 'CONCEDIDO',
      motivoDenegacion: '',
      registradoPor: 'Sistema Web', // Idealmente desde una sesión de usuario
      observacionesVisita: '',
      
      areasDisponibles: [], // Cargadas desde el API de áreas (objetos {id_area, nombre_area})
      
      // Estado de la operación
      registrando: false,
      mensajeExito: '',
      mensajeError: '',
      intentosEnvio: 0, // Para validación básica en el frontend

      // Configuración de API
      // La URL base para la mayoría de las API (con /api)
      baseURL: API_BASE_URL + '/api', 
      // ID del cliente "Consumidor Final" o "Varios". ¡AJUSTA ESTE ID A TU BASE DE DATOS!
      // Este ID se usará para la función seleccionarClienteConsumidorFinal
      idConsumidorFinal: 1 
    };
  },
  computed: {
    // Genera una cadena con todos los nombres de área disponibles para el modo miembro
    areasDisponiblesNombres() {
      return this.areasDisponibles.map(area => area.nombre_area).join(', ');
    },
    // Valida si el área de acceso es válida (maneja ambos modos)
    areaAccesoValida() {
      if (this.modoSeleccionado === 'miembro') {
        // Para miembros, es válido si hay áreas disponibles, ya que se registran todas.
        return this.areasDisponibles.length > 0;
      } else if (this.modoSeleccionado === 'ocasional') {
        // Para ocasionales (checkboxes), debe ser un array con al menos un elemento seleccionado.
        return Array.isArray(this.areasSeleccionadasOcasional) && this.areasSeleccionadasOcasional.length > 0;
      }
      return false; 
    }
  },
  watch: {
    modoSeleccionado() {
      // Resetear la búsqueda y selección al cambiar de modo
      this.resetBusquedaYSeleccion();
      // Resetear el campo de área de acceso al tipo correcto y vacío
      this.areasSeleccionadasOcasional = []; 
    }
  },
  methods: {
    setModo(modo) {
      this.modoSeleccionado = modo;
    },
    redirigir(ruta) {
      this.$router.push(ruta);
    },
    debouncedBuscar() {
      if (this.busquedaTimeout) {
        clearTimeout(this.busquedaTimeout);
      }
      this.busquedaTimeout = setTimeout(() => {
        this.buscarEntidad();
      }, 500);
    },

    async buscarEntidad() {
      if (!this.busquedaTexto.trim()) {
        this.resetBusquedaYSeleccion();
        return;
      }

      this.buscando = true;
      this.busquedaRealizada = true;
      this.resultadosBusqueda = [];
      this.entidadSeleccionada = null; 
      this.mensajeError = '';
      this.mensajeExito = '';

      try {
        let response;
        if (this.modoSeleccionado === 'miembro') {
          // Obtener todos los miembros y filtrar en el frontend.
          // Para proyectos más grandes, se recomienda una ruta de API de búsqueda de miembros optimizada en el backend.
          const miembrosResponse = await axios.get(`${this.baseURL}/miembros`); 
          const todosLosMiembros = miembrosResponse.data;
          
          this.resultadosBusqueda = todosLosMiembros.filter(m => 
            m.matricula.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
            (m.client_nombre && m.client_nombre.toLowerCase().includes(this.busquedaTexto.toLowerCase())) ||
            (m.client_rucCed && m.client_rucCed.toLowerCase().includes(this.busquedaTexto.toLowerCase()))
          );

        } else if (this.modoSeleccionado === 'ocasional') {
          // *** CORRECCIÓN APLICADA AQUÍ: Usa API_BASE_URL directamente ***
          // Buscar clientes por nombre o RUC/Cédula.
          //response = await axios.get(`<span class="math-inline">\{API\_BASE\_URL\}/consulta\_clientesApps?consulta\=</span>{encodeURIComponent(this.busquedaTexto)}`);
          response = await axios.get(`${API_BASE_URL}/consulta_clientesApps/?consulta=${this.busquedaTexto}`);
          this.resultadosBusqueda = response.data;
        }
      } catch (error) {
        console.error('Error al buscar entidad:', error.response ? error.response.data : error.message);
        this.mensajeError = 'Error al buscar. Intente de nuevo.';
      } finally {
        this.buscando = false;
      }
    },

    seleccionarMiembro(miembro) {
      this.entidadSeleccionada = miembro;
      this.resultadosBusqueda = []; 
      this.busquedaRealizada = false;
      this.busquedaTexto = ''; 
      this.resetFormularioVisita();
    },

    seleccionarClienteOcasional(cliente) {
      this.entidadSeleccionada = cliente;
      this.resultadosBusqueda = []; 
      this.busquedaRealizada = false;
      this.busquedaTexto = ''; 
      this.resetFormularioVisita();
    },

    async seleccionarClienteConsumidorFinal() {
      // *** CORRECCIÓN APLICADA AQUÍ: Usa API_BASE_URL directamente ***
      try {
        //const response = await axios.get(`<span class="math-inline">\{API\_BASE\_URL\}/api\_consultaClientes/?id\=</span>{this.idConsumidorFinal}`); 
        const response = await axios.get(`${API_BASE_URL}/consulta_clientesApps/?consulta=${this.busquedaTexto}`);
        if (response.data && response.data.length > 0) {
          const clienteCF = response.data[0];
          this.entidadSeleccionada = {
            client_id: this.idConsumidorFinal,
            client_nombre: clienteCF.nombre || 'Consumidor Final',
            client_rucCed: clienteCF.client_rucCed || clienteCF.ruc || '9999999999' 
          };
          this.mensajeExito = `Cliente "${this.entidadSeleccionada.client_nombre}" seleccionado.`;
        } else {
          this.entidadSeleccionada = {
            client_id: this.idConsumidorFinal, 
            client_nombre: 'Consumidor Final',
            client_rucCed: '9999999999' 
          };
          this.mensajeInfo = 'No se pudieron cargar los detalles del Consumidor Final desde la API, usando datos genéricos.';
        }
      } catch (error) {
        console.error('Error al obtener datos de Consumidor Final:', error);
        this.entidadSeleccionada = {
          client_id: this.idConsumidorFinal, 
          client_nombre: 'Consumidor Final (Error al cargar)',
          client_rucCed: '9999999999' 
        };
        this.mensajeError = 'Error al cargar datos del Consumidor Final. Se usará un registro genérico.';
      } finally {
        this.resultadosBusqueda = [];
        this.busquedaRealizada = false;
        this.busquedaTexto = '';
        this.resetFormularioVisita();
      }
    },

    async registrarVisita() {
      this.intentosEnvio++; 

      if (!this.entidadSeleccionada || !this.areaAccesoValida) { 
        this.mensajeError = 'Debe seleccionar una entidad y un área de acceso válida.';
        return;
      }

      this.registrando = true;
      this.mensajeExito = '';
      this.mensajeError = '';

      // Determina el valor de nombre_area_acceso a enviar al backend
      let nombreAreaAccesoEnviar;
      if (this.modoSeleccionado === 'miembro') {
        nombreAreaAccesoEnviar = this.areasDisponiblesNombres; // Envía la cadena de todas las áreas
      } else if (this.modoSeleccionado === 'ocasional') {
        nombreAreaAccesoEnviar = this.areasSeleccionadasOcasional.join(', '); // Une las áreas seleccionadas por coma
      }
      
      // Doble verificación: Asegurarse de que la cadena no sea completamente vacía si la validación pasó
      if (!nombreAreaAccesoEnviar || nombreAreaAccesoEnviar.trim() === '') {
          this.mensajeError = 'Error interno: El área de acceso no pudo ser determinada para el registro.';
          this.registrando = false;
          return;
      }

      const datosVisita = {
        client_id: this.entidadSeleccionada.client_id,
        es_miembro: this.modoSeleccionado === 'miembro',
        id_miembro: this.modoSeleccionado === 'miembro' ? this.entidadSeleccionada.id_miembro : null,
        nombre_area_acceso: nombreAreaAccesoEnviar, // Usa el valor determinado aquí
        estado_acceso: this.estadoAcceso,
        motivo_denegacion: this.estadoAcceso === 'DENEGADO' ? this.motivoDenegacion : null,
        registrado_por: this.registradoPor,
        observaciones: this.observacionesVisita,
      };

      // *** LÍNEAS DE DEPURACIÓN AÑADIDAS ***
      console.log('--- Depuración de registro de visita ---');
      console.log('Objeto datosVisita a enviar:', datosVisita);
      console.log('Tipo de entidad seleccionada (modo):', this.modoSeleccionado);
      console.log('Contenido de entidadSeleccionada:', this.entidadSeleccionada);
      console.log('Áreas seleccionadas (Ocasional):', this.areasSeleccionadasOcasional);
      console.log('Áreas disponibles (Nombres):', this.areasDisponiblesNombres);
      console.log('--- Fin Depuración ---');
      // **********************************
      
      try {
        const response = await axios.post(`${this.baseURL}/visitas`, datosVisita);
        this.mensajeExito = response.data.mensaje;
        
        if (this.modoSeleccionado === 'ocasional') {
            const visitaId = response.data.id_visita; 
            this.$router.push({ 
                name: 'registrar_pagos', 
                params: { 
                    clientId: this.entidadSeleccionada.client_id, 
                    visitaId: visitaId 
                } 
            });
        } else {
            this.limpiarSeleccion(); 
        }

      } catch (error) {
        console.error('Error al registrar visita:', error.response ? error.response.data : error.message);
        this.mensajeError = error.response && error.response.data && error.response.data.mensaje 
                           ? error.response.data.mensaje 
                           : 'Error al registrar la visita. Verifique los datos.';
      } finally {
        this.registrando = false;
      }
    },

    limpiarSeleccion() {
      this.entidadSeleccionada = null;
      this.resetFormularioVisita();
      this.resetBusquedaYSeleccion();
    },

    resetBusquedaYSeleccion() {
      this.busquedaTexto = '';
      this.resultadosBusqueda = [];
      this.busquedaRealizada = false;
      this.buscando = false;
      this.mensajeError = '';
      this.mensajeExito = '';
      if (this.busquedaTimeout) {
        clearTimeout(this.busquedaTimeout);
      }
    },

    resetFormularioVisita() {
      this.areasSeleccionadasOcasional = []; // Resetear el array de selecciones para ocasionales
      this.estadoAcceso = 'CONCEDIDO';
      this.motivoDenegacion = '';
      this.observacionesVisita = '';
      this.mensajeExito = '';
      this.mensajeError = '';
      this.intentosEnvio = 0; // Resetear contador de intentos
    },

    async cargarAreas() {
      try {
        const response = await axios.get(`${this.baseURL}/areas`);
        this.areasDisponibles = response.data;
      } catch (error) {
        console.error('Error al cargar áreas:', error);
        this.mensajeError = 'Error al cargar las áreas de acceso.';
      }
    }
  },
  mounted() {
    this.cargarAreas(); 
  }
};
</script>

<style scoped>
.registro-visita-unificado {
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

.modo-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.modo-selector button {
  padding: 12px 25px;
  background-color: #f0f0f0;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.modo-selector button:hover:not(.active) {
  background-color: #e0e0e0;
  border-color: #bbb;
}

.modo-selector button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.busqueda-seleccion, .formulario-visita {
  padding: 20px;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  background-color: #fcfcfc;
  margin-bottom: 20px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

input[type="text"], textarea, select {
  width: calc(100% - 24px);
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.input-readonly {
  background-color: #e9ecef; 
  cursor: default;
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

.resultados-busqueda ul {
  list-style: none;
  padding: 0;
  margin-top: 15px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 5px;
}

.resultados-busqueda li {
  background-color: #f5f5f5;
  padding: 10px 15px;
  margin-bottom: 5px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95em;
  border-bottom: 1px solid #eee;
}
.resultados-busqueda li:last-child {
  border-bottom: none;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

/* Estilos específicos para el grid de checkboxes */
.areas-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* 2 o 3 columnas flexibles */
  gap: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  max-height: 200px; /* Limitar altura para scroll */
  overflow-y: auto;
}

.checkbox-item {
  display: flex;
  align-items: center;
  font-size: 0.95em;
  padding: 5px;
  cursor: pointer;
  background-color: #f8f8f8;
  border-radius: 3px;
  border: 1px solid #eee;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 8px;
  width: auto; /* Resetear width: calc(100% - 24px) */
  margin-bottom: 0; /* Resetear margin-bottom: 15px */
}

.checkbox-item:hover {
  background-color: #eef;
}

.mensaje {
  margin-top: 20px;
  padding: 12px;
  border-radius: 5px;
  font-size: 0.95em;
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

.mensaje-info {
  text-align: center;
  padding: 25px;
  color: #888;
  font-style: italic;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.alerta {
  color: #dc3545;
  font-weight: bold;
  margin-top: 10px;
}

.error-msg {
  color: #dc3545;
  font-size: 0.85em;
  margin-top: -10px;
  margin-bottom: 10px;
}

.info-msg {
  color: #007bff;
  font-size: 0.85em;
  margin-top: -10px;
  margin-bottom: 10px;
}

.estado-activo { color: #28a745; font-weight: bold; }
.estado-vencido { color: #ffc107; font-weight: bold; }
.estado-suspendido { color: #6c757d; font-weight: bold; }
.estado-cancelado { color: #dc3545; font-weight: bold; }

/* Botones específicos en resultados */
.resultados-busqueda li button {
  padding: 8px 12px;
  font-size: 0.85em;
  margin-right: 0; /* Eliminar margen derecho para el botón Seleccionar */
}
</style>
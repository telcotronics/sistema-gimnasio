// ─────────────────────────────────────────────────────────────────────────────
// ApiService.js — Único punto de acceso a API-SIGMA-CLOUD
//
// Arquitectura SaaS multi-tenant:
//   · Cada request lleva x-api-key (identificar la plataforma)
//   · Cada request lleva Authorization: Bearer <jwt> (identificar al usuario)
//   · Cada request lleva ?db=<tenant> (enrutar al schema correcto)
//
// El tenant (db) viene de localStorage.db_tenant, que se guarda al hacer login.
// Fallback a la variable de entorno VUE_APP_DB_TENANT = "TELCOTRONICS" (desarrollo).
//
// API docs: https://api-gateway-cloud.telcotronics.net/api-docs
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios'

const BASE_URL = process.env.VUE_APP_API_SIGMA || 'https://api-gateway-cloud.telcotronics.net'
const API_KEY  = process.env.VUE_APP_API_KEY   || ''

// SaaS: el tenant lo determina el login de cada empresa, no el build.
function getTenant () {
  return localStorage.getItem('db_tenant') || process.env.VUE_APP_DB_TENANT || 'TELCOTRONICS'
}

function getToken () {
  return localStorage.getItem('jwt_token') || ''
}

// Headers estándar para requests autenticados (post-login).
function headers () {
  return {
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${getToken()}`
  }
}

const ApiService = {

  // ── AUTENTICACIÓN ──────────────────────────────────────────────────────────
  // Login de socios (personal del gimnasio).
  // Endpoint: POST /api/auth/login-socio
  // Body:     { n_sesion, clave, db }
  // Resp:     { success, token, db_tenant, usuario: { id_usr, cod_usr, nombre, apellido, nombre_completo, rol, nivel, plataforma, departamentoArea, form_init } }
  //
  // Solo envía x-api-key — el JWT no existe aún antes del login.
  // Ver /api-docs para documentación completa.
  async login (credenciales) {
    const res = await axios.post(`${BASE_URL}/api/auth/login-socio`, credenciales, {
      headers: { 'x-api-key': API_KEY }
    })
    return res.data
  },

  // ── CRUD GENÉRICO ──────────────────────────────────────────────────────────
  async get (ruta, params = {}) {
    const res = await axios.get(`${BASE_URL}/${ruta}`, {
      headers: headers(),
      params:  { db: getTenant(), ...params }
    })
    return res.data
  },

  async post (ruta, datos) {
    const res = await axios.post(`${BASE_URL}/${ruta}`, datos, {
      headers: headers(),
      params:  { db: getTenant() }
    })
    return res.data
  },

  async put (ruta, datos) {
    const res = await axios.put(`${BASE_URL}/${ruta}`, datos, {
      headers: headers(),
      params:  { db: getTenant() }
    })
    return res.data
  },

  async delete (ruta) {
    const res = await axios.delete(`${BASE_URL}/${ruta}`, {
      headers: headers(),
      params:  { db: getTenant() }
    })
    return res.data
  },

  // Búsqueda de clientes por RUC/cédula/nombre.
  // Endpoint esperado: GET /consultaClientesJson?consulta=...
  async buscarClientes (consulta) {
    const res = await axios.get(`${BASE_URL}/consultaClientesJson`, {
      headers: headers(),
      params:  { db: getTenant(), consulta }
    })
    return Array.isArray(res.data) ? res.data : []
  }
}

export default ApiService

<template>
  <div id="app">
    <v-app>
      <login @logeado="onLog" v-if="!logeado" />
      <cambiar-password v-if="debeCambiarPassword"/>
      <div v-if="logeado && !debeCambiarPassword">
        <encabezado />
        <v-main>
          <v-container fluid>
            <router-view/>
            <pie-component />
          </v-container>
        </v-main>
       
      </div>
        <v-snackbar
        v-model="mostrarMensaje"
        :timeout="3000"
        :color="mensaje.color"
        top
        >
            {{ mensaje.texto }}
        </v-snackbar>
    </v-app>


  </div>
</template>

<script>
// TAREA-02: App.vue migrado a API-SIGMA-CLOUD (2026-05-11).
// Antes usaba HttpService → ajustes.php (PHP muerto).
// Ahora maneja la sesión SaaS: guarda jwt_token + db_tenant al login
// para que ApiService los use en todos los requests posteriores.
import Encabezado from './components/Encabezado.vue'
import Login from './components/Usuarios/Login.vue'
import CambiarPassword from './components/Usuarios/CambiarPassword.vue'
import PieComponent from './components/Dialogos/PieComponent.vue'
import ApiService from './Servicios/ApiService'

export default {
  name: 'App',
  components: { Encabezado, Login, CambiarPassword, PieComponent },

  data: () => ({
    logeado: false,
    debeCambiarPassword: false,
    mostrarMensaje: false,
    mensaje: { texto: '', color: '' }
  }),

  mounted () {
    // Al recargar la página, verificar si hay sesión activa en localStorage.
    if (this.verificarSesion()) {
      this.logeado = true
      // Con JWT ya en localStorage, cargar datos del negocio del tenant activo.
      this.obtenerInformacionNegocio()
    }
  },

  methods: {
    // Recibe la respuesta de ApiService.login() → POST /api/auth/login.
    //
    // Formato real de la respuesta (webControl.usuarios_sesion):
    //   { success, token, db_tenant, usuario: { id, nombre, usuario, rol, modulos[] } }
    //
    // El token JWT lleva empresaDB en sus claims — pero usamos db_tenant de la respuesta
    // directamente para no tener que decodificar el JWT en el frontend.
    onLog (respuesta) {
      if (!respuesta || !respuesta.success) {
        this.mostrarNotificacion('Datos incorrectos, verifica la información', 'error')
        return
      }

      // Campos de la tabla `usuarios` del tenant (login-socio).
      const usr = respuesta.usuario || {}

      // ── SaaS: JWT + tenant ──
      // jwt_token → ApiService lo incluye en Authorization: Bearer de cada request.
      // db_tenant → ApiService lo envía como ?db= para enrutar al schema correcto.
      localStorage.setItem('jwt_token',     respuesta.token)
      localStorage.setItem('db_tenant',     respuesta.db_tenant || process.env.VUE_APP_DB_TENANT || 'TELCOTRONICS')

      // Datos de sesión del usuario (de webControl.usuarios_sesion).
      localStorage.setItem('logeado',       'true')
      localStorage.setItem('idUsuario',     usr.id_usr          || '')
      localStorage.setItem('codUsuario',    usr.cod_usr         || '')
      localStorage.setItem('nombreUsuario', usr.nombre_completo || '')
      localStorage.setItem('rolUsuario',    usr.rol             || '')
      localStorage.setItem('nivelUsuario',  usr.nivel           || '')
      localStorage.setItem('plataforma',    usr.plataforma      || '')

      this.logeado = true
      this.obtenerInformacionNegocio()
      this.mostrarNotificacion(`Bienvenido, ${usr.nombre || ''}`, 'success')
      this.$router.push({ name: 'InicioComponent' })
    },

    // Verificar si existe una sesión previa guardada en localStorage.
    verificarSesion () {
      return !!localStorage.getItem('logeado') && !!localStorage.getItem('jwt_token')
    },

    // Cargar datos del negocio del tenant activo y cachearlos en localStorage.
    // Endpoint esperado: GET /api/ajustes (ADAPTAR según /api-docs).
    // Con jwt_token y db_tenant ya en localStorage, ApiService los incluye automáticamente.
    obtenerInformacionNegocio () {
      ApiService.get('api/ajustes')
        .then(resultado => {
          localStorage.setItem('nombreGimnasio',   resultado.nombre    || '')
          localStorage.setItem('logoGimnasio',     resultado.logo      || '')
          localStorage.setItem('telefonoGimnasio', resultado.telefono  || '')
          localStorage.setItem('direccionGimnasio', resultado.direccion || '')
        })
        .catch(() => {
          // No bloquear la app si falla — los datos del negocio son opcionales al arrancar.
        })
    },

    mostrarNotificacion (texto, color) {
      this.mostrarMensaje = true
      this.mensaje = { texto, color }
    }
  }
}
</script>
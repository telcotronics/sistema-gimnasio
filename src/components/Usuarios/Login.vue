<template>
  <div class="fondo">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md5 lg4>
          <v-card class="login-card elevation-24" shaped>
            <!-- Header con logo y título -->
            <div class="login-header">
              <div class="logo-container">
                <v-icon size="48" color="white">fitness_center</v-icon>
              </div>
              <h2 class="login-title">Bienvenido</h2>
              <p class="login-subtitle">Inicia sesión en tu cuenta</p>
            </div>

            <!-- Formulario -->
            <v-card-text class="login-form-container">
              <v-form ref="form" v-model="formularioValido" lazy-validation>
                <div class="input-group">
                  <v-text-field
                    v-model="usuario"
                    prepend-inner-icon="person"
                    label="Usuario"
                    type="text"
                    outlined
                    color="primary"
                    :rules="reglasUsuario"
                    class="custom-input"
                    hide-details="auto"
                  ></v-text-field>
                </div>

                <div class="input-group">
                  <v-text-field
                    v-model="password"
                    prepend-inner-icon="lock"
                    :append-icon="mostrarPassword ? 'visibility' : 'visibility_off'"
                    @click:append="mostrarPassword = !mostrarPassword"
                    label="Contraseña"
                    :type="mostrarPassword ? 'text' : 'password'"
                    outlined
                    color="primary"
                    :rules="reglasPassword"
                    class="custom-input"
                    hide-details="auto"
                  ></v-text-field>
                </div>

                <!-- Recordar sesión -->
                <div class="remember-forgot">
                  <v-checkbox
                    v-model="recordarSesion"
                    label="Recordar sesión"
                    color="primary"
                    dense
                    hide-details
                  ></v-checkbox>
                  <v-btn
                    text
                    color="primary"
                    small
                    class="forgot-password"
                  >
                    ¿Olvidaste tu contraseña?
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>

            <!-- Botones de acción -->
            <v-card-actions class="login-actions">
              <v-btn
                color="primary"
                large
                :loading="cargando"
                :disabled="!formularioValido"
                @click="iniciarSesion"
                class="login-btn"
                block
                shaped
              >
                <v-icon left>login</v-icon>
                Iniciar Sesión
              </v-btn>
            </v-card-actions>

            <!-- Divider y registro -->
            <div class="divider-section">
              <v-divider></v-divider>
              <span class="divider-text">o</span>
              <v-divider></v-divider>
            </div>

            <div class="register-section">
              <p class="register-text">
                ¿No tienes cuenta?
                <v-btn
                  text
                  color="primary"
                  small
                  class="register-link"
                >
                  Regístrate aquí
                </v-btn>
              </p>
            </div>
          </v-card>
        </v-flex>
      </v-layout>

      <!-- Snackbar mejorado -->
      <v-snackbar
        v-model="mostrarMensaje"
        :timeout="4000"
        :color="mensaje.color"
        top
        shaped
        class="custom-snackbar"
      >
        <div class="snackbar-content">
          <v-icon class="snackbar-icon">
            {{ mensaje.color === 'success' ? 'check_circle' : 'error' }}
          </v-icon>
          {{ mensaje.texto }}
        </div>
        <v-btn
          icon
          @click="mostrarMensaje = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>

      <!-- Imagen de fondo opcional -->
      <div class="background-image">
        <img 
          src="https://2.bp.blogspot.com/-jKpjKDz7IMA/W7z4LIu9k_I/AAAAAAAACoA/r7AvmvmDDkomR1KA96D1cvBV5gom69zOgCLcBGAs/s0/gym.png" 
          alt="Gym background"
          class="gym-image"
        >
      </div>
    </v-container>
  </div>
</template>

<script>
import HttpService from '../../Servicios/HttpService'

export default {
  name: "Login",

  data: () => ({
    usuario: "",
    password: "",
    recordarSesion: false,
    mostrarPassword: false,
    formularioValido: false,
    cargando: false,
    mensaje: {
      texto: "",
      color: "",
    },
    mostrarMensaje: false,
    reglasUsuario: [
      v => !!v || 'El usuario es requerido',
      v => (v && v.length >= 3) || 'El usuario debe tener al menos 3 caracteres',
    ],
    reglasPassword: [
      v => !!v || 'La contraseña es requerida',
      v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres',
    ],
  }),

  methods: {
    async iniciarSesion() {
      // Validar formulario
      if (!this.$refs.form.validate()) return

      this.cargando = true

      try {
        let payload = {
          metodo: "login",
          usuario: {
            usuario: this.usuario,
            password: this.password
          }
        }

        const resultado = await HttpService.obtenerConDatos(payload, "usuarios.php")
        
        if (resultado) {
          this.mostrarMensajeExito("¡Bienvenido! Iniciando sesión...")
          setTimeout(() => {
            this.$emit("logeado", resultado)
          }, 1500)
        } else {
          this.mostrarMensajeError("Credenciales incorrectas")
        }
      } catch (error) {
        this.mostrarMensajeError("Error al conectar con el servidor")
      } finally {
        this.cargando = false
      }
    },

    mostrarMensajeExito(texto) {
      this.mostrarMensaje = true
      this.mensaje.texto = texto
      this.mensaje.color = "success"
    },

    mostrarMensajeError(texto) {
      this.mostrarMensaje = true
      this.mensaje.texto = texto
      this.mensaje.color = "error"
    }
  },
};
</script>

<style scoped>
.fondo {
  /* OPCIÓN 1: Azul con violeta (original) */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* OPCIÓN 2: Azul con verde esmeralda */
  /* background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); */
  
  /* OPCIÓN 3: Azul marino con turquesa */
  /* background: linear-gradient(135deg, #2980b9 0%, #6bb6ff 100%); */
  
  /* OPCIÓN 4: Azul royal con púrpura */
  /* background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); */
  
  /* OPCIÓN 5: Azul cielo con rosa */
  /* background: linear-gradient(135deg, #74b9ff 0%, #fd79a8 100%); */
  
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.fondo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='0.1'%3E%3Cpath fill='%23ffffff' d='M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z'/%3E%3Cpath fill='%23ffffff' d='M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  z-index: -1;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 450px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 16px !important;
}

.login-header {
  /* OPCIÓN 1: Azul con violeta (original) */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* OPCIÓN 2: Azul con verde esmeralda */
  /* background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); */
  
  /* OPCIÓN 3: Azul marino con turquesa */
  /* background: linear-gradient(135deg, #2980b9 0%, #6bb6ff 100%); */
  
  /* OPCIÓN 4: Azul royal con púrpura */
  /* background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); */
  
  /* OPCIÓN 5: Azul cielo con rosa */
  /* background: linear-gradient(135deg, #74b9ff 0%, #fd79a8 100%); */
  
  color: white;
  text-align: center;
  padding: 40px 30px 30px;
  position: relative;
}

.logo-container {
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.login-form-container {
  padding: 40px 30px 20px;
}

.input-group {
  margin-bottom: 24px;
}

.custom-input {
  transition: all 0.3s ease;
}

/* Vuetify 2 deep selector */
.custom-input >>> .v-input__control .v-input__slot {
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-input:hover >>> .v-input__control .v-input__slot {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.forgot-password {
  text-decoration: none;
  font-weight: 500;
}

.login-actions {
  padding: 0 30px 30px;
}

.login-btn {
  height: 50px !important;
  font-size: 16px !important;
  font-weight: 600;
  text-transform: none !important;
  /* OPCIÓN 1: Sombra azul-violeta (original) */
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  
  /* OPCIÓN 2: Sombra azul-verde */
  /* box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4) !important; */
  
  /* OPCIÓN 3: Sombra azul marino */
  /* box-shadow: 0 4px 12px rgba(41, 128, 185, 0.4) !important; */
  
  /* OPCIÓN 4: Sombra azul royal */
  /* box-shadow: 0 4px 12px rgba(30, 60, 114, 0.4) !important; */
  
  /* OPCIÓN 5: Sombra azul cielo */
  /* box-shadow: 0 4px 12px rgba(116, 185, 255, 0.4) !important; */
  
  transition: all 0.3s ease;
  border-radius: 12px !important;
}

.login-btn:hover {
  /* OPCIÓN 1: Hover azul-violeta (original) */
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
  
  /* OPCIÓN 2: Hover azul-verde */
  /* box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6) !important; */
  
  /* OPCIÓN 3: Hover azul marino */
  /* box-shadow: 0 6px 20px rgba(41, 128, 185, 0.6) !important; */
  
  /* OPCIÓN 4: Hover azul royal */
  /* box-shadow: 0 6px 20px rgba(30, 60, 114, 0.6) !important; */
  
  /* OPCIÓN 5: Hover azul cielo */
  /* box-shadow: 0 6px 20px rgba(116, 185, 255, 0.6) !important; */
  
  transform: translateY(-2px);
}

.divider-section {
  display: flex;
  align-items: center;
  padding: 0 30px;
  margin: 10px 0;
}

.divider-text {
  margin: 0 15px;
  color: #666;
  font-size: 14px;
}

.register-section {
  text-align: center;
  padding: 20px 30px 30px;
}

.register-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.register-link {
  font-weight: 600;
  text-decoration: none;
}

.custom-snackbar {
  z-index: 9999;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snackbar-icon {
  font-size: 20px;
  margin-right: 8px;
}

.background-image {
  position: absolute;
  bottom: 20px;
  right: 20px;
  opacity: 0.1;
  z-index: 1;
  pointer-events: none;
}

.gym-image {
  width: 120px;
  height: auto;
  filter: grayscale(100%);
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
    max-width: none;
  }
  
  .login-header {
    padding: 30px 20px 25px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-form-container {
    padding: 30px 20px 15px;
  }
  
  .login-actions {
    padding: 0 20px 25px;
  }
  
  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeInUp 0.6s ease-out;
}
</style>
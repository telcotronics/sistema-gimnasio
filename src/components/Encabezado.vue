<template>
  <div>
    <!-- App Bar con gradiente y efectos -->
    <v-app-bar 
      color="transparent" 
      class="app-bar-gradient flex-grow-0 backdrop-blur" 
      app 
      dark 
      elevation="0"
      height="70"
    >
      <v-app-bar-nav-icon 
        @click.stop="drawer = !drawer"
        class="nav-icon-hover"
      ></v-app-bar-nav-icon>
      
      <v-toolbar-title class="logo-container">
        <img src="@/assets/logo.png" width="200" class="logo-image">
      </v-toolbar-title>
      
      <v-spacer></v-spacer>

      <!-- Botón de logout mejorado -->
      <v-btn 
        icon 
        @click="salir" 
        class="logout-btn"
        large
      >
        <v-icon size="24">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer mejorado -->
    <v-navigation-drawer 
      app 
      v-model="drawer" 
      class="navigation-drawer"
      width="280"
    >
      <!-- Header del drawer con información del usuario -->
      <div class="drawer-header">
        <div class="user-info-container">
          <v-avatar size="60" class="user-avatar">
            <img
              :src="urlImagen(logo)"
              alt="Logo"
            >
          </v-avatar>
          <div class="user-details">
            <h3 class="gym-name">{{ nombreGimnasio }}</h3>
            <p class="user-name">{{ nombreUsuario }}</p>
          </div>
        </div>
      </div>

      <v-divider class="custom-divider"></v-divider>

      <!-- Lista de navegación mejorada -->
      <v-list class="navigation-list" dense nav>
        <v-list-item
          v-for="(item) in items"
          :key="item.title"
          link
          :to="item.link"
          class="nav-item"
          :class="{ 'nav-item-active': isActiveRoute(item.link) }"
        >
          <v-list-item-icon class="nav-icon">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title class="nav-title">{{ item.title }}</v-list-item-title>
          </v-list-item-content>

          <!-- Indicador de ruta activa -->
          <div class="active-indicator" v-if="isActiveRoute(item.link)"></div>
        </v-list-item>
      </v-list>

      <!-- Footer del drawer -->
      <div class="drawer-footer">
        <div class="version-info">
          <small>Versión 2.0</small>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import Utiles from '../Servicios/Utiles'

export default {
  name: "Encabezado",

  data: () => ({
    drawer: false,
    nombreUsuario: "",
    nombreGimnasio: "",
    logo: "",
    items: [
      { title: "Inicio", icon: "mdi-view-dashboard", link: "/" },
      { title: "Registrar visita", icon: "mdi-home-account", link: "/registrar-visita" },
      { title: "Usuarios", icon: "mdi-account-box", link: "/usuarios" },
      { title: "Miembros", icon: "mdi-weight-lifter", link: "/miembros" },
      { title: "Membresías List", icon: "mdi-wallet-membership", link: "/crud_membresias" },
      { title: "Membresías", icon: "mdi-wallet-membership", link: "/membresias" },
      { title: "Clientes", icon: "mdi-account-multiple", link: "/clientes" },
      { title: "Pagos", icon: "mdi-account-cash", link: "/pagos" },
      { title: "Visitas", icon: "mdi-calendar-star", link: "/visitas" },
      { title: "Chat Bot", icon: "mdi-chat", link: "/chat" },
      { title: "Notificar Usuario", icon: "mdi-bell-ring", link: "/enviar_msg" },
      { title: "Configurar", icon: "mdi-cog", link: "/configurar" },
      { title: "Mi perfil", icon: "mdi-account-key", link: "/perfil" },
    ],
  }),

  mounted() {
    this.nombreUsuario = localStorage.getItem("nombreUsuario")
    this.nombreGimnasio = localStorage.getItem("nombreGimnasio")
    this.logo = localStorage.getItem("logoGimnasio")
  },

  methods: { 
    salir() {
      localStorage.removeItem('logeado')
      localStorage.removeItem('nombreUsuario')
      localStorage.removeItem('idUsuario')
      window.location.reload()
    },

    urlImagen(imagen) {
      return Utiles.generarURL(imagen);
    },

    isActiveRoute(route) {
      return this.$route.path === route;
    }
  }
};
</script>

<style scoped>
/* App Bar Styles */
.app-bar-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.backdrop-blur {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.nav-icon-hover {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.nav-icon-hover:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-image {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.02);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Navigation Drawer Styles */
.navigation-drawer {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  padding: 24px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-details {
  flex: 1;
}

.gym-name {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.user-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.custom-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 0 20px;
}

/* Navigation List Styles */
.navigation-list {
  padding: 12px 0;
}

.nav-item {
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-left: 4px solid #667eea;
}

.nav-item-active::before {
  opacity: 1;
}

.nav-icon {
  margin-right: 12px !important;
  min-width: 40px !important;
}

.nav-icon .v-icon {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 20px;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-icon .v-icon,
.nav-item-active .nav-icon .v-icon {
  color: #ffffff !important;
  transform: scale(1.1);
}

.nav-title {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.3s ease;
}

.nav-item:hover .nav-title,
.nav-item-active .nav-title {
  color: #ffffff !important;
}

.active-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #667eea;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(103, 126, 234, 0.6);
}

/* Drawer Footer */
.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.version-info {
  text-align: center;
}

.version-info small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navigation-drawer {
    width: 100% !important;
  }
  
  .drawer-header {
    padding: 20px 16px;
  }
  
  .user-info-container {
    gap: 12px;
  }
  
  .user-avatar {
    width: 50px !important;
    height: 50px !important;
  }
  
  .gym-name {
    font-size: 14px;
  }
  
  .user-name {
    font-size: 12px;
  }
}

/* Animaciones adicionales */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease forwards;
}

.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.15s; }
.nav-item:nth-child(3) { animation-delay: 0.2s; }
.nav-item:nth-child(4) { animation-delay: 0.25s; }
.nav-item:nth-child(5) { animation-delay: 0.3s; }
.nav-item:nth-child(6) { animation-delay: 0.35s; }
.nav-item:nth-child(7) { animation-delay: 0.4s; }
.nav-item:nth-child(8) { animation-delay: 0.45s; }
.nav-item:nth-child(9) { animation-delay: 0.5s; }
.nav-item:nth-child(10) { animation-delay: 0.55s; }
.nav-item:nth-child(11) { animation-delay: 0.6s; }
.nav-item:nth-child(12) { animation-delay: 0.65s; }
.nav-item:nth-child(13) { animation-delay: 0.7s; }

/* Efectos de scroll suave */
.navigation-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.navigation-list::-webkit-scrollbar {
  width: 4px;
}

.navigation-list::-webkit-scrollbar-track {
  background: transparent;
}

.navigation-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.navigation-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
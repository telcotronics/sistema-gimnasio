import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Membresias from '../components/Membresias/Membresias'
import CrearMembresia from '../components/Membresias/Crear_membresias'
import CrearPlanes from '../components/Membresias/Crear_planes.vue'
import Miembros from '../components/Miembros/Miembros'
import CRUD_membresias from '../components/Membresias/Crud_membresias.vue'
import CRUD_MembresiaForm from '../components/Membresias/CRUD_MembresiaForm.vue'
import EditarMiembro from '../components/Miembros/EditarMiembro'
import Usuarios from '../components/Usuarios/Usuarios'
import NuevoMiembro from '../components/Miembros/NuevoMiembro'
import NuevoUsuario from '../components/Usuarios/NuevoUsuario'
import nuevoCliente from '../components/Clientes/NuevoCliente.vue'
import Clientes from '../components/Clientes/ListaClientes.vue'
import EditarCliente from '../components/Clientes/EditarCliente.vue'

import EditarUsuario from '../components/Usuarios/EditarUsuario'
import CambiarPassword from '../components/Usuarios/CambiarPassword'
import Pagos from '../components/Pagos/Pagos'
import RegistrarVisita from '../components/Visitas/RegistrarVisita'
import Visitas from '../components/Visitas/Visitas'
import ConfiguracionComponent from '../components/Configuracion/ConfiguracionComponent'
import InicioComponent from '../components/InicioComponent'
import MiPerfil from '../components/Usuarios/MiPerfil'
import Chat from '../components/Chat/Chat_ws'
import Envia_msg from '../components/Chat/Envia_msg.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'InicioComponent',
      component: InicioComponent
    },
    {
      path: '/membresias',
      name: 'Membresias',
      component: Membresias
    },
    {
      path: '/crear_membresia',
      name: 'CrearMembresia',
      component: CrearMembresia
    },
    {
      path: '/crear_planes',
      name: 'CrearPlanes',
      component: CrearPlanes
    },
    {
      path: '/crud_membresias',
      name: 'CrudMembresias',
      component: CRUD_membresias // Tu componente para listar
    },
    {
      path: '/CRUD_MembresiaForm',
      name: 'CrudCrearMembresia',
      component: CRUD_MembresiaForm // Apunta al componente unificado
    },
    {
      path: '/CRUD_MembresiaForm/:id', 
      name: 'CrudEditarMembresia',
      component: CRUD_MembresiaForm, // ¡También apunta al componente unificado!
      props: true // Esto permite que el ID de la ruta se pase como prop al componente, aunque no lo estamos usando directamente, lo leemos de $route.params.id
    },
    {
      path: '/miembros',
      name: 'Miembros',
      component: Miembros
    },
    {
      path: '/nuevo-miembro',
      name: 'NuevoMiembro',
      component: NuevoMiembro
    },
    {
      path: '/clientes',
      name: 'Clientes',
      component: Clientes
    },
    {
      path: '/Crear_cliente',
      name: 'CrearCliente',
      component: nuevoCliente
    },
    {
      path: '/editar-cliente/:id', // <-- ¡Nueva ruta para edición!
      name: 'EditarCliente',
      component: EditarCliente,
      props: true // Esto pasa el 'id' de la URL como una prop al componente
    },
    {
      path: '/editar-miembro/:id',
      name: 'EditarMiembro',
      component: EditarMiembro,
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: Usuarios
    },
    {
      path: '/nuevo-usuario',
      name: 'NuevoUsuario',
      component: NuevoUsuario
    },
    {
      path: '/editar-usuario/:id',
      name: 'EditarUsuario',
      component: EditarUsuario,
    },
    {
      path: '/cambiar-password',
      name: 'CambiarPassword',
      component: CambiarPassword
    },
    {
      path: '/pagos',
      name: 'Pagos',
      component: Pagos
    },
    {
      path: '/registrar-visita',
      name: 'RegistrarVisita',
      component: RegistrarVisita
    },
    {
      path: '/visitas',
      name: 'Visitas',
      component: Visitas
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/enviar_msg',
      name: 'Notificar Miembros',
      component: Envia_msg
    },
    {
      path: '/configurar',
      name: 'Configurar',
      component: ConfiguracionComponent
    },
    {
      path: '/perfil',
      name: 'MiPerfil',
      component: MiPerfil
    },
  ]
})
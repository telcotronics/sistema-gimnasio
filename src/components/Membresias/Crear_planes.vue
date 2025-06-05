<!-- FormularioPlanMembresias.vue -->
<template>
  <div class="formulario-container">
    <h1>Registro de Plan</h1>
    
    <div class="form-group">
      <label for="tipo">Tipo de Plan:</label>
      <select id="tipo" v-model="formData.Tipo" @change="cambiarTipo" class="form-control">
        <option value="Membresía">Membresía</option>
        <option value="Tarjeta Visita">Tarjeta de Visita</option>
      </select>
    </div>

    <div class="form-group">
      <label for="nombre">Nombre:</label>
      <input type="text" id="nombre" v-model="formData.Nombre" class="form-control" required>
    </div>

    <!-- Campos comunes -->
    <div class="form-group">
      <label for="estado">Estado:</label>
      <select id="estado" v-model="formData.Estado" class="form-control">
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
        <option value="Pendiente">Pendiente</option>
      </select>
    </div>

    <div class="form-group">
      <label for="valor">Valor:</label>
      <input type="number" id="valor" v-model="formData.Valor" step="0.01" class="form-control">
    </div>

    <!-- Campos específicos de Membresía -->
    <div v-if="formData.Tipo === 'Membresía' || formData.Tipo === 'Ambos'">
      <h3>Datos de Membresía</h3>
      
      <div class="form-group">
        <label for="fecha_inicio">Fecha de Inicio:</label>
        <input type="date" id="fecha_inicio" v-model="formData.Fecha_Inicio" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="fecha_fin">Fecha de Fin:</label>
        <input type="date" id="fecha_fin" v-model="formData.Fecha_Fin" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="grupo">Grupo:</label>
        <input type="text" id="grupo" v-model="formData.Grupo" class="form-control">
      </div>
    </div>

    <!-- Campos específicos de Tarjeta Visita -->
    <div v-if="formData.Tipo === 'Tarjeta Visita' || formData.Tipo === 'Ambos'">
      <h3>Datos de Tarjeta de Visita</h3>
      
      <div class="form-group">
        <label for="fecha_caducidad">Fecha de Caducidad:</label>
        <input type="date" id="fecha_caducidad" v-model="formData.Fecha_Caducidad" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="cant_dias">Cantidad de Días:</label>
        <input type="number" id="cant_dias" v-model="formData.Cant_Dias" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="dias_usados">Días Usados:</label>
        <input type="number" id="dias_usados" v-model="formData.Dias_Usados" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="saldo_dias">Saldo de Días:</label>
        <input type="number" id="saldo_dias" :value="calcularSaldoDias" class="form-control" 
               readonly>
      </div>
      
      <div class="form-group">
        <label for="cantidad_miembros">Cantidad de Miembros:</label>
        <input type="number" id="cantidad_miembros" v-model="formData.Cantidad_Miembros" class="form-control">
      </div>
    </div>

    <div class="form-buttons">
      <button @click="guardarPlan" class="btn btn-primary">Guardar</button>
      <button @click="limpiarFormulario" class="btn btn-secondary">Limpiar</button>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="mensaje" :class="['mensaje', mensajeEstado]">
      {{ mensaje }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormularioPlanMembresias',
  data() {
    return {
      formData: {
        ID: null,
        Nombre: '',
        Tipo: 'Membresía',
        Fecha_Inicio: null,
        Fecha_Fin: null,
        Fecha_Caducidad: null,
        Grupo: '',
        Valor: null,
        Estado: 'Activo',
        Cant_Dias: null,
        Dias_Usados: 0,
        Saldo_Dias: null,
        Cantidad_Miembros: null
      },
      mensaje: '',
      mensajeEstado: ''
    }
  },
  computed: {
    calcularSaldoDias() {
      if (this.formData.Cant_Dias !== null && this.formData.Dias_Usados !== null) {
        const saldoDias = this.formData.Cant_Dias - this.formData.Dias_Usados;
        this.formData.Saldo_Dias = saldoDias;
        return saldoDias;
      }
      return null;
    }
  },
  methods: {
    cambiarTipo() {
      // Reiniciar campos no relevantes cuando se cambia el tipo
      if (this.formData.Tipo === 'Membresía') {
        this.formData.Fecha_Caducidad = null;
        this.formData.Cant_Dias = null;
        this.formData.Dias_Usados = null;
        this.formData.Saldo_Dias = null;
        this.formData.Cantidad_Miembros = null;
      } else if (this.formData.Tipo === 'Tarjeta Visita') {
        this.formData.Fecha_Inicio = null;
        this.formData.Fecha_Fin = null;
        this.formData.Grupo = '';
      }
    },
    async guardarPlan() {
      try {
        // Validar campos obligatorios
        if (!this.formData.Nombre) {
          this.mostrarMensaje('El nombre es obligatorio', 'error');
          return;
        }

        // Validar según el tipo
        if (this.formData.Tipo === 'Membresía' || this.formData.Tipo === 'Ambos') {
          if (!this.formData.Fecha_Inicio) {
            this.mostrarMensaje('La fecha de inicio es obligatoria para membresías', 'error');
            return;
          }
        }

        if (this.formData.Tipo === 'Tarjeta Visita' || this.formData.Tipo === 'Ambos') {
          if (!this.formData.Cant_Dias) {
            this.mostrarMensaje('La cantidad de días es obligatoria para tarjetas de visita', 'error');
            return;
          }
        }

        // Aquí iría la llamada a la API para guardar los datos
        // Por ejemplo:
        // const response = await axios.post('/api/plan-membresias', this.formData);
        
        // Simulación de éxito:
        console.log('Datos a guardar:', this.formData);
        this.mostrarMensaje('Plan guardado exitosamente', 'exito');
        
        // Opcional: Limpiar el formulario después de guardar exitosamente
        this.limpiarFormulario();
      } catch (error) {
        console.error('Error al guardar:', error);
        this.mostrarMensaje('Error al guardar el plan', 'error');
      }
    },
    limpiarFormulario() {
      this.formData = {
        ID: null,
        Nombre: '',
        Tipo: 'Membresía',
        Fecha_Inicio: null,
        Fecha_Fin: null,
        Fecha_Caducidad: null,
        Grupo: '',
        Valor: null,
        Estado: 'Activo',
        Cant_Dias: null,
        Dias_Usados: 0,
        Saldo_Dias: null,
        Cantidad_Miembros: null
      };
      this.mensaje = '';
    },
    mostrarMensaje(msg, tipo) {
      this.mensaje = msg;
      this.mensajeEstado = tipo;
      
      // Eliminar el mensaje después de unos segundos
      setTimeout(() => {
        this.mensaje = '';
        this.mensajeEstado = '';
      }, 5000);
    }
  }
}
</script>

<style scoped>
.formulario-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #555;
  margin-top: 20px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-buttons {
  margin-top: 25px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.mensaje {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
}

.exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
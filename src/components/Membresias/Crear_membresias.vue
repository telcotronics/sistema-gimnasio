<template>
  <div class="membresiaForm">
    <div class="container">
      <h1 class="titulo">Crear Nueva Membresía</h1>
      
      <form @submit.prevent="guardarMembresia" class="formulario">
        <!-- Nombre -->
        <div class="campo">
          <label for="nombre">
            Nombre*
          </label>
          <input 
            id="nombre" 
            v-model="membresia.nombre" 
            type="text" 
            required
          >
        </div>
        
        <!-- Fechas -->
        <div class="campo-grupo">
          <div class="campo">
            <label for="fechaInicio">
              Fecha de Inicio
            </label>
            <input 
              id="fechaInicio" 
              v-model="membresia.fechaInicio" 
              type="date" 
            >
          </div>
          <div class="campo">
            <label for="fechaFin">
              Fecha de Fin
            </label>
            <input 
              id="fechaFin" 
              v-model="membresia.fechaFin" 
              type="date" 
            >
          </div>
        </div>
        
        <!-- Grupo -->
        <div class="campo">
          <label for="grupo">
            Grupo
          </label>
          <select 
            id="grupo" 
            v-model="membresia.grupo" 
          >
            <option value="">Seleccionar Grupo</option>
            <option value="Básico">Básico</option>
            <option value="Estándar">Estándar</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        
        <!-- Valor -->
        <div class="campo">
          <label for="valor">
            Valor
          </label>
          <div class="input-con-prefijo">
            <span class="prefijo">$</span>
            <input 
              id="valor" 
              v-model.number="membresia.valor" 
              type="number" 
              step="0.01" 
              min="0"
            >
          </div>
        </div>
        
        <!-- Estado -->
        <div class="campo">
          <label>
            Estado
          </label>
          <div class="radio-grupo">
            <div class="radio-opcion">
              <input 
                id="estadoActivo" 
                v-model="membresia.estado" 
                type="radio" 
                value="Activo"
              >
              <label for="estadoActivo">Activo</label>
            </div>
            <div class="radio-opcion">
              <input 
                id="estadoPendiente" 
                v-model="membresia.estado" 
                type="radio" 
                value="Pendiente"
              >
              <label for="estadoPendiente">Pendiente</label>
            </div>
            <div class="radio-opcion">
              <input 
                id="estadoInactivo" 
                v-model="membresia.estado" 
                type="radio" 
                value="Inactivo"
              >
              <label for="estadoInactivo">Inactivo</label>
            </div>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="botones">
          <button 
            type="submit" 
            class="btn btn-guardar"
          >
            Guardar Membresía
          </button>
          <button 
            type="button"
            @click="limpiarFormulario"
            class="btn btn-limpiar"
          >
            Limpiar
          </button>
        </div>
      </form>
      
      <!-- Mensaje de éxito -->
      <div v-if="mensajeExito" class="mensaje mensaje-exito">
        {{ mensajeExito }}
      </div>
      
      <!-- Mensaje de error -->
      <div v-if="mensajeError" class="mensaje mensaje-error">
        {{ mensajeError }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      membresia: {
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        grupo: '',
        valor: 0,
        estado: 'Activo'
      },
      mensajeExito: '',
      mensajeError: ''
    }
  },
  methods: {
    guardarMembresia() {
      // Aquí iría la lógica para guardar la membresía en la base de datos
      // Por ejemplo, usando axios para hacer una petición POST a un endpoint de API
      
      try {
        // Simulación de guardado exitoso
        console.log('Membresía a guardar:', this.membresia);
        
        // En un caso real, aquí realizaríamos la llamada a la API
        // axios.post('/api/membrecias', this.membresia)
        //   .then(response => {
        //     this.mensajeExito = 'Membresía guardada exitosamente';
        //     this.limpiarFormulario();
        //   })
        //   .catch(error => {
        //     this.mensajeError = 'Error al guardar la membresía: ' + error.message;
        //   });
        
        // Para efectos de demostración:
        this.mensajeExito = 'Membresía guardada exitosamente';
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
        
        this.limpiarFormulario();
      } catch (error) {
        this.mensajeError = 'Error al guardar la membresía: ' + error.message;
        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    },
    limpiarFormulario() {
      this.membresia = {
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        grupo: '',
        valor: 0,
        estado: 'Activo'
      };
    }
  }
}
</script>

<style scoped>
.membresiaForm {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.titulo {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.formulario {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 25px;
}

.campo {
  margin-bottom: 20px;
}

.campo label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.campo input,
.campo select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.campo input:focus,
.campo select:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.campo-grupo {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.campo-grupo .campo {
  flex: 1;
  margin-bottom: 0;
}

.input-con-prefijo {
  display: flex;
  align-items: center;
}

.prefijo {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding: 10px 12px;
  color: #666;
  font-weight: bold;
}

.input-con-prefijo input {
  border-radius: 0 4px 4px 0;
}

.radio-grupo {
  display: flex;
  gap: 20px;
}

.radio-opcion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-opcion input[type="radio"] {
  width: auto;
  margin-right: 5px;
  cursor: pointer;
}

.radio-opcion label {
  margin-bottom: 0;
  cursor: pointer;
}

.botones {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-guardar {
  background-color: #3498db;
  color: white;
}

.btn-guardar:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-limpiar {
  background-color: #95a5a6;
  color: white;
}

.btn-limpiar:hover {
  background-color: #7f8c8d;
}

.mensaje {
  padding: 12px 15px;
  border-radius: 4px;
  font-weight: 500;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease;
}

.mensaje-exito {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.mensaje-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .campo-grupo {
    flex-direction: column;
    gap: 20px;
  }
  
  .campo-grupo .campo {
    margin-bottom: 0;
  }
  
  .botones {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
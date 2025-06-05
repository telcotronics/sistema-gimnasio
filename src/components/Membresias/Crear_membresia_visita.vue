<template>
  <div class="tarjetaForm">
    <div class="container">
      <h1 class="titulo">Crear Tarjeta de Visita</h1>
      
      <form @submit.prevent="guardarTarjeta" class="formulario">
        <!-- Nombre -->
        <div class="campo">
          <label for="nombre">
            Nombre*
          </label>
          <input 
            id="nombre" 
            v-model="tarjeta.nombre" 
            type="text" 
            required
            placeholder="Ingrese nombre de la tarjeta"
          >
        </div>
        
        <!-- Cantidad de días -->
        <div class="campo-grupo">
          <div class="campo">
            <label for="cant_dias">
              Cantidad de Días
            </label>
            <input 
              id="cant_dias" 
              v-model.number="tarjeta.cant_dias" 
              type="number" 
              min="0"
              placeholder="Días totales"
              @input="calcularSaldo"
            >
          </div>
          <div class="campo">
            <label for="dias_usados">
              Días Usados
            </label>
            <input 
              id="dias_usados" 
              v-model.number="tarjeta.dias_usados" 
              type="number" 
              min="0"
              placeholder="Días consumidos"
              @input="calcularSaldo"
            >
          </div>
        </div>
        
        <!-- Saldo de días -->
        <div class="campo">
          <label for="saldo_dias">
            Saldo de Días
          </label>
          <input 
            id="saldo_dias" 
            v-model.number="tarjeta.saldo_dias" 
            type="number" 
            readonly
            class="campo-readonly"
          >
          <span class="campo-info">Calculado automáticamente</span>
        </div>
        
        <!-- Fecha de caducidad -->
        <div class="campo">
          <label for="fecha_caducidad">
            Fecha de Caducidad
          </label>
          <input 
            id="fecha_caducidad" 
            v-model="tarjeta.fecha_caducidad" 
            type="date" 
          >
        </div>
        
        <!-- Cantidad de miembros -->
        <div class="campo">
          <label for="cantidad_miembros">
            Cantidad de Miembros
          </label>
          <div class="campo-contador">
            <button 
              type="button" 
              class="btn-contador"
              @click="decrementarMiembros"
              :disabled="tarjeta.cantidad_miembros <= 1"
            >
              -
            </button>
            <input 
              id="cantidad_miembros" 
              v-model.number="tarjeta.cantidad_miembros" 
              type="number" 
              min="1"
              class="input-contador"
            >
            <button 
              type="button" 
              class="btn-contador"
              @click="incrementarMiembros"
            >
              +
            </button>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="botones">
          <button 
            type="submit" 
            class="btn btn-guardar"
          >
            Guardar Tarjeta
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
      tarjeta: {
        nombre: '',
        cant_dias: 0,
        dias_usados: 0,
        saldo_dias: 0,
        fecha_caducidad: '',
        cantidad_miembros: 1
      },
      mensajeExito: '',
      mensajeError: ''
    }
  },
  methods: {
    calcularSaldo() {
      const cantDias = this.tarjeta.cant_dias || 0;
      const diasUsados = this.tarjeta.dias_usados || 0;
      this.tarjeta.saldo_dias = Math.max(0, cantDias - diasUsados);
    },
    incrementarMiembros() {
      this.tarjeta.cantidad_miembros++;
    },
    decrementarMiembros() {
      if (this.tarjeta.cantidad_miembros > 1) {
        this.tarjeta.cantidad_miembros--;
      }
    },
    guardarTarjeta() {
      try {
        // Validación básica
        if (!this.tarjeta.nombre) {
          this.mensajeError = 'El nombre de la tarjeta es obligatorio';
          setTimeout(() => {
            this.mensajeError = '';
          }, 3000);
          return;
        }
        
        // Simulación de guardado exitoso
        console.log('Tarjeta a guardar:', this.tarjeta);
        
        // En un caso real, aquí realizaríamos la llamada a la API
        // axios.post('/api/tarjeta_visita', this.tarjeta)
        //   .then(response => {
        //     this.mensajeExito = 'Tarjeta guardada exitosamente';
        //     this.limpiarFormulario();
        //   })
        //   .catch(error => {
        //     this.mensajeError = 'Error al guardar la tarjeta: ' + error.message;
        //   });
        
        // Para efectos de demostración:
        this.mensajeExito = 'Tarjeta de visita guardada exitosamente';
        setTimeout(() => {
          this.mensajeExito = '';
        }, 3000);
        
        this.limpiarFormulario();
      } catch (error) {
        this.mensajeError = 'Error al guardar la tarjeta: ' + error.message;
        setTimeout(() => {
          this.mensajeError = '';
        }, 3000);
      }
    },
    limpiarFormulario() {
      this.tarjeta = {
        nombre: '',
        cant_dias: 0,
        dias_usados: 0,
        saldo_dias: 0,
        fecha_caducidad: '',
        cantidad_miembros: 1
      };
    }
  }
}
</script>

<style scoped>
.tarjetaForm {
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  color: #333;
  background-color: #f0f4f8;
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.titulo {
  color: #234e70;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 3px solid #ffa62b;
  position: relative;
}

.titulo::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 60px;
  height: 3px;
  background-color: #2c73d2;
}

.formulario {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 35px;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.formulario:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.campo {
  margin-bottom: 25px;
  position: relative;
}

.campo label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #234e70;
  font-size: 15px;
}

.campo input,
.campo select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dbe1e8;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  color: #2d3748;
  background-color: #fff;
}

.campo input:focus,
.campo select:focus {
  border-color: #2c73d2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(44, 115, 210, 0.15);
}

.campo input::placeholder {
  color: #a0aec0;
}

.campo-info {
  font-size: 12px;
  color: #718096;
  margin-top: 6px;
  display: block;
}

.campo-readonly {
  background-color: #f8fafc;
  color: #4a5568;
  cursor: not-allowed;
}

.campo-grupo {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.campo-grupo .campo {
  flex: 1;
  margin-bottom: 0;
}

.campo-contador {
  display: flex;
  align-items: center;
  width: 100%;
  height: 45px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dbe1e8;
}

.btn-contador {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background-color: #f1f5f9;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #234e70;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-contador:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.btn-contador:disabled {
  color: #cbd5e0;
  cursor: not-allowed;
}

.input-contador {
  height: 100%;
  flex: 1;
  border: none;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  padding: 0;
}

.input-contador:focus {
  outline: none;
  box-shadow: none;
}

.input-contador::-webkit-inner-spin-button, 
.input-contador::-webkit-outer-spin-button { 
  -webkit-appearance: none;
  margin: 0;
}

.botones {
  display: flex;
  justify-content: space-between;
  margin-top: 35px;
}

.btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-guardar {
  background-color: #2c73d2;
  color: white;
}

.btn-guardar:hover {
  background-color: #1e5daa;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(44, 115, 210, 0.2);
}

.btn-limpiar {
  background-color: #f8f9fa;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-limpiar:hover {
  background-color: #e2e8f0;
}

.mensaje {
  padding: 15px;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease;
  display: flex;
  align-items: center;
}

.mensaje-exito {
  background-color: #e6f7ee;
  border-left: 4px solid #38c172;
  color: #1e7b48;
}

.mensaje-error {
  background-color: #fce8e8;
  border-left: 4px solid #e53e3e;
  color: #c81e1e;
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
    gap: 25px;
  }

  .botones {
    flex-direction: column;
    gap: 15px;
  }
  
  .btn {
    width: 100%;
  }
  
  .formulario {
    padding: 25px 20px;
  }
}
</style>
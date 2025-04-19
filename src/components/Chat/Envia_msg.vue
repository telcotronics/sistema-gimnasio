<template>
    <div>
        <h2>Enviar Mensaje</h2>
        <form @submit.prevent="enviarMensaje" class="message-form">
            <div class="form-group">
                <label for="destino">Seleccionar Miembro:</label>
                <select v-model="destino" id="destino" required class="form-control">
                    <option value="" disabled selected>Seleccione un miembro</option>
                    <option v-for="miembro in miembros" :key="miembro.id" :value="miembro.id">
                        {{ miembro.nombre }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="mensaje">Mensaje:</label>
                <textarea v-model="mensaje" id="mensaje" required class="form-control"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Enviar Mensaje</button>
        </form>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            miembros: [],
            destino: "",
            mensaje: "",
        };
    },
    methods: {
        async obtenerMiembros() {
            try {
                const response = await axios.post(
                    "https://api-gym.factura-e.net/api/miembros.php",
                    { metodo: "get" }
                );
                if (response.data && Array.isArray(response.data)) {
                    this.miembros = response.data.map(miembro => ({
                        id: miembro.id,
                        nombre: miembro.nombre
                    }));
                } else {
                    console.error("La respuesta de la API no es un array o está vacía.");
                    this.miembros = [];
                }
            } catch (error) {
                console.error("Error al obtener los miembros:", error);
            }
        },
        async enviarMensaje() {
            if (!this.destino) {
                alert("Por favor, selecciona un miembro.");
                return;
            }
            if (!this.mensaje.trim()) {
                alert("Por favor, escribe un mensaje.");
                return;
            }
            try {
                const payload = {
                    origen: "",
                    destino: this.destino,
                    mensaje: this.mensaje,
                };
                const response = await axios.post(
                    "https://api-gym.factura-e.net/api/reenvia_msg.php",
                    payload
                );
                if (response.data && response.data.success) {
                    alert("Mensaje enviado con éxito");
                    this.mensaje = "";
                    this.destino = "";
                } else {
                    console.error("Error al enviar el mensaje:", response.data ? response.data.message : 'Respuesta inesperada del servidor');
                    alert("Error al enviar el mensaje");
                }
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
                alert("Error al enviar el mensaje");
            }
        },
    },
    mounted() {
        this.obtenerMiembros();
    },
};
</script>

<style scoped>
.message-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
    max-width: 500px;
    margin: 0 auto;
}

.form-group {
    display: flex;
    flex-direction: column;
}

label {
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #333;
}

.form-control {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

select.form-control {
    appearance: none; /* Quita los estilos por defecto del navegador */
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg fill="%23343a40" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    padding-right: 2.5rem;
}

textarea.form-control {
    min-height: 100px;
    resize: vertical;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
}
</style>
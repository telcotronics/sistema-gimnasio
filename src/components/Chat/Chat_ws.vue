<template>
    <div class="chat-container">
        <div class="messages">
            <div 
                v-for="(message, index) in messages" 
                :key="index" 
                :class="{'message-sent': message.sent, 'message-received': !message.sent}"
            >
                <p>{{ message.text }}</p>
            </div>
        </div>
        <form @submit.prevent="sendMessage" class="chat-form">
            <input 
                v-model="newMessage" 
                type="text" 
                placeholder="Escribe un mensaje..." 
                class="chat-input"
            />
            <button type="submit" class="send-button">Enviar</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            messages: [
                { text: "Hola, ¿cómo estás?", sent: false },
                { text: "¡Hola! Estoy bien, ¿y tú?", sent: true },
            ],
            newMessage: "",
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== "") {
                this.messages.push({ text: this.newMessage, sent: true });
                this.newMessage = "";
                // Simulate a response
                setTimeout(() => {
                    this.messages.push({ text: "Mensaje recibido.", sent: false });
                }, 1000);
            }
        },
    },
};
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
}

.messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #f5f5f5;
}

.message-sent {
    text-align: right;
    margin: 5px 0;
}

.message-received {
    text-align: left;
    margin: 5px 0;
}

.message-sent p {
    display: inline-block;
    background-color: #dcf8c6;
    padding: 8px 12px;
    border-radius: 15px;
    max-width: 70%;
}

.message-received p {
    display: inline-block;
    background-color: #fff;
    padding: 8px 12px;
    border-radius: 15px;
    max-width: 70%;
    border: 1px solid #ccc;
}

.chat-form {
    display: flex;
    padding: 10px;
    background-color: #fff;
    border-top: 1px solid #ccc;
}

.chat-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    outline: none;
}

.send-button {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #25d366;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.send-button:hover {
    background-color: #1da851;
}
</style>
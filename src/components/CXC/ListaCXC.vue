<template>
  <div class="modulo-construccion">
    <div class="construccion-card">
      <span class="material-symbols-outlined icono">pending_actions</span>
      <h2>Cuentas por Cobrar</h2>
      <p>Este módulo está en desarrollo.</p>
      <ul class="pendientes">
        <li>Lista de cuentas por cobrar con saldo pendiente</li>
        <li>Filtro por cliente, estado y fecha de vencimiento</li>
        <li>Acceso rápido para registrar abono</li>
      </ul>
      <button class="btn-volver" @click="$router.go(-1)">Volver</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListaCXC'
}
</script>

<style scoped>
.modulo-construccion {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  background: #102210;
}
.construccion-card {
  background: #1c2e1c;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 480px;
  text-align: center;
  color: white;
}
.icono {
  font-size: 3rem;
  color: #13ec13;
  margin-bottom: 1rem;
}
h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
p  { color: #9ca3af; margin-bottom: 1.5rem; }
.pendientes {
  text-align: left;
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}
.pendientes li {
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.pendientes li::before { content: '→ '; color: #13ec13; }
.btn-volver {
  background: #13ec13;
  color: black;
  font-weight: 700;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>

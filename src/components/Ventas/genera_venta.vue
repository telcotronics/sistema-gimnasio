<template>
  <div>
  <!-- v-container fluid>
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="headline blue-grey lighten-5 py-4">
        <v-icon left color="primary" large>mdi-cash-register</v-icon>
        <div>
          Ingreso de Cobros
          <v-spacer></v-spacer>
        </div>
        <v-spacer></v-spacer>
      </v-card-title>
    </v-card>
  </v-container -->

  <div class="sales-document-form">

    <main class="main-content">
      <div class="header-grid">
      <!-- Customer Section -->
      <section class="form-section">
        <h3 class="section-title">CLIENTE</h3>
        <div class="search-input-wrapper" style="position: relative;">
          <div class="input-container">
            <div class="input-icon" @click="buscarCliente" style="cursor: pointer">
              <span class="material-symbols-outlined">search</span>
            </div>
            <input v-model="form.customer" @keyup.enter="buscarCliente" class="form-input" placeholder="Buscar Cliente (RUC/Cédula/Nombre)..." type="text" />
          </div>
          <div v-if="showClientList && searchResults.length > 0" class="client-results-list">
            <div v-for="(client, index) in searchResults" :key="client.client_id" class="client-result-item" @click="selectClient(client)">
              <div class="client-name-result">{{ client.client_nombre }}</div>
              <div class="client-ruc-result">{{ client.client_rucCed }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Document Details -->
      <section class="form-section">
        <h3 class="section-title">Detalles del Documento</h3>
        <div class="details-grid">
          <div class="form-field">
            
            <div class="select-wrapper">
              <select v-model="form.documentType" class="form-select">
                <option value="invoice">Factura</option>
                <option value="receipt">Recibo</option>
                <option value="quote">Cotización</option>
              </select>
              <div class="select-icon">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
          <div class="form-field">
            <input v-model="form.sequence" class="form-input readonly-input" readonly type="text" />
          </div>
        </div>
      </section>
      </div>

      <hr class="section-divider" />

      <!-- Items Section -->
      <section class="form-section">
        <div class="section-header">
          <h3 class="section-title">ARTÍCULOS</h3>
        </div>

        <!-- Item Search -->
        <div class="search-input-wrapper" style="position: relative;">
          <div class="input-container">
            <div class="input-icon" @click="buscarArticulos" style="cursor: pointer">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <input v-model="itemSearch" @keyup.enter="buscarArticulos" class="form-input" placeholder="Buscar Artículos o Servicios..." type="text" />
            <div class="input-action">
              <span class="material-symbols-outlined scanner-icon">barcode_scanner</span>
            </div>
          </div>
          <div v-if="showItemList && searchResultsItems.length > 0" class="client-results-list">
            <div v-for="(item, index) in searchResultsItems" :key="index" class="client-result-item" @click="selectItem(item)">
              <div class="client-name-result">{{ item.descripcion || item.nombre || item.name }}</div>
              <div class="client-ruc-result">Precio: {{ formatCurrency(item.precio || item.price || 0) }}</div>
            </div>
          </div>
        </div>

        <!-- Items List -->
        <div class="items-list">
          <div v-for="(item, index) in form.items" :key="item.id" class="item-card">
            <button class="remove-item-badge" @click="removeItem(index)">
              <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
            </button>
            <div class="item-image" :style="{ backgroundImage: `url(${item.image})` }"></div>
            <div class="item-info">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-category">{{ item.category }}</p>
            </div>
            <div class="item-price-info">
              <p class="item-price">{{ formatCurrency(item.price) }}</p>
              <div class="item-quantity" @click="openQuantityModal(index)" style="cursor: pointer;">x {{ item.quantity }}</div>
            </div>
          </div>
        </div>

        <button class="add-item-button" @click="openMembershipModal">
          <span class="material-symbols-outlined">card_membership</span>
          Agregar Membresía
        </button>
      </section>

      <hr class="section-divider" />

      <!-- Payment & Logistics -->
      <section class="form-section">
        <!-- Payment Method -->
        <div class="subsection">
          <h3 class="section-title">MÉTODO DE PAGO</h3>
          <v-tabs v-model="paymentTabIndex" background-color="#f1f5f9" grow slider-color="#137fec" class="rounded-lg">
            <v-tab v-for="method in paymentMethods" :key="method.value">{{ method.label }}</v-tab>
          </v-tabs>

          <!-- Sección Contado: Lista de Pagos -->
          <div v-if="form.paymentMethod === 'contado'" class="mt-3">
            <div class="items-list mb-2" v-if="form.payments.length > 0">
              <div v-for="(pay, index) in form.payments" :key="index" class="item-card" style="padding: 0.5rem 0.75rem;">
                <div class="input-icon">
                  <span class="material-symbols-outlined">{{ getPaymentIcon(pay.type) }}</span>
                </div>
                <div class="item-info">
                  <p class="item-name" style="font-size: 0.9rem;">{{ getPaymentLabel(pay.type) }}</p>
                  <p class="item-category" v-if="pay.reference" style="font-size: 0.75rem;">Ref: {{ pay.reference }}</p>
                </div>
                <div class="item-price-info">
                  <p class="item-price" style="font-size: 0.9rem;">{{ formatCurrency(pay.amount) }}</p>
                </div>
                <button class="icon-button" style="width: 2rem; height: 2rem; background: transparent;" @click="removePayment(index)">
                  <span class="material-symbols-outlined" style="font-size: 1.2rem; color: #ef4444;">delete</span>
                </button>
              </div>
            </div>
            <button class="add-item-button" @click="openPaymentModal">
              <span class="material-symbols-outlined">add_card</span>
              Agregar Forma de Pago
            </button>
          </div>

          <!-- Sección Crédito: Indicador CXC -->
          <div v-else class="mt-3">
            <div class="info-card mb-3 compact-info-card">
              <div class="info-card-content">
                <span class="material-symbols-outlined icon-primary">pending_actions</span>
                <p class="info-card-label">Se generará una cuenta por cobrar (CXC) al cliente seleccionado. Si necesita hacer pago mixto use el módulo de abonos</p>
              </div>
            </div>
            <div class="credit-grid">
              <div class="form-field">
                <label class="field-label">Monto Crédito</label>
                <div class="input-container">
                  <input v-model.number="form.creditAmount" type="number" class="form-input px-3" />
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Días Crédito</label>
                <div class="input-container">
                  <input v-model.number="form.creditDays" type="number" class="form-input px-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <!-- Collector Selector -->
      </section>
      <div class="footer-grid">

      <!-- Observations -->
      <section class="form-section">
        <!-- Logistics Info Cards -->
        <div class="info-cards-grid">
          <div class="info-card">
            <p class="info-card-label">Caja Asignada</p>
            <div class="info-card-content">
              <span class="material-symbols-outlined icon-primary">point_of_sale</span>
              <select v-if="activeBoxes.length > 0" v-model="assignedBox" style="border: none; background: transparent; padding: 0; font-weight: 500; font-size: 0.875rem; color: #0f172a; cursor: pointer; outline: none; width: 100%;">
                <option v-for="box in activeBoxes" :key="box.contCaja_ID" :value="box.contCaja_caja">{{ box.contCaja_caja }}</option>
              </select>
              <p v-else class="info-card-value">{{ assignedBox }}</p>
            </div>
          </div>
          <div class="info-card">
            <p class="info-card-label">Vendedor</p>
            <div class="info-card-content">
              <span class="material-symbols-outlined icon-primary">badge</span>
              <p class="info-card-value">{{ form.seller }}</p>
            </div>
          </div>
        </div>
        <h3 class="section-title">OBSERVACIONES</h3>
        <textarea v-model="form.observations" class="form-textarea"
          placeholder="Agregar notas sobre entrega o pago..."></textarea>
      </section>

      <!-- Totals Summary -->
      <section class="totals-summary">
        <div class="total-row">
          <span class="total-label">Subtotal Gravado (15%)</span>
          <span class="total-value">{{ formatCurrency(subtotalGravado) }}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Subtotal No Gravado</span>
          <span class="total-value">{{ formatCurrency(subtotalNoGravado) }}</span>
        </div>
        <div class="total-row">
          <span class="total-label">
            Descuento (<input 
              v-model.number="discountPercentage" 
              type="number" 
              min="0" 
              max="100" 
              class="discount-input"
            />%)
          </span>
          <span class="total-value">- {{ formatCurrency(descuento) }}</span>
        </div>
        <div class="total-row">
          <span class="total-label">IVA (15%)</span>
          <span class="total-value">{{ formatCurrency(tax) }}</span>
        </div>
        <div class="total-divider"></div>
        <div class="total-row final">
          <span class="total-label-final">Total</span>
          <span class="total-value-final">{{ formatCurrency(total) }}</span>
        </div>
      </section>
      </div>
      <section>
        <div class="actions-container">
        <button class="action-button icon-button" @click="handlePrint">
          <span class="material-symbols-outlined">print</span>
        </button>
        <button class="action-button cancel-button" @click="handleCancel">
          Cancelar
        </button>
        <button class="action-button save-button" @click="handleSave">
          <span class="material-symbols-outlined">save</span>
          Guardar Documento
        </button>
      </div>
      </section>
    </main>
    <!-- Fixed Bottom Actions -->
  </div>

  <!-- Modal para Agregar Forma de Pago -->
  <v-dialog v-model="showPaymentModal" max-width="400px">
    <v-card class="rounded-lg">
      <v-card-title class="headline" style="font-size: 1.1rem; font-weight: 600;">Agregar Pago</v-card-title>
      <v-card-text class="pt-4">
        <div class="form-section">
          <div class="form-field">
            <label class="field-label">Tipo</label>
            <div class="select-wrapper">
              <select v-model="currentPayment.type" class="form-select">
                <option v-for="type in paymentTypesList" :key="type.value" :value="type.value">{{ type.text }}</option>
              </select>
              <div class="select-icon">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
          <div class="form-field mt-3">
            <label class="field-label">Monto</label>
            <div class="input-container">
              <input v-model.number="currentPayment.amount" type="number" class="form-input px-3" />
            </div>
          </div>
          <div class="form-field mt-3">
            <label class="field-label">Referencia (Opcional)</label>
            <div class="input-container">
              <input v-model="currentPayment.reference" type="text" class="form-input px-3" placeholder="Nº Cheque, Lote, etc." />
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <button class="action-button cancel-button" @click="showPaymentModal = false">Cancelar</button>
        <button class="action-button save-button" style="flex: 0 0 auto; padding: 0.5rem 1.5rem;" @click="addPayment">Agregar</button>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal para Editar Cantidad -->
  <v-dialog v-model="showQuantityModal" max-width="300px">
    <v-card class="rounded-lg">
      <v-card-title class="headline" style="font-size: 1.1rem; font-weight: 600;">Editar Cantidad</v-card-title>
      <v-card-text class="pt-4">
        <div class="form-field">
          <label class="field-label">Nueva Cantidad</label>
          <div class="input-container">
            <input v-model.number="editingItem.quantity" type="number" class="form-input px-3" @keyup.enter="updateQuantity" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <button class="action-button cancel-button" @click="closeQuantityModal">Cancelar</button>
        <button class="action-button save-button" style="flex: 0 0 auto; padding: 0.5rem 1.5rem;" @click="updateQuantity">Guardar</button>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal para Seleccionar Membresía -->
  <v-dialog v-model="showMembershipModal" max-width="500px">
    <v-card class="rounded-lg">
      <v-card-title class="headline" style="font-size: 1.1rem; font-weight: 600;">Seleccionar Membresía</v-card-title>
      <v-card-text class="pt-4">
        <div v-if="loadingMemberships" class="text-center">Cargando membresías...</div>
        <div v-else class="client-results-list" style="position: static; box-shadow: none; border: none; max-height: 400px;">
          <div v-for="membership in availableMemberships" :key="membership.id_tipo_membresia" class="client-result-item" @click="selectMembership(membership)">
            <div class="d-flex align-center">
              <span v-if="clientMembershipIds.includes(membership.id_tipo_membresia)" class="material-symbols-outlined" style="color: #13ec13; margin-right: 8px;">star</span>
              <div class="client-name-result">{{ membership.nombre_tipo }}</div>
            </div>
            <div class="client-ruc-result">{{ formatCurrency(membership.valor) }}</div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <button class="action-button cancel-button" @click="showMembershipModal = false">Cerrar</button>
      </v-card-actions>
    </v-card>
  </v-dialog>

  </div>
</template>

<script>
const baseUrl = process.env.VUE_APP_API_URL || 'https://api-gateway-cloud.telcotronics.net/api/';
const api_key = process.env.VUE_APP_API_KEY || 'ak_8f58d181cb8ad5042b677cf8a63ca708';
const baseDat = process.env.VUE_APP_BASE_DAT || 'telcotronics';
const gp_precio = process.env.VUE_APP_GP_PRECIO || 'PUBLICO';


export default {
  name: 'SalesDocumentForm',
  data() {
    return {
      busqueda: '',
      itemSearch: '',
      activeBoxes: [],
      assignedBox: 'POS #42',
      showPaymentModal: false,
      showQuantityModal: false,
      showMembershipModal: false,
      loadingMemberships: false,
      availableMemberships: [],
      clientMembershipIds: [],
      editingItem: {
        quantity: 1
      },
      editingItemIndex: null,
      showClientList: false,
      showItemList: false,
      searchResults: [],
      searchResultsItems: [],
      selectedClient: null,
      form: {
        customer: '',
        documentType: 'invoice',
        sequence: 'SEQ-2023-001',
        paymentMethod: 'contado',
        creditAmount: 0,
        creditDays: 30,
        payments: [], // Lista de pagos agregados
        seller: 'Jane Doe',
        observations: '',
        collector: {
          name: 'Jane Doe',
          role: 'Usuario Actual',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBx8EOkGnlRV2JEzhkR7mS4E5sCehlbvgZT3CbwMxIpkDGW8mC1F5fEN92Ja-vmU0dU90oLJz_YXavLRAZ42zZJPRunTh7qrLD5M7rrskc60s4le-8KpFS32brFEwGzz426OZtLsL7n-aCKoBvXEyveJ4fnQQe3C73cS0YrDJI8UGaptoetzkc8WZtMvTcVEH7EOmuRyUvWR-nlsvXbnaAlNrqazyvn0NgEpv6g70gDhDlWmttVjhhqsd6ZZHWiBosLcYyYlVMXMM'
        },
        items: []
      },
      paymentMethods: [
        { value: 'contado', label: 'Contado' },
        { value: 'credito', label: 'Crédito' }
      ],
      paymentTypesList: [
        { text: 'Efectivo', value: 'cash', icon: 'payments' },
        { text: 'Transferencia', value: 'transfer', icon: 'account_balance' },
        { text: 'Tarjeta', value: 'card', icon: 'credit_card' },
        { text: 'Cheque', value: 'check', icon: 'confirmation_number' },
        { text: 'Depósito', value: 'deposit', icon: 'savings' }
      ],
      currentPayment: {
        type: 'cash',
        amount: 0,
        reference: ''
      },
      discountPercentage: 0
    };
  },
  computed: {
    paymentTabIndex: {
      get() {
        return this.paymentMethods.findIndex(m => m.value === this.form.paymentMethod);
      },
      set(index) {
        this.form.paymentMethod = this.paymentMethods[index].value;
        if (this.form.paymentMethod === 'credito') {
          this.form.creditAmount = this.total;
          this.form.creditDays = 30;
        }
      }
    },
    subtotalGravado() {
      return this.form.items
        .filter(item => item.has_vat)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    subtotalNoGravado() {
      return this.form.items
        .filter(item => !item.has_vat)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    subtotal() {
      return this.subtotalGravado + this.subtotalNoGravado;
    },
    descuento() {
      return this.subtotal * ((this.discountPercentage || 0) / 100);
    },
    tax() {
      // Asumiendo una tasa de IVA del 15% sobre los productos gravados
      return this.subtotalGravado * 0.15;
    },
    total() {
      return this.subtotal - this.descuento + this.tax;
    }
  },
  mounted() {
    this.fetchActiveBoxes();
  },
  watch: {
    'currentPayment.type'(val) {
      if (val === 'cash') {
        this.currentPayment.reference = this.assignedBox;
      } else if (this.currentPayment.reference === this.assignedBox) {
        this.currentPayment.reference = '';
      }
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },
    async fetchActiveBoxes() {
      try {
        const response = await fetch(`${baseUrl}panel/contabilidad/cajas_activas?db=${baseDat}`, {
          headers: {
            'x-api-key': api_key
          }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          this.activeBoxes = data;
          if (this.activeBoxes.length > 0 && this.assignedBox === 'POS #42') {
            this.assignedBox = this.activeBoxes[0].contCaja_caja;
          }
        }
      } catch (error) {
        console.error('Error fetching active boxes:', error);
      }
    },
    async buscarCliente() {
      if (!this.form.customer) return;
      
      try {
        const db = baseDat;
        const response = await fetch(`${baseUrl}clientes/consulta_clientesApps?consulta=${encodeURIComponent(this.form.customer)}&db=${db}`, {
          headers: {
            'x-api-key': api_key
          }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
          this.searchResults = data;
          this.showClientList = true;
        } else {
          alert('Cliente no encontrado');
          this.searchResults = [];
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
      }
    },
    selectClient(client) {
      this.selectedClient = client;
      this.form.customer = client.client_nombre;
      this.showClientList = false;
      this.searchResults = [];
    },
    async buscarArticulos() {
      if (!this.itemSearch) return;
      
      try {
        // Parámetros fijos solicitados: gp_precio=PUBLICO&db=telcotronics
        //const db = 'telcotronics';
        //const gp_precio = 'PUBLICO';
        const query = encodeURIComponent(this.itemSearch);
        
        // Usamos la variable de entorno disponible (API_URL o SERV_API_DEV) o un fallback local
        
        console.log('baseUrl:', baseUrl)
        const response = await fetch(`${baseUrl}items/get-items/${query}?gp_precio=${gp_precio}&db=${baseDat}`, {
          headers: {
            'x-api-key': api_key,
            'accept': 'application/json'
          }
        });
        const data = await response.json();
        
        // Ajustar según la estructura real de la respuesta de la API (asumiendo array o {data: []})
        const items = Array.isArray(data) ? data : (data.data || []);
        
        if (items.length > 0) {
          this.searchResultsItems = items.map(i => ({
            id: i.codigo_prdcto,
            name: i.detalle_prdcto,
            category: i.describe_prdcto || 'General',
            price: Number(i.precio_vta),
            // Si viene en base64 (empieza con /9j/), agregamos el prefijo data URI
            image: i.url_img && !i.url_img.startsWith('http') ? `data:image/jpeg;base64,${i.url_img}` : (i.url_img || ''),
            has_vat: true // Asumimos que los artículos de la tienda tienen IVA
          }));
          this.showItemList = true;
        } else {
          this.searchResultsItems = [];
          this.showItemList = false;
        }
      } catch (error) {
        console.error('Error al buscar artículos:', error);
      }
    },
    selectItem(item) {
      this.form.items.push({
        id: item.id || Date.now(),
        name: item.name || 'Artículo sin nombre',
        category: item.category || 'General',
        price: parseFloat(item.price || 0),
        quantity: 1,
        image: item.image || '',
        has_vat: item.has_vat !== undefined ? item.has_vat : true
      });
      this.itemSearch = '';
      this.showItemList = false;
      this.searchResultsItems = [];
    },
    handleBack() {
      console.log('Volver');
    },
    handlePrint() {
      console.log('Imprimir');
    },
    handleCancel() {
      console.log('Cancelar');
    },
    handleSave() {
      console.log('Guardar documento', this.form);
    },
    async openMembershipModal() {
      if (!this.selectedClient) {
        alert('Por favor, seleccione un cliente primero.');
        return;
      }
      this.loadingMemberships = true;
      this.showMembershipModal = true;
      try {
        // Cargar todos los tipos de membresía si no están cargados
        if (this.availableMemberships.length === 0) {
          const resTypes = await fetch(`${baseUrl}clientes/tipos-membresia?db=${baseDat}`, { headers: { 'x-api-key': api_key } });
          this.availableMemberships = await resTypes.json();
        }

        // Cargar las membresías específicas del cliente seleccionado
        const resClient = await fetch(`${baseUrl}clientes/${this.selectedClient.client_id}/miembros?db=${baseDat}`, { headers: { 'x-api-key': api_key } });
        
        if (resClient.ok) {
            const clientMemberships = await resClient.json();
            // Si la respuesta es un array (incluso vacío), lo procesamos.
            if (Array.isArray(clientMemberships)) {
                this.clientMembershipIds = clientMemberships.map(m => m.id_tipo_membresia);
            } else {
                this.clientMembershipIds = [];
            }
        } else {
            // Si la respuesta no es OK (ej. 404), asumimos que el cliente no tiene membresías.
            this.clientMembershipIds = [];
        }

      } catch (error) {
        console.error('Error al cargar membresías:', error);
        this.showMembershipModal = false;
      } finally {
        this.loadingMemberships = false;
      }
    },
    selectMembership(membership) {
      this.form.items.push({ 
        id: `memb_${membership.id_tipo_membresia}`, 
        name: membership.nombre_tipo, 
        category: 'Membresía', 
        price: parseFloat(membership.valor), 
        quantity: 1, image: '', 
        has_vat: false // Asumimos que las membresías no tienen IVA
      });
      this.showMembershipModal = false;
    },
    openQuantityModal(index) {
      this.editingItemIndex = index;
      // Creamos una copia para no mutar el objeto original directamente en el modal
      this.editingItem = { ...this.form.items[index] }; 
      this.showQuantityModal = true;
    },
    updateQuantity() {
      if (this.editingItem.quantity > 0 && this.editingItemIndex !== null) {
        this.form.items[this.editingItemIndex].quantity = this.editingItem.quantity;
      }
      this.closeQuantityModal();
    },
    closeQuantityModal() {
      this.showQuantityModal = false;
    },
    removeItem(index) {
      this.form.items.splice(index, 1);
    },
    openPaymentModal() {
      // Calcular monto restante sugerido
      const paid = this.form.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, this.total - paid);
      
      this.currentPayment = {
        type: 'cash',
        amount: remaining,
        reference: this.assignedBox
      };
      this.showPaymentModal = true;
    },
    addPayment() {
      if (this.currentPayment.amount > 0) {
        this.form.payments.push({ ...this.currentPayment });
        this.showPaymentModal = false;
      }
    },
    removePayment(index) {
      this.form.payments.splice(index, 1);
    },
    getPaymentIcon(type) {
      const found = this.paymentTypesList.find(t => t.value === type);
      return found ? found.icon : 'payments';
    },
    getPaymentLabel(type) {
      const found = this.paymentTypesList.find(t => t.value === type);
      return found ? found.text : type;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

* {
  box-sizing: border-box;
}

.sales-document-form {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #0f172a;
  padding-bottom: 7rem;
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 0.75rem 1rem;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.back-button,
.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 1.125rem;
  font-weight: 700;
  flex: 1;
  text-align: center;
  margin: 0;
}

.help-button .material-symbols-outlined {
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin: 0 0 0 0.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Input Styles */
.search-input-wrapper {
  width: 100%;
  height: 3rem;
}

.input-container {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: stretch;
  border-radius: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.input-container:focus-within {
  ring: 2px solid #137fec;
  border-color: transparent;
}

.input-icon {
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 1rem;
  padding-right: 0.5rem;
}

.form-input {
  flex: 1;
  min-width: 0;
  background-color: transparent;
  border: none;
  outline: none;
  color: #0f172a;
  font-size: 1rem;
  padding: 0;
}

.form-input::placeholder {
  color: #94a3b8;
}

.input-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  border-left: 1px solid #e2e8f0;
}

.scanner-icon {
  color: #137fec;
  cursor: pointer;
}

/* Client Results List */
.client-results-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 60;
  max-height: 250px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.client-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.client-result-item:last-child {
  border-bottom: none;
}

.client-result-item:hover {
  background-color: #f8fafc;
}

.client-name-result {
  font-weight: 500;
  color: #0f172a;
  font-size: 0.9rem;
}

.client-ruc-result {
  font-size: 0.75rem;
  color: #64748b;
}

/* Details Grid */
.details-grid {
  display: flex;
  gap: 0.75rem;
}

.credit-grid {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.compact-info-card {
  padding: 0.5rem 0.75rem;
}

.compact-info-card .material-symbols-outlined {
  font-size: 1.25rem;
}

.compact-info-card .info-card-label {
  margin: 0;
  line-height: 1.2;
}

.discount-input {
  width: 3rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  padding: 0 0.25rem;
  text-align: right;
}

.form-field {
  flex: 1;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.375rem;
  margin-left: 0.25rem;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  appearance: none;
  border-radius: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  outline: none;
  cursor: pointer;
}

.form-select:focus {
  ring: 2px solid #137fec;
  border-color: transparent;
}

.select-icon {
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  color: #64748b;
}

.readonly-input {
  width: 100%;
  border-radius: 0.75rem;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.75rem 1rem;
  cursor: not-allowed;
}

/* Divider */
.section-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0.25rem 0;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #ffffff;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.remove-item-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 0;
}

.item-image {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.item-price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.item-price {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.item-quantity {
  font-size: 0.75rem;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.item-quantity:hover {
  background-color: #e2e8f0;
}

.add-item-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  color: #137fec;
  font-weight: 500;
  font-size: 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-item-button:hover {
  background-color: rgba(19, 127, 236, 0.1);
}

/* Payment & Logistics */
.subsection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-selector {
  display: flex;
  padding: 0.25rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
}

.payment-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-button:hover {
  color: #0f172a;
}

.payment-button.active {
  background-color: #137fec;
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-card {
  padding: 0.75rem;
  border-radius: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.info-card-label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
}

.info-card-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-primary {
  color: #137fec;
  font-size: 1.125rem;
}

.info-card-value {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.collector-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.collector-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.collector-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-size: cover;
  background-position: center;
}

.collector-details {
  display: flex;
  flex-direction: column;
}

.collector-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.collector-role {
  font-size: 0.75rem;
  color: #64748b;
}

/* Textarea */
.form-textarea {
  width: 100%;
  min-height: 100px;
  border-radius: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  outline: none;
}

.form-textarea:focus {
  ring: 2px solid #137fec;
  border-color: transparent;
}

.form-textarea::placeholder {
  color: #94a3b8;
}

/* Grid Layouts (Header & Footer) */
.footer-grid, .header-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .footer-grid, .header-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

/* Totals Summary */
.totals-summary {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-row.final {
  margin-bottom: 0;
}

.total-label {
  font-size: 0.875rem;
  color: #64748b;
}

.total-value {
  font-weight: 500;
}

.total-divider {
  height: 1px;
  background-color: #e2e8f0;
  width: 100%;
  margin-bottom: 1rem;
}

.total-label-final {
  font-size: 1.125rem;
  font-weight: 700;
}

.total-value-final {
  color: #137fec;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Bottom Actions */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1rem 1.5rem 1rem;
  z-index: 40;
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-button {
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: #f1f5f9;
  color: #64748b;
}

.icon-button:hover {
  background-color: #e2e8f0;
}

.cancel-button {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  background-color: transparent;
}

.cancel-button:hover {
  background-color: #f1f5f9;
}

.save-button {
  flex: 2;
  padding: 0.875rem 1.5rem;
  background-color: #137fec;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(19, 127, 236, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.save-button:hover {
  background-color: rgba(19, 127, 236, 0.9);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
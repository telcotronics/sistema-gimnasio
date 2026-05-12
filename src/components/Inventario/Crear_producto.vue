<template>
  <div class="relative flex flex-col h-screen w-full overflow-hidden max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-background-light shadow-2xl border-x border-border-light/30">
    <!-- Top Navigation Bar -->
    <header class="flex-none bg-surface-light px-4 md:px-6 lg:px-8 pt-12 md:pt-8 lg:pt-6 pb-3 flex items-center justify-between border-b border-border-light sticky top-0 z-20">
      <button class="flex items-center justify-center p-2 rounded-full hover:bg-background-light transition-colors -ml-2 text-text-primary" @click="goBack">
        <span class="material-symbols-outlined" style="font-size: 24px;">arrow_back_ios_new</span>
      </button>
      <div class="flex flex-col items-center">
        <h1 class="text-lg md:text-xl lg:text-2xl font-bold text-text-primary leading-tight">Crear Item</h1>
        <span class="text-xs md:text-sm font-medium text-text-secondary">Nuevo producto</span>
      </div>
      <button class="text-sm md:text-base font-bold text-text-secondary hover:text-primary transition-colors" @click="cancelar">
        Cancelar
      </button>
    </header>

    <!-- Main Scrollable Content -->
    <main class="flex-1 overflow-y-auto no-scrollbar pb-24">
      <!-- Tabs (Navigation) -->
      <div class="bg-surface-light sticky top-0 z-10 shadow-sm mb-4">
        <div class="flex overflow-x-auto no-scrollbar px-4 space-x-6 border-b border-border-light">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-button flex flex-col items-center pt-3 pb-2 border-b-2 min-w-[max-content]" 
            :class="activeTab === tab.id ? 'border-primary' : 'border-transparent hover:border-border-light'"
            @click="cambiarTab(tab.id)"
          >
            <span class="text-sm font-bold mb-1" :class="activeTab === tab.id ? 'text-primary' : 'text-text-secondary'">{{ tab.nombre }}</span>
          </button>
        </div>
      </div>

      <div class="px-4 md:px-6 lg:px-8 space-y-5">
        <!-- TAB: GENERAL -->
        <div v-show="activeTab === 'general'" id="tab-general" class="tab-content active">
          <!-- Section: Info Básica -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">info</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Información Básica</h3>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Name Input -->
              <div class="space-y-1.5 lg:col-span-2">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Nombre / Modelo</label>
                <input v-model="producto.nombre" class="w-full h-12 md:h-14 px-4 rounded-lg bg-background-light border-border-light text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary text-base" placeholder="Ej: IPHONE 13 PRO MAX" type="text"/>
              </div>
              <!-- Description Area -->
              <div class="space-y-1.5 lg:col-span-2">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Descripción Amplia</label>
                <textarea v-model="producto.descripcion" class="w-full h-24 md:h-32 p-4 rounded-lg bg-background-light border-border-light text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm" placeholder="Detalles técnicos, características..."></textarea>
              </div>
            </div>
          </section>

          <!-- Section: Códigos e Impuestos -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">qr_code_2</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Códigos e Impuestos</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
              <!-- Auto Code -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Código (Auto)</label>
                <input class="w-full h-11 md:h-12 px-3 rounded-lg bg-gray-100 border-transparent text-gray-500 text-sm font-medium cursor-not-allowed" disabled type="text" :value="producto.codigoAuto"/>
              </div>
              <!-- Aux Code -->
              <div class="space-y-1.5 relative">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Cod. Auxiliar</label>
                <div class="relative">
                  <input v-model="producto.codigoAuxiliar" class="w-full h-11 md:h-12 pl-3 pr-10 rounded-lg bg-background-light border-border-light text-text-primary focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium" type="text"/>
                  <button class="absolute right-0 top-0 h-11 md:h-12 w-10 flex items-center justify-center text-primary hover:bg-primary/5 rounded-r-lg" @click="escanearCodigo">
                    <span class="material-symbols-outlined" style="font-size: 20px;">barcode_scanner</span>
                  </button>
                </div>
              </div>
            </div>
            <!-- Code Preview Small -->
            <div class="mt-4 p-3 md:p-4 bg-background-light rounded-lg border border-dashed border-border-light flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="bg-white p-1 rounded border border-gray-200">
                  <span class="material-symbols-outlined text-black" style="font-size: 24px;">qr_code</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-text-secondary">Generado</span>
                  <span class="text-sm md:text-base font-bold text-text-primary">{{ producto.codigoGenerado }}</span>
                </div>
              </div>
              <button class="text-xs md:text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 md:py-2 rounded-md hover:bg-primary/20" @click="regenerarCodigo">
                Regenerar
              </button>
            </div>
          </section>

          <!-- Section: Imagen -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">image</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Imágenes</h3>
            </div>
            <div class="flex flex-col md:flex-row gap-4">
              <div class="size-20 md:size-32 lg:size-40 bg-background-light rounded-lg border border-border-light flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer mx-auto md:mx-0">
                <div class="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100" data-alt="Placeholder for no image available"></div>
                <span class="material-symbols-outlined text-gray-400 relative z-10" style="font-size: 28px;">image_not_supported</span>
              </div>
              <div class="flex flex-col md:flex-row gap-2 md:gap-3 flex-1">
                <button class="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg px-3 py-3 md:py-0 hover:bg-blue-700 transition-colors" @click="usarCamara">
                  <span class="material-symbols-outlined" style="font-size: 16px;">photo_camera</span>
                  Usar Cámara
                </button>
                <button class="flex-1 flex items-center justify-center gap-2 bg-white border border-border-light text-text-primary text-xs md:text-sm font-bold rounded-lg px-3 py-3 md:py-0 hover:bg-gray-50 transition-colors" @click="subirArchivo">
                  <span class="material-symbols-outlined" style="font-size: 16px;">upload_file</span>
                  Subir Archivo
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- TAB: CLASIFICACIÓN -->
        <div v-show="activeTab === 'clasificacion'" id="tab-clasificacion" class="tab-content">
          <!-- Section: Clasificación -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">category</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Clasificación</h3>
            </div>
            <div class="space-y-3 md:space-y-4">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Unidad</label>
                  <div class="relative">
                    <select v-model="producto.unidad" class="w-full h-11 md:h-12 pl-3 pr-8 appearance-none rounded-lg bg-background-light border-border-light text-text-primary text-sm font-medium">
                      <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
                    </select>
                    <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-base pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Tipo</label>
                  <div class="relative">
                    <select v-model="producto.tipo" class="w-full h-11 md:h-12 pl-3 pr-8 appearance-none rounded-lg bg-background-light border-border-light text-text-primary text-sm font-medium">
                      <option v-for="tipo in tipos" :key="tipo" :value="tipo">{{ tipo }}</option>
                    </select>
                    <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-base pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Categoría</label>
                  <div class="relative">
                    <select v-model="producto.categoria" class="w-full h-11 md:h-12 pl-3 pr-8 appearance-none rounded-lg bg-background-light border-border-light text-text-primary text-sm font-medium">
                      <option v-for="categoria in categorias" :key="categoria" :value="categoria">{{ categoria }}</option>
                    </select>
                    <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-base pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Marca</label>
                  <div class="relative">
                    <select v-model="producto.marca" class="w-full h-11 md:h-12 pl-3 pr-8 appearance-none rounded-lg bg-background-light border-border-light text-text-primary text-sm font-medium">
                      <option v-for="marca in marcas" :key="marca" :value="marca">{{ marca }}</option>
                    </select>
                    <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-base pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Flags de Publicación -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">flag</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Flags de Publicación y Control</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <!-- Toggle Item -->
              <div v-for="flag in flags" :key="flag.id" class="flex items-center justify-between p-3 md:p-4 rounded-lg bg-background-light border border-border-light">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary" style="font-size: 24px;">{{ flag.icono }}</span>
                  <span class="text-sm md:text-base font-medium text-text-primary">{{ flag.nombre }}</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="flag.activo" class="sr-only peer" type="checkbox"/>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <!-- TAB: PRECIOS -->
        <div v-show="activeTab === 'precios'" id="tab-precios" class="tab-content">
          <!-- Section: Costos -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">attach_money</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Costos y Precios</h3>
            </div>

            <!-- Checkbox Ver/Modificar Costos -->
            <div class="mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="habilitaCosto" type="checkbox" class="w-4 h-4 text-primary bg-background-light border-border-light rounded focus:ring-primary focus:ring-2"/>
                <span class="text-sm font-medium text-text-primary">Ver/Modificar Costos</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <!-- Costo Items -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Costo Items</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">$</span>
                  <input v-model.number="producto.costo" @input="calcularPrecios" class="w-full h-11 md:h-12 pl-8 pr-3 rounded-lg bg-background-light border-border-light text-text-primary font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary" type="number" placeholder="0.00"/>
                </div>
              </div>

              <!-- Utilidad % -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Utilidad. %.</label>
                <div class="relative">
                  <input v-model.number="producto.utilidadPorcentaje" @input="calcularPrecios" class="w-full h-11 md:h-12 pl-3 pr-8 rounded-lg bg-background-light border-border-light text-text-primary font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary" type="number" placeholder="0.00"/>
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">%</span>
                </div>
              </div>

              <!-- Ganancia $ -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Ganancia. $</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">$</span>
                  <input v-model.number="producto.ganancia" class="w-full h-11 md:h-12 pl-8 pr-3 rounded-lg bg-background-light border-border-light text-text-primary font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary" type="number" placeholder="0.00" readonly/>
                </div>
              </div>

              <!-- Precio Unit -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Precio Unit.</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">$</span>
                  <input v-model.number="producto.precioUnitario" class="w-full h-11 md:h-12 pl-8 pr-3 rounded-lg bg-background-light border-border-light text-text-primary font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary" type="number" placeholder="0.00" readonly/>
                </div>
              </div>

              <!-- Precio + IVA -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Precio + IVA</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">$</span>
                  <input v-model.number="producto.precioConIva" class="w-full h-11 md:h-12 pl-8 pr-3 rounded-lg bg-background-light border-border-light text-text-primary font-mono text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary" type="number" placeholder="0.00" readonly/>
                </div>
              </div>
            </div>

            <!-- Resumen Visual -->
            <div class="bg-primary/5 rounded-lg p-3 md:p-4 border border-primary/20 mt-5">
              <div class="flex flex-col md:flex-row justify-between md:items-center gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary" style="font-size: 20px;">info</span>
                  <span class="text-xs md:text-sm font-medium text-text-secondary">Los precios se calculan automáticamente según costos y utilidad</span>
                </div>
              </div>
            </div>
            <div class="space-y-2 md:space-y-3">
              <h4 class="text-sm md:text-base font-bold text-text-primary mb-2">Precios por Grupo</h4>
              <!-- Desktop Table View -->
              <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b-2 border-border-light">
                      <th class="text-left py-2 px-3 text-xs font-bold text-text-secondary uppercase tracking-wider">ID</th>
                      <th class="text-left py-2 px-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Grupo Precios</th>
                      <th class="text-right py-2 px-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Util %</th>
                      <th class="text-right py-2 px-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Precio</th>
                      <th class="text-right py-2 px-3 text-xs font-bold text-text-secondary uppercase tracking-wider">P+IVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="grupo in gruposPrecios" :key="grupo.id" class="border-b border-border-light/50 hover:bg-background-light/50">
                      <td class="py-3 px-3 text-text-secondary font-medium">{{ grupo.id }}</td>
                      <td class="py-3 px-3 font-bold text-text-primary">{{ grupo.nombre }}</td>
                      <td class="py-3 px-3 text-right font-mono text-text-primary">{{ grupo.utilidad }}</td>
                      <td class="py-3 px-3 text-right font-mono text-text-primary">${{ grupo.precio.toFixed(2) }}</td>
                      <td class="py-3 px-3 text-right font-mono font-bold text-primary">${{ grupo.precioIva.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Mobile Card View -->
              <div class="grid grid-cols-1 md:hidden gap-2 md:gap-3">
                <!-- Price Card Item -->
                <div v-for="grupo in gruposPrecios" :key="grupo.id" class="flex flex-col p-3 rounded-lg bg-background-light border border-border-light">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-text-secondary font-medium">ID: {{ grupo.id }}</span>
                        <span class="text-sm font-bold text-text-primary">{{ grupo.nombre }}</span>
                      </div>
                      <span class="text-xs text-text-secondary mt-1">Util: {{ grupo.utilidad }}%</span>
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="text-xs text-text-secondary">P+IVA</span>
                      <span class="text-base font-bold text-primary font-mono">${{ grupo.precioIva.toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs pt-2 border-t border-border-light/50">
                    <span class="text-text-secondary">Precio: <span class="font-mono text-text-primary">${{ grupo.precio.toFixed(2) }}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- TAB: IMPUESTOS -->
        <div v-show="activeTab === 'impuestos'" id="tab-impuestos" class="tab-content">
          <!-- Section: Selector de Impuesto -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">receipt_long</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Seleccionar Impuesto</h3>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Impuesto</label>
              <div class="relative">
                <select v-model="producto.impuestoSeleccionado" class="w-full h-12 md:h-14 pl-4 pr-10 appearance-none rounded-lg bg-background-light border-border-light text-text-primary focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium">
                  <option v-for="impuesto in impuestosOpciones" :key="impuesto" :value="impuesto">{{ impuesto }}</option>
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" style="font-size: 20px;">expand_more</span>
              </div>
            </div>
          </section>

          <!-- Section: Tabla de Impuestos -->
          <section class="bg-surface-light rounded-xl p-4 md:p-6 shadow-soft border border-border-light/40">
            <div class="flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary" style="font-size: 20px;">table_chart</span>
              <h3 class="text-base md:text-lg font-bold text-text-primary">Tabla de Impuestos</h3>
            </div>

            <!-- Desktop Table View -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead class="bg-background-light">
                  <tr>
                    <th class="text-left py-3 px-3 md:px-4 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-light">Id</th>
                    <th class="text-left py-3 px-3 md:px-4 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-light">Nombre</th>
                    <th class="text-center py-3 px-3 md:px-4 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-light">Código</th>
                    <th class="text-center py-3 px-3 md:px-4 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-light">Código %</th>
                    <th class="text-center py-3 px-3 md:px-4 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-light">Tarifa %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="impuesto in tablaImpuestos" :key="impuesto.id" class="hover:bg-background-light/50">
                    <td class="py-3 px-3 md:px-4 text-text-secondary font-medium border border-border-light">{{ impuesto.id }}</td>
                    <td class="py-3 px-3 md:px-4 font-medium text-text-primary border border-border-light">{{ impuesto.nombre }}</td>
                    <td class="py-3 px-3 md:px-4 text-center font-mono text-text-primary border border-border-light">{{ impuesto.codigo }}</td>
                    <td class="py-3 px-3 md:px-4 text-center font-mono text-text-primary border border-border-light">{{ impuesto.codigoPorcentaje }}</td>
                    <td class="py-3 px-3 md:px-4 text-center font-mono font-bold text-primary border border-border-light">{{ impuesto.tarifa }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="h-8"></div>
      </div>
    </main>

    <!-- Sticky Footer Action -->
     <footer class="flex-none bg-surface-light border-t border-border-light px-4 md:px-6 lg:px-8 py-3 md:py-4 pb-6 md:pb-8 z-20">
      <div class="flex gap-3 md:gap-4 max-w-2xl mx-auto">
        <button class="flex-1 bg-primary text-white h-12 md:h-14 rounded-lg font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-blue-700 transition-colors" @click="guardarProducto">
          <span class="material-symbols-outlined">save</span>
          Guardar Producto
        </button>
        <button class="size-12 md:size-14 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" @click="eliminarProducto">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'CrearItemProducto',
  data() {
    return {
      activeTab: 'general',
      habilitaCosto: true,
      tabs: [
        { id: 'general', nombre: 'General' },
        { id: 'clasificacion', nombre: 'Clasificación' },
        { id: 'precios', nombre: 'Precios' },
        { id: 'impuestos', nombre: 'Impuestos' }
      ],
      producto: {
        nombre: '',
        descripcion: '',
        codigoAuto: 'PXF0001',
        codigoAuxiliar: '00000111',
        codigoGenerado: 'TCA00424A1',
        unidad: 'LIBRA',
        tipo: 'PRODUCTO',
        categoria: 'ELECTRÓNICA DE CONSUMO',
        marca: 'GENÉRICO',
        costo: 0,
        utilidadPorcentaje: 0,
        ganancia: 0,
        precioUnitario: 0,
        precioConIva: 0,
        impuestoSeleccionado: 'Ventas sin IVA 0%'
      },
      flags: [
        { id: 1, nombre: 'Lleva Seriado', icono: 'verified_user', activo: true },
        { id: 2, nombre: 'Publicar Web', icono: 'language', activo: false },
        { id: 3, nombre: 'Publicar Facebook', icono: 'facebook', activo: false },
        { id: 4, nombre: 'Publicar WhatsApp', icono: 'chat', activo: false },
        { id: 5, nombre: 'Control Caducidad', icono: 'event_busy', activo: false }
      ],
      unidades: ['LIBRA', 'UNIDAD', 'KG'],
      tipos: ['PRODUCTO', 'SERVICIO'],
      categorias: ['ELECTRÓNICA DE CONSUMO', 'HOGAR', 'OFICINA'],
      marcas: ['GENÉRICO', 'APPLE', 'SAMSUNG'],
      impuestosOpciones: ['Ventas sin IVA 0%', 'IVA 12%', 'IVA 15%'],
      gruposPrecios: [
        { id: 2, nombre: 'PUBLICO', utilidad: 100, precio: 0, precioIva: 0 },
        { id: 5, nombre: 'TECNICOS', utilidad: 750.00, precio: 0, precioIva: 0 },
        { id: 6, nombre: 'X_MAYOR', utilidad: 300.0, precio: 0, precioIva: 0 },
        { id: 7, nombre: 'VENTAS_WEB', utilidad: 800.0, precio: 0, precioIva: 0 }
      ],
      tablaImpuestos: [
        { id: 1, nombre: 'Ventas sin IVA', codigo: 2, codigoPorcentaje: 0, tarifa: 0 },
        { id: 2, nombre: 'Ventas con IVA', codigo: 2, codigoPorcentaje: 2, tarifa: 12 },
        { id: 3, nombre: 'Ventas con IVA', codigo: 2, codigoPorcentaje: 3, tarifa: 14 },
        { id: 4, nombre: 'Ventas con IVA', codigo: 2, codigoPorcentaje: 4, tarifa: 15 },
        { id: 5, nombre: 'Ventas con IVA', codigo: 2, codigoPorcentaje: 5, tarifa: 5 },
        { id: 6, nombre: 'No Objeto de Impuesto', codigo: 2, codigoPorcentaje: 7, tarifa: 0 },
        { id: 7, nombre: 'Exento de IVA', codigo: 2, codigoPorcentaje: 8, tarifa: 0 },
        { id: 8, nombre: 'IVA diferenciado', codigo: 2, codigoPorcentaje: 9, tarifa: 0 }
      ]
    };
  },
  methods: {
    cambiarTab(tabId) {
      this.activeTab = tabId;
    },
    goBack() {
      console.log('Volver atrás');
    },
    cancelar() {
      console.log('Cancelar');
    },
    escanearCodigo() {
      console.log('Escanear código de barras');
    },
    regenerarCodigo() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let codigo = 'TCA';
      for (let i = 0; i < 8; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.producto.codigoGenerado = codigo;
    },
    usarCamara() {
      console.log('Usar cámara');
    },
    subirArchivo() {
      console.log('Subir archivo');
    },
    calcularPrecios() {
      const costo = this.producto.costo || 0;
      const utilidad = this.producto.utilidadPorcentaje || 0;
      
      this.producto.ganancia = (costo * utilidad) / 100;
      this.producto.precioUnitario = costo + this.producto.ganancia;
      this.producto.precioConIva = this.producto.precioUnitario * 1.12;

      this.gruposPrecios.forEach(grupo => {
        const gananciaGrupo = (costo * grupo.utilidad) / 100;
        grupo.precio = costo + gananciaGrupo;
        grupo.precioIva = grupo.precio * 1.12;
      });
    },
    guardarProducto() {
      console.log('Guardar producto:', this.producto);
    },
    eliminarProducto() {
      console.log('Eliminar producto');
    }
  }
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Sans:wght@400;500;700&display=swap');

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

body {
  min-height: max(884px, 100dvh);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}
</style>
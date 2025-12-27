<!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <a 
        v-for="item in navItems.slice(0, 2)" 
        :key="item.id" 
        :class="['nav-item', { active: activeNav === item.id }]"
        @click.prevent="activeNav = item.id"
        href="#"
      >
        <span class="material-symbols-outlined" :class="{ filled: activeNav === item.id }">
          {{ item.icon }}
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </a>

      <div class="fab-container">
        <button class="fab" @click="handleAddAction">
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>

      <a 
        v-for="item in navItems.slice(2)" 
        :key="item.id" 
        :class="['nav-item', { active: activeNav === item.id }]"
        @click.prevent="activeNav = item.id"
        href="#"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>
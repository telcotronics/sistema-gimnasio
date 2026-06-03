import Vue from 'vue'
// FIX COMPILACIÓN (2026-06-03): Se cambió 'vuetify/lib' a 'vuetify'
// para usar el bundle pre-compilado en ES5, ya que Webpack 3 excluye node_modules
// del procesamiento de babel-loader y fallaba al parsear desestructuraciones ES6.
import Vuetify from 'vuetify'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary:    '#13ec13',
        secondary:  '#9ca3af',
        accent:     '#13ec13',
        error:      '#ef4444',
        warning:    '#f59e0b',
        info:       '#3b82f6',
        success:    '#13ec13',
        background: '#102210',
        surface:    '#1c2e1c',
      }
    }
  }
})

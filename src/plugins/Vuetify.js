import Vue from 'vue'
import Vuetify from 'vuetify/lib'

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

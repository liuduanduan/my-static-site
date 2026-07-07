import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import GlossaryExplorer from './components/GlossaryExplorer.vue'
import WorksExplorer from './components/WorksExplorer.vue'
import RandomEntry from './components/RandomEntry.vue'
import ReadingProgress from './components/ReadingProgress.vue'

const theme: Theme = {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress)
    })
  },
  enhanceApp({ app }) {
    app.component('GlossaryExplorer', GlossaryExplorer)
    app.component('WorksExplorer', WorksExplorer)
    app.component('RandomEntry', RandomEntry)
  }
}

export default theme

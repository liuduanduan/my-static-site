import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import AiDirectory from './components/AiDirectory.vue'
import ToolDetail from './components/ToolDetail.vue'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AiDirectory', AiDirectory)
    app.component('ToolDetail', ToolDetail)
  }
}

export default theme

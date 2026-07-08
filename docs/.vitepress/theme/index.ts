import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import GlossaryExplorer from './components/GlossaryExplorer.vue'
import WorksExplorer from './components/WorksExplorer.vue'
import RandomEntry from './components/RandomEntry.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import RmjiRealmMaps from './components/RmjiRealmMaps.vue'
import NascentSoulScene from './components/NascentSoulScene.vue'
import NascentSoulHeroImage from './components/NascentSoulHeroImage.vue'

const theme: Theme = {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress),
      'home-hero-image': () => h(NascentSoulHeroImage),
      'home-hero-after': () => h(NascentSoulScene)
    })
  },
  enhanceApp({ app }) {
    app.component('GlossaryExplorer', GlossaryExplorer)
    app.component('WorksExplorer', WorksExplorer)
    app.component('RandomEntry', RandomEntry)
    app.component('RmjiRealmMaps', RmjiRealmMaps)
    app.component('NascentSoulScene', NascentSoulScene)
    app.component('NascentSoulHeroImage', NascentSoulHeroImage)
  }
}

export default theme

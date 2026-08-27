import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import AiDirectory from './components/AiDirectory.vue'
import ToolDetail from './components/ToolDetail.vue'
import ToolSubmissionForm from './components/ToolSubmissionForm.vue'
import SubmissionStatus from './components/SubmissionStatus.vue'
import SponsoredTools from './components/SponsoredTools.vue'
import AffiliateAction from './components/AffiliateAction.vue'
import ToolStructuredData from './components/ToolStructuredData.vue'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AiDirectory', AiDirectory)
    app.component('ToolDetail', ToolDetail)
    app.component('ToolSubmissionForm', ToolSubmissionForm)
    app.component('SubmissionStatus', SubmissionStatus)
    app.component('SponsoredTools', SponsoredTools)
    app.component('AffiliateAction', AffiliateAction)
    app.component('ToolStructuredData', ToolStructuredData)
  }
}

export default theme

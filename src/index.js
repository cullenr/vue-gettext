import './object-assign-polyfill.js'

import Component from './component.js'
import Directive from './directive.js'
import Config from './config.js'
import interpolate from './interpolate.js'
import Override from './override.js'
import translate from './translate.js'
import { shareVueInstance } from './localVue.js'


let languageVm  // Singleton.

let GetTextPlugin = function (Vue, options = {}) {

  let defaultConfig = {
    availableLanguages: { en_US: 'English' },
    defaultLanguage: 'en_US',
    languageVmMixin: {},
    silent: Vue.config.silent,
    translations: null,
  }

  Object.keys(options).forEach(key => {
    if (Object.keys(defaultConfig).indexOf(key) === -1) {
      throw new Error(`${key} is an invalid option for the translate plugin.`)
    }
  })

  if (!options.translations) {
    throw new Error('No translations available.')
  }

  options = Object.assign(defaultConfig, options)

  languageVm = new Vue({
    created: function () {
      // Non-reactive data.
      this.available = options.availableLanguages
    },
    data: {
      current: options.defaultLanguage,
    },
    mixins: [options.languageVmMixin],
  })

  shareVueInstance(Vue)

  Override(Vue, languageVm)

  Config(Vue, languageVm, options.silent)

  // Makes <translate> available as a global component.
  Vue.component('translate', Component)

  // An option to support translation with HTML content: `v-translate`.
  Vue.directive('translate', Directive)

  // Exposes global properties.
  Vue.$translations = options.translations
  // Exposes instance methods.
  Vue.prototype.$gettext = translate.gettext.bind(translate)
  Vue.prototype.$pgettext = translate.pgettext.bind(translate)
  Vue.prototype.$ngettext = translate.ngettext.bind(translate)
  Vue.prototype.$npgettext = translate.npgettext.bind(translate)
  Vue.prototype.$gettextInterpolate = interpolate.bind(interpolate)

}

export default GetTextPlugin

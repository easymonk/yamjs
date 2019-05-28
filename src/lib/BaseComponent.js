import init from './init'
import lifeCycle from './init/lifeCycle'
import { Mix } from './init/mix'
import { getStyleStr, toCamelCase, getCallFnName } from './utils'
import BaseCustomElements from './BaseCustomElements'
import { HTML_TAGS } from './vDom/creatConfig'
var comps = window.comps = {}
// var _runfn_ = window._runfn_ = window._runfn_ || {}
let compsIds = 0
@Mix()
class BaseComponent {
  constructor () {
    this._config()
    // console.log(new.target)
    comps[this._eid + ++compsIds] = this
    // console.log('BaseComponent', isCustomElements)
  }
  __getProps (props) {
    this.__props = props
  }
  __connectedCallback (isRenderIn) {
    init(this, isRenderIn)
    this.$connectedCallback && this.$connectedCallback()
  }
  __disconnectedCallback () {
    console.log('disconnectedCallback')
    // 取消 监听
    // this.mutation.disconnect()
    this.isUnset = true
    lifeCycle.destroyed(this)
  }
  __beforeDisconnectedCallback () {
    console.log('disconnectedCallback')
    // 取消 监听
    // this.mutation.disconnect()
    lifeCycle.beforeDestroyed(this)
  }
  // 会被覆盖的方法
  $config () {
    return {

    }
  }
  // 会被覆盖的方法
  $data () {
    return {}
  }
  // 会被覆盖的方法
  $updated () {
  }
  // 渲染
  renderAt (el) {
    if (!this.isCustomElements) {
      this.elm = typeof el === 'string' ? document.querySelector(el) : el
      this.__connectedCallback(true)
    }
  }
  // 手动更新方法
  update () {

  }
  // 执行方法
  emit (fnName, ...params) {
    if (!fnName) {
      console.warn(`需要传入方法名`)
      return
    }
    return (typeof this[fnName] === 'function' ? this[fnName](...params) : (() => {
      console.warn(`该组件【${this._tagName}】没有这个方法:【${fnName}】`)
    })(...params))
  }
  // 触发父级方法
  emitProp (fnName, ...params) {
    if (!fnName) {
      console.warn(`需要传入方法名`)
      return
    }
    if (this.props) {
      if (typeof this.props[fnName] === 'function') {
        return this.props[fnName](...params)
      } else {
        console.warn(`该组件【${this._tagName}】没有接收到父组件的传值:【${fnName}】`)
        return null
      }
    } else {
      // 根组件 this.elm.getAttribute(fnName)
      let fn = getCallFnName(this, fnName)
      let runfn = window[fn] || (this.elm['_runfn_'] ? this.elm['_runfn_'][fn] : null)
      if (fn && typeof runfn === 'function') {
        return runfn(...params)
      } else {
        console.warn(`该元素上【${this._tagName}】没有接收到父组件的传值:【${fnName}${fn}】`)
      }
    }
    return null
  }
}

export default BaseComponent
// 注解
export function Component (Config) {
  let { tagName, shadow, style, props, customElements, canBeCalledExt } = Config
  return function (Target) {
    Target._tagName = tagName
    Target._shadow = !!shadow
    Target.prototype._config = function () {
      this._tagName = tagName
      this._name = toCamelCase(tagName)
      this._shadow = !!shadow || false
      this._props = props || []
      this._canBeCalledExt = typeof canBeCalledExt === 'boolean' ? canBeCalledExt : false
      this._eid = 'com_' + tagName
      this._style = getStyleStr(this._eid, style)
      // if (typeof customElements === 'undefined') {
      //   this.isCustomElements = true
      // }
      // console.log('this._style', this._style)
    }
    if (!HTML_TAGS[tagName]) {
      HTML_TAGS[tagName] = {
        name: tagName,
        isComponent: true,
        class: Target
      }
    }
    if (customElements || typeof customElements === 'undefined') {
      Target.customElements = true
      try {
        window.customElements.define(tagName, BaseCustomElements(Target))
      } catch (e) {
        console.log('e', e)
      }
    } else {
      Target.customElements = false
    }
  }
}

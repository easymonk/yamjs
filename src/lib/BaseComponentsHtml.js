import init from './init'
import { Mix } from './init/mix'
import { getStyleStr } from './utils'
var comps = window.comps = {}
@Mix()
// eslint-disable-next-line
class Owl extends HTMLElement {
  constructor () {
    super()
    this._config()
    comps[this._cid] = this
    // console.log('Owl', this._style)
  }
  connectedCallback () {
    init(this)
    this.$connectedCallback && this.$connectedCallback()
  }
  disconnectedCallback () {
    console.log('disconnectedCallback')
    // 取消 监听
    this.mutation.disconnect()
    this.isUnset = true
  }
  // 会被覆盖的方法
  $config () {
    return {

    }
  }
  // 会被覆盖的方法
  $data () {
    return {
    }
  }
  // 会被覆盖的方法
  $updated () {
  }
}
export default Owl
// 注解
export function Component (Config) {
  let { tagName, shadow, style, props } = Config
  return function (Target) {
    Target._tagName = tagName
    Target._shadow = !!shadow
    Target.prototype._config = function () {
      this._tagName = tagName
      this._shadow = !!shadow
      this._props = props || []
      this._cid = 'com-' + tagName
      this._style = getStyleStr(this._cid, style)
      // console.log('this._style', this._style)
    }
    try {
      window.customElements.define(tagName, Target)
    } catch (e) {
      console.log('e', e)
    }
  }
}

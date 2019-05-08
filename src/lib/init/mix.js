import { createElementJson } from '../vDom/createElement'
// 注解
// 预留字段
var reserved = 'constructor __createElement connectedCallback $connectedCallback disconnectedCallback $config $data mutation render'
// 安装的扩展
var installed = []
export function Mix () {
  return function (Target) {
    Target.__createElement = (tagName, props = {}, ...childNodes) => {
      // childNodes = childNodes.length ? childNodes : undefined
      return createElementJson(tagName, props, childNodes)
    }
    Target.use = (Config) => {
      /**
       * obj={
       *  name:'',
       * install:function(baseConpoment){}
       * }
       *  */
      let { name, install } = Config
      if (!name) {
        console.warn(`
            必须填写name
          `)
        return false
      }
      if (typeof install !== 'function') {
        console.warn(`
            install 必须是个方法
          `)
        return false
      }
      if (installed.includes(name)) {
        console.info(`已经注册此扩展:${name}`)
      } else {
        installed.push(name)
        install(addPrototype(Target))
      }
    }
  }
}
function addPrototype (Target) {
  return {
    addPrototype (type, fn) {
      if (reserved.includes(type)) {
        console.warn(`
        方法名：${type} 为预留字段，请修改
        `)
        return false
      }
      Target.prototype[type] = fn
    }
  }
}
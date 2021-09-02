/**
 * 实现一个webpack原型
 */

const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const Parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

// 便于统一相对路径
let root = process.cwd()

// 分析模块依赖
const readModule = (filePath) => {
  const relativePath = './' + path.relative(root, path.resolve(filePath))
  const code = fs.readFileSync(filePath, 'utf-8')
  const ast = Parser.parse(code)

  const deps = []
  traverse(ast, {
    CallExpression(nodePath) {
      const node = nodePath.node
      // 确认是require引入
      if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
        // require修改为__webpack__require
        node.callee.name = '__webpack__require'
        const arg = node.arguments[0]
        if (arg.type === 'StringLiteral') {
          let moduleName = arg.value
          moduleName += path.extname(moduleName) ? '' : '.js'
          moduleName = path.join(path.dirname(filePath), moduleName)
          moduleName = './' + path.relative(root, moduleName)
          arg.value = moduleName
          // 依赖收集
          deps.push(moduleName)
        }
      }
    }
  })

  const { code: newCode } = babel.transformFromAstSync(ast)
  
  return {
    relativePath,
    deps,
    code: newCode,
  }
}

// 递归收集依赖树
const findAllModule = (entry) => {
  const entryModule = readModule(entry)
  const tree = []
  tree.push(entryModule)
  for (const target of tree) {
    target.deps.forEach(dep => {
      const module = readModule(dep)
      tree.push(module)
    })
  }
  return tree
}

const generate = (tree, entry) => {

  const moduleArr = tree.map(module => {
    return `"${module.relativePath}": (module, exports, __webpack__require) => {
      eval(\`${module.code}\`)
    }`
  })

  const output = `;(() => {
    var modules = {
      ${moduleArr.join(',\n')}
    }
    var modules_cache = {}
    var __webpack__require = function(moduleId) {
      if (modules_cache[moduleId]) return modules_cache[moduleId].exports

      var module = modules_cache[moduleId] = {
        exports: {}
      }
      modules[moduleId](module, module.exports, __webpack__require)
      return module.exports
    }

    __webpack__require('${entry}')
  })()`

  return output
}

const run = (params) => {
  const { entry, dist } = params
  const tree = findAllModule(entry)
  const output = generate(tree, entry)
  fs.writeFileSync(dist, output)
}

module.exports = {
  minipack: run
}

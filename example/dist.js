(() => {
  var modules = {
    "./example/index.js": (module, exports, __webpack__require) => {
      eval(`// test
const printA = __webpack__require("./example/a.js");

printA();`);
    },
    "./example/a.js": (module, exports, __webpack__require) => {
      eval(`const printB = __webpack__require("./example/b.js");

module.exports = function printA() {
  console.log('module a!');
  printB();
};`);
    },
    "./example/b.js": (module, exports, __webpack__require) => {
      eval(`module.exports = function printB() {
  console.log('module b!');
};`);
    },
  };
  var modules_cache = {};
  var __webpack__require = function (moduleId) {
    if (modules_cache[moduleId]) return modules_cache[moduleId].exports;

    var module = (modules_cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, __webpack__require);
    return module.exports;
  };

  __webpack__require("./example/index.js");
})();

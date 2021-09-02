const { minipack } = require('../index.js')

// 入口文件为example/index.js 目标文件为 example/dist.js
minipack({ entry: './example/index.js', dist: './example/dist.js' })

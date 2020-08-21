var express = require('express')
var cors = require('cors')
var articleController = require('./api/article')

var app = express()
var router = express.Router()

// 获取文章列表
router.get('/articles', articleController.index)

// routes
app.use('/api', cors(), router)

app.listen(9091, function() {
  console.log('api_router is running at port 9091')
})
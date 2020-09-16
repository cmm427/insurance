// var zqrb = require('./spider/zqrb_spider')
// var jrj = require('./spider/jrj_spider')
// var sinoins = require('./spider/sinoins_spider')
// var lanjinger = require('./spider/lanjinger_spider')
var azhihuibao = require('./spider/azhihuibao_spider')

var spider = function () {
  // zqrb.zqrb_spider()
  // jrj.jrj_spider()
  // sinoins.sinoins_spider()
  // lanjinger.lanjinger_spider()
  azhihuibao.azhihuibao_spider()
}

spider()
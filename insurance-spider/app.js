// var zqrb = require('./spider/zqrb_spider')
var jrj = require('./spider/jrj_spider')
// var sinoins = require('./spider/sinoins_spider')

var spider = function () {
  // zqrb.zqrb_spider()
  jrj.jrj_spider()
  // sinoins.sinoins_spider()
}

spider()
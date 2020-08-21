exports.formatDate = function (nows) {
  var now = new Date(nows)
  var year = now.getFullYear()
  var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
  var date = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
  var hour = now.getHours()
  var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
  var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()
  return (
      year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
  )
}


// 格式化日期-月份：202008
exports.formatMonth = function (nows) {
  var now = new Date(nows)
  var year = now.getFullYear()
  var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
  return (
    year + month + ''
  )
}


// 格式化日期-天: 20200818
exports.formatDay = function (nows) {
  var now = new Date(nows)
  var year = now.getFullYear()
  var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
  var date = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
  return (
    year + month + date + ''
  )
}


// 休眠
var sleep = function (interval) {
  return new Promise(function(resolve) {
      setTimeout(resolve, interval)
  })
}


// 顺序队列任务
exports.asyncQueueTask = async function (arr, fn) {
  var resList = []
  for (let i = 0, l = arr.length; i < l; i++) {
    fn(arr[i]).then(function (x) {
      if (Array.isArray(x)) {
        resList = [...resList, ...x]
      } else {
        resList.push(x)
      }
    })
    await sleep(3000)
  }
  return resList
}


exports.sleep = sleep
export function timeAgo (timeStr) {
  var timestamp = parseInt(new Date(timeStr + '').getTime())
  var created = new Date(timestamp)
  var fullYear = created.getFullYear()
  var month = created.getMonth() + 1
  var day = created.getDate()
  var timeDistance = new Date().getTime() - timestamp
  var minuteDistance = Math.round(Math.abs(timeDistance) / 1000 / 60)
  if (minuteDistance <= 1) {
    return '刚刚'
  } else if (minuteDistance >= 2 && minuteDistance <= 59) {
    return minuteDistance + ' 分钟前'
  } else if (minuteDistance >= 60 && minuteDistance <= 1439) {
    return (Math.round(minuteDistance / 60)) + ' 小时前'
  } else if (minuteDistance >= 1440 && minuteDistance <= 2879) {
    return '昨天'
  } else if (minuteDistance >= 2880 && minuteDistance <= 4319) {
    return '前天'
  } else if (new Date().getFullYear() === fullYear) {
    return month + ' 月 ' + day + ' 日 '
  } else {
    return fullYear + ' 年 ' + month + ' 月 ' + day + ' 日'
  }
}

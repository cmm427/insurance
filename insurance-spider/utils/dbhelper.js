var mysql = require('mysql')
var utils = require('./index')


// sql 语句
const objSQL = {
  addSQL: 'insert into articles (title, url, content, source, created, creator, updatetime) values(?,?,?,?,?,?,?)',
  querySQL: 'select 1 from articles where url = ? limit 1'
}


const option = {
  host: '',
  user: '',
  password: '',
  port: '',
  database: ''
}

// 创建数据库连接池
const pool = mysql.createPool(option)

var dbOperation = function (sql ,values) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, function (err, rows) {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}


// 检查表中是否已存在该文章
var haveArticle = function (item) {
  console.log('check: ' + item)
  const querySql = objSQL.querySQL
  const values = [item]
  var result = dbOperation(querySql, values)
  return result
}


// 筛选出数据库中不存在的文章列表
var filterArticle = async function (arr) {
  var newArr = []
  for (let i = 0, l = arr.length; i < l; i++) {
    haveArticle(arr[i]).then(function (data) {
      if (data.length === 0) {
        newArr.push(arr[i])
      }
    })
    await utils.sleep(50)
  }
  return newArr
} 


// 根据文章详情列表，筛选出数据库中不存在的详情列表
var filterArticleDetails = async function (arrDetails) {
  var newArrDetails = []
  for (let i = 0, l = arrDetails.length; i < l; i++) {
    haveArticle(arrDetails[i].target).then(function (data) {
      if (data.length === 0) {
        newArrDetails.push(arrDetails[i])
      }
    })
    await utils.sleep(50)
  }
  return newArrDetails
}

exports.objSQL = objSQL
exports.dbOperation = dbOperation
exports.filterArticle = filterArticle
exports.filterArticleDetails = filterArticleDetails
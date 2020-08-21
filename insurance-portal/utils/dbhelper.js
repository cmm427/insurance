var mysql = require('mysql')

const option = {
  host: '',
  user: '',
  password: '',
  port: '',
  database: ''
}

// 创建数据库连接池
const pool = mysql.createPool(option)

exports.addValue = function (sql ,values) {
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
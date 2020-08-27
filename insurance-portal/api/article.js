var dbhelper = require('../utils/dbhelper')

var index = function (req, res, next) {
  var offset = parseInt(req.query.offset, 10) || 0
  var limit = parseInt(req.query.limit, 10) || 20
  const sql = 'select * from articles order by created desc limit ?, ?'
  const values = [offset, limit]
  dbhelper.addValue(sql, values).then(function (rows) {
    res.send({
      success: true,
      data: rows
    })
  })
}

exports.index = index
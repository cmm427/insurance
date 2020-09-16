var axios = require('axios')
var url = require('url')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')


// A智慧保
var aUserId = '8954933447'
var aUrl = 'https://xueqiu.com/u/8954933447'
var apiUrl = 'https://xueqiu.com/v4/statuses/user_timeline.json'
var xueqiu_user_id = ''
var sourceStr = '雪球'
var creatorStr = 'A智慧保'

var headers = {
  Host: 'xueqiu.com',
  Cookie: ''
}

// 获取页数
var getPageNums = function () {
  console.log('getPageNums: ' + aUrl)
  return new Promise(function(resolve, reject) {
    axios.get(apiUrl, {
      headers: headers,
      params: {
        page: '1',
        user_id: aUserId,
        _: xueqiu_user_id
      }
    })
    .then(res => {
      var pageNums = res.data.maxPage
      return resolve(pageNums)
    })
    .catch(err => {
      reject(err)
    })
  })
}

// 获取文章详情列表
var getArticleDetail = function (page) {
  console.log('getArticleDetail: ' + page)
  return new Promise(function(resolve, reject) {
    axios.get(apiUrl, {
      headers: headers,
      params: {
        page: page,
        user_id: aUserId,
        _: xueqiu_user_id
      }
    })
    .then(res => {
      res.data.statuses.forEach(element => {
        console.log(element.id, element.title)
        element.target = url.resolve(aUrl, element.target)
      });
      resolve(res.data.statuses)
    })
    .catch(err => {
      reject(err)
    })
  })
}

exports.azhihuibao_spider = async function () {
  try {
    var nums = await getPageNums()
    console.log(nums)
    var pages = []
    for(let i = 0; i < parseInt(nums); i++) {
      pages[i] = i + 1
    }
    var details = await utils.asyncQueueTask(pages, getArticleDetail)
    var newDetails = await dbhelper.filterArticleDetails(details)
    const addSql = dbhelper.objSQL.addSQL
    newDetails.map(item => {
      var values = [item.title, item.target, item.description, sourceStr, utils.formatDate(item.created_at), creatorStr, utils.formatDate(Date())]
      console.log(values)
      dbhelper.dbOperation(addSql, values)
    })
  } catch (err) {
    console.log(err)
  }
}
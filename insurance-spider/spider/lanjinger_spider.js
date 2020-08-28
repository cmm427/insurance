var axios = require('axios')
var cheerio = require('cheerio')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')
var url = require('url')


// 蓝鲸保险频道
var lanjingerHomeUrl = 'https://m.lanjinger.com/c/18'
var lanjingerApiUrl = 'https://m.lanjinger.com/wap_api/v1/h5/news'
var lanjingerDetailApiUrl = 'https://m.lanjinger.com/wap_api/v1/h5/news/detail'

var extension = '{"mobile_models":null,"os":null,"os_version":"","soft_version":"","net_type":0,"app":"lanjing","cuid":"","channel":"","sign":"","app_key":"","app_secret":"","platform":"web"}'


// 根据入口url，获取请求页面列表
var getHomePageUrls = function () {
  console.log('getHomePageUrls: ')
  var articleUrls = []

  // 获取首页链接
  return new Promise( (resolve, reject) => {
    axios.get(lanjingerHomeUrl)
    .then(res => {
      var $ = cheerio.load(res.data)
      $('a[class=lj-news-item-article]').each(function (idx, element) {
        var $element = $(element)
        var article = url.resolve(lanjingerHomeUrl, $element.attr('href'))
        console.log(idx, article)
        articleUrls.push(article)
      })
      return resolve(articleUrls)
    })
    .catch(err => {
      reject(err)
    })
  })
}


// 顺序任务队列
var asyncTask = async function (fuc) {
  var articleUrls = []
  // 页数，只获取 pageNums 页的数据
  var pageNums = 50
  // 首次偏移量从10开始，后续请求根据上个请求返回的偏移量开始
  var last_id = 10
  var last_time = new Date().getTime()
  for (let i = 0; i < pageNums; i++) {
    var now = new Date()
    var params = {
      _ts: Math.round(now / 1000),
      channel: 18,
      last_time: last_time,
      last_id: last_id,
      rn: 10,
      refresh_type: 1
    }
    console.log(JSON.stringify(params))
    fuc(params).then(item => {
      articleUrls = [...articleUrls, ...item.articles]
      last_id = item.last_id
      last_time = item.last_time
    })
    await utils.sleep(5000)
  }
  return articleUrls
}


// 获取下一页页面链接
// 返回页面链接，last_id，last_time 供下次调用
var getNextPageUrls = function (params) {
  console.log('getNextPageUrls: ')
  var articleUrls = []
  return new Promise((resolve, reject) => {
    axios.get(lanjingerApiUrl, {
      params: params,
      headers: {
        'extension': extension
      }
    })
    .then(res => {
      res.data.data.list.map(item => {
        var article = url.resolve(lanjingerHomeUrl, '/d/' + item.id)
        articleUrls.push(article)
        console.log(article)
      })
      return resolve({
        articles: articleUrls,
        last_id: res.data.data.last_id,
        last_time: res.data.data.last_time
      })
    })
    .catch(err => {
      reject(err)
    })
  })
}


// 获取每篇文章详情
var getArticleDetail = function (article) {
  console.log('getArticleDetail: ' + article)
  var id = article.split('/').pop()
  var newUrl = lanjingerDetailApiUrl + '/' + id
  var articleInfo = {
    title: null,
    href: null,
    content: null,
    source: null,
    createdAt: null,
    creator: null,
  }
  return new Promise(function (resolve, reject) {
    axios.get(newUrl, {
      params: {
        _ts: Math.round(new Date() / 1000)
      },
      headers: {
        'extension': extension
      }
    })
    .then(res => {
      var item = res.data.data
      articleInfo.title = item.title
      articleInfo.href = article
      articleInfo.content = item.describe
      articleInfo.source = item.author.split(' ')[0] || ''
      articleInfo.createdAt = utils.formatDate(new Date(parseInt(item.update_time + '000')))
      articleInfo.creator = item.author.split(' ')[1] || ''
      console.log('Detail: ' + JSON.stringify(articleInfo))
      return resolve(articleInfo)
    })
    .catch(err => {
      reject(err)
    })
  })
}


exports.lanjinger_spider = async function () {
  try {
    // var homeArticles = await getHomePageUrls()
    var nextArticles = await asyncTask(getNextPageUrls)
    var articles = nextArticles
    var newArticles = await dbhelper.filterArticle(articles)
    console.log(newArticles)
    var articleDetailList = await utils.asyncQueueTask(newArticles, getArticleDetail)
    const addSql = dbhelper.objSQL.addSQL
    articleDetailList.map(item => {
      var values = [item.title, item.href, item.content, item.source, item.createdAt || utils.formatDate(Date()), item.creator, utils.formatDate(Date())]
      console.log(values)
      dbhelper.dbOperation(addSql, values)
    })
  } catch (err) {
    console.log(err)
  }
}
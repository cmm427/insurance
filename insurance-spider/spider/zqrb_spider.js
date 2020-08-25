var axios = require('axios')
var cheerio = require('cheerio')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')


// 证券日报

// 根据入口url，获取请求页面列表
var getPages = function () {
  console.log('getPages: ')
  var urls = []
  // 只抓取最近15页的数据
  for (var i = 1; i < 16; i++) {
    var url = 'http://www.zqrb.cn/jrjg/insurance/index_p' + i + '.html'
    urls.push(url)
  }
  console.log(urls)
  return urls
}

// 获取每个页面的文章链接
var getPageUrls = function (pageUrl) {
  console.log('getPageUrls: ' + pageUrl)
  var articleUrls = []
  return new Promise(function (resolve, reject) {
    axios.get(pageUrl)
    .then(res => {
      var $ = cheerio.load(res.data)
      $('a[class=lista]').each(function (idx, element) {
        var $element = $(element)
        console.log(idx, $element.attr('href'))
        articleUrls.push($element.attr('href'))
      })
      return resolve(articleUrls)
    })
    .catch(err => {
      reject(err)
    })
  })
}

// 获取每篇文章详情
var getArticleDetail = function (article) {
  console.log('getArticleDetail: ' + article)
  var articleInfo = {
    title: null,
    href: null,
    content: null,
    source: null,
    createdAt: null,
    creator: null,
  }
  return new Promise(function (resolve, reject) {
    axios.get(article)
    .then(res => {
      var $ = cheerio.load(res.data)
      var info = $('div[class=info_news]').text()
      var infoArr = info.split('来源：')
      articleInfo.title = $('div[class=news_content] > h1').text()
      articleInfo.href = article
      articleInfo.content = $('div[class=content-lcq] > p:nth-child(2)').text().trim()
      articleInfo.source = infoArr[1].split(' ')[0]
      articleInfo.createdAt = infoArr[0].trim() + ':00'
      articleInfo.creator = infoArr[1].slice(infoArr[1].split(' ')[0].trim().length)
      console.log('Detail: ' + JSON.stringify(articleInfo))
      return resolve(articleInfo)
    })
    .catch(err => {
      reject(err)
    })
  })
}


exports.zqrb_spider = async function () {
  try {
    var pages = await getPages()
    var articles = await utils.asyncQueueTask(pages, getPageUrls)
    var newArticles = await dbhelper.filterArticle(articles)
    var articleDetailList = await utils.asyncQueueTask(newArticles, getArticleDetail)
    const addSql = 'insert into articles (title, url, content, source, created, creator, updatetime) values(?,?,?,?,?,?,?)'
    articleDetailList.map(item => {
      var values = [item.title, item.href, item.content, item.source, item.createdAt || utils.formatDate(Date()), item.creator, utils.formatDate(Date())]
      console.log(values)
      dbhelper.dbOperation(addSql, values)
    })
  } catch (err) {
    console.log(err)
  }
}
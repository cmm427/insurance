var axios = require('axios')
var cheerio = require('cheerio')
var url = require('url')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')


// 中国银行保险报网
var sinoinsUrl = 'http://xw.sinoins.com/node_125.htm'

// 根据入口url，获取请求页面列表
var getPages = function (entryUrl) {
  console.log('getPages: ' + entryUrl)
  var urls = []
  return new Promise(function (resolve, reject) {
    axios.get(entryUrl)
    .then(res => {
      var $ = cheerio.load(res.data)
      var $element = $('#displaypagenum > center > a:nth-child(5)')
      var shortUrl = $element.attr('href')
      var pageNums = parseInt(shortUrl.slice(shortUrl.lastIndexOf('_') + 1, shortUrl.indexOf('.')))
      for (var i = 2; i <= pageNums; i++) {
        urls.push(url.resolve(entryUrl, 'node_125_' + i + '.htm'))
      }
      urls.unshift(entryUrl)
      resolve(urls)
    })
    .catch(err => {
      reject(err)
    })
  })
}

// 获取每个页面的文章链接
var getPageUrls = function (pageUrl) {
  console.log('getPageUrls: ' + pageUrl)
  var articleUrls = []
  return new Promise(function (resolve, reject) {
    axios.get(pageUrl)
    .then(res => {
      var $ = cheerio.load(res.data)
      $('ul[class=nList] a').each(function (idx, element) {
        var $element = $(element)
        console.log(idx, $element.attr('href'))
        articleUrls.push(url.resolve(sinoinsUrl, $element.attr('href')))
      })
      resolve(articleUrls)
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
      var info = $('div[class=artInfo]').text()
      articleInfo.title = $('h1[class=artTitle]').text()
      articleInfo.href = article
      articleInfo.content = $('div[class=text-t] > p:nth-child(2)').text()
      articleInfo.source = info ? /来源：(.*)/.exec(info)[1].trim() : ''
      articleInfo.createdAt = info ? /发布时间：(.*)作者/.exec(info)[1].trim() : ''
      articleInfo.creator = info ? /作者：(.*)来源/.exec(info)[1].trim() : ''
      console.log('Detail: ' + JSON.stringify(articleInfo))
      resolve(articleInfo)
    })
    .catch(err => {
      reject(err)
    })
  })
}


exports.sinoins_spider = async function () {
  try {
    var pages = await getPages(sinoinsUrl)
    var articles = await utils.asyncQueueTask(pages, getPageUrls)
    var newArticles = await dbhelper.filterArticle(articles)
    var articleDetailList = await utils.asyncQueueTask(newArticles, getArticleDetail)
    console.log(articleDetailList)
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
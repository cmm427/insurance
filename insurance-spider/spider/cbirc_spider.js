var axios = require('axios')
var url = require('url')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')
var cheerio = require('cheerio')

// 银保
var apiUrl = 'http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild?itemId=917&pageSize=18&pageIndex=1'
var pageUrl = 'http://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=942109&itemId=915&generaltype=0'
var detailUrl = 'http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=925865.json'
var newsCategory = [
  // {
  //   itemValue: 'jgdt',
  //   id: 915
  // },
  {
    itemValue: 'zcjd',
    id: 917
  }
]

// 生成 page url
var genUrl = function(itemId, pageIndex) {
  return 'http://www.cbirc.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild?itemId=' + itemId + '&pageSize=18&pageIndex=' + pageIndex
}

// 生成 article url
var genArticleUrl = function(docId, itemId) {
  return 'http://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=' + docId + '&itemId=' + itemId + '&generaltype=0'
}

// 生成 doc url
var genDocUrl = function(docId, itemId) {
  return 'http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=' + docId + '.json&itemId=' + itemId
}

// 根据不同id，生成入口url数组
var genItemUrlLists = function () {
  var urls = newsCategory.map(function(item) {
    return genUrl(item.id, 1)
  })
  return urls
}

// 获取页数
var getItemNums = function (itemUrl) {
  console.log('getItemNUms: ' + itemUrl)
  var num = 0
  return new Promise(function(resolve, reject) {
    axios.get(itemUrl)
    .then(res => {
      num = res.data.data.total
      resolve(num)
    })
    .catch(err => {
      reject(err)
    })
  })
}

// 获取每个页面的文章链接
var getPageUrls = function (link) {
  console.log('getPageUrls: ' + link)
  // 获取itemId
  var itemId = link.split('&')[0].split('=')[1]
  var articleUrls = []
  return new Promise(function(resolve, reject) {
    axios.get(link)
    .then(res => {
      res.data.data.rows.forEach(row => {
        var docUrl = genArticleUrl(row.docId, itemId)
        console.log(docUrl)
        articleUrls.push(docUrl)
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
  var docUrl = article.split('&')[0]
  var docId = article.split('=')[1].split('.')[0]
  var itemId = article.split('&')[1].split('=')[1]
  console.log('getArticleDetail: ' + docUrl)
  var articleInfo = {
    title: null,
    href: null,
    content: null,
    source: null,
    createdAt: null,
    creator: null,
  }
  return new Promise(function(resolve, reject) {
    axios.get(docUrl)
    .then(res => {
      var docInfo = res.data.data
      articleInfo.title = docInfo.docTitle
      articleInfo.href = genArticleUrl(docId, itemId)
      articleInfo.source = '中国银保监会'
      articleInfo.createdAt = docInfo.publishDate
      articleInfo.creator = docInfo.docSource

      var $ = cheerio.load(docInfo.docClob)
      var content = $('p:nth-child(1) > span:nth-child(1)').text().trim()
      articleInfo.content = content
      console.log('Detail: ' + JSON.stringify(articleInfo))

      resolve(articleInfo)
    })
    .catch(err => {
      reject(err)
    })
  })
}

exports.cbirc_spider = async function () {
  // 获取总数目
  var items = genItemUrlLists()
  var totals = await utils.asyncQueueTask(items, getItemNums)
  totals.forEach((val, key) => {
    newsCategory[key].total = val
    newsCategory[key].pages = Math.ceil(val / 18)
  })
  console.log(newsCategory)

  var allArticles = []
  for(const item of newsCategory) {
    console.log(item)
    var urls = []
    for(var i = 0; i < item.pages; i++) {
      var tmp = await utils.asyncQueueTask([genUrl(item.id, i + 1)], getPageUrls)
      urls = [...urls, ...tmp]
    }
    allArticles.push({
      id: item.id,
      articles: urls
    })
  }

  var docs = []
  for (const item of allArticles) {
    item.articles = await dbhelper.filterArticle(item.articles)
    var tmp = item.articles.map(val => {
      // 获取docId
      var docId = val.split('&')[0].split('=')[1]
      return genDocUrl(docId, item.id)
    })
    docs = [...docs, ...tmp]
  }


  var articleDetailList = await utils.asyncQueueTask(docs, getArticleDetail)
}
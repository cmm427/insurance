var cheerio = require('cheerio')
var iconv = require('iconv-lite')
var BufferHelper = require('bufferhelper')
var dbhelper = require('../utils/dbhelper')
var utils = require('../utils/index')
var axios = require('axios')


// 金融界
var jrjUrl = 'http://insurance.jrj.com.cn/xwk/'

// 根据入口url，获取请求页面列表
var getPages = function () {
  console.log('getPages: ')
  var urls = []
  // 只抓取最近30天的数据
  var nows = new Date()
  for (var i = 0; i < 30; i++) {
    nows.setDate(nows.getDate() - 1)
    var month =  utils.formatMonth(nows)
    var day = utils.formatDay(nows)
    var url = jrjUrl + month + '/' + day + '_1.shtml'
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
      $('ul[class=list]>li>a').each(function (idx, element) {
        var $element = $(element)
        console.log(idx, $element.attr('href'))
        articleUrls.push($element.attr('href'))
      })
      resolve(articleUrls)
    })
    .catch (err => {
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
    // iconv-lite 模块能配合 http 模块以及 request 模块使用， 却不能直接和 superAgent 模块使用
    // 因为 superAgent 是以 utf8 去取数据，然后再用 iconv 转也是不行的
    // https://www.cnblogs.com/chris-oil/p/12602039.html
    axios.get(article, {
      responseType: 'stream'
    }).then(res => {
      var bufferHelper = new BufferHelper()
      res.data.on('data', chunk => {
        bufferHelper.concat(chunk)
      })
      res.data.on('end', () => {
        var html = iconv.decode(bufferHelper.toBuffer(), 'GBK')
        var $ = cheerio.load(html, {
          decodeEntities: false
        })
        var source = $('p[class=inftop]>span:nth-child(4)').text().trim()
        var creator = $('p[class=inftop]>span:nth-child(5)').text().trim()
        articleInfo.title = $('div[class=titmain]>h1').text().trim()
        articleInfo.href = article
        articleInfo.content = $('div[class=texttit_m1]>p:nth-child(1)').text().trim()
        articleInfo.source = source ? /来源：(.*)/.exec(source)[1].trim() : ''
        articleInfo.createdAt = $('p[class=inftop]>span:nth-child(3)').text().trim()
        articleInfo.creator = creator ? /作者：(.*)/.exec(creator)[1].trim() : ''
        console.log('Detail: ' + JSON.stringify(articleInfo))
        resolve(articleInfo)
      })
    })
  })
}


exports.jrj_spider = async function () {
  try {
    var pages = getPages()
    var articles = await utils.asyncQueueTask(pages, getPageUrls)
    var newArticles = await dbhelper.filterArticle(articles)
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
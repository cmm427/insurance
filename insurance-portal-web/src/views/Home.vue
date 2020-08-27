<template>
<div>
  <keep-alive>
    <div>
      <van-collapse v-model="activeName" @change="changeStyle">
        <div v-for="(item, idx) in articleItems" :key="idx">
          <van-collapse-item :name="idx" :is-link="false" class="item-box"  @click="changeStyle">
            <template #title>
              <div>
                <span>{{item.title}}</span>
                <span>{{timeAgo(item.created)}}</span>
              </div>
            </template>
            <template>
              <div>
                {{item.content}}
                <div>
                  <a :href="item.url">{{item.source}}</a>
                  <span>/ {{item.creator}}</span>
                </div>
              </div>
            </template>
          </van-collapse-item>
        </div>
        <div class="load-more" @click="loadMore">
          <div>加载更多</div>
        </div>
      </van-collapse>
    </div>
  </keep-alive>
  <div class="back2Top" @click="backTop" v-if="showBackTop">
    <div class="line"></div>
    <div class="arrow"></div>
  </div>
</div>
</template>

<script>
import { getArticles } from '@/api/article'
import { timeAgo } from '@/utils/timeago'
export default {
  data () {
    return {
      offset: 0,
      limit: 20,
      activeName: [],
      articleItems: [],
      showBackTop: false
    }
  },
  methods: {
    // 多久以前
    timeAgo: timeAgo,

    // 监听页面滚动事件
    scrollEvent: function () {
      const that = this
      var height = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      // var clientHeight = document.documentElement.clientHeight
      that.height = height
      if (that.height > 60) {
        that.showBackTop = true
      } else {
        that.showBackTop = false
      }
    },

    // 回到顶部
    backTop: function () {
      const that = this
      var timer = setInterval(() => {
        var distance = that.height
        var speed = Math.floor(-that.height / 5)
        document.documentElement.scrollTop = document.body.scrollTop = that.height + speed
        if (distance <= 10) {
          document.documentElement.scrollTop = document.body.scrollTop = 0
          clearInterval(timer)
        }
      }, 20)
    },

    // 获取文章列表
    getArticles: async function () {
      var that = this
      var params = {
        offset: this.offset,
        limit: this.limit
      }
      var res = await getArticles(params)
      if (res.success) {
        that.articleItems = [...that.articleItems, ...res.data]
      }
    },

    // 加载更多
    loadMore: function () {
      var that = this
      that.offset += this.limit
      this.getArticles()
    },

    // 展开面板时设置背景和阴影
    changeStyle: function () {
      var dom = document.getElementsByClassName('item-box')
      setTimeout(function () {
        dom.forEach(function (item) {
          var tmpStr = item.children[0].attributes[2].value
          tmpStr = (tmpStr === 'true')
          if (tmpStr) {
            item.children[0].style.background = '#fefefe'
            item.style.boxShadow = '0px 5px 21px 1px rgba(0,0,0,.15)'
          } else {
            item.children[0].style.background = '#fafafa'
            item.style.boxShadow = ''
          }
        })
      }, 50)
    }
  },
  computed: {
  },
  mounted () {
    this.getArticles()
    window.addEventListener('scroll', this.scrollEvent)
  },
  destroyed () {
    window.removeEventListener('scroll', this.scrollEvent)
  }
}
</script>

<style lang="scss" scoped>
::v-deep .item-box {
  text-align: justify;
  >div {
    background: #fafafa;
    font-size: 18px;
    color: #000000;
    >div {
      min-height: 72px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      >div {
        >span {
          &:nth-of-type(2) {
            font-size: 14px;
            color: darkgrey;
            margin-left: 16px;
          }
        }
      }
    }
    &:nth-of-type(2) {
      >div {
        background: #fefefe;
        >div {
          font-size: 16px;
          line-height: 28px;
          >div {
            margin-top: 10px;
            font-size: 12px;
            >span {
              margin-left: 20px;
            }
          }
        }
      }
    }
  }
}
.load-more {
  position: relative;
  padding: 10px 0px;
  margin-bottom: 10px;
  background: #fafafa;
  >div {
    height: 36px;
    line-height: 36px;
    color: #000000;
    border: 1px solid rgb(209, 206, 206);
    border-radius: 4px;
    margin: 10px 30px;
  }
}
.back2Top {
  position: fixed;
  right: 18px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .line {
    width: 14px;
    height: 2px;
    background: #934FFF;
    margin-bottom: 2px;
  }
  .arrow {
    width: 0px;
    height: 0px;
    border-style: solid;
    border-width: 0px 7px 10px;
    border-color: transparent transparent #934FFF;
  }
}
.back2Top::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  border: 1px solid #d5d6d8;
  border-radius: 4px;
}
</style>

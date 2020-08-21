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
</div>
</template>

<script>
import { getArticles } from '@/api/article'
import { timeAgo } from '@/utils/timeago'
export default {
  data () {
    return {
      offset: 0,
      limit: 10,
      activeName: [],
      articleItems: []
    }
  },
  methods: {
    // 多久以前
    timeAgo: timeAgo,

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
</style>

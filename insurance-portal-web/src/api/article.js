import { get } from '../utils/request'
import base from './base'

const baseUrl = base.production

// 获取文章列表
export function getArticles (data) {
  return get(baseUrl + '/articles', {
    ...data
  })
}

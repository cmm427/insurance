import axios from 'axios'

export function get (url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: data
    }).then(response => {
      resolve(response.data)
    }).catch(err => {
      reject(err)
    })
  })
}

import { useMemberStore } from '@/stores'
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

const httpInterceptor = {
  invoke(options: UniApp.RequestOptions) {
    // 拦截url
    if (options.url.search(/^http/)) {
      options.url = baseURL + options.url
    }
    // 设置响应超时
    options.timeout = 10000
    // 设置请求头(必需)
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 获取token
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
  },
}

uni.addInterceptor('request', httpInterceptor)

interface Data<T> {
  code: number
  msg: string
  data: T
}

export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (/[2|3]\d{2}/.test(res.statusCode.toString())) {
          resolve(res.data as Data<T>)
        } else if (/401/.test(res.statusCode.toString())) {
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          uni.showToast({
            title: '数据获取失败',
          })
          reject(res)
        }
      },
      fail(err) {
        uni.showToast({
          icon: 'error',
          title: '当前无网络，请稍后再试',
        })
        reject(err)
      },
    })
  })
}

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // logs.unshift(new Date(1989, 11, 17, 12, 28, 45, 30))
    // wx.setStorageSync('logs', logs)
    //获取userId
    if (!this.globalData.userId) {
      this.getUserInfoFromServer();
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.showLoading({
            title: '加载中',
          })
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              wx.hideLoading();
            }
          });
          //不管授权与否，先跳到index页面，再做判断
        }
      }
    })
  },
  //从服务器获取用户信息
  getUserInfoFromServer: function () {
    wx.showLoading({
      title: '加载中',
    })
    // 登录 获取code
    wx.login({
      success: res => {
        wx.request({
          url: this.globalData.host + '/plan/login/get/userInfo?jscode=' + res.code,
          success: res => {
            this.globalData.userId = res.data
            console.log("userId:" + this.globalData.userId)
            wx.hideLoading();
          }
        })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    openId: null,
    userId: null,
    currentDetailPlan: null,
    currentPlanEditId: null,
    host: "https://techedge.top:444"
  }
})
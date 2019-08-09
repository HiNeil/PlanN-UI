//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    planName: "null",
    remindInfo: "亲爱的，不要忘记吃药！",
    appliedPlan: [
      {
        number: 1,
        desc: '健身房健身',
        finished: true
      },
      {
        number: 2,
        desc: '注册会计师学习',
        finished: false
      },
      {
        number: 3,
        desc: 'read 5 pages',
        finished: true
      },
      {
        number: 4,
        desc: '弹尤克里里半小时',
        finished: true
      }
    ]
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  setFinished: function (e) {
    var index = e.currentTarget.dataset.idx
    var currentFinished = this.data.appliedPlan[index].finished
    for (var i = 0; i < this.data.appliedPlan.length; i++) {
      if (i == index) {
        var item = "appliedPlan[" + i + "].finished";//先用一个变量，把(info[0].gMoney)用字符串拼接起来
        this.setData({
          [item]: !currentFinished
        })
      }
    }
  },
  openConfirm: function (e) {
    var change = this.setFinished
    var index = e.currentTarget.dataset.idx
    var currentFinished = this.data.appliedPlan[index].finished
    wx.showModal({
      // title: '',
      content: currentFinished ? '今天未完成该项目？' : '今天已完成该项目？',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          change(e),
            console.log('用户点击主操作')
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
  },
  popRemind: function () {
    var remindInfo = this.data.remindInfo
    wx.showModal({
      // title: '',
      content: remindInfo,
      confirmText: "确定",
      cancelText: "修改",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击主操作')
        } else {
          wx.navigateTo({
            url: '../logs/logs'
          })
          console.log('用户点击修改操作')
        }
      }
    });

  },
  getSystemInfo: function () {
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
      }
    }),
      wx.showTabBarRedDot({
        index: 0
      }),
      wx.request({
        url: 'https://tcb-api.tencentcloudapi.com',
        success: function (res) {
          console.log(res)
        }
      }),
      wx.getUserInfo({
        success: function (res) {
          // console.log(this.globalData.userInfo)
        }
      }),
      wx.login({
        success: function (res) {
          console.log(res.code)
        }
      })
    if (this.data.planName) {
      this.setData({
        planName: null
      })
    } else {
      this.setData({
        planName: "test plan name"
      })
    }
    wx.showToast({
      title: '已完成',
      icon: 'success',
      duration: 3000
    });
  },
  onLoad: function () {

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else { //如果 onLaunch 中判断已经授权过将直接拿userInfo，还没拿到的话设置回调函数 userInfoReadyCallback
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})

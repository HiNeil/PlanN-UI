//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userId: null,
    userInfo: null,
    hasUserInfo: false,
    userInfoAuthorized: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    planName: "null",
    remindInfo: "亲爱的，不要忘记吃药！",
    appliedPlan:null,
    appliedPlanHard: [{
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
  onLoad: function () {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            userInfoAuthorized: true
          })
        }
      }
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log("youma" + this.data.userInfo)
    } else { //如果 onLaunch 中判断已经授权过将直接拿userInfo，还没拿到的话设置回调函数 userInfoReadyCallback
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // setTimeout(function () {
        //   //要延时执行的代码
        // }, 20000)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        console.log("get user Info call back" + this.data.userInfo);
      };
    }
    //如果有userId 就设置给当前页面的userId,如果没有就重新获取
    if (app.globalData.userId) {
      this.setData({
        userId: app.globalData.userId
      })
    } else {
      wx.login({
        success: res => {
          console.log("code:" + res.code)
          wx.request({
            url: this.globalData.host + '/plan/login/get/userInfo?jscode=' + res.code,
            success: res => {
              this.globalData.userId = res.data
              console.log("userId:" + res.data)
            }
          })
        }
      })
    }
  },
  //用户点击获取用户信息触发
  clickGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      //插入登录的用户的相关信息到数据库
      //设置用户信息为全局变量
      console.log("login user Info " + e.detail.userInfo.nickname)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        userInfoAuthorized: true
      })
      if (app.myCallBack) {
        app.myCallBack();
      }
      console.log("auth " + that.data.userInfoAuthorized)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        showTitle: false,
        content: '您拒绝了授权, 请授权后再进入',
        showCancel: false,
        confirmText: '确定',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
  setFinished: function (e) {
    var index = e.currentTarget.dataset.idx
    var currentFinished = this.data.appliedPlan[index].finished
    for (var i = 0; i < this.data.appliedPlan.length; i++) {
      if (i == index) {
        var item = "appliedPlan[" + i + "].finished"; //先用一个变量，把(info[0].gMoney)用字符串拼接起来
        this.setData({
          [item]: !currentFinished
        })
      }
    }
  },
  popConfirmFinished: function (e) {
    var change = this.setFinished
    var index = e.currentTarget.dataset.idx
    var currentFinished = this.data.appliedPlan[index].finished
    wx.showModal({
      // title: '',
      content: currentFinished ? '今天未完成该项目？' : '今天已完成该项目？',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
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
  }
})
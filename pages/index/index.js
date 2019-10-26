//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userId: null,
    userInfo: null,
    userInfoAuthorized: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    remindInfo: "踢一下功能紧急开发中...",
    appliedPlan: null,
    appliedPlanDeail: null,
    offset: (new Date()).getTimezoneOffset() / -60
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
    });
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
      })
    } else { //如果 onLaunch 中判断已经授权过将直接拿userInfo，还没拿到的话设置回调函数 userInfoReadyCallback
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        // setTimeout(function () {
        //   //要延时执行的代码
        // }, 20000)
        that.setData({
          userInfo: res.userInfo,
        });
      };
    };
    //如果有userId 就设置给当前页面的userId,如果没有就重新获取
    if (app.globalData.userId) {
      that.setData({
        userId: app.globalData.userId
      });
    }
  },
  onShow: function () {
    var that = this;
    if (that.data.userId)
      that.getUserAppliedPlan(that.data.userId);
    else
      that.getUserInfoFromServer();
  },
  //从服务器获取plans
  getUserAppliedPlan: function (id) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.host + "/plan/plan-info/list/" + id,
      success: res => {
        if (res.data.length > 0 && res.data[0].appled == 1) {
          that.setData({
            appliedPlan: res.data[0]
          });
          that.getPlanDetail(that.data.appliedPlan.id);
        } else {
          that.setData({
            appliedPlan: null
          });
        }
      },
      fail: res => {

      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  getPlanDetail: function (id) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.host + "/plan/plan-info/detail/" + id + "?offSet=" + that.data.offset,
      success: res => {
        if (res.data.length > 0) {
          that.setData({
            appliedPlanDeail: res.data
          })
        } else {
          that.setData({
            appliedPlanDeail: null
          });
        }
      },
      fail: res => {

      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  //从服务器获取用户信息
  getUserInfoFromServer: function () {
    var that = this
    // 登录 
    wx.showLoading({
      title: '加载中',
    })
    wx.login({
      success: res => {
        wx.request({
          url: app.globalData.host + '/plan/login/get/userInfo?jscode=' + res.code,
          success: res => {
            app.globalData.userId = res.data;
            that.setData({
              userId: res.data
            });
            that.getUserAppliedPlan(that.data.userId);
          },
          fail: res => {

          },
          complete: res => {
            wx.hideLoading();
          }
        })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  addPlanItem: function () {
    app.globalData.currentDetailPlan = this.data.appliedPlan;
    wx.navigateTo({
      url: '../plan_detail/plan_detail'
    })
  },
  //用户点击获取用户信息触发
  clickGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      //设置用户信息为全局变量
      console.log("login user Info " + e.detail.userInfo.nickName)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        userInfoAuthorized: true
      });
      if (app.callBackForMy)
        app.callBackForMy();
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
  //设置完成或者取消完成
  setFinished: function (e) {
    var index = e.currentTarget.dataset.idx;
    var itemId = this.data.appliedPlanDeail[index].id
    var planId = this.data.appliedPlan.id
    var currentFinished = this.data.appliedPlanDeail[index].finished
    var nextFinished = currentFinished ? 0 : 1;
    var that = this
    wx.showLoading();
    wx.request({
      url: app.globalData.host + '/plan/plan-item-change/modify/' + planId + '/' + itemId,
      data: {
        'finished': nextFinished
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'PUT',
      success: function (res) {
        var item = "appliedPlanDeail[" + index + "].finished";
        that.setData({
          [item]: nextFinished
        });
        var desc = nextFinished ? "已完成" : "未完成";
        that.showSuccessToast(desc);
      },
      fail: res => {

      },
      complete: res => {
        
      }
    })
  },
  showSuccessToast: function (desc) {
    wx.showToast({
      title: desc,
      icon: 'success',
      duration: 1000
    });
  },
  dircetToMy: function () {
    wx.switchTab({
      url: '../my/my',
    })
  },
  popRemind: function () {
    var remindInfo = this.data.remindInfo
    wx.showModal({
      content: remindInfo,
      confirmText: "确定",
      showCancel: false,
      // cancelText: "修改",
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
  }
})
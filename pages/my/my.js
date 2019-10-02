const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    userId: null,
    plans: null,
    reminds: [{
      id: 1,
      info: 'ainiyo1',
      appliedFlag: false
    },
    {
      id: 2,
      info: 'ainiyo2',
      appliedFlag: false
    },
    {
      id: 3,
      info: 'ainiyo3',
      appliedFlag: true
    },
    {
      id: 4,
      info: 'ainiyo4',
      appliedFlag: false
    },
    {
      id: 5,
      info: 'ainiyo5',
      appliedFlag: false
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.initData();
    app.callBackForMy = this.initData;
  },
  initData: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      userId: app.globalData.userId
    });
  },
  cleanData: function () {
    this.setData({
      plans: null
    })
  },
  getUserPlans: function (id) {
    wx.request({
      url: app.globalData.host + "/plan/plan-info/list/" + id,
      success: res => {
        this.setData({
          plans: res.data
        })
      }
    })
  },
  //如果用户信息数据不存在跳转到的主页进行登录操作
  setLoginCallBack: function () {
    if (app.globalData.userInfo) {
      this.initData();
      if (this.data.userId)
        this.getUserPlans(this.data.userId);
    } else {
      wx.switchTab({
        url: '../index/index',
      })
    }
  },
  /**
   * 弹框激活还是查看
   */
  activePlan: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.idx;
    var planId = that.data.plans[index].id;
    var currentApplied = that.data.plans[index].appled;
    var userId = that.data.userId;
    wx.showActionSheet({
      itemList: currentApplied ? ['查看计划', '取消计划'] : ['查看计划', '激活计划'],
      success: function (res) {
        if (res.tapIndex == 1 && currentApplied) {
          that.setApplied(index);
        } else if (res.tapIndex == 1 && !currentApplied) {
          wx.request({
            url: app.globalData.host + "/plan/plan-info/list/" + userId,
            success: res => {
              var firstPlan = res.data[0]
              if (firstPlan && firstPlan.appled) {
                wx.showModal({
                  content: '请先取消已激活的计划',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    }
                  }
                });
              } else {
                that.setApplied(index);
              }
            }
          });
        } else if (res.tapIndex == 0) {
          console.log("跳转到详情页");
        }
      }
    });
  },
  setApplied: function (index) {
    var that = this;
    var planId = that.data.plans[index].id;
    var userId = that.data.userId;
    var nextApplied = that.data.plans[index].appled ? 0 : 1;
    wx.request({
      url: app.globalData.host + '/plan/plan-change/modify/' + userId + '/' + planId,
      data: {
        appled: nextApplied
      },
      method: 'PUT',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var plan = 'plans[' + index + "]." + "appled"
        that.setData({
          [plan]: nextApplied
        });
        console.log(res.data);
      }
    })



  },
  activeRemind: function () {
    wx.showActionSheet({
      itemList: ['查看提醒', '激活提醒'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    console.log("页面->刷新完毕")

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.data.userInfo)
      wx.switchTab({
        url: '../index/index',
      });
    if (this.data.userId)
      this.getUserPlans(this.data.userId);
    console.log("页面->显示了");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.cleanData();
    console.log("页面->隐藏了");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

    console.log("页面->卸载了？")

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    console.log("页面->被下拉了")

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    console.log("页面->到底了")

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    console.log("页面->要被分享啦")

  }
})
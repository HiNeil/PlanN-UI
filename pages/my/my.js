const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    userId: null,
    plans: null,
    addModelHide: true,
    inputedPlan: null,
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
  onPullDownRefresh: function () {
    this.onShow();
    wx.stopPullDownRefresh();
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.data.userId || !this.data.userInfo)
      this.initData()
    if (this.data.userInfo && this.data.userId)
      this.getUserPlans(this.data.userId);
    else
      wx.switchTab({
        url: '../index/index',
      });
  },

  cleanData: function () {
    this.setData({
      plans: null
    })
  },

  getUserPlans: function (id) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.host + "/plan/plan-info/list/" + id,
      success: res => {
        if (res.statusCode < 300) {
          that.setData({
            plans: res.data
          });
        }
        else
          that.showFailToast('请求错误，请稍候重试');
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },

  //如果用户信息数据不存在跳转到的主页进行登录操作
  setLoginCallBack: function () {
    if (app.globalData.userInfo && app.globalData.userId) {
      this.initData();
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
      itemList: currentApplied ? ['查看计划', '取消计划'] : ['查看计划', '激活计划', "删除计划"],
      success: function (res) {
        if (res.tapIndex == 1 && currentApplied) {
          that.setApplied(index);
        } else if (res.tapIndex == 1 && !currentApplied) {
          wx.showLoading();
          wx.request({
            url: app.globalData.host + "/plan/plan-info/list/" + userId,
            success: res => {
              if (res.statusCode < 300) {
                var firstPlan = res.data[0]
                if (firstPlan && firstPlan.appled) {
                  // wx.hideLoading();
                  that.showFailToast('请先取消已激活计划');
                } else {
                  that.setApplied(index);
                }
              }
              else
                that.showFailToast('请求错误，请稍候重试');
            },
            fail: res => {
              that.showFailToast('网络异常，请稍候重试');
            },
            complete: res => {

            }
          });
        } else if (res.tapIndex == 0) {
          app.globalData.currentDetailPlan = that.data.plans[index]
          wx.navigateTo({
            url: '../plan_detail/plan_detail',
          });
          console.log("跳转到详情页");
        } else if (res.tapIndex == 2) {
          wx.showLoading();
          wx.request({
            url: app.globalData.host + "/plan/plan-change/delete/" + userId + "/" + planId,
            method: "DELETE",
            success: res => {
              if (res.statusCode < 300) {
                var deletedPlans = that.data.plans.filter((ele, idx) => {
                  return idx != index
                });
                that.setData({
                  plans: deletedPlans
                });
                that.showSuccessToast("删除成功");
              }
              else
                that.showFailToast('请求错误，请稍候重试');
            },
            fail: res => {
              that.showFailToast('网络异常，请稍候重试');
            },
            complete: res => {

            }
          });
        }
      }
    });
  },
  /**
   * 更多计划相关
   */
  addPlan: function () {
    var that = this
    var plans = that.data.plans ? that.data.plans : [];
    if (plans.length >= 10) {
      that.showFailToast('超出数量限制，请删除后再添加');
    } else {
      that.showAddPlan();
    }
  },
  showSuccessToast: function (desc) {
    wx.showToast({
      title: desc,
      icon: 'success',
      duration: 1500
    });
  },
  showFailToast: function (desc) {
    wx.showToast({
      title: desc,
      icon: 'none',
      duration: 2000
    });
  },
  /**
   * 新增plan相关
   */
  hideAddPlan: function () {
    this.setData({
      addModelHide: true,
      inputedPlan: null,
    })
  },
  showAddPlan: function () {
    this.setData({
      addModelHide: false,
    })
  },
  getInputPlan: function (e) {
    this.setData({
      inputedPlan: e.detail.value.trim()
    });
  },
  newToserver: function () {
    var that = this;
    var userId = that.data.userId;
    var des = that.data.inputedPlan;
    if (des == null || des.length == 0) {
      that.showSuccessToast("请输入");
      return
    }
    that.hideAddPlan();
    wx.showLoading();
    wx.request({
      url: app.globalData.host + "/plan/plan-change/add/" + userId,
      method: "POST",
      data: {
        planName: des,
        applied: 0,
        type: 0
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.statusCode < 300) {
          var plans = that.data.plans ? that.data.plans : []
          plans.push({
            id: res.data.id,
            userId: res.data.userId,
            planName: res.data.planName,
            appled: res.data.appled,
            number: res.data.number,
            appled: res.data.appled,
          });
          that.setData({
            plans: plans
          });
          that.showSuccessToast("添加成功");
        }
        else
          that.showFailToast('请求错误，请稍候重试');
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {

      }
    });
  },
  setApplied: function (index) {
    var that = this;
    var planId = that.data.plans[index].id;
    var userId = that.data.userId;
    var nextApplied = that.data.plans[index].appled ? 0 : 1;
    wx.hideLoading();
    wx.showLoading();
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
        if (res.statusCode < 300) {
          var plan = 'plans[' + index + "]." + "appled"
          that.setData({
            [plan]: nextApplied
          });
          var desc = nextApplied == 0 ? "取消成功" : "激活成功"
          that.showSuccessToast(desc);
        }
        else
          that.showFailToast('请求错误，请稍候重试');
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {

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
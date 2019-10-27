const app = getApp();

Page({
  data: {
    planDetail: null,
    noticeDetail: null,
    plan: null,
    userId: null,
    noticeTime: null,
    inputedItem: null,
    addModelHide: true,
    editModelHide: true,
    editedItem: null,
    editIndex: null,
    editPlanModelHide: true,
    inputedPlan: null,
    offset: (new Date()).getTimezoneOffset() / -60
  },
  onLoad: function () {
    this.setData({
      userId: app.globalData.userId
    })
  },
  onShow: function () {
    var that = this;
    /**
     * 如果userId 或者 currentDetailPlan 为空的话 就跳回首页
     */
    if (that.data.userId == null) {
      wx.switchTab({
        url: '../my/my',
      })
    };
    that.setData({
      plan: app.globalData.currentDetailPlan
    });
    var planId = that.data.plan.id;
    that.getPlanDetail(planId);
    that.getNoticeDetail(planId);
  },
  getPlanDetail: function (planId) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.host + "/plan/plan-info/detail/" + planId + "?offSet=" + that.data.offset,
      success: res => {
        if (res.data.length > 0) {
          that.setData({
            planDetail: res.data
          });
        } else {
          that.setData({
            planDetail: null
          });
        }
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  getNoticeDetail: function (planId) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.host + "/plan/plan-notice/get/" + planId + "?zoneOffset=" + that.data.offset,
      success: res => {
        if (res.data.length > 0) {
          that.setData({
            noticeDetail: res.data
          });
        } else {
          that.setData({
            noticeDetail: null
          });
        }
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        wx.hideLoading();
      }
    })
  },
  onHide: function () {
    this.setData({
      planDetail: null,
      plan: null,
      noticeTime: null,
      inputedItem: null,
      addModelHide: true,
      editModelHide: true,
      editedItem: null,
      editIndex: null,
      editPlanModelHide: true,
      inputedPlan: null
    });
    app.globalData.currentDetailPlan = null;
    wx.switchTab({
      url: '../my/my',
    })
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
   * 编辑plan item 相关
   */
  getEditItem: function (e) {
    var itemDesc = "editedItem.description";
    this.setData({
      [itemDesc]: e.detail.value.trim()
    });
  },
  showEditItem: function (index) {
    var item = this.data.planDetail[index]
    this.setData({
      editedItem: item,
      editModelHide: false
    })
  },
  hideEditItem: function () {
    this.setData({
      editModelHide: true,
      editedItem: null
    })
  },
  /**
   * 编辑item弹框
   */
  editItem: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.idx;
    that.setData({
      editIndex: index,
    });
    wx.showActionSheet({
      itemList: ['修改', '删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.showEditItem(index);
        } else if (res.tapIndex == 1) {
          var planId = that.data.plan.id;
          var itemId = that.data.planDetail[index].id
          wx.showLoading();
          wx.request({
            url: app.globalData.host + "/plan/plan-item-change/delete/" + planId + "/" + itemId,
            method: "DELETE",
            success: function (e) {
              var deletedPlanDetail = that.data.planDetail.filter(
                (ele, idx) => {
                  return idx != index
                }
              );
              that.setData({
                planDetail: deletedPlanDetail
              })
              that.showSuccessToast("删除成功");
            },
            fail: res => {
              that.showFailToast('网络异常，请稍候重试');
            },
            complete: res => {
              
            }
          });
        }
      }
    })
  },
  /**
   * 编辑time弹框
   */
  editTime: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.idx;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        if (res.tapIndex == 0) {
          var planId = that.data.plan.id;
          var timeId = that.data.noticeDetail[index].id
          wx.showLoading();
          wx.request({
            url: app.globalData.host + "/plan/plan-notice/delete/" + planId + "/" + timeId,
            method: "DELETE",
            success: function (e) {
              var deletedNoticeDetail = that.data.noticeDetail.filter(
                (ele, idx) => {
                  return idx != index
                }
              );
              that.setData({
                noticeDetail: deletedNoticeDetail
              })
              that.showSuccessToast("删除成功")
            },
            fail: res => {
              that.showFailToast('网络异常，请稍候重试');
            },
            complete: res => {
              
            }
          });
        }
      }
    })
  },
  editToserver: function () {
    var that = this;
    var planId = that.data.plan.id;
    var item = that.data.editedItem;
    if (item.description == null || item.description.length == 0) {
      that.showSuccessToast("请输入");
      return
    }
    that.hideEditItem();
    wx.showLoading();
    wx.request({
      url: app.globalData.host + "/plan/plan-item-change/modify/" + planId + "/" + item.id,
      method: "PUT",
      data: {
        description: item.description
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("edited: " + res.data);
        var index = that.data.editIndex;
        var itemDesc = "planDetail[" + index + "].description";
        that.setData({
          [itemDesc]: item.description
        });
        that.showSuccessToast("修改成功");
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        
      }
    });
  },
  /**
   * 新增plan item 相关
   */
  getInputItem: function (e) {
    this.setData({
      inputedItem: e.detail.value.trim()
    });
    console.log(this.data.inputedItem);
  },
  showAddItem: function () {
    this.setData({
      addModelHide: false,
      inputedItem: null
    })
  },
  hideAddItem: function () {
    this.setData({
      addModelHide: true,
      inputedItem: null
    })
  },
  newToserver: function () {
    var that = this;
    var planId = that.data.plan.id;
    var des = that.data.inputedItem;
    if (des == null || des.length == 0) {
      that.showSuccessToast("请输入");
      return
    }
    that.hideAddItem();
    wx.showLoading();
    wx.request({
      url: app.globalData.host + "/plan/plan-item-change/add/" + planId,
      method: "POST",
      data: {
        description: des
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("inserted: " + res.data);
        var planItems = that.data.planDetail == null ? [] : that.data.planDetail
        planItems.push({
          description: res.data.description,
          finished: res.data.finished,
          id: res.data.id,
          noticeTime: res.data.noticeTime,
          number: res.data.number,
          planId: res.data.planId
        });
        that.setData({
          planDetail: planItems
        });
        that.showSuccessToast("添加成功");
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {

      }
    });
  },
  /**
   * 编辑plan相关
   */
  showEditPlan: function () {
    var currentPlanName = this.data.plan.planName;
    this.setData({
      editPlanModelHide: false,
      inputedPlan: currentPlanName
    })
  },
  hideEditPlan: function () {
    this.setData({
      editPlanModelHide: true,
      inputedPlan: null
    })
  },
  getEditPlan: function (e) {
    this.setData({
      inputedPlan: e.detail.value.trim()
    })
  },
  editPlanToserver: function () {
    var that = this;
    var planId = that.data.plan.id;
    var userId = that.data.userId;
    var newPlanName = that.data.inputedPlan;
    if (newPlanName == null || newPlanName.length == 0) {
      that.showSuccessToast("请输入");
      return
    }
    that.hideEditPlan();
    wx.showLoading();
    wx.request({
      url: app.globalData.host + "/plan/plan-change/modify/" + userId + "/" + planId,
      method: "PUT",
      data: {
        planName: newPlanName
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("edited plan: " + res.data);
        var newPlan = "plan.planName";
        that.setData({
          [newPlan]: newPlanName
        });
        that.showSuccessToast("修改成功");
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        
      }
    });
  },
  /**
   * 编辑时间相关
   */
  timeChange: function (e) {
    console.log(e.detail.value)
    var that = this
    var time = e.detail.value
    var planId = that.data.plan.id
    wx.showLoading();
    wx.request({
      url: app.globalData.host + "/plan/plan-notice/add/" + planId,
      method: "POST",
      data: {
        noticeTime: time,
        zoneOffset: that.data.offset
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var times = that.data.noticeDetail == null ? [] : that.data.noticeDetail
        times.push({
          "id": res.data.id,
          "noticeTime": res.data.noticeTime,
          "zoneOffset": res.data.zoneOffset,
          "planId": res.data.planId,
          "finished": 0
        });
        that.setData({
          noticeDetail: times
        });
        that.showSuccessToast("添加成功");
      },
      fail: res => {
        that.showFailToast('网络异常，请稍候重试');
      },
      complete: res => {
        
      }
    });
  }
})
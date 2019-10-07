const app = getApp();

Page({
  data: {
    planDetail: null,
    plan: null,
    userId: null,
    noticeTime: null,
    inputedItem: null,
    addModelHide: true,
    editModelHide: true,
    editedItem: null,
    editIndex: null,
    editPlanModelHide: true,
    inputedPlan: null
  },
  onLoad: function () {
    this.setData({
      userId: app.globalData.userId
    })
  },
  onShow: function () {
    this.setData({
      plan: app.globalData.currentDetailPlan
    });
    console.log(this.data.plan);
    var that = this;
    var planId = that.data.plan.id;
    wx.request({
      url: app.globalData.host + "/plan/plan-info/detail/" + planId,
      success: res => {
        if (res.data.length > 0) {
          that.setData({
            planDetail: res.data
          });
          console.log(that.data.planDetail);
        } else {
          that.setData({
            planDetail: null
          });
        }
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
    console.log("plan:")
    console.log(this.data.plan)
  },

  showSuccessToast: function (desc) {
    wx.showToast({
      title: desc,
      icon: 'success',
      duration: 1000
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
              that.showSuccessToast("删除成功")
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
      }
    });
  }
})
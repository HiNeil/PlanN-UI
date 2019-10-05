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
    });
    app.globalData.currentDetailPlan = null;
    console.log("plan:")
    console.log(this.data.plan)
  },
  getInputItem: function (e) {
    this.setData({
      inputedItem: e.detail.value.trim()
    });
    console.log(this.data.inputedItem);
  },
  getEditItem: function (e) {
    var itemDesc = "editedItem.description";
    this.setData({
      [itemDesc]: e.detail.value.trim()
    });
    this.data.editedItem.description = e.detail.value.trim();
  },
  showSuccessToast: function (desc) {
    wx.showToast({
      title: desc,
      icon: 'success',
      duration: 1000
    });
  },
  showAddItem: function () {
    this.setData({
      addModelHide: false
    })
  },
  hideAddItem: function () {
    this.setData({
      addModelHide: true,
      inputedItem: null
    })
  },
  showEditItem: function () {
    this.setData({
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
          var item = that.data.planDetail[index]
          that.setData({
            editedItem: item
          })
          that.showEditItem();
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
  }
})
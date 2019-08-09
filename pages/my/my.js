
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    plans:[
      {
        id:1,
        planName:'plan1',
        appliedFlag:false
      },
      {
        id: 2,
        planName: 'plan2',
        appliedFlag: false
      }, 
      {
        id: 3,
        planName: 'plan3',
        appliedFlag: false
      },
      {
        id: 4,
        planName: 'plan4',
        appliedFlag: true  
      },
      {
        id: 5,
        planName: 'plan5',
        appliedFlag: false
      }
    ],
    reminds:[
      {
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
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },
  /**
   * 弹框激活还是查看
   */
  activePlan: function() {
    wx.showActionSheet({
      itemList: ['查看计划', '激活计划' ],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
        }
      }
    });
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
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
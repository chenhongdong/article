define(function(require) {
    var config = {
        '2': {
            'title': '电脑上门维修',
            'supply': '由同城帮提供',
            'btn': {
                '0': {
                    'btntxt': '维修电脑',
                    'url': 'http://m.bang.360.cn/ziying?category=pc&from=360map'
                },
                '1': {
                    'btntxt': '数据恢复',
                    'url': 'http://m.bang.360.cn/ziying/yuyue/?gid=11&fault_tit=%E4%B8%8A%E9%97%A8%E6%95%B0%E6%8D%AE%E6%81%A2%E5%A4%8D&from=360map'
                }
            },
            'info': [
                '内容：电脑清灰，重装系统；数据恢复',
                '价格：维修电脑100元-120元；数据恢复200元-1500元'
            ],
            'poi': true
        },
        '3': {
            'title': '上门按摩',
            'supply': '由点到、功夫熊提供',
            'btn': {
                '0': {'btntxt': '功夫熊', 'url': 'http://w.gfxiong.com/m/lst/product'},
                '1': {
                    'btntxt': '&nbsp;点&nbsp;到&nbsp;',
                    'url': 'http://360life.diandao.org/?utm_source=360_haosou'
                }
            },
            'info': [
                '内容：头颈肩理疗，腰腿理疗，全身理疗',
                '价格：基础价118元-388元'
            ],
            'poi': true
        },
        '4': {
            'title': '代驾、陪练',
            'supply': '由微代驾提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://360.weidaijia.cn/'}
            },
            'info': [
                '内容：酒后代驾、商务代驾、长途代驾、陪练',
                '价格：基础价39元-300元'
            ],
            'poi': true
        },
        '5': {
            'title': '手机上门维修',
            'supply': '由同城帮提供',
            'btn': {
                '0': {
                    'btntxt': '维修手机',
                    'url': 'http://m.bang.360.cn/ziying?category=mobile&from=360map'
                },
                '1': {
                    'btntxt': '数据恢复',
                    'url': 'http://m.bang.360.cn/ziying/yuyue/?gid=11&fault_tit=%E4%B8%8A%E9%97%A8%E6%95%B0%E6%8D%AE%E6%81%A2%E5%A4%8D&from=360map'
                }
            },
            'info': [
                '内容：换屏、换iPhone电池、手机配件；数据恢复',
                '价格：手机维修169元-799元；数据恢复200元-1500元'
            ],
            'poi': true
        },
        '6': {
            'title': 'iPad上门维修',
            'supply': '由同城帮提供',
            'btn': {
                '0': {
                    'btntxt': '维修iPad',
                    'url': 'http://m.bang.360.cn/ziying?category=tablet&from=360map'
                }
            },
            'info': [
                '内容：iPad更换屏幕',
                '价格：299元-399元'
            ],
            'poi': true
        },
        '7': {
            'title': '上门搬家',
            'supply': '由赶集提供',
            'btn': {
                '0': {
                    'btntxt': '放心搬家',
                    'url': 'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=fangxinfuwu&ca_n=360&ca_i=testi&ca_kw=test12&redirect=true#app/fuwu/client/banjia/view/customer/index_page.js?city=bj'
                }
            },
            'info': [
                '费用：面包车120元起，金杯车145元起，厢货车275元起'
            ],
            'poi': true
        },
        '8': {
            'title': '上门洗车',
            'supply': '由赶集易洗车提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=360s&businessCode=360s#app/client/app/xiche/pub_page/view/index.js'}
            },
            'info': [
                '内容：清洗外观、清洗内饰、打蜡、去除虫胶',
                '价格：25元-153元(首单1元)'
            ],
            'poi': true
        },
        '9': {
            'title': '蛋糕',
            'supply': '由生日管家提供',
            'btn': {
                '0': {
                    'btntxt': '订购服务',
                    'url': 'http://m.shengri.cn/shop/cake?hmsr=qhhaosou&r=qhhaosou'
                }
            },
            'info': [
                '内容：在线订购品牌蛋糕',
                '价格：30元起（根据大小、品牌、材料等定价）'
            ],
            'poi': true
        },
        '10': {
            'title': '礼品',
            'supply': '由生日管家提供',
            'btn': {
                '0': {
                    'btntxt': '订购服务',
                    'url': 'http://m.shengri.cn/shop/gift?hmsr=qhhaosou&r=qhhaosou'
                }
            },
            'info': [
                '内容：在线订购品牌礼品',
                '价格：20元起（根据材质、做工、运费等定价）'
            ],
            'poi': true
        },
        '11': {
            'title': '鲜花',
            'supply': '由生日管家提供',
            'btn': {
                '0': {
                    'btntxt': '订购服务',
                    'url': 'http://m.shengri.cn/shop/flower?hmsr=qhhaosou&r=qhhaosou'
                }
            },
            'info': [
                '内容：在线订购品牌鲜花',
                '价格：50元起（根据数量、品牌、品种等定价）'
            ],
            'poi': true
        },
        '12': {
            'title': '家居养护',
            'supply': '由赶集提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=fangxinfuwu&ca_n=360&ca_i=testi&ca_kw=test12&redirect=true#app/fuwu/client/cleaning/view/customer/maintenance_type.js?cleaningType=undefined'
                }
            },
            'info': [
                '费用：地板打蜡5元/平起；皮沙发保养80元/座；布沙发除螨50元/座'
            ],
            'poi': true
        },
        '13': {
            'title': '家政保洁',
            'supply': '由赶集提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=fangxinfuwu&ca_n=360&ca_i=user_id_token&ca_kw=test12&redirect=true#app/fuwu/client/cleaning/view/customer/index.js?city=bj'
                }
            },
            'info': [
                '费用：家庭保洁30元/小时；深度保洁4元/平米；开荒保洁5元/平米'
            ],
            'poi': true
        },
        '14': {
            'title': '宠物洗澡',
            'supply': '由狗狗去哪儿提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://www.dogwhere.com:8080/pet/newOrder/openBath.html?source=360zb&token=XXX&jumpOS=0'
                }
            },
            'info': [
                '内容：各类体型犬上门洗澡',
                '价格：50元-280元（超出部分另算）'
            ],
            'poi': true
        },
        '15': {
            'title': '送药上门',
            'supply': '由药给力提供',
            'btn': {
                '0': {'btntxt': '选购药品', 'url': 'http://medicinepower.cn/web_client/home'},
                '1': {'btntxt': '咨询药师', 'url': 'http://medicinepower.cn/web/consults'}
            },
            'info': [
                '内容：牛皮纸隐私包装，附近药店取药，1小时送上门',
                '价格：选购药品后免费配送'
            ],
            'poi': true
        },
        '16': {
            'title': '美容美体',
            'supply': '由美丽来、小美提供',
            'btn': {
                '0': {
                    'btntxt': '美丽来',
                    'url': 'http://m.meililai.com/meililai/all/projectlist.html?channel=10004&payhome=1'
                },
                '1': {
                    'btntxt': '&nbsp;小&nbsp;美&nbsp;',
                    'url': 'http://t.wx.beauty.xiaolinxiaoli.com/app/wx'
                }
            },
            'info': [
                '内容：美容美体上门服务',
                '价格：58元起'
            ],
            'poi': true
        },
        '17': {
            'title': '洗衣洗鞋',
            'supply': '由阿姨帮、e袋洗提供',
            'btn': {
                '0': {
                    'btntxt': '阿姨帮',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_wash_protect'
                },
                '1': {
                    'btntxt': 'e袋洗',
                    'url': 'http://wx.rongchain.com/mobile.php?m=wap&act=homepage&do=index'
                }
            },
            'info': [
                '内容：衣物干洗水洗，上门取送',
                '价格：9元-36元起'
            ],
            'poi': true
        },
        '18': {
            'title': '擦玻璃',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_clean_glass'
                }
            },
            'info': [
                '内容：专业技师上门擦玻璃',
                '价格：12元/平米，120元起'
            ],
            'poi': true
        },
        '19': {
            'title': '洗窗帘',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_wash_curtain'
                }
            },
            'info': [
                '内容：专业窗帘洗护，上门拆装、取送',
                '价格：布帘15元/平米，纱帘10元/平米'
            ],
            'poi': true
        },
        '20': {
            'title': '洗地毯',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_wash_carpet'
                }
            },
            'info': [
                '内容：专业地毯洗护，上门取送、铺装',
                '价格：化纤40元/平米，纯毛60元/平米'
            ],
            'poi': true
        },
        '21': {
            'title': '空调清洗',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_clean_ac'
                }
            },
            'info': [
                '内容：专业技师上门，标准化工具，深度去污杀菌',
                '价格：壁挂式120元/台；柜式140元/台'
            ],
            'poi': true
        },
        '22': {
            'title': '油烟机清洗',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_clean_fume'
                }
            },
            'info': [
                '内容：深度清洁内部油污，专业技师、标准服务',
                '价格：中式120元/台；欧式140元/台'
            ],
            'poi': true
        },
        '23': {
            'title': '冰箱除臭',
            'supply': '由阿姨帮提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://m.ayibang.com/appointment?keyword=project_clean_fridge'
                }
            },
            'info': [
                '内容：冰箱外壁清洁、消毒，内室除霜、去污',
                '价格：80元-140元/台'
            ],
            'poi': true
        },
        '24': {
            'title': '家电维修',
            'supply': '由赶集提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=fangxinfuwu&ca_n=360&ca_i=user_id_token&ca_kw=test12&redirect=true#app/fuwu/client/repair/view/customer/index.js?city=bj'
                }
            },
            'info': [
                '内容：空调、电视、油烟机等家用电器上门维修',
                '价格：25元-30元/小时'
            ],
            'poi': true
        },
        /*'25': {
            'title': '餐厅预订',
            'supply': '由订餐小秘书提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://m.xiaomishu.com/shop/search'}
            },
            'info': [
                '内容：多渠道餐厅预订服务',
                '价格：免费预订'
            ],
            'poi': true
        },*/
        '26': {
            'title': '上门美甲',
            'supply': '由58到家提供',
            'btn': {
                '0': {
                    'btntxt': '预约服务',
                    'url': 'http://t.jzt.58.com/wap/meijia/products?hmsr=360&comm_pf=0&comm_flag=0'
                }
            },
            'info': [
                '内容：专业美甲上门服务',
                '价格：起步价59元-88元(不同城市起步价不同)'
            ],
            'poi': true
        },
        '27': {
            'title': '在线挂号',
            'supply': '由就医160提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://wap.91160.com/'}
            },
            'info': [
                '内容：支持全国各大医院预约挂号、检查报告单查询',
                '价格：免费预约'
            ],
            'poi': true
        },
        '28': {
            'title': '修车',
            'supply': '由摩卡i车提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://app.mocar.cn/direct/html/?state=,,109,,1'}
            },
            'info': [
                '内容：专业汽车养护、维修上门服务',
                '价格：基础价99元起'
            ],
            'poi': true
        },
        '29': {
            'title': '打车',
            'supply': '由滴滴打车提供',
            'btn': {
                '0': {'btntxt': '预约服务', 'url': 'http://webapp.diditaxi.com.cn/?channel=1355&d=130002030203'}
            },
            'info': [
                '内容：支持全国300多个城市在线叫车',
                '价格：按车内计价器显示金额付费'
            ],
            'poi': true
        }
    };
    return config;
});
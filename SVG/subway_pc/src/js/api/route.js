/* 
    is: 表示展示起/终点图标 true为起点
    ex: 表示是否为换乘站
    rc: 表示圆滑过渡，进行二次贝塞尔曲线绘制
    st: 表示是否需要绘制该点坐标
*/
export default {
    route: {
        origin: '永泰庄',
        destination: '西二旗',
        price: 4,
        duration: 1889,
        transfer: {
            pass: 6,
            segments: [
                {
                    subway: {
                        color: '009B6B',
                        line: '地铁8号线(中国美术馆--朱辛庄)',
                        point: {
                            name: '永泰庄',
                            x: -63.6,
                            y: -200,
                            ex: false,
                            rc: false,
                            st: true,
                            is: true,
                            uid: '2535aaf0fb50b53e210220ac'
                        },
                        stops: [
                            {
                                name: '永泰庄',
                                x: -63.6,
                                y: -200,
                                ex: false,
                                rc: false,
                                st: true,
                                uid: '2535aaf0fb50b53e210220ac'
                            },
                            {
                                name: '西小口',
                                x: -63.6,
                                y: -215,
                                ex: false,
                                rc: false,
                                st: true,
                                uid: 'f34d2b573370194b9de321ac'
                            },
                            {
                                name: '育新',
                                x: -63.6,
                                y: -230,
                                ex: false,
                                rc: false,
                                st: true,
                                uid: '73eae3779f05a5aabfa822ac'
                            },
                            {
                                name: '霍营',
                                x: -63.6,
                                y: -253.6,
                                ex: true,
                                rc: false,
                                st: true,
                                uid: 'b4ca4f0223e487e1d0ff23ac'
                            }
                        ],
                        duration: 683
                    }
                },
                {
                    subway: {
                        color: 'F9E700',
                        line: '地铁13号线(东直门--西直门)',
                        point: {
                            name: '西二旗',
                            x: -183.7,
                            y: -224,
                            ex: true,
                            rc: false,
                            st: true,
                            is: false,
                            uid: 'f33f29f9c7d5c8bc4e2fdf96'
                        },
                        stops: [
                            {
                                name: '霍营',
                                x: -63.6,
                                y: -253.6,
                                ex: true,
                                rc: false,
                                st: true,
                                uid: 'b4ca4f0223e487e1d0ff23ac'
                            },
                            {
                                name: '回龙观',
                                x: -101.3,
                                y: -253.6,
                                ex: false,
                                rc: false,
                                st: true,
                                uid: '611070493252e3a58b36eede'
                            },
                            {
                                name: '龙泽',
                                x: -146.9,
                                y: -253.6,
                                ex: false,
                                rc: false,
                                st: true,
                                uid: '2b62945565ebb27fcc04efde'
                            },
                            {
                                name: '',
                                x: -177.1,
                                y: -247.6,
                                ex: false,
                                rc: true,
                                st: false,
                                uid: ''
                            },
                            {
                                name: '西二旗',
                                x: -183.7,
                                y: -224,
                                ex: true,
                                rc: false,
                                st: true,
                                uid: 'f33f29f9c7d5c8bc4e2fdf96'
                            }
                        ],
                        duration: 906,
                    }
                }
            ]
        }
    }
}
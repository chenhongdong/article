export default {
    route: {
        origin: '永泰庄',
        destination: '霍营',
        price: 4,
        duration: 1889,
        transfer: {
            pass: 6,
            segments: [
                {
                    subway: {
                        color: '009B6B',
                        line: '地铁8号线(中国美术馆--朱辛庄)',
                        stops: [
                            {
                                name: '永泰庄',
                                location: '-63.6,-200',
                                ex: false,
                                rc: false,
                                uid: '2535aaf0fb50b53e210220ac'
                            },
                            {
                                name: '西小口',
                                location: '-63.6,-215',
                                ex: false,
                                rc: false,
                                uid: 'f34d2b573370194b9de321ac'
                            },
                            {
                                name: '育新',
                                location: '-63.6,-230',
                                ex: false,
                                rc: false,
                                uid: '73eae3779f05a5aabfa822ac'
                            },
                            {
                                name: '霍营',
                                location: '-63.6,-253.6',
                                ex: true,
                                rc: false,
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
                        stops: [
                            {
                                name: '霍营',
                                location: '-63.6,-253.6',
                                ex: true,
                                rc: false,
                                uid: 'b4ca4f0223e487e1d0ff23ac'
                            },
                            {
                                name: '回龙观',
                                location: '-101.3,-253.6',
                                ex: false,
                                rc: false,
                                uid: '611070493252e3a58b36eede',
                            },
                            {
                                name: '龙泽',
                                location: '-146.9,-253.6',
                                ex: false,
                                rc: false,
                                uid: '2b62945565ebb27fcc04efde',
                            },
                            {
                                name: '',
                                location: '-177.1,-247.6',
                                ex: false,
                                rc: true,
                                uid: '',
                            },
                            {
                                name: '西二旗',
                                location: '-183.7,-224',
                                ex: true,
                                rc: false,
                                uid: 'f33f29f9c7d5c8bc4e2fdf96',
                            }
                        ],
                        duration: 906,
                    }
                }
            ]
        }
    }
}
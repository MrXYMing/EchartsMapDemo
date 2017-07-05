$(function () {
    $(".content").mCustomScrollbar();

    var myChart;

    //全国总仓坐标
    var provinces = GetProvinces();
    //全国总仓干线
    var provincesTrunk = GetProvincesTrunk();
    var trunkList = ["全国"];
    for (var x in provincesTrunk) {
        trunkList.push(provincesTrunk[x].name);
    }

    SetOption("全国");

    //生成左上角的legend
    function SetLegend(_trunkList) {
        var html = "";
        for (var i = 0; i < 10; i += 1) {
            for (var x in _trunkList) {
                html += "<div class='legendItem clearfloat' onclick=\"ClickLegend('" + _trunkList[x] + "')\"><span class='label'></span><span class='title'>" + _trunkList[x] + "</span></div>"
            }
        }

        $(".legendbox").addClass("show");
        $(".legend").html(html);
    }
    //控制legend点击后的激活颜色
    $(".legend").on("click", ".legendItem", function () {
        $(this).siblings().children(".label").removeClass("active");
        $(this).children(".label").addClass("active");
    });
    //legend的点击事件，重新渲染视图
    ClickLegend = function (_seriesName) {
        var selected = {};
        for (var x in provincesTrunk) {
            if (provincesTrunk[x].name === _seriesName) {
                selected[provincesTrunk[x].name] = true;
            } else {
                selected[provincesTrunk[x].name] = false;
            }
        }
        var _option = myChart.getOption();
        _option.series = SetSeries(_seriesName);
        _option.legend = {
            show: false,
            orient: 'vertical',
            x: 'left',
            data: [_seriesName],
            selectedMode: 'single',
            textStyle: {
                color: '#fff'
            }
        };
        myChart.clear();
        myChart.setOption(_option, true);
    }

    //初始化设置option
    function SetOption(_seriesName) {
        var series = SetSeries(_seriesName);
        var legendData = [_seriesName];
        // 路径配置
        require.config({
            paths: {
                echarts: '../Scripts/echarts'
            }
        });

        // 使用
        require(
            [
                'echarts',
                'echarts/chart/map' // 使用柱状图就加载bar模块，按需加载
            ],
            function (ec) {
                // 基于准备好的dom，初始化echarts图表
                myChart = ec.init(document.getElementById('main'));
                //   myChart.showLoading({text:"数据加载中......"});
                option = {
                    backgroundColor: '#1b1b1b',
                    color: ['gold', 'aqua', 'lime'],
                    title: {
                        text: 'LIS系统在途信息展示',
                        subtext: '测试数据',
                        x: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}'
                    },
                    legend: {
                        show: false,
                        //布局方式，默认为水平布局，可选为：'horizontal' | 'vertical' 
                        orient: 'vertical',
                        //水平安放位置，默认为全图居中，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                        x: 'left',
                        //图例内容数组，数组项通常为{string}，每一项代表一个系列的name，
                        data: legendData,
                        //选择模式，默认开启图例开关，可选single，multiple 
                        selectedMode: 'single',
                        //配置默认选中状态，可配合LEGEND.SELECTED事件做动态数据载入
                        //selected: selected,
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    toolbox: {
                        show: true,
                        orient: 'vertical',
                        x: 'right',
                        y: 'center',
                        feature: {
                            mark: { show: true },
                            dataView: { show: true, readOnly: false },
                            restore: { show: true },
                            saveAsImage: { show: true }
                        }
                    },
                    //值域选择
                    dataRange: {
                        //显示策略
                        show: false,
                        //指定的最小值，eg: 0，默认无，必须参数，唯有指定了splitList时可缺省min。
                        min: 0,
                        //指定的最大值，eg: 100，默认无，必须参数，唯有指定了splitList时可缺省max
                        max: 100,
                        //是否启用值域漫游，启用后无视splitNumber和splitList，值域显示为线性渐变 
                        calculable: true,
                        //值域颜色标识，颜色数组长度必须>=2，颜色代表从数值高到低的变化，即颜色数组低位代表数值高的颜色标识 ，支持Alpha通道上的变化（rgba）
                        color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
                        //默认只设定了值域控件文字颜色
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: series
                };
                var ecConfig = require('echarts/config');
                myChart.on(ecConfig.EVENT.CLICK, function (param) {
                    console.log(param);
                    var seriesIndex = param.seriesIndex;
                    var dataIndex = param.dataIndex;
                    if (typeof seriesIndex === "string" && typeof dataIndex === "number") {
                        var names = param.name.split(">");
                        ShowWaybill(names[0].Trim(), names[1].Trim());
                    } else {
                        $(".waybillList").removeClass("show");
                        $(".details").removeClass("show");
                        $(".waybillList table tbody").html("<tr><td colspan='3'>获取运单清单中，请稍后...</td></tr>");
                        $(".details").html("获取清单详情中，请稍后...");
                        $(".legendbox").removeClass("show");
                        $(".legend").html("");
                        alert("将进入省仓支线总览，敬请期待");
                    }
                });
                // myChart.hideLoading();
                // 为echarts对象加载数据 
                myChart.setOption(option);
                SetLegend(trunkList);
            }
        );
        //_myChart = require('echarts').init(document.getElementById('main'));

    }
    //字符串去除前后空格
    String.prototype.Trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
    //初始化设置option中的series
    function SetSeries(_seriesName) {
        //各干线数据
        // var markLineData = [];
        var lineData = [];
        var pointData = [];

        var series = [];
        if (_seriesName === "全国") {
            for (var x in provincesTrunk) {
                // markLineData[x] = [];
                for (y in provincesTrunk[x].Terminus) {
                    lineData.push([{ name: provincesTrunk[x].firstStation }, { name: provincesTrunk[x].Terminus[y].name }]);
                    pointData.push(provincesTrunk[x].Terminus[y]);
                    //markLineData[x].push([{ name: provincesTrunk[x].firstStation }, provincesTrunk[x].Terminus[y]]);
                }
            }

        } else {
            var _provinces = GetTrunk(_seriesName);
            if (_provinces) {
                pointData = _provinces.Terminus;
                for (y in _provinces.Terminus) {
                    lineData.push([{ name: _provinces.firstStation }, { name: _provinces.Terminus[y].name }]);
                    // provinces.push(provincesTrunk[x].Terminus[y]);
                }
            }
        }


        //[[{ name: '北京' }, { name: '包头' }],[{ name: '北京' }, { name: '北海' }],]


        series = [
            {
                //系列名称，如启用legend，该值将被legend.data索引相关 
                name: _seriesName,
                //图表类型，必要参数！如为空或不支持类型，则该系列数据不被显示。可选为：'line'（折线图） | 'bar'（柱状图） | 'scatter'（散点图） | 'k'（K线图）'pie'（饼图） | 'radar'（雷达图） | 'chord'（和弦图） | 'force'（力导向布局图） | 'map'（地图） 
                type: 'map',
                //是否开启滚轮缩放和拖拽漫游，默认为false（关闭），其他有效输入为true（开启），'scale'（仅开启滚轮缩放），'move'（仅开启拖拽漫游）
                roam: 'scale',
                //非数值显示（如仅用于显示标注标线时），可以通过hoverable:false关闭区域悬浮高亮
                hoverable: false,
                //地图类型，支持world，china及全国34个省市自治区
                mapType: 'china',
                //图形样式,可设置图表内图形的默认样式和强调样式
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(100,149,237,1)',
                        borderWidth: 0.5,
                        areaStyle: {
                            color: '#1b1b1b'
                        }
                    }
                    //,emphasis: {
                    //	...
                    //}
                },
                //数据
                data: [],
                //标线
                markLine: {
                    //平滑曲线显示
                    smooth: true,
                    //标线起始和结束的symbol介绍类型
                    symbol: ['none', 'circle'],
                    //标线起始和结束的symbol大小，半宽（半径）参数，
                    symbolSize: 1,
                    effect: {
                        //loop: 循环动画，默认开启, 
                        //是否开启，默认关闭 
                        show: true,
                        //放大倍数，以markLine lineWidth为基准
                        scaleSize: 1,
                        //运动周期，无单位，值越大越慢，默认为15
                        period: 30,
                        //炫光颜色，默认跟随markLine itemStyle定义颜色,
                        color: '#fff',
                        //光影模糊度，默认根据scaleSize计算 
                        shadowBlur: 10
                    },
                    itemStyle: {
                        normal: {
                            borderWidth: 1,
                            lineStyle: {
                                type: 'solid',
                                shadowBlur: 10
                            }
                        }
                    },
                    data: lineData,
                },
                //终点处的标注以及动画
                markPoint: {
                    //标注类型
                    symbol: 'emptyCircle',
                    //标注大小
                    symbolSize: function (v) {
                        return 10 + v / 10
                    },
                    effect: {
                        show: true,
                        shadowBlur: 0
                    },
                    itemStyle: {
                        normal: {
                            label: { show: false }
                        },
                        emphasis: {
                            label: { position: 'top' }
                        }
                    },
                    //标注图形数据
                    data: pointData
                },
                //通过绝对经纬度指定地区的名称文本位置，如{'Islands':[113.95, 22.26]}，香港离岛区名称显示定位到东经113.95，北纬22.26上
                geoCoord: provinces
            }
        ];

        return series;
        //组成各干线图层
        /*        for (var z in provincesTrunk) {
                    var newObj = {
                        name: provincesTrunk[z].name,
                        type: 'map',
                        mapType: 'china',
                        data: [],
                        markLine: {
                            smooth: true,
                            //标线图形炫光特效:
                            effect: {
                                //loop: 循环动画，默认开启, 
                                //是否开启，默认关闭 
                                show: true,
                                //放大倍数，以markLine lineWidth为基准
                                scaleSize: 1,
                                //运动周期，无单位，值越大越慢，默认为15
                                period: 30,
                                //炫光颜色，默认跟随markLine itemStyle定义颜色,
                                color: '#fff',
                                //光影模糊度，默认根据scaleSize计算 
                                shadowBlur: 10
                            },
                            itemStyle: {
                                normal: {
                                    borderWidth: 1,
                                    lineStyle: {
                                        type: 'solid',
                                        shadowBlur: 10
                                    }
                                }
                            },
                            data: markLineData[z]
                        },
                        //终点处的标注以及动画
                        markPoint: {
                            //标注类型
                            symbol: 'emptyCircle',
                            //标注大小
                            symbolSize: function (v) {
                                return 10 + v / 10
                            },
                            effect: {
                                show: true,
                                shadowBlur: 0
                            },
                            itemStyle: {
                                normal: {
                                    label: { show: false }
                                },
                                emphasis: {
                                    label: { position: 'top' }
                                }
                            },
                            //标注图形数据
                            data: provincesTrunk[z].Terminus
                        }
                    }
                    series.push(newObj);
                }*/
    }
    //显示运单清单
    function ShowWaybill(_firstStation, _Terminus) {
        $(".waybillList table tbody").html("<tr><td colspan='3'>获取运单清单中，请稍后...</td></tr>");
        $(".details").removeClass("show");
        $(".waybillList").addClass("show");
        var html = "";
        var res = GetWaybillList(_firstStation, _Terminus);
        if (res.IsExist) {
            var List = res.waybill;
            for (var x in List) {
                html += "<tr onclick=\"ShowDetails('" + List[x].WaybillNo + "')\"><td>" + List[x].WaybillNo + "</td><td>" + List[x].ExpressNo + "</td><td>" + List[x].Num + "</td></tr>";
            }
        } else {
            html = "<tr><td colspan='3'>" + res.message + "</td></tr>";
        }
        var t = setTimeout(show, 1000);
        function show() {
            $('.waybillList table tbody').html(html);
            clearTimeout(t);
        }
    }
    //显示运单详情
    ShowDetails = function (_WaybillNo) {
        $(".waybillList").removeClass("show");
        $(".details").html("获取清单详情中，请稍后...");
        $(".details").addClass("show");
        var html = "";
        var res = GetDetails(_WaybillNo);
        if (res.IsExist) {
            var _List = res.details;
            console.log(_List);
            for (var x in _List) {
                html += "<div><div class=\"item\">";
                html += "<span>" + _List[x].date + "</span><span>" + _List[x].day + "</span><span>" + _List[x].subDetails[0].time + "</span><span>" + _List[x].subDetails[0].message + "</span></div>";
                html += "<div class=\"subitem\">";
                var length = _List[x].subDetails.length;
                if (length > 1) {
                    for (var i = 1; i < length; i += 1) {
                        html += "<span>" + _List[x].subDetails[i].time + "</span><span>" + _List[x].subDetails[i].message + "</span>";
                    }
                }
                html += "</div></div>";
            }
        } else {
            html = res.message;
        }
        var t = setTimeout(show, 1000);
        function show() {
            $('.details').html(html);
            clearTimeout(t);
        }

    }
    //获取全国总仓坐标
    function GetProvinces() {
        return {
            "上海": [
                121.4648,
                31.2891
            ],
            "东莞": [
                113.8953,
                22.901
            ],
            "东营": [
                118.7073,
                37.5513
            ],
            "中山": [
                113.4229,
                22.478
            ],
            "临汾": [
                111.4783,
                36.1615
            ],
            "临沂": [
                118.3118,
                35.2936
            ],
            "丹东": [
                124.541,
                40.4242
            ],
            "丽水": [
                119.5642,
                28.1854
            ],
            "乌鲁木齐": [
                87.9236,
                43.5883
            ],
            "佛山": [
                112.8955,
                23.1097
            ],
            "保定": [
                115.0488,
                39.0948
            ],
            "兰州": [
                103.5901,
                36.3043
            ],
            "包头": [
                110.3467,
                41.4899
            ],
            "北京": [
                116.4551,
                40.2539
            ],
            "北海": [
                109.314,
                21.6211
            ],
            "南京": [
                118.8062,
                31.9208
            ],
            "南宁": [
                108.479,
                23.1152
            ],
            "南昌": [
                116.0046,
                28.6633
            ],
            "南通": [
                121.1023,
                32.1625
            ],
            "厦门": [
                118.1689,
                24.6478
            ],
            "台州": [
                121.1353,
                28.6688
            ],
            "合肥": [
                117.29,
                32.0581
            ],
            "呼和浩特": [
                111.4124,
                40.4901
            ],
            "咸阳": [
                108.4131,
                34.8706
            ],
            "哈尔滨": [
                127.9688,
                45.368
            ],
            "唐山": [
                118.4766,
                39.6826
            ],
            "嘉兴": [
                120.9155,
                30.6354
            ],
            "大同": [
                113.7854,
                39.8035
            ],
            "大连": [
                122.2229,
                39.4409
            ],
            "天津": [
                117.4219,
                39.4189
            ],
            "太原": [
                112.3352,
                37.9413
            ],
            "威海": [
                121.9482,
                37.1393
            ],
            "宁波": [
                121.5967,
                29.6466
            ],
            "宝鸡": [
                107.1826,
                34.3433
            ],
            "宿迁": [
                118.5535,
                33.7775
            ],
            "常州": [
                119.4543,
                31.5582
            ],
            "广州": [
                113.5107,
                23.2196
            ],
            "廊坊": [
                116.521,
                39.0509
            ],
            "延安": [
                109.1052,
                36.4252
            ],
            "张家口": [
                115.1477,
                40.8527
            ],
            "徐州": [
                117.5208,
                34.3268
            ],
            "德州": [
                116.6858,
                37.2107
            ],
            "惠州": [
                114.6204,
                23.1647
            ],
            "成都": [
                103.9526,
                30.7617
            ],
            "扬州": [
                119.4653,
                32.8162
            ],
            "承德": [
                117.5757,
                41.4075
            ],
            "拉萨": [
                91.1865,
                30.1465
            ],
            "无锡": [
                120.3442,
                31.5527
            ],
            "日照": [
                119.2786,
                35.5023
            ],
            "昆明": [
                102.9199,
                25.4663
            ],
            "杭州": [
                119.5313,
                29.8773
            ],
            "枣庄": [
                117.323,
                34.8926
            ],
            "柳州": [
                109.3799,
                24.9774
            ],
            "株洲": [
                113.5327,
                27.0319
            ],
            "武汉": [
                114.3896,
                30.6628
            ],
            "汕头": [
                117.1692,
                23.3405
            ],
            "江门": [
                112.6318,
                22.1484
            ],
            "沈阳": [
                123.1238,
                42.1216
            ],
            "沧州": [
                116.8286,
                38.2104
            ],
            "河源": [
                114.917,
                23.9722
            ],
            "泉州": [
                118.3228,
                25.1147
            ],
            "泰安": [
                117.0264,
                36.0516
            ],
            "泰州": [
                120.0586,
                32.5525
            ],
            "济南": [
                117.1582,
                36.8701
            ],
            "济宁": [
                116.8286,
                35.3375
            ],
            "海口": [
                110.3893,
                19.8516
            ],
            "淄博": [
                118.0371,
                36.6064
            ],
            "淮安": [
                118.927,
                33.4039
            ],
            "深圳": [
                114.5435,
                22.5439
            ],
            "清远": [
                112.9175,
                24.3292
            ],
            "温州": [
                120.498,
                27.8119
            ],
            "渭南": [
                109.7864,
                35.0299
            ],
            "湖州": [
                119.8608,
                30.7782
            ],
            "湘潭": [
                112.5439,
                27.7075
            ],
            "滨州": [
                117.8174,
                37.4963
            ],
            "潍坊": [
                119.0918,
                36.524
            ],
            "烟台": [
                120.7397,
                37.5128
            ],
            "玉溪": [
                101.9312,
                23.8898
            ],
            "珠海": [
                113.7305,
                22.1155
            ],
            "盐城": [
                120.2234,
                33.5577
            ],
            "盘锦": [
                121.9482,
                41.0449
            ],
            "石家庄": [
                114.4995,
                38.1006
            ],
            "福州": [
                119.4543,
                25.9222
            ],
            "秦皇岛": [
                119.2126,
                40.0232
            ],
            "绍兴": [
                120.564,
                29.7565
            ],
            "聊城": [
                115.9167,
                36.4032
            ],
            "肇庆": [
                112.1265,
                23.5822
            ],
            "舟山": [
                122.2559,
                30.2234
            ],
            "苏州": [
                120.6519,
                31.3989
            ],
            "莱芜": [
                117.6526,
                36.2714
            ],
            "菏泽": [
                115.6201,
                35.2057
            ],
            "营口": [
                122.4316,
                40.4297
            ],
            "葫芦岛": [
                120.1575,
                40.578
            ],
            "衡水": [
                115.8838,
                37.7161
            ],
            "衢州": [
                118.6853,
                28.8666
            ],
            "西宁": [
                101.4038,
                36.8207
            ],
            "西安": [
                109.1162,
                34.2004
            ],
            "贵阳": [
                106.6992,
                26.7682
            ],
            "连云港": [
                119.1248,
                34.552
            ],
            "邢台": [
                114.8071,
                37.2821
            ],
            "邯郸": [
                114.4775,
                36.535
            ],
            "郑州": [
                113.4668,
                34.6234
            ],
            "鄂尔多斯": [
                108.9734,
                39.2487
            ],
            "重庆": [
                107.7539,
                30.1904
            ],
            "金华": [
                120.0037,
                29.1028
            ],
            "铜川": [
                109.0393,
                35.1947
            ],
            "银川": [
                106.3586,
                38.1775
            ],
            "镇江": [
                119.4763,
                31.9702
            ],
            "长春": [
                125.8154,
                44.2584
            ],
            "长沙": [
                113.0823,
                28.2568
            ],
            "长治": [
                112.8625,
                36.4746
            ],
            "阳泉": [
                113.4778,
                38.0951
            ],
            "青岛": [
                120.4651,
                36.3373
            ],
            "韶关": [
                113.7964,
                24.7028
            ]
        }
    }
    //获取全国总仓干线
    function GetProvincesTrunk() {
        return [
            {
                "name": "北京 Top10",
                "firstStation": "北京",
                "Terminus": [
                    { "name": "上海", "value": 95 },
                    { "name": "广州", "value": 90 },
                    { "name": "大连", "value": 80 },
                    { "name": "南宁", "value": 70 },
                    { "name": "南昌", "value": 60 },
                    { "name": "拉萨", "value": 50 },
                    { "name": "长春", "value": 40 },
                    { "name": "包头", "value": 30 },
                    { "name": "重庆", "value": 20 },
                    { "name": "常州", "value": 10 }
                ]
            },
            {
                "name": "上海 Top10",
                "firstStation": "上海",
                "Terminus": [
                    { "name": "包头", "value": 95 },
                    { "name": "昆明", "value": 90 },
                    { "name": "广州", "value": 80 },
                    { "name": "郑州", "value": 70 },
                    { "name": "长春", "value": 60 },
                    { "name": "重庆", "value": 50 },
                    { "name": "长沙", "value": 40 },
                    { "name": "北京", "value": 30 },
                    { "name": "丹东", "value": 20 },
                    { "name": "大连", "value": 10 }
                ]
            },
            {
                "name": "广州 Top10",
                "firstStation": "广州",
                "Terminus": [
                    { "name": "福州", "value": 95 },
                    { "name": "太原", "value": 90 },
                    { "name": "长春", "value": 80 },
                    { "name": "重庆", "value": 70 },
                    { "name": "西安", "value": 60 },
                    { "name": "成都", "value": 50 },
                    { "name": "常州", "value": 40 },
                    { "name": "北京", "value": 30 },
                    { "name": "北海", "value": 20 },
                    { "name": "海口", "value": 10 }
                ]
            }
        ]
    }

    function GetTrunk(_name) {
        var provincesTrunk = GetProvincesTrunk();
        var trunk;
        for (var x in provincesTrunk) {
            if (provincesTrunk[x].name === _name) {
                trunk = provincesTrunk[x];
                break;
            }
        }
        return trunk;
    }
    //获取运单清单
    function GetWaybillList(_firstStation, _Terminus) {
        var waybillList = [
            {
                "provinces": "北京",
                "trunk": "上海",
                "waybill": [
                    { "WaybillNo": "00AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "00AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "00AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "00AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "00AAAA0005", "ExpressNo": "6800133335", "Num": 31 },
                    { "WaybillNo": "01AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "01AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "01AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "01AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "01AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "北京",
                "trunk": "广州",
                "waybill": [
                    { "WaybillNo": "01AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "01AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "01AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "01AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "01AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "北京",
                "trunk": "大连",
                "waybill": [
                    { "WaybillNo": "10AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "10AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "10AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "10AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "10AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "北京",
                "trunk": "南宁",
                "waybill": [
                    { "WaybillNo": "11AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "11AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "11AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "11AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "11AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "北京",
                "trunk": "拉萨",
                "waybill": [
                    { "WaybillNo": "20AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "20AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "20AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "20AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "20AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "上海",
                "trunk": "北京",
                "waybill": [
                    { "WaybillNo": "21AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "21AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "21AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "21AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "21AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
            {
                "provinces": "上海",
                "trunk": "大连",
                "waybill": [
                    { "WaybillNo": "30AAAA0001", "ExpressNo": "6800133331", "Num": 20 },
                    { "WaybillNo": "30AAAA0002", "ExpressNo": "6800133332", "Num": 12 },
                    { "WaybillNo": "30AAAA0003", "ExpressNo": "6800133333", "Num": 30 },
                    { "WaybillNo": "30AAAA0004", "ExpressNo": "6800133334", "Num": 17 },
                    { "WaybillNo": "30AAAA0005", "ExpressNo": "6800133335", "Num": 31 }
                ]
            },
        ];

        var res = {};
        res["IsExist"] = false;
        for (var x in waybillList) {
            if (waybillList[x].provinces === _firstStation && waybillList[x].trunk === _Terminus) {
                res["waybill"] = waybillList[x].waybill;
                res.IsExist = true;
                break;
            }
        }
        if (!res["waybill"]) {
            res["message"] = "该线路暂无订单";
        }
        return res;

    }
    //获取运单详情
    function GetDetails(_WaybillNo) {
        var list = [
            {
                "WaybillNo": "00AAAA0001",
                "Details": [
                    {
                        "date": "2017-06-19",
                        "day": "周一",
                        "subDetails": [
                            {
                                "time": "20:26:53",
                                "message": "您的订单开始处理"
                            },
                            {
                                "time": "20:28:42",
                                "message": "您的订单待配货"
                            },
                            {
                                "time": "20:28:42",
                                "message": "卖家发货"
                            },
                            {
                                "time": "20:28:53",
                                "message": "您的包裹已出库"
                            }
                        ]
                    },
                    {
                        "date": "2017-06-20",
                        "day": "周二",
                        "subDetails": [
                            {
                                "time": "02:15:52",
                                "message": "深圳转运公司 已收入"
                            },
                            {
                                "time": "20:28:42",
                                "message": "深圳转运公司 已发出，下一站 北京转运中心"
                            }
                        ]
                    },
                    {
                        "date": "2017-06-21",
                        "day": "周三",
                        "subDetails": [
                            {
                                "time": "02:15:52",
                                "message": "深圳转运公司 已收入"
                            },
                            {
                                "time": "20:28:42",
                                "message": "深圳转运公司 已发出，下一站 北京转运中心"
                            }
                        ]
                    },
                    {
                        "date": "2017-06-22",
                        "day": "周四",
                        "subDetails": [
                            {
                                "time": "02:15:52",
                                "message": "深圳转运公司 已收入"
                            },
                            {
                                "time": "20:28:42",
                                "message": "深圳转运公司 已发出，下一站 北京转运中心"
                            }
                        ]
                    }
                ]
            }
        ];

        var res = {};
        res["IsExist"] = false;
        for (var x in list) {
            if (list[x].WaybillNo === _WaybillNo) {
                res["details"] = list[x].Details;
                res.IsExist = true;
                break;
            }
        }
        if (!res["details"]) {
            res["message"] = "该订单暂无订单详情";
        }
        return res;

    }
    /* //全国总仓坐标
     var provinces = GetProvinces();
     //全国总仓干线坐标
     var provincesTrunk = GetProvincesTrunk();
 
     //全国总仓干线
     var allTrunk = [];
     //全国总仓
     var allProvinces = [];
     //各干线数据
     var markLineData = [];
     //展示抬头
     var legendData = ["全国"];
     //抬头默认不选中项
     var selected = {"全国":false};
     for (var x in provincesTrunk) {
         legendData.push(provincesTrunk[x].name);
         selected[provincesTrunk[x].name] = false;
         markLineData[x] = [];
         for (y in provincesTrunk[x].Terminus) {
             allTrunk.push([{ name: provincesTrunk[x].firstStation }, { name: provincesTrunk[x].Terminus[y].name }]);
             allProvinces.push(provincesTrunk[x].Terminus[y]);
             markLineData[x].push([{ name: provincesTrunk[x].firstStation }, provincesTrunk[x].Terminus[y]]);
         }
     }
     //[[{ name: '北京' }, { name: '包头' }],[{ name: '北京' }, { name: '北海' }],]
 
 
     var series = [
         {
             //系列名称，如启用legend，该值将被legend.data索引相关 
             name: '全国',
             //图表类型，必要参数！如为空或不支持类型，则该系列数据不被显示。可选为：'line'（折线图） | 'bar'（柱状图） | 'scatter'（散点图） | 'k'（K线图）'pie'（饼图） | 'radar'（雷达图） | 'chord'（和弦图） | 'force'（力导向布局图） | 'map'（地图） 
             type: 'map',
             //是否开启滚轮缩放和拖拽漫游，默认为false（关闭），其他有效输入为true（开启），'scale'（仅开启滚轮缩放），'move'（仅开启拖拽漫游）
             roam: 'scale',
             //非数值显示（如仅用于显示标注标线时），可以通过hoverable:false关闭区域悬浮高亮
             hoverable: false,
             //地图类型，支持world，china及全国34个省市自治区
             mapType: 'china',
             //图形样式,可设置图表内图形的默认样式和强调样式
             itemStyle: {
                 normal: {
                     borderColor: 'rgba(100,149,237,1)',
                     borderWidth: 0.5,
                     areaStyle: {
                         color: '#1b1b1b'
                     }
                 }
                 //,emphasis: {
                 //	...
                 //}
             },
             //数据
             data: [],
             //标线
             markLine: {
                 //平滑曲线显示
                 smooth: true,
                 //标线起始和结束的symbol介绍类型
                 symbol: ['none', 'circle'],
                 //标线起始和结束的symbol大小，半宽（半径）参数，
                 symbolSize: 1,
                 effect: {
                     //loop: 循环动画，默认开启, 
                     //是否开启，默认关闭 
                     show: true,
                     //放大倍数，以markLine lineWidth为基准
                     scaleSize: 1,
                     //运动周期，无单位，值越大越慢，默认为15
                     period: 30,
                     //炫光颜色，默认跟随markLine itemStyle定义颜色,
                     color: '#fff',
                     //光影模糊度，默认根据scaleSize计算 
                     shadowBlur: 10
                 },
                 itemStyle: {
                     normal: {
                         borderWidth: 1,
                         lineStyle: {
                             type: 'solid',
                             shadowBlur: 10
                         }
                     }
                 },
                 //标线的数据内容数组,[{name: '标线1起点', value: 100, x: 50, y: 20},{name: '标线1终点', x: 150, y: 120}],
                 //标线数据比较特殊也最为常用的地图上，除了直接位置定位外，如果希望基于地理坐标标线，并且能够随地图漫游缩放，需要为markLine提供一份geoCoord，如下:
                 //data : [[{name: '北京', value: 100},{name:'上海'}],[{name: '北京', value: 100},{name:'广州'}]],
                 //geoCoord : {"北京":[116.46,39.92],           // 支持数组[经度，维度]"广州":[113.23,23.16],"上海": {x: 121.48, y: 31.22},   // 支持对象{x:经度,y:纬度}}
                 data: allTrunk,
             },
             //终点处的标注以及动画
             markPoint: {
                 //标注类型
                 symbol: 'emptyCircle',
                 //标注大小
                 symbolSize: function (v) {
                     return 10 + v / 10
                 },
                 effect: {
                     show: true,
                     shadowBlur: 0
                 },
                 itemStyle: {
                     normal: {
                         label: { show: false }
                     },
                     emphasis: {
                         label: { position: 'top' }
                     }
                 },
                 //标注图形数据
                 data: allProvinces
             },
             //通过绝对经纬度指定地区的名称文本位置，如{'Islands':[113.95, 22.26]}，香港离岛区名称显示定位到东经113.95，北纬22.26上
             geoCoord: provinces
         }
     ];
     //组成各干线图层
     for (var z in provincesTrunk) {
         var newObj = {
             name: provincesTrunk[z].name,
             type: 'map',
             mapType: 'china',
             data: [],
             markLine: {
                 smooth: true,
                 //标线图形炫光特效:
                 effect: {
                     //loop: 循环动画，默认开启, 
                     //是否开启，默认关闭 
                     show: true,
                     //放大倍数，以markLine lineWidth为基准
                     scaleSize: 1,
                     //运动周期，无单位，值越大越慢，默认为15
                     period: 30,
                     //炫光颜色，默认跟随markLine itemStyle定义颜色,
                     color: '#fff',
                     //光影模糊度，默认根据scaleSize计算 
                     shadowBlur: 10
                 },
                 itemStyle: {
                     normal: {
                         borderWidth: 1,
                         lineStyle: {
                             type: 'solid',
                             shadowBlur: 10
                         }
                     }
                 },
                 data: markLineData[z]
             },
             //终点处的标注以及动画
             markPoint: {
                 //标注类型
                 symbol: 'emptyCircle',
                 //标注大小
                 symbolSize: function (v) {
                     return 10 + v / 10
                 },
                 effect: {
                     show: true,
                     shadowBlur: 0
                 },
                 itemStyle: {
                     normal: {
                         label: { show: false }
                     },
                     emphasis: {
                         label: { position: 'top' }
                     }
                 },
                 //标注图形数据
                 data: provincesTrunk[z].Terminus
             }
         }
         series.push(newObj);
     }
 
     // 路径配置
     require.config({
         paths: {
             echarts: '../Scripts/echarts'
         }
     });
 
     // 使用
     require(
         [
             'echarts',
             'echarts/chart/map' // 使用柱状图就加载bar模块，按需加载
         ],
         function (ec) {
             // 基于准备好的dom，初始化echarts图表
             var myChart = ec.init(document.getElementById('main'));
             //   myChart.showLoading({text:"数据加载中......"});
             option = {
                 backgroundColor: '#1b1b1b',
                 color: ['gold', 'aqua', 'lime'],
                 title: {
                     text: 'LIS系统在途信息展示',
                     subtext: '测试数据',
                     x: 'center',
                     textStyle: {
                         color: '#fff'
                     }
                 },
                 tooltip: {
                     trigger: 'item',
                     formatter: '{b}'
                 },
                 legend: {
                     //布局方式，默认为水平布局，可选为：'horizontal' | 'vertical' 
                     orient: 'vertical',
                     //水平安放位置，默认为全图居中，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                     x: 'left',
                     //图例内容数组，数组项通常为{string}，每一项代表一个系列的name，
                     data: legendData,
                     //选择模式，默认开启图例开关，可选single，multiple 
                     selectedMode: 'single',
                     //配置默认选中状态，可配合LEGEND.SELECTED事件做动态数据载入
                     selected: selected,
                     textStyle: {
                         color: '#fff'
                     }
                 },
                 toolbox: {
                     show: true,
                     orient: 'vertical',
                     x: 'right',
                     y: 'center',
                     feature: {
                         mark: { show: true },
                         dataView: { show: true, readOnly: false },
                         restore: { show: true },
                         saveAsImage: { show: true }
                     }
                 },
                 //值域选择
                 dataRange: {
                     //显示策略
                     show: false,
                     //指定的最小值，eg: 0，默认无，必须参数，唯有指定了splitList时可缺省min。
                     min: 0,
                     //指定的最大值，eg: 100，默认无，必须参数，唯有指定了splitList时可缺省max
                     max: 100,
                     //是否启用值域漫游，启用后无视splitNumber和splitList，值域显示为线性渐变 
                     calculable: true,
                     //值域颜色标识，颜色数组长度必须>=2，颜色代表从数值高到低的变化，即颜色数组低位代表数值高的颜色标识 ，支持Alpha通道上的变化（rgba）
                     color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
                     //默认只设定了值域控件文字颜色
                     textStyle: {
                         color: '#fff'
                     }
                 },
                 series: series
             };
             var ecConfig = require('echarts/config');
             myChart.on(ecConfig.EVENT.CLICK, function (param) {
                 console.log(param);
                 var seriesIndex = param.seriesIndex;
                 var dataIndex = param.dataIndex;
                 if (typeof seriesIndex === "string" && typeof dataIndex === "number") {
                     ShowWaybill(seriesIndex, dataIndex);
                 } else {
                     $(".waybillList").removeClass("show");
                     alert("将进入省仓支线总览，敬请期待");
                 }
             });
             // myChart.hideLoading();
             // 为echarts对象加载数据 
             myChart.setOption(option);
         }
     );*/
});

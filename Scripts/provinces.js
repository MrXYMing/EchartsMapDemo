//全国总仓地图
var myChart;
//全省总仓地图
//var myCityChart;
//全国缩略图
var myChinaChart;
//echarts/config
var ecConfig;
//全国总仓坐标
var provinces;
//全国总仓干线
var provincesTrunk;
//全国城市坐标
var citys;
//全省干线
var citysTrunk;
//所选省份
var selectedProvince;

$(function () {
    $(".box").css({ width: $(window).width(), height: $(window).height() });
    $(window).resize(function () {
        $(".box").css({ width: $(window).width(), height: $(window).height() });

        myChart.resize();
    });
    //定义滚动条组件
    $(".content").mCustomScrollbar();

    //全国总仓坐标
    provinces = GetProvinces();
    //全国总仓干线
    provincesTrunk = GetProvincesTrunk();
    //全国城市坐标
    citys = GetCitys();
    //设置全国总仓option
    SetOption("全国");
    setInterval("startTime()", 500);
});

function startTime() {
    var today = new Date();
    var y = today.getFullYear();
    var mo = checkTime(today.getMonth() + 1);
    var d = checkTime(today.getDate());
    var h = checkTime(today.getHours());
    var m = checkTime(today.getMinutes());
    var s = checkTime(today.getSeconds());
    var _html = y + "/" + mo + "/" + d + " " + h + ":" + m + ":" + s;
    $('.showtime').html(_html);
}

function checkTime(i) {
    if (i < 10)
    { i = "0" + i }
    return i
}

//生成左上角的legend
function SetLegend(_trunkList) {
    var html = "";
    for (var x in _trunkList) {
        //  html += "<div class='legendItem clearfloat' onclick=\"ClickLegend('" + _trunkList[x] + "')\"><span class='label'></span><span class='title'>" + _trunkList[x] + "</span></div>"
        html += "<option value='" + _trunkList[x] + "'>" + _trunkList[x] + "</option>"
    }
    $(".legendbox").addClass("show");
    $(".legend").html(html);
}
//legend的change事件，重新渲染视图
$(".box").on("change", "#legend", function () {
    var animate = new Animate();
    animate.ClearWaybillbox();
    animate.ClearDetailsbox();
    var _seriesName = $(this).val();
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
});
//字符串去除前后空格
String.prototype.Trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
//初始化设置option
function SetOption(_seriesName) {
    var series = SetSeries(_seriesName);
    var legendData = [_seriesName];
    // 路径配置
    require.config({
        paths: {
            echarts: 'Scripts/echarts'
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
                /* toolbox: {
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
                 },*/
                //值域选择
                dataRange: {
                    //显示策略
                    show: true,
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
            ecConfig = require('echarts/config');
            myChart.on(ecConfig.EVENT.CLICK, function (param) {
                console.log(param);
                var seriesIndex = param.seriesIndex;
                var dataIndex = param.dataIndex;
                if (typeof seriesIndex === "string" && typeof dataIndex === "number") {
                    var names = param.name.split(">");
                    if (names[1]) {
                        ShowWaybill(names[0].Trim(), names[1].Trim());
                    }
                } else {
                    /* $(".waybillList").removeClass("show");
                     $(".details").removeClass("show");
                     $(".waybillList table tbody").html("<tr><td colspan='3'>获取运单清单中，请稍后...</td></tr>");
                     $(".details").html("获取清单详情中，请稍后...");
                     $(".legendbox").removeClass("show");
                     $(".legend").html("");*/
                    $(".waybillList table tbody").html("<tr><td colspan='3'>获取运单清单中，请稍后...</td></tr>");
                    $(".details").html("获取清单详情中，请稍后...");
                    $(".legend").html("<option value='--'>--</option>");
                    //销毁全国总仓视图
                    myChart.dispose();
                    //重新渲染全省总仓视图
                    SetSecondInit(param.name);

                    //alert("将进入 "+param.name+" 的省仓支线总览，敬请期待");
                }
            });
            // myChart.hideLoading();
            // 为echarts对象加载数据 
            myChart.setOption(option);

            var trunkList = ["全国"];
            for (var x in provincesTrunk) {
                trunkList.push(provincesTrunk[x].name);
            }
            SetLegend(trunkList);
        }
    );
    //_myChart = require('echarts').init(document.getElementById('main'));

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
            for (y in provincesTrunk[x].Terminus) {
                lineData.push([{ name: provincesTrunk[x].firstStation }, { name: provincesTrunk[x].Terminus[y].name, value: provincesTrunk[x].Terminus[y].value }]);
                pointData.push(provincesTrunk[x].Terminus[y]);
            }
        }
    } else {
        var _provinces = GetTrunk(_seriesName);
        if (_provinces) {
            pointData = _provinces.Terminus;
            for (y in _provinces.Terminus) {
                lineData.push([{ name: _provinces.firstStation }, { name: _provinces.Terminus[y].name, value: _provinces.Terminus[y].value }]);
            }
        }
    }
    series = [
        {
            //系列名称，如启用legend，该值将被legend.data索引相关 
            name: _seriesName,
            //图表类型，必要参数！如为空或不支持类型，则该系列数据不被显示。可选为：'line'（折线图） | 'bar'（柱状图） | 'scatter'（散点图） | 'k'（K线图）'pie'（饼图） | 'radar'（雷达图） | 'chord'（和弦图） | 'force'（力导向布局图） | 'map'（地图） 
            type: 'map',
            //是否开启滚轮缩放和拖拽漫游，默认为false（关闭），其他有效输入为true（开启），'scale'（仅开启滚轮缩放），'move'（仅开启拖拽漫游）
            roam: 'scale',
            //非数值显示（如仅用于显示标注标线时），可以通过hoverable:false关闭区域悬浮高亮
            hoverable: true,
            //地图类型，支持world，china及全国34个省市自治区
            mapType: 'china',
            //图形样式,可设置图表内图形的默认样式和强调样式
            itemStyle: {
                normal: {
                    label: { show: true },
                    borderColor: 'rgba(100,149,237,1)',
                    borderWidth: 0.5,
                    areaStyle: {
                        color: '#1b1b1b'
                    }
                },
                emphasis: {
                    label: { show: true }
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
}
//设置第二次初始化
function SetSecondInit(_selectedProvince) {
    //$("#main").css("width", "67%");
    var animate = new Animate();
    animate.ClearWaybillbox();
    animate.ClearDetailsbox();
    $("#minor").css("display", "block");
    $(".back").addClass("show");
    SetChina(_selectedProvince);
    SetCityOption(_selectedProvince);
}
//初始化省仓支线中的省份地图的option
function SetCityOption(_selectedProvince) {
    // 路径配置
    require.config({
        paths: {
            echarts: 'Scripts/echarts'
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
            //   myChart.showLoading({ text: "数据加载中......" });
            var series = SetCitySeries(_selectedProvince, true);
            option = {
                backgroundColor: '#1b1b1b',
                series: series,
                legend: {
                    x: 'right',
                    data: []
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                dataRange: {
                    //显示策略
                    show: true,
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
                }
            };
            //  ecConfig = require('echarts/config');
            myChart.on(ecConfig.EVENT.CLICK, function (param) {
                console.log(param);
                var seriesIndex = param.seriesIndex;
                var dataIndex = param.dataIndex;
                if (typeof seriesIndex === "string" && typeof dataIndex === "number") {
                    var names = param.name.split(">");
                    ShowWaybill(names[0].Trim(), names[1].Trim());
                } else {
                    console.log(param.data.name);
                }
            });

            myChart.setOption(option);
            //   myChart.hideLoading();
            var cityTrunkList = ["全省"];
            for (var x in citysTrunk) {
                cityTrunkList.push(citysTrunk[x].firstStation);
            }
            SetLegend(cityTrunkList);

            selectedProvince = _selectedProvince;
            $(".box").off("change", "#legend");
            $(".box").on("change", "#legend", function () {
                var animate = new Animate();
                animate.ClearWaybillbox();
                animate.ClearDetailsbox();
                var _seriesName = $(this).val();
                var _option = myChart.getOption();
                _option.series = SetCitySeries(selectedProvince, false, _seriesName);
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
            });
        }
    );

}
//初始化省仓支线中的省份地图option的series
function SetCitySeries(_selectedProvince, _isProvince, _selectedCity) {
    var lineData = [];
    var pointData = [];
    var series = [];
    if (_isProvince) {
        citysTrunk = GetCityTrunk(_selectedProvince);
        var _cityTrunk = citysTrunk;
        for (var x in _cityTrunk) {
            for (y in _cityTrunk[x].Terminus) {
                lineData.push([{ name: _cityTrunk[x].firstStation }, { name: _cityTrunk[x].Terminus[y].name, value: _cityTrunk[x].Terminus[y].value }]);
                pointData.push(_cityTrunk[x].Terminus[y]);
            }
        }
    } else {
        var trunk;
        if (_selectedCity === "全省") {
            for (var x in citysTrunk) {
                for (y in citysTrunk[x].Terminus) {
                    lineData.push([{ name: citysTrunk[x].firstStation }, { name: citysTrunk[x].Terminus[y].name, value: citysTrunk[x].Terminus[y].value }]);
                    pointData.push(citysTrunk[x].Terminus[y]);
                }
            }
        } else {
            for (var x in citysTrunk) {
                if (citysTrunk[x].firstStation === _selectedCity) {
                    trunk = citysTrunk[x];
                    break;
                }
            }
        }
        if (trunk) {
            pointData = trunk.Terminus;
            for (y in trunk.Terminus) {
                lineData.push([{ name: trunk.firstStation }, { name: trunk.Terminus[y].name, value: trunk.Terminus[y].value }]);
            }
        }
    }

    var _series = [{
        name: '',
        type: 'map',
        roam: 'scale',
        mapType: _selectedProvince,
        itemStyle: {
            normal: {
                label: { show: true },
                borderColor: 'rgba(100,149,237,1)',
                borderWidth: 0.5,
                areaStyle: {
                    color: '#1b1b1b'
                }
            },
            emphasis: { label: { show: true } }
            //,emphasis: {
            //	...
            //}
        },
        mapLocation: {
            x: 'center',
            y: 'top'
        },
        hoverable: false,
        roam: true,
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
            data: lineData
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
        geoCoord: citys
    }];

    return _series;
}
//生成省仓支线图中的全国地图
function SetChina(_selectedProvince) {
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
            var data = [
                { name: '北京', selected: false },
                { name: '天津', selected: false },
                { name: '上海', selected: false },
                { name: '重庆', selected: false },
                { name: '河北', selected: false },
                { name: '河南', selected: false },
                { name: '云南', selected: false },
                { name: '辽宁', selected: false },
                { name: '黑龙江', selected: false },
                { name: '湖南', selected: false },
                { name: '安徽', selected: false },
                { name: '山东', selected: false },
                { name: '新疆', selected: false },
                { name: '江苏', selected: false },
                { name: '浙江', selected: false },
                { name: '江西', selected: false },
                { name: '湖北', selected: false },
                { name: '广西', selected: false },
                { name: '甘肃', selected: false },
                { name: '山西', selected: false },
                { name: '内蒙古', selected: false },
                { name: '陕西', selected: false },
                { name: '吉林', selected: false },
                { name: '福建', selected: false },
                { name: '贵州', selected: false },
                { name: '广东', selected: false },
                { name: '青海', selected: false },
                { name: '西藏', selected: false },
                { name: '四川', selected: false },
                { name: '宁夏', selected: false },
                { name: '海南', selected: false },
                { name: '台湾', selected: false },
                { name: '香港', selected: false },
                { name: '澳门', selected: false }
            ];
            for (var x in data) {
                if (data[x].name === _selectedProvince) {
                    data[x].selected = true;
                    break;
                }
            }
            // 基于准备好的dom，初始化echarts图表
            myChinaChart = ec.init(document.getElementById('minor'));
            //   myChinaChart.showLoading({ text: "数据加载中......" });
            option = {
                // backgroundColor: '#1b1b1b',
                //提示框，鼠标悬浮交互时的信息提示 
                /*tooltip: {
                    trigger: 'item'
                },*/

                series: [
                    {
                        tooltip: {
                            trigger: 'item',
                            formatter: '{b}'
                        },
                        name: '中国',
                        type: 'map',
                        roam: 'scale',
                        mapType: 'china',
                        mapLocation: {
                            x: 'left',
                            y: 'top'
                        },
                        roam: true,
                        selectedMode: 'single',
                        itemStyle: {
                            //normal:{label:{show:true}},
                            emphasis: { label: { show: true } }
                        },
                        data: data
                    }
                ],
                animation: false
            };
            // ecConfig = require('echarts/config');
            myChinaChart.on(ecConfig.EVENT.MAP_SELECTED, function (param) {
                var animate = new Animate();
                animate.ClearWaybillbox();
                animate.ClearDetailsbox();

                var selected = param.selected;
                for (var x in selected) {
                    if (selected[x]) {
                        selectedProvince = x;
                        break;
                    }
                }
                console.log(selected);
                console.log(selectedProvince);

                var _option = myChart.getOption();
                _option.series = SetCitySeries(selectedProvince, true);
                myChart.clear();
                myChart.setOption(_option, true);


                var cityTrunkList = ["全省"];
                for (var x in citysTrunk) {
                    cityTrunkList.push(citysTrunk[x].firstStation);
                }
                SetLegend(cityTrunkList);

            });
            myChinaChart.setOption(option);
            //   myChinaChart.hideLoading();
        }
    );
}
$(".box").on("click", ".back", function () {
    var animate = new Animate();
    animate.ClearWaybillbox();
    animate.ClearDetailsbox();
    //销毁全国总仓视图
    myChinaChart.dispose();
    myChart.dispose();
    $("#minor").css("display", "none");
    $(".back").removeClass("show");
    //重新渲染全省总仓视图
    SetOption("全国");

    var trunkList = ["全国"];
    for (var x in provincesTrunk) {
        trunkList.push(provincesTrunk[x].name);
    }
    SetLegend(trunkList);

    $(".box").off("change", "#legend");
    $(".box").on("change", "#legend", function () {
        var animate = new Animate();
        animate.ClearWaybillbox();
        animate.ClearDetailsbox();
        var _seriesName = $(this).val();
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
    });

});

var Animate = function () { };
Animate.prototype = {
    ClearWaybillbox: function () {
        $(".waybillList").hide(1000);
        $(".tbodybox").animate({ height: "0" }, 1000);
    },
    InitWaybillbox: function () {
        $(".waybillList").show(1000);
        $(".tbodybox").animate({ height: "0" });
    },
    ShowTbodybox: function () {
        $(".tbodybox").animate({ height: "130px" }, 1000);
        $(".detailsbox").animate({ height: "230px", width: "350px" });
    },
    ClearDetailsbox: function () {
        $(".detailsbox").animate({ height: "0", width: "0" }, 1000);
        $(".detailsbox").hide(1000);
        $(".detailsbox .table").animate({ height: "0" }, 1000);
    },
    InitDetailsbox: function () {
        //  $(".detailsbox").animate({ height: "314px" });
        $(".detailsbox").show();
        $(".detailsbox .table").animate({ height: "16px" }, 1000);
    },
    ShowDetails: function () {
        //$(".detailsbox .table").css('height')
        // $(".detailsbox").animate({ height: "314px" }, 1000);
        var _height = $(".details").height();
        if (_height > 228) {
            _height = 228;
        }
        $(".detailsbox .table").animate({ height: _height + "px" }, 1000);
    },
}
//显示运单清单
function ShowWaybill(_firstStation, _Terminus) {
    var _title ="<span class='Highlight'>"+_firstStation+"</span> 至 " +"<span class='Highlight'>"+_Terminus+"</span>";
    $(".waybillList .waybilltitle .statetitle").html(_title);
    $(".waybillList .table .tbody").html("<div><span>获取运单清单中，请稍后...</span></div>");
    var animate = new Animate();
    animate.InitWaybillbox();
    animate.ClearDetailsbox();
    var html = "";
    var res = GetWaybillList(_firstStation, _Terminus);
    if (res.IsExist) {
        var List = res.waybill;
        for (var x in List) {
            html += "<div class='btnclick clearfloat' onclick=\"ShowDetails('" + List[x].WaybillNo + "')\"><label title='" + List[x].WaybillNo + "'>" + List[x].WaybillNo + "</label><label title='" + List[x].ExpressNo + "'>" + List[x].ExpressNo + "</label><label title='" + List[x].Num + "'>" + List[x].Num + "</label><label title='" + List[x].shipping + "'>" + List[x].shipping + "</label></div>";
        }
    } else {
        html = "<div class='clearfloat'><span>" + res.message + "</span></div>";
    }
    var t = setTimeout(show, 1000);
    function show() {
        $('.waybillList .table .tbody').html(html);
        animate.ShowTbodybox();
        clearTimeout(t);
    }
}
$(".waybillList").on("click", ".btnclick", function () {
    $(this).siblings().removeClass("select");
    $(this).addClass("select");
});
//关闭运单清单
CloseWaybill = function () {
    var animate = new Animate();
    animate.ClearWaybillbox();
    animate.ClearDetailsbox();
    //$(".detailsbox").hide(1000);
}
//显示运单详情
ShowDetails = function (_WaybillNo) {
    $(".details").html("获取清单详情中，请稍后...");
    var animate = new Animate();
    animate.InitDetailsbox();
    // $(".detailsbox").show(1000);
    var html = "";
    var res = GetDetails(_WaybillNo);
    if (res.IsExist) {
        var _List = res.details;
        console.log(_List);
        for (var x in _List) {
            html += "<div class=\"item clearfloat\">";
            html += "<label title='" + _List[x].date + "'>" + _List[x].date + "/" + _List[x].days + "</label><label title='" + _List[x].subDetails[0].time + "'>" + _List[x].subDetails[0].time + "</label><label title='" + _List[x].subDetails[0].message + "'>[" + _List[x].subDetails[0].address + "]" + _List[x].subDetails[0].message + "</label><label><span></span></label></div>";
            //html += "<div class=\"subitem\">";
            var length = _List[x].subDetails.length;
            if (length > 1) {
                for (var i = 1; i < length; i += 1) {
                    html += "<div class=\"subitem clearfloat\"><label title='" + _List[x].subDetails[i].time + "'>" + _List[x].subDetails[i].time + "</label><label title='" + _List[x].subDetails[i].message + "'>[" + _List[x].subDetails[i].address + "]" + _List[x].subDetails[i].message + "</label></div>";
                }
            }
            //  html += "</div>";
        }
    } else {
        html = res.message;
    }
    var t = setTimeout(show, 1000);
    function show() {
        $('.details').html(html);
        // $(".details").hide();
        // $(".details").show(1000);
        animate.ShowDetails();
        clearTimeout(t);
    }

}
//关闭运单详情
CloseDetails = function () {
    // $(".details").hide(1000);
    // $(".detailsbox").hide(1000);
    var animate = new Animate();
    animate.ClearDetailsbox();
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
//获取全国城市
function GetCitys() {
    return {
        "忻州市": [112.4561, 38.8971],
        "吕梁市": [111.3574, 37.7325],
        "临汾市": [111.4783, 36.1615],
        "晋中市": [112.7747, 37.37],
        "运城市": [111.1487, 35.2002],
        "大同市": [113.7854, 39.8035],
        "长治市": [112.8625, 36.4746],
        "朔州市": [113.0713, 39.6991],
        "晋城市": [112.7856, 35.6342],
        "太原市": [112.3352, 37.9413],
        "阳泉市": [113.4778, 38.0951],
        "榆林市": [109.8743, 38.205],
        "延安市": [109.1052, 36.4252],
        "汉中市": [106.886, 33.0139],
        "安康市": [109.1162, 32.7722],
        "商洛市": [109.8083, 33.761],
        "宝鸡市": [107.1826, 34.3433],
        "渭南市": [109.7864, 35.0299],
        "咸阳市": [108.4131, 34.8706],
        "西安市": [109.1162, 34.2004],
        "铜川市": [109.0393, 35.1947],
        "烟台市": [120.7397, 37.5128],
        "临沂市": [118.3118, 35.2936],
        "潍坊市": [119.0918, 36.524],
        "青岛市": [120.4651, 36.3373],
        "菏泽市": [115.6201, 35.2057],
        "济宁市": [116.8286, 35.3375],
        "德州市": [116.6858, 37.2107],
        "滨州市": [117.8174, 37.4963],
        "聊城市": [115.9167, 36.4032],
        "东营市": [118.7073, 37.5513],
        "济南市": [117.1582, 36.8701],
        "泰安市": [117.0264, 36.0516],
        "威海市": [121.9482, 37.1393],
        "日照市": [119.2786, 35.5023],
        "淄博市": [118.0371, 36.6064],
        "枣庄市": [117.323, 34.8926],
        "莱芜市": [117.6526, 36.2714],
        "海西蒙古族藏族自治州": [94.9768, 37.1118],
        "玉树藏族自治州": [93.5925, 33.9368],
        "果洛藏族自治州": [99.3823, 34.0466],
        "海南藏族自治州": [100.3711, 35.9418],
        "海北藏族自治州": [100.3711, 37.9138],
        "黄南藏族自治州": [101.5686, 35.1178],
        "海东地区": [102.3706, 36.2988],
        "西宁市": [101.4038, 36.8207],
        "吴忠市": [106.853, 37.3755],
        "中卫市": [105.4028, 36.9525],
        "固原市": [106.1389, 35.9363],
        "银川市": [106.3586, 38.1775],
        "石嘴山市": [106.4795, 39.0015],
        "呼伦贝尔市": [120.8057, 50.2185],
        "阿拉善盟": [102.019, 40.1001],
        "锡林郭勒盟": [115.6421, 44.176],
        "鄂尔多斯市": [108.9734, 39.2487],
        "赤峰市": [118.6743, 43.2642],
        "巴彦淖尔市": [107.5562, 41.3196],
        "通辽市": [121.4758, 43.9673],
        "乌兰察布市": [112.5769, 41.77],
        "兴安盟": [121.3879, 46.1426],
        "包头市": [110.3467, 41.4899],
        "呼和浩特市": [111.4124, 40.4901],
        "乌海市": [106.886, 39.4739],
        "大连市": [122.2229, 39.4409],
        "朝阳市": [120.0696, 41.4899],
        "丹东市": [124.541, 40.4242],
        "铁岭市": [124.2773, 42.7423],
        "沈阳市": [123.1238, 42.1216],
        "抚顺市": [124.585, 41.8579],
        "葫芦岛市": [120.1575, 40.578],
        "阜新市": [122.0032, 42.2699],
        "锦州市": [121.6626, 41.4294],
        "鞍山市": [123.0798, 40.6055],
        "本溪市": [124.1455, 41.1987],
        "营口市": [122.4316, 40.4297],
        "辽阳市": [123.4094, 41.1383],
        "盘锦市": [121.9482, 41.0449],
        "赣州市": [115.2795, 25.8124],
        "吉安市": [114.884, 26.9659],
        "上饶市": [117.8613, 28.7292],
        "九江市": [115.4224, 29.3774],
        "抚州市": [116.4441, 27.4933],
        "宜春市": [115.0159, 28.3228],
        "南昌市": [116.0046, 28.6633],
        "景德镇市": [117.334, 29.3225],
        "萍乡市": [113.9282, 27.4823],
        "鹰潭市": [117.0813, 28.2349],
        "新余市": [114.95, 27.8174],
        "盐城市": [120.2234, 33.5577],
        "徐州市": [117.5208, 34.3268],
        "南通市": [121.1023, 32.1625],
        "淮安市": [118.927, 33.4039],
        "苏州市": [120.6519, 31.3989],
        "宿迁市": [118.5535, 33.7775],
        "连云港市": [119.1248, 34.552],
        "扬州市": [119.4653, 32.8162],
        "南京市": [118.8062, 31.9208],
        "泰州市": [120.0586, 32.5525],
        "无锡市": [120.3442, 31.5527],
        "常州市": [119.4543, 31.5582],
        "镇江市": [119.4763, 31.9702],
        "延边朝鲜族自治州": [129.397, 43.2587],
        "吉林市": [126.8372, 43.6047],
        "白城市": [123.0029, 45.2637],
        "松原市": [124.0906, 44.7198],
        "长春市": [125.8154, 44.2584],
        "白山市": [127.2217, 42.0941],
        "通化市": [125.9583, 41.8579],
        "四平市": [124.541, 43.4894],
        "辽源市": [125.343, 42.7643],
        "怀化市": [109.9512, 27.4438],
        "永州市": [111.709, 25.752],
        "邵阳市": [110.9619, 26.8121],
        "郴州市": [113.2361, 25.8673],
        "常德市": [111.4014, 29.2676],
        "湘西土家族苗族自治州": [109.7864, 28.6743],
        "衡阳市": [112.4121, 26.7902],
        "岳阳市": [113.2361, 29.1357],
        "益阳市": [111.731, 28.3832],
        "长沙市": [113.0823, 28.2568],
        "株洲市": [113.5327, 27.0319],
        "张家界市": [110.5115, 29.328],
        "娄底市": [111.6431, 27.7185],
        "湘潭市": [112.5439, 27.7075],
        "恩施土家族苗族自治州": [109.5007, 30.2563],
        "十堰市": [110.5115, 32.3877],
        "宜昌市": [111.1707, 30.7617],
        "襄樊市": [111.9397, 31.9263],
        "黄冈市": [115.2686, 30.6628],
        "荆州市": [113.291, 30.0092],
        "荆门市": [112.6758, 30.9979],
        "咸宁市": [114.2578, 29.6631],
        "随州市": [113.4338, 31.8768],
        "孝感市": [113.9502, 31.1188],
        "武汉市": [114.3896, 30.6628],
        "黄石市": [115.0159, 29.9213],
        "神农架林区": [110.4565, 31.5802],
        "天门市": [113.0273, 30.6409],
        "仙桃市": [113.3789, 30.3003],
        "潜江市": [112.7637, 30.3607],
        "鄂州市": [114.7302, 30.4102],
        "黑河市": [127.1448, 49.2957],
        "大兴安岭地区": [124.1016, 52.2345],
        "哈尔滨市": [127.9688, 45.368],
        "齐齐哈尔市": [124.541, 47.5818],
        "牡丹江市": [129.7815, 44.7089],
        "绥化市": [126.7163, 46.8018],
        "伊春市": [129.1992, 47.9608],
        "佳木斯市": [133.0005, 47.5763],
        "鸡西市": [132.7917, 45.7361],
        "双鸭山市": [133.5938, 46.7523],
        "大庆市": [124.7717, 46.4282],
        "鹤岗市": [130.4407, 47.7081],
        "七台河市": [131.2756, 45.9558],
        "南阳市": [112.4011, 33.0359],
        "信阳市": [114.8291, 32.0197],
        "洛阳市": [112.0605, 34.3158],
        "驻马店市": [114.1589, 32.9041],
        "周口市": [114.873, 33.6951],
        "商丘市": [115.741, 34.2828],
        "三门峡市": [110.8301, 34.3158],
        "新乡市": [114.2029, 35.3595],
        "平顶山市": [112.9724, 33.739],
        "郑州市": [113.4668, 34.6234],
        "安阳市": [114.5325, 36.0022],
        "开封市": [114.5764, 34.6124],
        "焦作市": [112.8406, 35.1508],
        "许昌市": [113.6975, 34.0466],
        "濮阳市": [115.1917, 35.799],
        "漯河市": [113.8733, 33.6951],
        "鹤壁市": [114.3787, 35.744],
        "承德市": [117.5757, 41.4075],
        "张家口市": [115.1477, 40.8527],
        "保定市": [115.0488, 39.0948],
        "唐山市": [118.4766, 39.6826],
        "沧州市": [116.8286, 38.2104],
        "石家庄市": [114.4995, 38.1006],
        "邢台市": [114.8071, 37.2821],
        "邯郸市": [114.4775, 36.535],
        "秦皇岛市": [119.2126, 40.0232],
        "衡水市": [115.8838, 37.7161],
        "廊坊市": [116.521, 39.0509],
        "儋州市": [109.3291, 19.5653],
        "文昌市": [110.8905, 19.7823],
        "乐东黎族自治县": [109.0283, 18.6301],
        "三亚市": [109.3716, 18.3698],
        "琼中黎族苗族自治县": [109.8413, 19.0736],
        "东方市": [108.8498, 19.0414],
        "海口市": [110.3893, 19.8516],
        "万宁市": [110.3137, 18.8388],
        "澄迈县": [109.9937, 19.7314],
        "白沙黎族自治县": [109.3703, 19.211],
        "琼海市": [110.4208, 19.224],
        "昌江黎族自治县": [109.0407, 19.2137],
        "临高县": [109.6957, 19.8063],
        "陵水黎族自治县": [109.9924, 18.5415],
        "屯昌县": [110.0377, 19.362],
        "定安县": [110.3384, 19.4698],
        "保亭黎族苗族自治县": [109.6284, 18.6108],
        "五指山市": [109.5282, 18.8299],
        "遵义市": [106.908, 28.1744],
        "黔东南苗族侗族自治州": [108.4241, 26.4166],
        "毕节地区": [105.1611, 27.0648],
        "黔南布依族苗族自治州": [107.2485, 25.8398],
        "铜仁地区": [108.6218, 28.0096],
        "黔西南布依族苗族自治州": [105.5347, 25.3949],
        "六盘水市": [104.7546, 26.0925],
        "安顺市": [105.9082, 25.9882],
        "贵阳市": [106.6992, 26.7682],
        "百色市": [106.6003, 23.9227],
        "河池市": [107.8638, 24.5819],
        "桂林市": [110.5554, 25.318],
        "南宁市": [108.479, 23.1152],
        "柳州市": [109.3799, 24.9774],
        "崇左市": [107.3364, 22.4725],
        "来宾市": [109.7095, 23.8403],
        "玉林市": [110.2148, 22.3792],
        "梧州市": [110.9949, 23.5052],
        "贺州市": [111.3135, 24.4006],
        "钦州市": [109.0283, 22.0935],
        "贵港市": [109.9402, 23.3459],
        "防城港市": [108.0505, 21.9287],
        "北海市": [109.314, 21.6211],
        "清远市": [112.9175, 24.3292],
        "韶关市": [113.7964, 24.7028],
        "湛江市": [110.3577, 20.9894],
        "梅州市": [116.1255, 24.1534],
        "河源市": [114.917, 23.9722],
        "肇庆市": [112.1265, 23.5822],
        "惠州市": [114.6204, 23.1647],
        "茂名市": [111.0059, 22.0221],
        "江门市": [112.6318, 22.1484],
        "阳江市": [111.8298, 22.0715],
        "云浮市": [111.7859, 22.8516],
        "广州市": [113.5107, 23.2196],
        "汕尾市": [115.5762, 23.0438],
        "揭阳市": [116.1255, 23.313],
        "珠海市": [113.7305, 22.1155],
        "佛山市": [112.8955, 23.1097],
        "潮州市": [116.7847, 23.8293],
        "汕头市": [117.1692, 23.3405],
        "深圳市": [114.5435, 22.5439],
        "东莞市": [113.8953, 22.901],
        "中山市": [113.4229, 22.478],
        "酒泉市": [96.2622, 40.4517],
        "张掖市": [99.7998, 38.7433],
        "甘南藏族自治州": [102.9199, 34.6893],
        "武威市": [103.0188, 38.1061],
        "陇南市": [105.304, 33.5632],
        "庆阳市": [107.5342, 36.2],
        "白银市": [104.8645, 36.5076],
        "定西市": [104.5569, 35.0848],
        "天水市": [105.6445, 34.6289],
        "兰州市": [103.5901, 36.3043],
        "平凉市": [107.0728, 35.321],
        "临夏回族自治州": [103.2715, 35.5737],
        "金昌市": [102.074, 38.5126],
        "嘉峪关市": [98.1738, 39.8035],
        "南平市": [118.136, 27.2845],
        "三明市": [117.5317, 26.3013],
        "龙岩市": [116.8066, 25.2026],
        "宁德市": [119.6521, 26.9824],
        "福州市": [119.4543, 25.9222],
        "漳州市": [117.5757, 24.3732],
        "泉州市": [118.3228, 25.1147],
        "莆田市": [119.0918, 25.3455],
        "厦门市": [118.1689, 24.6478],
        "酉阳土家族苗族自治县": [108.8196, 28.8666],
        "奉节县": [109.3909, 30.9265],
        "巫溪县": [109.3359, 31.4813],
        "开县": [108.4131, 31.2561],
        "彭水苗族土家族自治县": [108.2043, 29.3994],
        "云阳县": [108.8306, 31.0089],
        "万州区": [108.3911, 30.6958],
        "城口县": [108.7756, 31.9098],
        "江津区": [106.2158, 28.9874],
        "石柱土家族自治县": [108.2813, 30.1025],
        "巫山县": [109.8853, 31.1188],
        "涪陵区": [107.3364, 29.6796],
        "丰都县": [107.8418, 29.9048],
        "武隆县": [107.655, 29.35],
        "南川区": [107.1716, 29.1302],
        "秀山土家族苗族自治县": [109.0173, 28.5205],
        "黔江区": [108.7207, 29.4708],
        "合川区": [106.3257, 30.108],
        "綦江县": [106.6553, 28.8171],
        "忠县": [107.8967, 30.3223],
        "梁平县": [107.7429, 30.6519],
        "巴南区": [106.7322, 29.4214],
        "潼南县": [105.7764, 30.1135],
        "永川区": [105.8643, 29.2566],
        "垫江县": [107.4573, 30.2454],
        "渝北区": [106.7212, 29.8499],
        "长寿区": [107.1606, 29.9762],
        "大足县": [105.7544, 29.6136],
        "铜梁县": [106.0291, 29.8059],
        "荣昌县": [105.5127, 29.4708],
        "璧山县": [106.2048, 29.5807],
        "北碚区": [106.5674, 29.8883],
        "万盛区": [106.908, 28.9325],
        "九龙坡区": [106.3586, 29.4049],
        "沙坪坝区": [106.3696, 29.6191],
        "南岸区": [106.6663, 29.5367],
        "江北区": [106.8311, 29.6191],
        "大渡口区": [106.4905, 29.4214],
        "双桥区": [105.7874, 29.4928],
        "渝中区": [106.5344, 29.5477],
        "蓟县": [117.4672, 40.004],
        "武清区": [117.0621, 39.4121],
        "宝坻区": [117.4274, 39.5913],
        "静海县": [116.9824, 38.8312],
        "宁河县": [117.6801, 39.3853],
        "大港区": [117.3875, 38.757],
        "塘沽区": [117.6801, 38.9987],
        "西青区": [117.1829, 39.0022],
        "北辰区": [117.1761, 39.2548],
        "东丽区": [117.4013, 39.1223],
        "汉沽区": [117.8888, 39.2191],
        "津南区": [117.3958, 38.9603],
        "河西区": [117.2365, 39.0804],
        "河东区": [117.2571, 39.1209],
        "南开区": [117.1527, 39.1065],
        "河北区": [117.2145, 39.1615],
        "红桥区": [117.1596, 39.1663],
        "和平区": [117.2008, 39.1189],
        "台湾": [121.0295, 23.6082],
        "甘孜藏族自治州": [99.9207, 31.0803],
        "阿坝藏族羌族自治州": [102.4805, 32.4536],
        "凉山彝族自治州": [101.9641, 27.6746],
        "绵阳市": [104.7327, 31.8713],
        "达州市": [107.6111, 31.333],
        "广元市": [105.6885, 32.2284],
        "雅安市": [102.6672, 29.8938],
        "宜宾市": [104.6558, 28.548],
        "乐山市": [103.5791, 29.1742],
        "南充市": [106.2048, 31.1517],
        "巴中市": [107.0618, 31.9977],
        "泸州市": [105.4578, 28.493],
        "成都市": [103.9526, 30.7617],
        "资阳市": [104.9744, 30.1575],
        "攀枝花市": [101.6895, 26.7133],
        "眉山市": [103.8098, 30.0146],
        "广安市": [106.6333, 30.4376],
        "德阳市": [104.48, 31.1133],
        "内江市": [104.8535, 29.6136],
        "遂宁市": [105.5347, 30.6683],
        "自贡市": [104.6667, 29.2786],
        "崇明县": [121.5637, 31.5383],
        "南汇区": [121.8755, 30.954],
        "奉贤区": [121.5747, 30.8475],
        "浦东新区": [121.6928, 31.2561],
        "金山区": [121.2657, 30.8112],
        "青浦区": [121.1751, 31.1909],
        "松江区": [121.1984, 31.0268],
        "嘉定区": [121.2437, 31.3625],
        "宝山区": [121.4346, 31.4051],
        "闵行区": [121.4992, 31.0838],
        "杨浦区": [121.528, 31.2966],
        "普陀区": [121.3879, 31.2602],
        "徐汇区": [121.4333, 31.1607],
        "长宁区": [121.3852, 31.2115],
        "闸北区": [121.4511, 31.2794],
        "虹口区": [121.4882, 31.2788],
        "黄浦区": [121.4868, 31.219],
        "卢湾区": [121.4758, 31.2074],
        "静安区": [121.4484, 31.2286],
        "那曲地区": [88.1982, 33.3215],
        "阿里地区": [82.3645, 32.7667],
        "日喀则地区": [86.2427, 29.5093],
        "林芝地区": [95.4602, 29.1138],
        "昌都地区": [97.0203, 30.7068],
        "山南地区": [92.2083, 28.3392],
        "拉萨市": [91.1865, 30.1465],
        "香港": [114.2784, 22.3057],
        "普洱市": [100.7446, 23.4229],
        "红河哈尼族彝族自治州": [103.0408, 23.6041],
        "文山壮族苗族自治州": [104.8865, 23.5712],
        "曲靖市": [103.9417, 25.7025],
        "楚雄彝族自治州": [101.6016, 25.3619],
        "大理白族自治州": [99.9536, 25.6805],
        "临沧市": [99.613, 24.0546],
        "迪庆藏族自治州": [99.4592, 27.9327],
        "昭通市": [104.0955, 27.6031],
        "昆明市": [102.9199, 25.4663],
        "丽江市": [100.448, 26.955],
        "西双版纳傣族自治州": [100.8984, 21.8628],
        "保山市": [99.0637, 24.9884],
        "玉溪市": [101.9312, 23.8898],
        "怒江傈僳族自治州": [99.1516, 26.5594],
        "德宏傣族景颇族自治州": [98.1299, 24.5874],
        "巴音郭楞蒙古自治州": [88.1653, 39.6002],
        "和田地区": [81.167, 36.9855],
        "哈密地区": [93.7793, 42.9236],
        "阿克苏地区": [82.9797, 41.0229],
        "阿勒泰地区": [88.2971, 47.0929],
        "喀什地区": [77.168, 37.8534],
        "塔城地区": [86.6272, 45.8514],
        "昌吉回族自治州": [89.6814, 44.4507],
        "克孜勒苏柯尔克孜自治州": [74.6301, 39.5233],
        "吐鲁番地区": [89.6375, 42.4127],
        "伊犁哈萨克自治州": [82.5513, 43.5498],
        "博尔塔拉蒙古自治州": [81.8481, 44.6979],
        "乌鲁木齐市": [87.9236, 43.5883],
        "克拉玛依市": [85.2869, 45.5054],
        "阿拉尔市": [81.2769, 40.6549],
        "图木舒克市": [79.1345, 39.8749],
        "五家渠市": [87.5391, 44.3024],
        "石河子市": [86.0229, 44.2914],
        "丽水市": [119.5642, 28.1854],
        "杭州市": [119.5313, 29.8773],
        "温州市": [120.498, 27.8119],
        "宁波市": [121.5967, 29.6466],
        "舟山市": [122.2559, 30.2234],
        "台州市": [121.1353, 28.6688],
        "金华市": [120.0037, 29.1028],
        "衢州市": [118.6853, 28.8666],
        "绍兴市": [120.564, 29.7565],
        "嘉兴市": [120.9155, 30.6354],
        "湖州市": [119.8608, 30.7782],
        "六安市": [116.3123, 31.8329],
        "安庆市": [116.7517, 30.5255],
        "滁州市": [118.1909, 32.536],
        "宣城市": [118.8062, 30.6244],
        "阜阳市": [115.7629, 32.9919],
        "宿州市": [117.5208, 33.6841],
        "黄山市": [118.0481, 29.9542],
        "巢湖市": [117.7734, 31.4978],
        "亳州市": [116.1914, 33.4698],
        "池州市": [117.3889, 30.2014],
        "合肥市": [117.29, 32.0581],
        "蚌埠市": [117.4109, 33.1073],
        "芜湖市": [118.3557, 31.0858],
        "淮北市": [116.6968, 33.6896],
        "淮南市": [116.7847, 32.7722],
        "马鞍山市": [118.6304, 31.5363],
        "铜陵市": [117.9382, 30.9375],
        "澳门": [113.5715, 22.1583],
        "密云县": [117.0923, 40.5121],
        "怀柔区": [116.6377, 40.6219],
        "房山区": [115.8453, 39.7163],
        "延庆县": [116.1543, 40.5286],
        "门头沟区": [115.8, 39.9957],
        "昌平区": [116.1777, 40.2134],
        "大兴区": [116.4716, 39.6352],
        "顺义区": [116.7242, 40.1619],
        "平谷区": [117.1706, 40.2052],
        "通州区": [116.7297, 39.8131],
        "朝阳区": [116.4977, 39.949],
        "海淀区": [116.2202, 40.0239],
        "丰台区": [116.2683, 39.8309],
        "石景山区": [116.1887, 39.9346],
        "西城区": [116.3631, 39.9353],
        "东城区": [116.418, 39.9367],
        "宣武区": [116.3603, 39.8852],
        "崇文区": [116.4166, 39.8811]
    }
}
//获取各省干线
function GetCityTrunk(_selectedProvince) {
    var cityTrunk = [
        {
            "name": "湖南",
            "firstStation": "长沙市",
            "Terminus": [
                { "name": "岳阳市", "value": 95 },
                { "name": "益阳市", "value": 90 },
                { "name": "株洲市", "value": 80 },
                { "name": "张家界市", "value": 70 },
                { "name": "常德市", "value": 60 },
                { "name": "邵阳市", "value": 50 },
                { "name": "永州市", "value": 40 },
                { "name": "衡阳市", "value": 30 },
                { "name": "怀化市", "value": 20 },
                { "name": "娄底市", "value": 10 }
            ]
        },
        {
            "name": "湖南",
            "firstStation": "岳阳市",
            "Terminus": [
                { "name": "长沙市", "value": 95 },
                { "name": "益阳市", "value": 90 },
                { "name": "株洲市", "value": 80 },
                { "name": "张家界市", "value": 70 },
                { "name": "常德市", "value": 60 },
                { "name": "邵阳市", "value": 50 },
                { "name": "永州市", "value": 40 },
                { "name": "衡阳市", "value": 30 },
                { "name": "怀化市", "value": 20 },
                { "name": "娄底市", "value": 10 }
            ]
        },
        {
            "name": "湖南",
            "firstStation": "益阳市",
            "Terminus": [
                { "name": "岳阳市", "value": 95 },
                { "name": "长沙市", "value": 90 },
                { "name": "株洲市", "value": 80 },
                { "name": "张家界市", "value": 70 },
                { "name": "常德市", "value": 60 },
                { "name": "邵阳市", "value": 50 },
                { "name": "永州市", "value": 40 },
                { "name": "衡阳市", "value": 30 },
                { "name": "怀化市", "value": 20 },
                { "name": "娄底市", "value": 10 }
            ]
        },
        {
            "name": "湖北",
            "firstStation": "武汉市",
            "Terminus": [
                { "name": "恩施土家族苗族自治州", "value": 95 },
                { "name": "十堰市", "value": 90 },
                { "name": "宜昌市", "value": 80 },
                { "name": "襄樊市", "value": 70 },
                { "name": "黄冈市", "value": 60 },
                { "name": "荆州市", "value": 50 }
            ]
        },
        {
            "name": "贵州",
            "firstStation": "贵阳市",
            "Terminus": [
                { "name": "遵义市", "value": 95 },
                { "name": "黔东南苗族侗族自治州", "value": 90 },
                { "name": "毕节地区", "value": 80 },
                { "name": "黔南布依族苗族自治州", "value": 70 },
                { "name": "铜仁地区", "value": 60 },
                { "name": "黔西南布依族苗族自治州", "value": 50 },
                { "name": "六盘水市", "value": 40 }
            ]
        }
    ];
    var res = [];
    for (var x in cityTrunk) {
        if (cityTrunk[x].name === _selectedProvince) {
            res.push(cityTrunk[x]);
            //break;
        }
    }
    return res;
}

//获取运单清单
function GetWaybillList(_firstStation, _Terminus) {
    var waybillList = [
        {
            "provinces": "北京",
            "trunk": "上海",
            "waybill": [
                { "Warehouse": "北京", "WaybillNo": "00AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "00AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "00AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "00AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "00AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "北京",
            "trunk": "广州",
            "waybill": [
                { "Warehouse": "北京", "WaybillNo": "01AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "01AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" },
            ]
        },
        {
            "provinces": "北京",
            "trunk": "大连",
            "waybill": [
                { "Warehouse": "北京", "WaybillNo": "10AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "10AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "10AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "10AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "10AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "北京",
            "trunk": "南宁",
            "waybill": [
                { "Warehouse": "北京", "WaybillNo": "11AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "11AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "11AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "11AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "11AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "北京",
            "trunk": "拉萨",
            "waybill": [
                { "Warehouse": "北京", "WaybillNo": "20AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "20AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "20AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "20AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "北京", "WaybillNo": "20AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "上海",
            "trunk": "北京",
            "waybill": [
                { "Warehouse": "上海", "WaybillNo": "21AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "21AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "21AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "21AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "21AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "上海",
            "trunk": "大连",
            "waybill": [
                { "Warehouse": "上海", "WaybillNo": "30AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "30AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "30AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "30AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "上海", "WaybillNo": "30AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "长沙市",
            "trunk": "岳阳市",
            "waybill": [
                { "Warehouse": "长沙市", "WaybillNo": "00AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "长沙市",
            "trunk": "常德市",
            "waybill": [
                { "Warehouse": "长沙市", "WaybillNo": "00AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        },
        {
            "provinces": "长沙市",
            "trunk": "益阳市",
            "waybill": [
                { "Warehouse": "长沙市", "WaybillNo": "00AAAA0001", "ExpressNo": "6800133331", "Num": 20, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0002", "ExpressNo": "6800133332", "Num": 12, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0003", "ExpressNo": "6800133333", "Num": 30, "shipping": "快递" },
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0004", "ExpressNo": "6800133334", "Num": 17, "shipping": "快递" }, ,
                { "Warehouse": "长沙市", "WaybillNo": "30AAAA0005", "ExpressNo": "6800133335", "Num": 31, "shipping": "快递" }
            ]
        }
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
                /*{
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        }
                    ]
                },
                {
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        }
                    ]
                },
                {
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        }
                    ]
                },
                {
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        }
                    ]
                },
                {
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        }
                    ]
                },*/


                {
                    "date": "2017-06-22",
                    "days": "周四",
                    "subDetails": [
                        {
                            "address": "北京市",
                            "time": "20:28:42",
                            "message": "北京转运公司 已发出，下一站 朝阳区处理中心"
                        },
                        {
                            "address": "北京市",
                            "time": "02:15:52",
                            "message": "北京转运公司 已收入"
                        }
                    ]
                },
                {
                    "date": "2017-06-21",
                    "days": "周三",
                    "subDetails": [
                        {
                            "address": "上海市",
                            "time": "20:28:42",
                            "message": "上海转运公司 已发出，下一站 北京转运中心"
                        },
                        {
                            "address": "上海市",
                            "time": "02:15:52",
                            "message": "上海转运公司 已收入"
                        }
                    ]
                },
                {
                    "date": "2017-06-20",
                    "days": "周二",
                    "subDetails": [
                        {
                            "address": "深圳市",
                            "time": "20:28:42",
                            "message": "深圳转运公司 已发出，下一站 上海转运中心"
                        },
                        {
                            "address": "深圳市",
                            "time": "02:15:52",
                            "message": "深圳转运公司 已收入"
                        }
                    ]
                },
                {
                    "date": "2017-06-19",
                    "days": "周一",
                    "subDetails": [
                        {
                            "address": "广州市",
                            "time": "20:28:53",
                            "message": "您的包裹已出库"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "您的订单待配货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:28:42",
                            "message": "卖家发货"
                        },
                        {
                            "address": "广州市",
                            "time": "20:26:53",
                            "message": "您的订单开始处理"
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

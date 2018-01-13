// format code: ctrl + shift + h

var marginScaterplot = { top: 10, right: 10, bottom: 100, left: 110 },
    widthScaterplot = 950 - marginScaterplot.left - marginScaterplot.right,
    heightScaterplot = 500 - marginScaterplot.top - marginScaterplot.bottom;


var margin = { top: 30, right: 20, bottom: 30, left: 60 },
    width = 950 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
var colorPopular = "#FF7F0E";
var colorNPopular = "#4DAF4A";
var colorTotal = "#1F77B4";
var totalWeekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
var totalChanel = ["Entertainment", "Bussiness", "Tech", "Lifestyle", "Viral", "Social Media", "World"];

d3.csv('mydata.csv', function (data) {
    // visualize not filter
    visualize(data, filters);

    var year = $("#year > input[type='checkbox']").on('change', function () {
        if ($(this).val() == "All") {
            $("#year > input[type='checkbox']").prop("checked", false);
            $(this).prop("checked", true);
        }
        else {
            $("#year > input[type='checkbox'][value='All']").prop("checked", false);
        }
        visualize(data, filters)
    });
    var month = $("#month > input[type='checkbox']").on('change', function () {
        if ($(this).val() == "All") {
            $("#month > input[type='checkbox']").prop("checked", false);
            $(this).prop("checked", true);
        }
        else {
            $("#month > input[type='checkbox'][value='All']").prop("checked", false);
        }
        visualize(data, filters)
    });
    var weekday = $("#weekday > input[type='checkbox']").on('change', function () {
        if ($(this).val() == "All") {
            $("#weekday > input[type='checkbox']").prop("checked", false);
            $(this).prop("checked", true);
        }
        else {
            $("#weekday > input[type='checkbox'][value='All']").prop("checked", false);
        }
        visualize(data, filters)
    });
    var aticletype = $("#aticletype > input[type='checkbox']").on('change', function () {
        if ($(this).val() == "All") {
            $("#aticletype > input[type='checkbox']").prop("checked", false);
            $(this).prop("checked", true);
        }
        else {
            $("#aticletype > input[type='checkbox'][value='All']").prop("checked", false);
        }
        visualize(data, filters);
    });
    var num_img_video = $("#amount_img_video_select").on('change', function () {
        visualize(data, filters);
    });
});

//////////////////////
///// Visualize //////
//////////////////////
function visualize(data, filters) {
    var filtered_data;
    if (filters) {
        filtered_data = filters(data);
    } else {
        filtered_data = data;
    }

    //console.log(filtered_data);
    // remove old visualization (current svg)
    $("#scaterplot_type_weekday").text("");
    $("#line_num_img_video").text("");

    // visualize
    Type_WeekDay_Scaterplot(filtered_data);
    Img_Video_Line(filtered_data);
}

//////////////////////
//// Filter Data /////
//////////////////////
function filters(data) {

    var year = $("#year > input[type='checkbox']");
    var month = $("#month > input[type='checkbox']");
    var weekday = $("#weekday > input[type='checkbox']");
    var aticletype = $("#aticletype > input[type='checkbox']");

    var arr_year = [];
    var arr_month = [];
    var arr_weekday = [];
    var arr_aticletype = [];

    year.each(function (i) {
        if ($(this).prop("checked")) {
            arr_year.push($(this).val());
        }
    })

    month.each(function (i) {
        if ($(this).prop("checked")) {
            arr_month.push($(this).val());
        }
    })

    weekday.each(function (i) {
        if ($(this).prop("checked")) {
            arr_weekday.push($(this).val());
        }
    })

    aticletype.each(function (i) {
        if ($(this).prop("checked")) {
            arr_aticletype.push($(this).val());
        }
    })

    var filtered = data.filter(function (aticle) {
        var keep = true;
        if (!arr_year.includes("All")) {
            keep = arr_year.includes(aticle.year);
        }
        if (!keep) {
            return false;
        }

        if (!arr_month.includes("All")) {
            keep = arr_month.includes(aticle.month);
        }

        if (!keep) {
            return false;
        }

        if (!arr_weekday.includes("All")) {
            keep = arr_weekday.includes(aticle.week_day);
        }
        if (!keep) {
            return false;
        }

        if (!arr_aticletype.includes("All")) {
            keep = arr_aticletype.includes(aticle.aticle_type);
        }
        if (!keep) {
            return false;
        }

        var amount = $("#amount_img_video_select").val() * 1;
        if (aticle.num_imgs * 1 > amount || aticle.num_videos * 1 > amount) {
            keep = false;
        }
        return keep;
    });
    return filtered;
}
//////////////////////
/// Visualization ////
//////////////////////
function Type_WeekDay_Scaterplot(data) {
    var nested_data = d3.nest()
        .key(function (d) { return d.week_day; })
        .key(function (d) { return d.aticle_type; })
        .rollup(function (leaves) {
            return {
                "num_aticle": leaves.length,
                "num_popular": d3.sum(leaves, function (d) { if (d.popular == 1) return 1; }),
                "num_non_popular": d3.sum(leaves, function (d) { if (d.popular == 0) return 1; })
            }
        })
        .entries(data);

    var arr_num_aticle = [];
    var arr_data = [];
    nested_data.forEach(element => {
        var arr = element.values;
        arr.forEach(a => {
            arr_num_aticle.push(a.values.num_aticle);
            var obj = {
                week_day: element.key,
                aticle_type: a.key,
                num_aticle: a.values.num_aticle,
                num_popular: a.values.num_popular,
                num_non_popular: a.values.num_non_popular
            }
            arr_data.push(obj);
        })
    })

    var bin_r_max = d3.max(arr_num_aticle);

    var input_weekday = $("#weekday > input[type='checkbox']");
    var input_chanel = $("#aticletype > input[type='checkbox']");

    var weekday = [];
    var channel = [];

    input_weekday.each(function (i) {
        if ($(this).prop("checked")) {
            weekday.push($(this).val());
        }
    })

    input_chanel.each(function (i) {
        if ($(this).prop("checked")) {
            channel.push($(this).val());
        }
    })

    if (weekday.includes("All")) {
        weekday = totalWeekday;
    }
    if (channel.includes("All")) {
        channel = totalChanel;
    }
    var xscale = d3.scale.ordinal().rangeRoundBands([0, widthScaterplot], .1, .1);
    var yscale = d3.scale.ordinal().rangeRoundBands([0, heightScaterplot], .1, .1);

    xscale.domain(weekday);
    yscale.domain(channel);
    var xAxis = d3.svg.axis().scale(xscale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yscale).orient("left");

    var xbin = xscale.rangeBand() / 2;
    var ybin = yscale.rangeBand() / 2;

    var rscale = d3.scale.linear().domain([0, bin_r_max]).range([0, d3.min([xbin, ybin])]);

    var svg = d3.select("#scaterplot_type_weekday").append("svg")
        .attr("width", widthScaterplot + marginScaterplot.left + marginScaterplot.right)
        .attr("height", heightScaterplot + marginScaterplot.top + marginScaterplot.bottom)
        .append("g")
        .attr("transform", "translate(" + marginScaterplot.left + "," + marginScaterplot.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightScaterplot + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Aticle:</strong><span style='color:#1F77B4'>" + d.num_aticle
                + "</span><hr> <strong>Popular:</strong> <span style='color:#FF7F0E'>" + d.num_popular
                + "</span><hr> <strong>Non-Popular:</strong> <span style='color:red'>" + d.num_non_popular
                + "</span>"
        });

    svg.call(tip);
    var circleDot = svg.append("g").selectAll(".dot");
    circleDot.data(arr_data)
        .enter().append("circle")
        .attr("class", "dot total-article")
        .attr("r", function (d) { return rscale(+d.num_aticle) })
        .attr("cx", function (d) { return xscale(d.week_day) + xscale.rangeBand() / 2 })
        .attr("cy", function (d) { return yscale(d.aticle_type) + yscale.rangeBand() / 2 })
        .style("fill", function (d) { return colorTotal })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    circleDot.data(arr_data)
        .enter().append("circle")
        .attr("class", "dot popular-article")
        .attr("r", function (d) { return rscale(+d.num_popular) })
        .attr("cx", function (d) { return xscale(d.week_day) + xscale.rangeBand() / 2 })
        .attr("cy", function (d) { return yscale(d.aticle_type) + yscale.rangeBand() / 2 })
        .style("fill", function (d) { return colorPopular })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    var legend = svg.append("g");

    legend.append("text")
        .attr("x", 30)
        .attr("y", heightScaterplot + marginScaterplot.bottom - 35)
        .text("Number Article:");

    legend.append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", 30 + 110)
        .attr("cy", heightScaterplot + marginScaterplot.bottom - 40)
        .attr("fill", "none")
        .attr("stroke", "black");


    legend.append("circle")
        .attr("class", "dot")
        .attr("r", 10)
        .attr("cx", 55 + 110)
        .attr("cy", heightScaterplot + marginScaterplot.bottom - 40)
        .attr("fill", "none")
        .attr("stroke", "black");

    legend.append("circle")
        .attr("class", "dot")
        .attr("r", 20)
        .attr("cx", 95 + 110)
        .attr("cy", heightScaterplot + marginScaterplot.bottom - 40)
        .attr("fill", "none")
        .attr("stroke", "black");

    legend.append("text")
        .attr("x", widthScaterplot - 300)
        .attr("y", heightScaterplot + marginScaterplot.bottom - 35)
        .text("Total Article:");

    legend.append("circle")
        .attr("class", "dot")
        .attr("r", 10)
        .attr("cx", widthScaterplot - 200)
        .attr("cy", heightScaterplot + marginScaterplot.bottom - 40)
        .attr("fill", colorTotal)
        .on("mouseover", function () {
            d3.selectAll(".popular-article").style("display", "none");
        })
        .on("mouseout", function () {
            d3.selectAll(".popular-article").style("display", "block");
        });

    legend.append("text")
        .attr("x", widthScaterplot - 150)
        .attr("y", heightScaterplot + marginScaterplot.bottom - 35)
        .text("Popular Article:");

    legend.append("circle")
        .attr("class", "dot")
        .attr("r", 10)
        .attr("cx", widthScaterplot - 20)
        .attr("cy", heightScaterplot + marginScaterplot.bottom - 40)
        .attr("fill", colorPopular)
        .on("mouseover", function () {
            d3.selectAll(".total-article").style("display", "none");
        })
        .on("mouseout", function () {
            d3.selectAll(".total-article").style("display", "block");
        });
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
function Img_Video_Line(data) {
    var shareFormat = d3.format("s");

    // thống kê tổng lượng share theo từng sl img
    var nested_data_imgs = d3.nest()
        .key(function (d) { return d.num_imgs; })
        .rollup(function (leaves) {
            return {
                "shares": d3.sum(leaves, function (d) { return d.shares }),
            }
        })
        .entries(data);

    // thống kê tổng lượng share theo từng sl video
    var nested_data_videos = d3.nest()
        .key(function (d) { return d.num_videos; })
        .rollup(function (leaves) {
            return {
                "shares": d3.sum(leaves, function (d) { return d.shares }),
            }
        })
        .entries(data);

    var arr_numImg = [];
    nested_data_imgs.forEach(d => {
        var obj = {
            num_img: +d.key,
            shares: +d.values.shares
        };
        arr_numImg.push(obj);
    });

    var arr_numVideo = [];
    nested_data_videos.forEach(d => {
        var obj = {
            num_video: +d.key,
            shares: +d.values.shares
        };
        arr_numVideo.push(obj);
    });

    var x = d3.scale.linear().rangeRound([0, width]);
    var y = d3.scale.linear().rangeRound([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(shareFormat);

    var min_num_img = d3.min(arr_numImg, function (d) { return d.num_img });
    var min_num_video = d3.min(arr_numVideo, function (d) { return d.num_video });

    var max_num_img = d3.max(arr_numImg, function (d) { return d.num_img });
    var max_num_video = d3.max(arr_numVideo, function (d) { return d.num_video });

    var min_num_img_shares = d3.min(arr_numImg, function (d) { return d.shares });
    var min_num_video_shares = d3.min(arr_numVideo, function (d) { return d.shares });

    var max_num_img_shares = d3.max(arr_numImg, function (d) { return d.shares });
    var max_num_video_shares = d3.max(arr_numVideo, function (d) { return d.shares });

    x.domain([d3.min([min_num_img, min_num_video]), d3.max([max_num_img, max_num_video])]).nice();
    y.domain([d3.min([min_num_img_shares, min_num_video_shares]), d3.max([max_num_img_shares, max_num_video_shares])]);



    // Define the line
    var valuelineImg = d3.svg.line()
        .x(function (d) { return x(+d.num_img); })
        .y(function (d) { return y(+d.shares); });
    var valuelineVideo = d3.svg.line()
        .x(function (d) { return x(+d.num_video); })
        .y(function (d) { return y(+d.shares); });
    var svg = d3.select("#line_num_img_video").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", width)
        .attr("y", 0)
        .attr("dy", -2)
        .style("text-anchor", "end")
        .text("Amount");

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", 50)
        .attr("y", 0)
        .attr("dy", 0)
        .style("text-anchor", "end")
        .text("Shares");

    var gImg = svg.append("g");
    gImg.append("path")
        .attr("id", "path_line_img")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("d", valuelineImg(arr_numImg))
        .on('mouseover', function () {
            d3.select("#path_line_video").style("display", "none");
        })
        .on('mouseout', function () {
            d3.select("#path_line_video").style("display", "block");
        });

    var gVideo = svg.append("g");
    gVideo.append("path")
        .attr("id", "path_line_video")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("d", valuelineVideo(arr_numVideo))
        .on('mouseover', function () {
            d3.select("#path_line_img").style("display", "none");
        })
        .on('mouseout', function () {
            d3.select("#path_line_img").style("display", "block");
        });

    // tạo 2 tag g để viết chú thích    
    var legendImg = svg.append('g')
        .attr('class', 'legend')
        .attr("id", "legend_Img")
        .on('mouseover', function () {
            d3.select("#path_line_video").style("display", "none");
        })
        .on('mouseout', function () {
            d3.select("#path_line_video").style("display", "block");
        });

    var legendVideo = svg.append('g')
        .attr('class', 'legend')
        .attr("id", "legend_Video")
        .on('mouseover', function () {
            d3.select("#path_line_img").style("display", "none");
        })
        .on('mouseout', function () {
            d3.select("#path_line_img").style("display", "block");
        });

    // tạo chú thích Image - đỏ
    legendImg.append('rect')
        .attr('x', width - 50)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', "red");
    legendImg.append('text')
        .attr('x', width - 35)
        .attr('y', 10)
        .text("Image");

    // tạo chú thích Video - xanh
    legendVideo.append('rect')
        .attr('x', width - 50)
        .attr('y', 20)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', "green");

    legendVideo.append('text')
        .attr('x', width - 35)
        .attr('y', 30)
        .text("Video");
}
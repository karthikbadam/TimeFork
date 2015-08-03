//Overview Chart class

function OverviewHorizonChart(options) {

    var _self = this;

    _self.brush = [];
    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;

    _self.margin = {
        top: 0,
        right: 0,
        bottom: 30,
        left: 0
    };

    _self.correlationViewer = options.correlationViewer;

    _self.color = options.color;
    _self.linecharts = options.linecharts;

    _self.width = $("#overviewchart-viz").parent().width() - 2;

    _self.height = $("#overviewchart-viz").parent().height();

    _self.x = d3.time.scale().range([0, _self.width]);

    _self.x.domain(d3.extent(_self.data, function (stock) {
        return stock[dateCol];
    }));

    _self.axisHeight = 25;

    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("top");

    _self.svg = d3.select("#overviewchart-viz").append("svg")
        .attr("width", _self.width)
        .attr("height", _self.axisHeight);

    _self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (_self.axisHeight - 5) + ")")
        .call(_self.xAxis);

    var brush = d3.svg.brush()
        .x(_self.x)
        .on("brushend", onBrush);

    _self.svg.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 2)
        .attr("height",  _self.axisHeight - 2);

    function onBrush() {

        _self.b = brush.empty() ?
            _self.x.domain() : brush.extent();

        var empty = brush.empty() ? 1 : 0;

        for (var i = 0; i < _self.linecharts.length; i++) {

            try {

                _self.linecharts[i].showOnly(_self.b, empty);

            } catch (err) {

                console.log("error caught -" + err);

            }
        }

        _self.correlationViewer.refresh();
    }

}

OverviewHorizonChart.prototype.addHorizon = function (options) {
    var _self = this;

    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;
    _self.id = options.id;

    _self.stockCount = totalSelectedStocks;

    // divide height into segments
    _self.horizonHeight = (_self.height - _self.margin.top - _self.margin.bottom) / _self.stockCount;

    _self.horizonWidth = _self.width - _self.margin.left - _self.margin.right;

    var parsedData = _self.data.map(function (d, i) {
        return [d[dateCol], d[adjCol]];
    });

    var chart = d3.horizon()
        .width(_self.horizonWidth)
        .height(_self.horizonHeight)
        .bands(4)
        .mode("mirror")
        .interpolate("basis");

    var svg = d3.select("#overviewchart-viz").append("svg")
        .attr("width", _self.horizonWidth + _self.margin.left + _self.margin.right)
        .attr("height", _self.horizonHeight + _self.margin.top)
        .style("border-bottom", "1px solid #000000");

    // Render the chart.
    svg.data([parsedData]).call(chart);

    svg.append("text")
        .attr("dx", "1em")
        .attr("y", 2*_self.horizonHeight/3)
        .text(_self.stockObject.companyName)
        .style("font-size", "12px")
        .style("fill", "#000000");

}
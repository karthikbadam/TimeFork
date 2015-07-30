//Overview Chart class

function OverviewHorizonChart(options) {

    var _self = this;

    _self.brush = [];
    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;

    _self.margin = {
        top: 2,
        right: 0,
        bottom: 25,
        left: 0
    };

    _self.correlationViewer = options.correlationViewer;

    _self.color = options.color;
    _self.linecharts = options.linecharts;

    _self.width = $("#overviewchart-viz").parent().width();

    _self.height = $("#overviewchart-viz").parent().height();

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
        .bands(2)
        .mode("mirror")
        .interpolate("basis");

    var svg = d3.select("#overviewchart-viz").append("svg")
        .attr("width", _self.horizonWidth + _self.margin.left + _self.margin.right)
        .attr("height", _self.horizonHeight + _self.margin.top);

    // Render the chart.
    svg.data([parsedData]).call(chart);

    svg.append("text")
        .attr("dx", "1em")
        .attr("dy", "1em")
        .text(_self.stockObject.companyName)
        .style("font-size", "12px")
        .style("fill", "#000000");
        
}
//Overview Chart class

function OverviewHorizonChart(options) {

    var _self = this;

    _self.brush = [];
    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;

    _self.margin = {
        top: 2,
        right: 5,
        bottom: 20,
        left: 10
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

    _self.stockCount = selectedSymbols.length;

    // divide height into segments
    _self.horizonHeight = (_self.height - _self.margin.top - _self.margin.bottom) / _self.stockCount;

    _self.horizonWidth = _self.width - _self.margin.left - _self.margin.right

    var chart = d3.horizon()
        .width(width)
        .height(height)
        .bands(1)
        .mode("mirror")
        .interpolate("basis");



}
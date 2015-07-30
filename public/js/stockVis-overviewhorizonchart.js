//Overview Chart class

function OverviewHorizonChart(options) {

    var _self = this;

    _self.brush = [];
    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;
    _self.margin = {
        top: 5,
        right: 10,
        bottom: 20,
        left: 10
    };

    _self.correlationViewer = options.correlationViewer;

    _self.color = options.color;
    _self.linecharts = options.linecharts;

    _self.width = $("#overviewchart-viz").parent().width() - _self.margin.left - _self.margin.right;

    _self.height = $("#overviewchart-viz").parent().height() - _self.margin.top - _self.margin.bottom;

}

OverviewHorizonChart.prototype.addHorizon = function (options) {
    var _self = this;

    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;
    _self.id = options.id;

    _self.chartContainer.append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .data([_self.data])
        .attr("d", _self.line)
        //.attr("stroke", _self.color(options.id))
        .attr("stroke", "#444")
        .attr("fill", "transparent")
        .attr("stroke-width", "1.5px")
        .attr("opacity", 0.8).attr("z-index", 1);
}
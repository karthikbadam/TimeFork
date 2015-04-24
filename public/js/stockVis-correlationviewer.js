//Correlation Chart class

function CorrelationChart(options) {
    var _self = this;

//    _self.selectedSymbolsData = options.selectedSymbolsData;
//    _self.selectedSymbols = options.selectedSymbols; 
//    _self.color = options.color; 
//    _self.stocks = options.stocks;
//    

    _self.nodes = [];
    _self.links = [];

    _self.margin = {top: 10, right: 10, bottom: 10, left: 10};
    _self.width = ($("#correlation-viewer").parent().width() / 3 - _self.margin.left - _self.margin.right - 5);
    _self.height = ($("#correlation-viewer").parent().height() - _self.margin.top - _self.margin.bottom);

    _self.force = d3.layout.force()
            .charge(-120)
            .linkDistance(function (d) {
                return _self.width / 3 - _self.width * d.value / 3;
            })
            .size([_self.width, _self.height]);

    _self.div = d3.select("#correlation-viewer");

    _self.svg = _self.div.append("svg")
            .attr("class", "correlation-svg")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    _self.nodes = [];
    _self.links = [];

    _self.force.nodes(_self.nodes)
            .links(_self.links);

}

CorrelationChart.prototype.add = function (options) {
    var _self = this;

    _self.selectedSymbolsData = options.selectedSymbolsData;
    _self.selectedSymbols = options.selectedSymbols;
    _self.color = options.color;
    _self.stocks = options.stocks;
}

CorrelationChart.prototype.refresh = function () {
    var _self = this;
    var radius = _self.radius = 7;

    //$("#correlation-viewer").empty();

    _self.nodes = [];
    _self.links = [];

    for (var i = 0; i < _self.selectedSymbols.length; i++) {
        var node1 = {};
        node1.name = _self.selectedSymbols[i];
        node1.companyName = _self.stocks[i].companyName;
        node1.id = i;
        _self.nodes.push(node1);
    }


    for (var i = 0; i < _self.selectedSymbols.length; i++) {
        for (var j = i + 1; j < _self.selectedSymbols.length; j++) {
            var link1 = {};
            link1.source = i;
            link1.target = j;
            //var data1 = _self.selectedSymbolsData[i];
            //var data2 = _self.selectedSymbolsData[j];

            var data1 = _self.stocks[i].dataFiltered;
            var data2 = _self.stocks[j].dataFiltered;

            link1.value = _self.getCorrelationValue(data1, data2);
            //console.log(link1.value);
            //var value1 = 100*(data1[0][stockColumns[6]] - data1[1][stockColumns[6]])/data1[1][stockColumns[6]];
            //var value2 = 100*(data2[0][stockColumns[6]] - data2[1][stockColumns[6]])/data2[1][stockColumns[6]];
            //link1.value = Math.pow(value1 - value2, 2);

            _self.links.push(link1);
        }
    }

    _self.force.nodes(_self.nodes)
            .links(_self.links);

    if (_self.link)
        _self.link.remove();

    _self.link = _self.svg.selectAll(".link")
            .data(_self.links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke", function (d) {
                if (d.value > 0) {
                    return "#90EE90";
                } else {
                    return "#F08080";
                }

            })
            .attr("stroke-width", "1px");


    //_self.link.exit().remove();

    if (_self.node)
        _self.node.remove();

//    _self.node = _self.svg.selectAll(".node")
//            .data(_self.nodes)
//            .enter().append("circle")
//            .attr("class", "node")
//            .attr("r", radius)
//            .style("fill", function (d) {
//                return color(d.id);
//            });
    //.call(_self.force.drag);

    _self.node = _self.svg.selectAll(".node")
            .data(_self.nodes)
            .enter()
            .append("g")
            .attr("class", "node");


    _self.node.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius)
            .style("fill", function (d) {
                //CHANGE COLOR SCHEME
                //return color(d.id);
                return "#67655D";
            });
    //.call(_self.force.drag);

    _self.node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.companyName;
            });

//
//    _self.node.append("title")
//            .text(function (d) {
//                return d.name;
//            });


    //_self.node.exit().remove();

    _self.force.on("tick", function () {
        _self.link.attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
        _self.node.attr("transform", function (d) {
            d.x = Math.max(radius, Math.min(_self.width - radius, d.x));
            d.y = Math.max(radius, Math.min(_self.height - radius, d.y));
            return "translate(" + d.x + "," + d.y + ")";
        });

//        _self.node.attr("cx", function (d) {
//            return d.x = Math.max(radius, Math.min(_self.width - radius, d.x));
//        })
//                .attr("cy", function (d) {
//                    return d.y = Math.max(radius, Math.min(_self.height - radius, d.y));
//                });
        //.attr("cx", function(d) { return d.x; })
        //.attr("cy", function(d) { return d.y; });
    });

    _self.force
            .start();

    var n = _self.nodes.length;
    for (var i = n * n; i > 0; --i)
        _self.force.tick();

    _self.force.stop();

};

CorrelationChart.prototype.getCorrelationValue = function (x, y) {
    var shortestArrayLength = 0;

    if (x.length == y.length) {
        shortestArrayLength = x.length;

    } else if (x.length > y.length) {
        shortestArrayLength = y.length;

    } else {
        shortestArrayLength = x.length;

    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i][stockColumns[6]] * y[i][stockColumns[6]]);
        x2.push(x[i][stockColumns[6]] * x[i][stockColumns[6]]);
        y2.push(y[i][stockColumns[6]] * y[i][stockColumns[6]]);

    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (var i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i][stockColumns[6]];
        sum_y += y[i][stockColumns[6]];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];

    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);

    var correlation = step1 / step4;

    if (isNaN(correlation))
        return 0;
    return correlation;
}

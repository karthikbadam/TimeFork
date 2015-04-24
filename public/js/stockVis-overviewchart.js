//Overview Chart class

function OverviewChart(options) {
    var _self = this;
    _self.brush = [];
    _self.stockObject = options.stockObject;
    _self.data = _self.stockObject.data;
    _self.stockColumns = options.columns;
    _self.margin = {
        top: 10,
        right: 30,
        bottom: 20,
        left: 30
    };
    
    _self.correlationViewer = options.correlationViewer;
    
    _self.color = options.color;
    _self.linecharts = options.linecharts;
    
    _self.width = (2*$("#overviewchart-viz").parent().width()/3 - _self.margin.left - _self.margin.right),
        _self.height = ($("#overviewchart-viz").parent().height() - _self.margin.top - _self.margin.bottom);

    _self.svg = d3.select("#overviewchart-viz").append("svg").attr("class", "overviewchart")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    //Axis x - date -- Axis y - value
    _self.x = d3.time.scale()
        .range([0, _self.width]);

    _self.y = d3.scale.linear()
        .range([_self.height - 20, 0]);

    
    _self.x.domain(d3.extent(_self.data, function(stock) {
        return stock[_self.stockColumns[0]];
    }));

    _self.y.domain([0, 1]);

    //x and y axis
    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("bottom");
    //.tickFormat(function(d) { return d3.time.format('%b')(new Date(d)); });

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left");

    _self.line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) {
            return _self.x(d[_self.stockColumns[0]]);
        })
        .y(function(d) {
            return _self.y(d.normalized);
        });

    _self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + _self.height + ")")
        .call(_self.xAxis);


    _self.svg.append("defs")
        .append("clipPath").attr("id", "clip")
        .append("rect")
        .attr("width", _self.width).attr("height", _self.height);

    _self.chartContainer = _self.svg.append("g")
        .attr("width", _self.width).attr("height", _self.height);


    var brush = d3.svg.brush().x(_self.x).on("brush", onBrush);
    var context = _self.svg.append("g").attr("class", "context")
        .attr("transform", "translate(" + 0 + "," + (0) + ")");


    _self.b = _self.x.domain();

    context.append("g").attr("class", "brush")
        .call(brush).selectAll("rect").attr("y", 0)
        .attr("height", _self.height)
        .attr("z-index", 3);

    /* brush and link to guide interaction from the overview chart */
    function onBrush() {
        /* this will return a date range to pass into the chart object */
        _self.b = brush.empty() ? _self.x.domain() : brush.extent();
        var empty = brush.empty() ? 1 : 0;
        for (var i = 0; i < _self.linecharts.length; i++) {
            try {
                _self.linecharts[i].showOnly(_self.b, empty);
            } catch (err) {
                //console.log("error caught -" + err);
            }
        }
             
        _self.correlationViewer.refresh();
    }

    //user study part!
    $('#next_button').on('click', function(e) {
        var b = _self.b;
        if (b === x.domain()) {
            return;
        } else {
            var leftDay = b[0];
            var rightDay = b[1];

            leftDay.setDate(b[0].getDate() + 1);
            if (b[0].getDay() === 6) {
                leftDay.setDate(b[0].getDate() + 2);
            }
            if (b[0].getDay() === 5) {
                leftDay.setDate(b[0].getDate() + 3);
            }

            rightDay.setDate(b[1].getDate() + 1);
            if (b[1].getDay() === 6) {
                rightDay.setDate(b[1].getDate() + 2);
            }
            if (b[1].getDay() === 5) {
                rightDay.setDate(b[1].getDate() + 3);
            }


            for (var i = 0; i < _self.linecharts.length; i++) {
                try {
                    _self.linecharts[i].showOnly(b, 1);
                } catch (err) {
                    console.log("error caught -" + err);
                }
            }

        }

    });

}

OverviewChart.prototype.addLine = function(options) {
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

};


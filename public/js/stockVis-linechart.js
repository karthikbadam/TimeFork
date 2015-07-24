//Stock value + volume visualization: Creates a line chart of the value and a bar chart of the volume

function LineChart(options) {
 
    var _self = this;
    _self.stockObject = options.stockObject;
    _self.stockColumns = options.columns;
    _self.charts = options.charts;
    _self.chartObjects = options.chartObjects;

    _self.color = options.color;
    _self.id = options.id;

    _self.data = _self.stockObject.data;
    _self.dataFiltered = _self.stockObject.data;
    _self.stockName = options.name;
    _self.stockSymbol = options.symbol;
    _self.trainingStocks = options.trainingStocks;

    _self.spatialPrediction = options.spatialPrediction;
    _self.temporalPredictors = options.temporalPredictors;
    _self.numberOfPredictionsMade = 0;
    _self.topTemporalPredictions = [];

    var temporalprediction = new TemporalPrediction({
        //encog_file: data,
        stock_name: _self.stockSymbol
    });

    temporalPredictors[_self.stockSymbol] = temporalprediction;

    _self.margin = {
        top: 50,
        right: 0,
        bottom: 30,
        left: 30
    };


    _self.tomorrow = new Date();

    _self.dataFilteredForPrediction = _self.dataFiltered;

    _self.svgWidth = $("#linechart-viz").width() - _self.margin.left - _self.margin.right;

    _self.predictionRects = [];

    _self.width = (480 - _self.margin.left - _self.margin.right),
        _self.height = (150 - _self.margin.top - _self.margin.bottom);

    _self.div = d3.select("#linecharts").append("div")
        .attr("class", "stockChart").attr("id", "ID" + _self.id);

    _self.div.append("div").attr("class", "expandClass")
        .text(_self.stockName)
        .on("click", expandChart);

    /* Manage visual space to handle prediction chaining */
    function expandChart() {
        $("#ID" + _self.id).toggleClass("expandedStockChart");
    }

    //line chart svg
    _self.linechartSVG = _self.div.append("svg")
        .attr("width", _self.svgWidth + _self.margin.left - _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (_self.margin.left) + "," + _self.margin.top + ")");

    //volume bar chart svg
    _self.volumeSVG = _self.div.append("svg")
        .attr("class", "volumeBar")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", (_self.height + _self.margin.top + _self.margin.bottom) / 5)
        .append("g")
        .attr("transform", "translate(" + (_self.margin.left) + "," + _self.margin.top / 4 + ")");


    //sets domain for Axis x - date and Axis y - Adj close
    _self.x = d3.time.scale()
        .range([0, _self.width]);

    _self.y = d3.scale.linear()
        .range([_self.height, 0]);

    _self.x.domain(d3.extent(_self.dataFiltered, function (stock) {
        return stock[_self.stockColumns[0]];
    }));

    _self.y.domain(d3.extent(_self.dataFiltered, function (stock) {
        return stock[_self.stockColumns[6]];
    }));


    //creates x and y axis
    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("bottom").ticks(4)
        .tickFormat(function (d) {
            return d3.time.format('%b%d/%y')(new Date(d));
        });

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left").ticks(6);

    //creates the mapping function for path line in SVG
    _self.line = d3.svg.line()
        .interpolate("Monotone")
        .x(function (d) {
            return _self.x(d[_self.stockColumns[0]]);
        })
        .y(function (d) {
            return _self.y(d[_self.stockColumns[6]]);
        });


    //general definitions to keep everything within boundaries 
    _self.linechartSVG.append("defs")
        .append("clipPath").attr("id", "clip-" + _self.id)
        .append("rect")
        .attr("width", _self.width).attr("height", _self.height);


    //creates arrow head for user drawn prediction line! 
    _self.linechartSVG.selectAll("marker")
        .data(["marker", "licensing", "resolved"])
        .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");


    //draws the path line    
    _self.chartContainer = _self.linechartSVG.append("g")
        .attr("class", "linechart")
        .attr("width", _self.width).attr("height", _self.height);

    _self.chartContainer.append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip-" + _self.id + ")")
        .data([_self.dataFiltered])
        .attr("d", _self.line)
        //.attr("stroke", _self.color(_self.id)) //change COLOR THEME
        .attr("stroke", "#67655D")
        .attr("fill", "transparent")
        .attr("stroke-width", "1.5px")
        .attr("z-index", 1);


    //draws the axis   
    _self.chartContainer.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + _self.height + ")")
        .call(_self.xAxis);

    _self.chartContainer.append("g")
        .attr("class", "y axis")
        .call(_self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 4)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    //creates y-axis for the volume bar chart 
    _self.volumeY = d3.scale.linear().range([_self.height / 4, 0]);
    _self.volumeY.domain(d3.extent(_self.data, function (stock) {
        return stock[stockColumns[5]];
    }));


    //creating Volume SVG
    _self.volumeSVG.selectAll(".bar")
        .data(_self.data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return _self.x(d[_self.stockColumns[0]]);
        })
        .attr("width", 2)
        .attr("y", function (d) {
            return _self.volumeY(d[stockColumns[5]]);
        })
        .attr("height", function (d) {
            return _self.height / 4 - _self.volumeY(d[stockColumns[5]]);
        })
        //.attr("fill", _self.color(_self.id)) //--change COLOR THEME
        .attr("fill", "#222")
        .attr("fill-opacity", 0.3);


    // initializes parameters to show the prediction line at end of each chart
    _self.lastValueY = _self.y(_self.data[0][_self.stockColumns[6]]);
    _self.lastValueX = _self.x(_self.data[0][_self.stockColumns[0]]);
    _self.stockMaxValue = _self.y.domain()[1];
    _self.stockMinValue = _self.y.domain()[0];
    _self.closingValue = _self.data[0][_self.stockColumns[6]];

    _self.predictionValueX = _self.lastValueX;
    _self.predictionValueY = _self.lastValueY;

    // draws a rectangle at the right of each line chart for predictions
    var rect_offsetX = 2;
    var rectangle_width = _self.rectangle_width = 30;
    var rectangle_height = _self.height + _self.margin.top + _self.margin.bottom;

    var numberOfPredictions = 20;

    // one single rectangle with multiple lines
    // rectangle width 30*10
    // lines at 30, 60, 90, 120...
    // mouse event get size of the prediction line 
    // convert x to closest 30 multiple
    // get x/30 for future time step and get y 
    // do greedy to fit a prediction path
    // find a greedy JS library

    var rect = _self.linechartSVG.append("svg:rect")
        .attr("class", "predictionRect")
        .attr("transform", "translate(" + (_self.width - rect_offsetX) + "," + (-_self.margin.top) + ")")
        .attr("width", numberOfPredictions * rectangle_width)
        .attr("height", rectangle_height)
        .on("mousedown", mousedown)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);


    for (var i = 0; i < numberOfPredictions; i++) {
        var rect = _self.linechartSVG.append("line")
            .attr("class", "boundaryLine")
            .attr("x1", _self.width + i * rectangle_width - rect_offsetX)
            .attr("y1", -_self.margin.top)
            .attr("x2", _self.width + i * rectangle_width - rect_offsetX)
            .attr("y2", -_self.margin.top + rectangle_height)
            .attr("stroke-dasharray", "5, 5");
    }



    // draws the visual prediction space
    //    for (var i = 0; i < numberOfPredictions; i++) {
    //        var rect = _self.linechartSVG.append("svg:rect")
    //            .attr("class", "rect")
    //            .attr("transform", "translate(" + (_self.width + i * rectangle_width - rect_offsetX) + "," + (-_self.margin.top) + ")")
    //            .attr("width", rectangle_width)
    //            .attr("height", rectangle_height)
    //            .on("mousedown", mousedown)
    //            .on("mousemove", mousemove)
    //            .on("mouseup", mouseup);
    //
    //        _self.predictionRects.push(rect);
    //    }

    // creates the variable for the prediction line -- variable updated when user actually draws a prediction    
    var draw = _self.linechartSVG.append("line").attr("id", "prediction")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX)
        .attr("y2", _self.lastValueY)
        .attr("marker-end", "url(#marker)");

    //draw handlers for when initiates prediction 
    var predictMouseClicked = false;
    _self.userPredicted = false;
    _self.lineLength = 0;

    // interacting with the prediction space
    function mousedown() {
        predictMouseClicked = true;
        _self.lineLength = 0;
    }

    function mousemove() {
        var m = d3.mouse(this);

        /* Indirection to check if the user indeed wants a prediction */
        if (predictMouseClicked) {
            //draw.attr("x2", (_self.width - 2 * rect_offsetX + (_self.numberOfPredictionsMade + 1) * rectangle_width))
            draw.attr("x2", _self.width - rect_offsetX + m[0])
                .attr("y2", (m[1] - _self.margin.top))
                //.attr("stroke", _self.color(_self.id)); //--change COLOR SCHEME
                .attr("stroke", "#222");

            _self.predictedValueX = _self.width - rect_offsetX + (_self.numberOfPredictionsMade + 1) * rectangle_width;

            _self.predictedValueX = m[0];

            _self.predictedValueY = m[1] - _self.margin.top;

            _self.predictedY = _self.stockMaxValue - (_self.stockMaxValue - _self.stockMinValue) * (((m[1] - _self.margin.top)) / (_self.height));

            _self.lineLength = 100 * ((_self.predictedY - _self.closingValue) / _self.closingValue);

        }

        _self.linechartSVG.on("mouseup", mouseup);
    }

    function mouseup() {
        if (!predictMouseClicked) {
            return;
        }

        predictMouseClicked = false;

        _self.userPredicted = true;

        // clear existing spatial predictions
        _self.predictedTimeSteps = Math.round(_self.predictedValueX / _self.rectangle_width);

        var allPredictions = predictionObject.predictFutureSteps(_self.stockSymbol, _self.predictedTimeSteps, _self.dataFiltered, true).spatial;

        for (var j = 0; j < _self.charts.length; j++) {
            _self.chartObjects[stockSymbols[j]].linechartSVG.selectAll(".predictionLine").remove();

        }

        for (var i = 0; i < allPredictions.length; i++) {

            var p = allPredictions[i];

            var predictions = p.predictions;
            var step = p.step;

            for (var j = 0; j < _self.charts.length; j++) {

                for (var k = 0; k < predictions.length; k++) {

                    _self.chartObjects[stockSymbols[j]].addPrediction(predictions[k].predictions, predictions[k].opacity, step);

                }
            }
        }
    }

}

LineChart.prototype.getCurrentPrediction = function () {

    var _self = this;

    //#8066A6
    var percentIncrease = _self.lineLength;
    var numberOfTimeSteps = _self.predictedTimeSteps;
    var previousValue = _self.dataFiltered[0][_self.stockColumns[6]];
    var predictedValue = previousValue + previousValue * percentIncrease / 100;
    var previousDate = _self.dataFiltered[0][_self.stockColumns[0]];
    var predictedDate = previousDate;

    for (var i = 0; i < numberOfTimeSteps; i++) {
        predictedDate = getFutureDate(predictedDate);
    }

    var actual = _self.data.filter(function (d) {

        return predictedDate.getTime() == d[stockColumns[0]].getTime();
    });

    var predictionInfo = {
        stockId: _self.stockSymbol,
        date1: previousDate,
        date2: predictedDate,
        past: previousValue,
        predict: predictedValue,
        actual: actual[0][stockColumns[6]]
    };

    return predictionInfo;

}

//brushes each line chart based on the region selected on the overview
LineChart.prototype.showOnly = function (b, empty) {
    var _self = this;

    _self.numberOfPredictionsMade = 0;
    _self.userPredicted = false;
    _self.startedPredictions = false;
    _self.lineLength = 0;
    _self.predictedTimeSteps = 0;

    _self.tomorrow = new Date();

    _self.dataFiltered = _self.stockObject.getFilteredData(b);

    if (_self.dataFiltered.length < 0) {
        return;
    }

    _self.dataFilteredForPrediction = _self.dataFiltered;

    _self.x.domain(d3.extent(_self.dataFiltered, function (stock) {
        return stock[_self.stockColumns[0]];
    }));

    b = _self.x.domain();

    _self.chartContainer.select(".x.axis").call(_self.xAxis);

    _self.y.domain(d3.extent(_self.dataFiltered, function (stock) {
        return stock[_self.stockColumns[6]];
    }));

    _self.y.domain([_self.y.domain()[0] - _self.y.domain()[0] / 50, _self.y.domain()[1] + _self.y.domain()[1] / 50]);
    _self.chartContainer.select(".y.axis").call(_self.yAxis);


    //parameters to find the ending value of each chart
    _self.lastValueY = _self.y(_self.dataFiltered[0][_self.stockColumns[6]]);
    _self.lastValueX = _self.x(_self.dataFiltered[0][_self.stockColumns[0]]);

    _self.closingValue = _self.dataFiltered[0][_self.stockColumns[6]];
    _self.stockMaxValue = _self.y.domain()[1];
    _self.stockMinValue = _self.y.domain()[0];

    _self.linechartSVG.select("#prediction")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX)
        .attr("y2", _self.lastValueY);


    var volumeY = _self.volumeY.domain(d3.extent(_self.dataFiltered, function (stock) {
        return stock[stockColumns[5]];
    }));


    //updates volume chart below the line chart
    _self.volumeSVG.selectAll(".bar").remove();
    _self.volumeSVG.selectAll(".bar")
        .data(_self.dataFiltered)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return _self.x(d[_self.stockColumns[0]]);
        })
        .attr("width", 4)
        .attr("y", function (d) {
            return volumeY(d[stockColumns[5]]);
        })
        .attr("height", function (d) {
            return _self.height / 4 - volumeY(d[stockColumns[5]]);
        })
        //.attr("fill", color(_self.id))
        .attr("fill", "#222") //--change COLOR THEME
        .attr("fill-opacity", 0.3);

    _self.chartContainer.select("path")
        .attr("clip-path", "url(#clip-" + _self.id + ")")
        .data([_self.dataFiltered])
        .attr("d", _self.line);


    //re-renders each dot on the linechart    
    _self.chartContainer.selectAll(".dot").remove();
    _self.chartContainer.selectAll(".dot")
        .data(_self.dataFiltered)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", _self.line.x())
        .attr("cy", _self.line.y())
        .attr("r", 3)
        //.attr("stroke", _self.color(_self.id)) //-- change COLOR SCHEME
        .attr("stroke", "#222")
        .attr("fill", "transparent")
        .attr("stroke-opacity", 0.3);


    //finds temporal prediction lines -- one per each linechart
    _self.linechartSVG.selectAll(".userPredictionLine").remove();
    _self.linechartSVG.selectAll(".predictionLine").remove();

    _self.linechartSVG.selectAll(".temporalPredictionLine").remove();
    _self.linechartSVG.selectAll(".savedPredictionLine").remove();

    var savedPredictions = userPredictions[_self.stockSymbol];

    if (savedPredictions != null) {
        for (var i = 0; i < savedPredictions.length; i++) {

            var savedPrediction = savedPredictions[i];
            var date1 = savedPrediction["date1"];
            var date2 = savedPrediction["date2"];
            var pastValue = savedPrediction["past"];
            var predictedValue = savedPrediction["predict"];

            if (date1.getTime() >= b[0].getTime() && date2.getTime() <= b[1].getTime() && date2.getTime() != date1.getTime()) {

                //show already made predictions
                _self.linechartSVG.append("line")
                    .attr("class", "savedPredictionLine")
                    .attr("x1", _self.x(date1))
                    .attr("y1", _self.y(pastValue))
                    .attr("x2", _self.x(date2))
                    .attr("y2", _self.y(predictedValue))
                    //.attr("stroke", _self.color(_self.id))
                    .attr("stroke", "#8066A6")
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", "2px");
            }
        }
    }


    _self.topTemporalPredictions = new Array(20);
    _self.topTemporalPredictions[0] = _self.dataFiltered[0][_self.stockColumns[6]];

    //get a list of predictions at each step
    var allPredictions = predictionObject.predictFutureSteps(_self.stockSymbol, 20, _self.dataFiltered, false);
    var temporal = _self.currentTemporalPredictions = allPredictions.temporal;

    var xDate;

    for (var i = 0; i < temporal.length; i++) {

        var currentDate = temporal[i].date;
        var prediction = temporal[i].prediction;
        var opacity = temporal[i].opacity;
        var past = temporal[i].past;
        var step = temporal[i].step;

        _self.topTemporalPredictions[step] = past;


        if (i == 0) {
            xDate = currentDate;
        }


        _self.linechartSVG.append("line")
            .attr("class", "temporalPredictionLine")
            .attr("x1", _self.x(xDate) + step * _self.rectangle_width)
            .attr("y1", _self.y(past))
            .attr("x2", _self.x(xDate) + (step + 1) * _self.rectangle_width)
            .attr("y2", _self.y(prediction))
            //.attr("stroke", _self.color(_self.id))
            .attr("stroke", "#fc8d59")
            .attr("stroke-opacity", opacity)
            .attr("stroke-width", "1px");
    }


};

// Adds spatial predictions
LineChart.prototype.addPrediction = function (predictionArray, opacity, step) {
    var _self = this;
    _self.startedPredictions = true;
    var stockIndex = stockSymbols.indexOf(_self.stockSymbol);
    var value = _self.topTemporalPredictions[step] + _self.topTemporalPredictions[step] * predictionArray[stockIndex] / 100;
    //console.log("Index "+stockIndex+" Value "+value);
    _self.linechartSVG.append("line")
        .attr("class", "predictionLine")
        .attr("x1", _self.lastValueX + (step) * _self.rectangle_width)
        .attr("y1", _self.y(_self.topTemporalPredictions[step]))
        .attr("x2", _self.lastValueX + (step + 1) * _self.rectangle_width)
        .attr("y2", _self.y(value))
        //.attr("stroke", _self.color(_self.id)) -- // change COLOR SCHEME
        .attr("stroke", "#91bfdb")
        .attr("stroke-width", "1px")
        .attr("stroke-opacity", opacity);
};
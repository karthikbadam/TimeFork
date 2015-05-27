//Stock value + volume visualization: Creates a line chart of the value and a bar chart of the volume

function LineChart(options) {

    var _self = this;
    _self.stockObject = options.stockObject;
    _self.stockColumns = options.columns;
    _self.charts = options.charts;
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

    var temporalprediction = new TemporalPrediction({
        //encog_file: data,
        stock_name: _self.stockSymbol
    });

    temporalPredictors[_self.stockSymbol] = temporalprediction;

    _self.margin = {
        top: 20,
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

    _self.div = d3.select("#linechart-viz").append("div")
        .attr("class", "stockChart").attr("id", "ID" + _self.id);

    _self.div.append("div").attr("class", "expandClass")
        .text(_self.stockName)
        .on("click", expandChart)
        .style({
                padding: "5px",
                color: "black",
                fontSize: "14px",
                textAlign: "center",
                "background-color": "#EEE",
                "font": "sans-serif"});

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

        var error = Math.abs((_self.predictedY - _self.tomorrowValue) * 100 / _self.tomorrowValue);
        console.log("Prediction error= " + error + "%" + " actual value " + _self.tomorrowValue + " predicted value " + _self.predictedY);
        
        
        // Count number of time steps predicted 
        console.log("time steps predicted: "+ Math.round(_self.predictedValueX /_self.rectangle_width));
        _self.predictedTimeSteps = Math.round(_self.predictedValueX /_self.rectangle_width);
        
        // Look through the past data to get the best fit
        
        
        

        //        if (error < 10) {
        //            var score = Number($('#score_value').text());
        //            $('#score_value').html((score + 1));
        //            console.log("score - " + score);
        //        }

        var count = 0;
        for (var i = 0; i < _self.charts.length; i++) {

            if (_self.charts[i].userPredicted === true) {

                count++;
                continue;

            } else {

                break;

            }
        }

        // TODO - clean up here when prediction on all the charts happens
        if (count === _self.charts.length) {
            for (var i = 0; i < _self.charts.length; i++) {
                _self.charts[i].moveToNextInstance();
            }
            return;
        }

        // when moving to the next prediction stage during chaing, record the current value
        if (_self.startedPredictions) {
            var actualValue = _self.tomorrowValue;
            return;
        }

        // pop up a confirm dialog box for spatial prediction
        $("#dialog-confirm").dialog({
            resizable: false,
            height: 140,
            modal: true,
            open: function (event, ui) {
                var textarea = '<p id="predictionText"><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>Do you want to predict other stocks?</p>';
                if ($("#predictionText").contents().length < 1) {
                    $("#dialog-confirm").append(textarea);
                }
            },

            buttons: {
                OK: function () {
                    $(this).dialog("close");
                    //do something
                    var predictions = _self.spatialPrediction.getPredictions(_self.lineLength, _self.stockSymbol);
                    for (var i = 0; i < _self.charts.length; i++) {
                        for (var j = 0; j < predictions.arrays.length; j++) {
                            _self.charts[i].addPrediction(predictions.arrays[j], predictions.opacities[j]);
                        }
                    }
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }

        });
    }

}

//move to next instance
LineChart.prototype.moveToNextInstance = function () {
    var _self = this;
    _self.tomorrowValue = _self.predictedY;
    var stockData = {};
    stockData[_self.stockColumns[6]] = _self.tomorrowValue;
    stockData[_self.stockColumns[0]] = _self.tomorrow;

    var b = _self.tomorrow;
    var tomorrow = _self.tomorrow;
    //find the date of next day
    tomorrow.setMonth(b.getMonth());
    tomorrow.setFullYear(b.getFullYear());

    tomorrow.setDate(b.getDate() + 1);
    if (b.getDay() === 6) {
        tomorrow.setDate(b.getDate() + 2);
    }
    if (b.getDay() === 5) {
        tomorrow.setDate(b.getDate() + 3);
    }

    // goes through the data to find the actual tomorrow's value -- we do have training data
    _self.tomorrowValue = 0;
    for (var i = 0; i < _self.data.length; i++) {
        var d = _self.data[i];
        if (d[_self.stockColumns[0]].getDate() === tomorrow.getDate() && d[_self.stockColumns[0]].getMonth() === tomorrow.getMonth() && d[_self.stockColumns[0]].getFullYear() === tomorrow.getFullYear()) {
            _self.tomorrowValue = d[_self.stockColumns[6]];
            console.log("OWO");
            break;
        }
    }

    // reads the last 15 values -- this might have to contain the predictions    
    var prData = [];
    prData.push(stockData);
    for (var i = 0; i < 15; i++) {
        prData.push(_self.dataFilteredForPrediction[i]);
    }
    _self.dataFilteredForPrediction = prData;


    // temporal input
    var input = new Array(15);
    for (var i = 0; i < 15; i++) {
        input[i] = _self.stockObject.normalizeValue(prData[i][_self.stockColumns[6]]);
    }

    _self.numberOfPredictionsMade++;

    //adding a line to the prediction space
    _self.linechartSVG.append("line")
        .attr("class", "userPredictionLine")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.predictedValueX)
        .attr("y2", _self.predictedValueY)
        //.attr("stroke", _self.color(_self.id)) //change COLOR THEME
        .attr("stroke", "#222")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", "2px");

    _self.linechartSVG.selectAll(".temporalPredictionLine")
        .attr("stroke-opacity", 0.1);

    _self.linechartSVG.selectAll(".predictionLine")
        .attr("stroke-opacity", 0.03);

    _self.lastValueX = _self.predictedValueX;
    _self.lastValueY = _self.predictedValueY;

    var predictor = _self.temporalPredictors[_self.stockSymbol];
    var output = predictor.predict(input);
    _self.currentPrediction = _self.stockObject.deNormalize(output[0]);
    //console.log("prediction is "+((this.currentPrediction - tomorrowValue)*100/this.currentPrediction));
    _self.linechartSVG.append("line")
        .attr("class", "temporalPredictionLine")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX + _self.rectangle_width)
        .attr("y2", _self.y(_self.currentPrediction))
        //.attr("stroke", _self.color(_self.id)) //change COLOR THEME
        .attr("stroke", "#fc8d59")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", "2px");

    console.log("after all prediction --" + _self.lastValueX);
    _self.linechartSVG.select("#prediction")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX)
        .attr("y2", _self.lastValueY);

    _self.userPredicted = false;
    _self.startedPredictions = false;

};

//brushes each line chart based on the region selected on the overview
LineChart.prototype.showOnly = function (b, empty) {
    var _self = this;

    _self.numberOfPredictionsMade = 0;
    _self.userPredicted = false;
    _self.startedPredictions = false;
    
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

    var input = new Array(7);
    for (var i = 0; i < 7; i++) {
        input[i] = _self.stockObject.normalizeValue(_self.dataFiltered[i][_self.stockColumns[6]]);
    }
    //find the date of next day
    _self.tomorrow.setMonth(b[1].getMonth());
    _self.tomorrow.setFullYear(b[1].getFullYear());

    _self.tomorrow.setDate(b[1].getDate() + 1);
    if (b[1].getDay() === 6) {
        _self.tomorrow.setDate(b[1].getDate() + 2);
    }
    if (b[1].getDay() === 5) {
        _self.tomorrow.setDate(b[1].getDate() + 3);
    }
    //go through the data to find the actual value
    _self.tomorrowValue = 0;
    for (var i = 0; i < _self.data.length; i++) {
        var d = _self.data[i];
        if (d[_self.stockColumns[0]].getDate() === _self.tomorrow.getDate() && d[_self.stockColumns[0]].getMonth() === _self.tomorrow.getMonth() && d[_self.stockColumns[0]].getFullYear() === _self.tomorrow.getFullYear()) {
            _self.tomorrowValue = d[_self.stockColumns[6]];
            break;
        }
    }

    _self.linechartSVG.selectAll(".temporalPredictionLine").remove();
    var predictor = _self.temporalPredictors[_self.stockSymbol];
    var output = predictor.predict(input);
    _self.currentPrediction = _self.stockObject.deNormalize(output[0]);

    //console.log("prediction is "+((this.currentPrediction - tomorrowValue)*100/this.currentPrediction));
    _self.linechartSVG.append("line")
        .attr("class", "temporalPredictionLine")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX + _self.rectangle_width)
        .attr("y2", _self.y(_self.currentPrediction))
        //.attr("stroke", _self.color(_self.id))
        .attr("stroke", "#fc8d59")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", "2px");

};

// Adds spatial predictions
LineChart.prototype.addPrediction = function (predictionArray, opacity) {
    var _self = this;
    _self.startedPredictions = true;
    var stockIndex = _self.trainingStocks.indexOf(_self.stockSymbol);
    var value = _self.closingValue + _self.closingValue * predictionArray[stockIndex] / 100;
    //console.log("Index "+stockIndex+" Value "+value);
    _self.linechartSVG.append("line")
        .attr("class", "predictionLine")
        .attr("x1", _self.lastValueX)
        .attr("y1", _self.lastValueY)
        .attr("x2", _self.lastValueX + _self.rectangle_width)
        .attr("y2", _self.y(value))
        //.attr("stroke", _self.color(_self.id)) -- // change COLOR SCHEME
        .attr("stroke", "#91bfdb")
        .attr("stroke-opacity", opacity);
};
/* user study initializations */

var participantID = "T1";

var PREDICTION_SCENARIO = 1; //0 for no prediction, 1 for TimeFork

var CALENDAR_TIME = 1; //0 for July, 1 for December, 2 for training

var stepNumber = 0;

var userPredictions = {};

var parseDate = d3.time.format("%Y-%m-%d").parse;

var brushes1 = [[parseDate("2014-07-01"), parseDate("2014-07-23")], [parseDate("2014-07-07"), parseDate("2014-07-31")], [parseDate("2014-07-13"), parseDate("2014-08-05")], [parseDate("2014-08-01"), parseDate("2014-08-23")]];

var brushes2 = [[parseDate("2014-01-07"), parseDate("2014-01-27")], [parseDate("2015-01-11"), parseDate("2015-02-11")], [parseDate("2015-02-03"), parseDate("2015-02-23")], [parseDate("2014-03-01"), parseDate("2014-03-18")]];

var tBrushes = [[parseDate("2013-07-01"), parseDate("2013-07-23")], [parseDate("2013-07-07"), parseDate("2013-07-31")], [parseDate("2013-07-13"), parseDate("2013-08-05")], [parseDate("2013-08-01"), parseDate("2013-08-23")]];

var stockList = 'data/stocks.csv';

var stockSymbols = [];

var companyNames = [];

var selectedSymbols = [];

var selectedSymbolsData = [];

var newlySelectedSymbols = [];

var trainingStockList;

var weightsSOM;

var spatialPrediction;

var color = d3.scale.category10();

var charts = [];

var chartObjects = {};

//var overviewChart;

var stockColumns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'];

var temporalPredictors = {};

var stocks = [];

var stockObjects = {};

var startDate = parseDate("2010-05-06");

var correlationViewer;

var predictionObject;

var userPredictions = {};

var holidays = [parseDate("2013-01-01"), parseDate("2014-01-01"), parseDate("2015-01-01"), parseDate("2013-01-21"), parseDate("2014-01-20"), parseDate("2015-01-19"), parseDate("2013-02-18"), parseDate("2014-02-17"), parseDate("2015-02-16"), parseDate("2013-03-29"), parseDate("2014-04-18"), parseDate("2015-04-03"), parseDate("2013-05-27"), parseDate("2014-05-26"), parseDate("2015-05-25"), parseDate("2013-07-04"), parseDate("2014-07-04"), parseDate("2015-07-04"), parseDate("2013-09-02"), parseDate("2014-09-01"), parseDate("2015-09-07"), parseDate("2013-11-28"), parseDate("2014-11-27"), parseDate("2015-11-26"), parseDate("2013-12-25"), parseDate("2014-12-25"), parseDate("2015-12-25")];

// Earnings for the stock market game
var totalEarnings = 100000;

var investment = {};

var step1 = 0,
    step2 = 0,
    step3 = 0,
    step4 = 0;

function getFutureDate(today) {

    var tomorrow = new Date(today.getTime());

    tomorrow.setMonth(today.getMonth());
    tomorrow.setFullYear(today.getFullYear());

    tomorrow.setDate(today.getDate() + 1);

    if (today.getDay() == 6) {
        tomorrow.setDate(today.getDate() + 2);
    }

    if (today.getDay() == 5) {
        tomorrow.setDate(today.getDate() + 3);
    }

    for (var i = 0; i < holidays.length; i++) {
        if (holidays[i].getTime() == tomorrow.getTime()) {
            tomorrow = getFutureDate(tomorrow);
        }
    }

    return tomorrow;

}

// Decision tree!!
// Take previous seven values -- build a decision tree 
// maybe a random forest
// add variation at each node -- check how much you get back
$(document).ready(function () {

    //initialize a predictions object 
    predictionObject = new Predictions();

    // create Correlation Viewer
    // correlationViewer = new CorrelationChart();

    // steps click
    $("#step1").click(function (e) {

        if (step1 == 1)
            return;

        stepNumber = 1;

        $("#step1").addClass("completed");

        for (var i = 0; i < charts.length; i++) {


            if (CALENDAR_TIME == 0) {

                charts[i].showOnly(brushes1[0], null);

            } else if (CALENDAR_TIME == 1) {

                charts[i].showOnly(brushes2[0], null);

            } else {

                charts[i].showOnly(tBrushes[0], null);

            }
        }


    });

    $("#step2").click(function (e) {

        if (step2 == 1)
            return;

        stepNumber = 2;

        $("#step2").addClass("completed");

        for (var i = 0; i < charts.length; i++) {


            if (CALENDAR_TIME == 0) {

                charts[i].showOnly(brushes1[1], null);

            } else if (CALENDAR_TIME == 1) {

                charts[i].showOnly(brushes2[1], null);

            } else {

                charts[i].showOnly(tBrushes[1], null);

            }
        }

    });

    $("#step3").click(function (e) {

        if (step3 == 1)
            return;

        stepNumber = 3;

        $("#step3").addClass("completed");

        for (var i = 0; i < charts.length; i++) {


            if (CALENDAR_TIME == 0) {

                charts[i].showOnly(brushes1[2], null);

            } else if (CALENDAR_TIME == 1) {

                charts[i].showOnly(brushes2[2], null);

            } else {

                charts[i].showOnly(tBrushes[2], null);

            }
        }

    });

    $("#step4").click(function (e) {

        if (step4 == 1)
            return;

        stepNumber = 4;

        $("#step4").addClass("completed");

        for (var i = 0; i < charts.length; i++) {


            if (CALENDAR_TIME == 0) {

                charts[i].showOnly(brushes1[3], null);

            } else if (CALENDAR_TIME == 1) {

                charts[i].showOnly(brushes2[3], null);

            } else {

                charts[i].showOnly(tBrushes[3], null);

            }
        }

    });

    //reads the list of stocks first
    d3.csv(stockList, function (error, data) {
        //for each string element in the data
        data.forEach(function (d) {

            //collects all stock values into a data structure
            stockSymbols.push(d.symbols);
            companyNames.push(d.company);

        });

        //        $("#forward").click(function (e) {
        //
        //            for (var i = 0; i < charts.length; i++) {
        //
        //                var b = [charts[i].dataFiltered[charts[i].dataFiltered.length - 1][stockColumns[0]], charts[i].dataFiltered[0][stockColumns[0]]];
        //
        //                b[0] = getFutureDate(b[0]);
        //                b[1] = getFutureDate(b[1]);
        //
        //                overviewChart.moveBrush(b);
        //
        //                charts[i].showOnly(b, null);
        //            }
        //
        //        });
        //
        //        $("#fast-forward").click(function (e) {
        //
        //            for (var i = 0; i < charts.length; i++) {
        //
        //                var b = [charts[i].dataFiltered[charts[i].dataFiltered.length - 1][stockColumns[0]], charts[i].dataFiltered[0][stockColumns[0]]];
        //
        //                for (var j = 0; j < 10; j++) {
        //                    b[0] = getFutureDate(b[0]);
        //                    b[1] = getFutureDate(b[1]);
        //                }
        //
        //                overviewChart.moveBrush(b);
        //
        //                charts[i].showOnly(b, null);
        //            }
        //
        //        });

        $("#saveButton").click(function (e) {

            var previousEarnings = totalEarnings;

            for (var i = 0; i < charts.length; i++) {

                var predictionInfo = charts[i].getCurrentPrediction();

                if (userPredictions[predictionInfo["stockId"]] == null) {
                    userPredictions[predictionInfo["stockId"]] = [];
                }

                var predicted = predictionInfo.predict;
                var actual = predictionInfo.actual;
                var past = predictionInfo.past;
                var stockId = predictionInfo["stockId"];

                if (investment[stockId] && investment[stockId] != 0) {

                    var profit = (investment[stockId] / past) * (actual - past);


                    totalEarnings = totalEarnings + profit + investment[stockId];

                    var sendData = {
                        id: participantID,
                        timestamp: new Date(),
                        phase: stepNumber,
                        stockId: stockId,
                        ps: PREDICTION_SCENARIO,
                        ct: CALENDAR_TIME,
                        investment: investment[stockId],
                        profit: profit.toFixed(2),
                        totalEarnings: totalEarnings.toFixed(2)

                    };

                    $.post("/userlog", sendData, function (data, error) {});

                    previousEarnings += investment[stockId];

                    investment[stockId] = 0;

                    $('#investStock' + stockId).val(0);

                    console.log(totalEarnings);

                    $("#currentEarnings").html(totalEarnings.toFixed(2));

                }

                userPredictions[predictionInfo["stockId"]].push(predictionInfo);


            }

            if (totalEarnings - previousEarnings > 0) {

                $("#currentEarnings").css("color", "green");

            } else if (totalEarnings - previousEarnings < 0) {

                $("#currentEarnings").css("color", "red");

            } else {

                $("#currentEarnings").css("color", "black");

            }
        });


        $("#investStockAAPL").change(function () {
            
            var stockId = "AAPL";

            var investmentValue = +$("#investStockAAPL").val();

            var earningsChange = investmentValue;
            
            if (investment[stockId]) {
                
                var previous = investment[stockId];
                
                earningsChange = investmentValue - previous; 
                
            }
            
            investment[stockId] = investmentValue;
            
            totalEarnings = totalEarnings - earningsChange;

            $("#currentEarnings").html(Math.floor(totalEarnings));
            
        });
        
        $("#investStockFB").change(function () {
            
            var stockId = "FB";

            var investmentValue = +$("#investStockFB").val();

            var earningsChange = investmentValue;
            
            if (investment[stockId]) {
                
                var previous = investment[stockId];
                
                earningsChange = investmentValue - previous; 
                
            }
            
            investment[stockId] = investmentValue;
            
            totalEarnings = totalEarnings - earningsChange;

            $("#currentEarnings").html(Math.floor(totalEarnings));

            
        });
        
         $("#investStockTSLA").change(function () {
            
            var stockId = "TSLA";

            var investmentValue = +$("#investStockTSLA").val();

            var earningsChange = investmentValue;
            
            if (investment[stockId]) {
                
                var previous = investment[stockId];
                
                earningsChange = investmentValue - previous; 
                
            }
            
            investment[stockId] = investmentValue;
            
            totalEarnings = totalEarnings - earningsChange;

            $("#currentEarnings").html(Math.floor(totalEarnings));

            
        });

        var q = queue();

        //Download file for spatial prediction
        $.get("data/train/SOM_WEIGHTS.json", function (data) {
            console.log("Data: ");

            data = JSON.parse(JSON.stringify(data));

            trainingStockList = stockSymbols;
            spatialPrediction = new SpatialPrediction({
                weights: data.data,
                trainingStocks: trainingStockList,
                stockSymbols: stockSymbols
            });

        }, "json");

        stockSymbols.forEach(function (stock_id) {

            var stock_name = companyNames[stockSymbols.indexOf(stock_id)];

            q.defer(function (callback) {

                /* Loads the data for this particular stock */
                // TODO: How about using a browser database?
                d3.csv('data/' + stock_id + '.csv', function (error, data) {
                    //Data downloaded 
                    if (error) {
                        console.log("Data for " + stock_id + " not found");
                        return;
                    }

                    console.log('Downloaded data for stock ' + stock_id);

                    //add stock to selected list
                    selectedSymbols.push(stock_id);
                    selectedSymbolsData.push(data);

                    var close_values = [];

                    //look inside the csv data
                    data.forEach(function (stock_instance) {
                        //convert date format
                        stock_instance[stockColumns[0]] = parseDate(String(stock_instance[stockColumns[0]]));

                        //convert other column values to numbers
                        stock_instance[stockColumns[1]] = +stock_instance[stockColumns[1]];
                        stock_instance[stockColumns[2]] = +stock_instance[stockColumns[2]];
                        stock_instance[stockColumns[3]] = +stock_instance[stockColumns[3]];
                        stock_instance[stockColumns[4]] = +stock_instance[stockColumns[4]];
                        stock_instance[stockColumns[5]] = +stock_instance[stockColumns[5]];
                        stock_instance[stockColumns[6]] = +stock_instance[stockColumns[6]];
                        stock_instance['normalized'] = stock_instance[stockColumns[6]];
                        close_values.push(stock_instance[stockColumns[6]]);

                    });

                    //creates a stock object for future reference
                    var stockObject = new Stock({
                        data: data,
                        companyName: stock_name,
                        symbol: stock_id,
                        startDate: startDate,
                        stockColumns: stockColumns
                    });

                    stocks.push(stockObject);
                    stockObjects[stock_id] = stockObject;

                    stockObject.normalize(close_values);

                    var lc = new LineChart({
                        stockObject: stockObject,
                        id: selectedSymbols.indexOf(stock_id) % 10,
                        name: stock_name,
                        symbol: stock_id,
                        color: color,
                        trainingStocks: trainingStockList,
                        charts: charts,
                        chartObjects: chartObjects,
                        columns: stockColumns,
                        spatialPrediction: spatialPrediction,
                        temporalPredictors: temporalPredictors
                    });

                    charts.push(lc);
                    chartObjects[stock_id] = lc;

                    /* Checks if there is an overview chart created -- if not -- do it */
                    //                    if ($("#overviewchart-viz").contents().length < 1) {
                    //                        overviewChart = new OverviewChart({
                    //                            stockObject: stockObject,
                    //                            id: selectedSymbols.indexOf(stock_id) % 10,
                    //                            name: stock_id,
                    //                            color: color,
                    //                            linecharts: charts,
                    //                            columns: [stockColumns[0], stockColumns[6]],
                    //                            correlationViewer: correlationViewer
                    //                        });
                    //                    }
                    //
                    //                    overviewChart.addLine({
                    //                        stockObject: stockObject,
                    //                        id: selectedSymbols.indexOf(stock_id) % 10
                    //                    });

                    callback(null, data);

                });

            });

            q.await(createCorrelation);

        });

    });

});

function createCorrelation() {
    //    correlationViewer.add({
    //        selectedSymbolsData: selectedSymbolsData,
    //        stocks: stocks,
    //        selectedSymbols: selectedSymbols,
    //        color: color,
    //    });
    //    correlationViewer.refresh();
}
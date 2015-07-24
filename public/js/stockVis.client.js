var stockList = 'data/topInternetStocks.csv';

var parseDate = d3.time.format("%Y-%m-%d").parse;

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

var overviewChart;

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

$(document).ready(function () {

    //create Correlation Viewer
    correlationViewer = new CorrelationChart();

    //initialize a predictions object 
    predictionObject = new Predictions();

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

    //reads the list of stocks first
    d3.csv(stockList, function (error, data) {
        //for each string element in the data
        data.forEach(function (d) {

            //collects all stock values into a data structure
            stockSymbols.push(d.symbols);
            companyNames.push(d.company);

            //adds each stock to a list in UI and associate it with a handler
            $('#stocklist').append('<option class = "ui-widget-content" id=' + d.symbols + '>' + d.company + '</option>');

        });

        $("#search").autocomplete({
            source: companyNames
        });


        /* Searches box above the list of stocks */
        $("#search").keyup(function (e) {
            //checking for a click of the "Enter" key
            if (e.keyCode == 13) {
                var selectedCompany = $("#search").val();
                var index = companyNames.indexOf(selectedCompany);
                newlySelectedSymbols.push(stockSymbols[index]);
            }
        });

        /* Gets all selections in a newlySelectedSymbols list */
        $("select").change(function () {
            newlySelectedSymbols.length = 0;
            $("select option:selected").each(function () {
                theID = $(this).attr('id');
                newlySelectedSymbols.push(theID);
            });
        });


        /* Adds newly selected stocks to the workspace */
        $("#add_button").on('click', function (e) {

            //queue for handling file reading
            var q = queue();

            //goes through the newlySelectedSymbols list and download each stock data file
            newlySelectedSymbols.forEach(function (stock_id) {

                //stock not already selected
                if (selectedSymbols.indexOf(stock_id) <= -1) {

                    var stock_name = companyNames[stockSymbols.indexOf(stock_id)];

                    q.defer(function (callback) {

                        /* Loads the data for this particular stock */
                        // TODO: How about using a browser database?

                        $.ajax({
                            type: "GET",
                            url: "/stockData",
                            data: {
                                stock: stock_id
                            }
                        }).done(function (data) {

                            //d3.csv('data/' + stock_id + '.csv', function (error, data) {
                            //Data downloaded 
                            console.log('Downloaded data for stock ' + stock_id);
                            
                            data = JSON.parse(data); 
                            
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

                            var lcObject = new LineChart({
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

                            charts.push(lcObject);
                            chartObjects[stock_id] = lcObject;

                            /* Checks if there is an overview chart created -- if not -- do it */
                            if ($("#overviewchart-viz").contents().length < 1) {
                                overviewChart = new OverviewChart({
                                    stockObject: stockObject,
                                    id: selectedSymbols.indexOf(stock_id) % 10,
                                    name: stock_id,
                                    color: color,
                                    linecharts: charts,
                                    columns: [stockColumns[0], stockColumns[6]],
                                    correlationViewer: correlationViewer
                                });
                            }

                            overviewChart.addLine({
                                stockObject: stockObject,
                                id: selectedSymbols.indexOf(stock_id) % 10
                            });

//                            document.getElementById(stock_id).style.color = color(selectedSymbols.indexOf(stock_id) % 10);

                            document.getElementById(stock_id).style.backgroundColor = "#EEEEEE";

                            callback(null, data);

                        });

                    });
                }
            });
            //emptying this list because the data has already been downloaded
            newlySelectedSymbols = [];

            q.await(createCorrelation);
        });
    });
});

function createCorrelation() {
    correlationViewer.add({
        selectedSymbolsData: selectedSymbolsData,
        stocks: stocks,
        selectedSymbols: selectedSymbols,
        color: color,
    });
    correlationViewer.refresh();
}
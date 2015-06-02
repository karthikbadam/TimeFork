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

var parseDate = d3.time.format("%Y-%m-%d").parse;

var charts = [];

var chartObjects = {};

var overviewChart;

var stockColumns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'];

var temporalPredictors = [];

var stocks = [];

var stockObjects = {};

var startDate = parseDate("2010-05-06");

var correlationViewer;

var predictionObject; 

// Decision tree!!
// Take previous seven values -- build a decision tree 
// maybe a random forest
// add variation at each node -- check how much you get back

$(document).ready(function () {
    
    //initialize a predictions object 
    predictionObject = new Predictions(); 

    //create Correlation Viewer
    //correlationViewer = new CorrelationChart();

    //reads the list of stocks first
    d3.csv(stockList, function (error, data) {
        //for each string element in the data
        data.forEach(function (d) {

            //collects all stock values into a data structure
            stockSymbols.push(d.symbols);
            companyNames.push(d.company);

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
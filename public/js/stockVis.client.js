
var stockList = 'data/internet information providers.csv';

var stockSymbols = [];

var companyNames = [];

var selectedSymbols = [];

var selectedSymbolsData = [];

var newlySelectedSymbols = [];

var trainingStockList;

var weightsSOM;

var spatialPrediction;

var color = d3.scale.category10();

var parseDate = d3.time.format("%Y%m%d").parse;

var charts = [];

var overviewChart;

var stockColumns = ['date', 'open price', 'close price', 'high price', 'low price', 'volume', 'adjusted price'];

var temporalPredictors = [];

var stocks = [];

var startDate = parseDate("20100506");

var correlationViewer;

//Download file for spatial prediction
$.get("/StockVisServlet/SpatialPrediction", function (data) {
    console.log("Data: " + data);
    trainingStockList = data.stocks;
    weightsSOM = data.weights;
    spatialPrediction = new SpatialPrediction({weights: weightsSOM,
        trainingStocks: trainingStockList,
        stockSymbols: stockSymbols
    });
    console.log(spatialPrediction.weights);
}, "json");


$(document).ready(function () {
    
    //create Correlation Viewer
    correlationViewer = new CorrelationChart();

    //Temporal prediction request handler
    $("#request_temporal").on('click', function (e) {
        //Download file from servlet
        $("#start_prediction_label").html("Prediction Started");
        selectedSymbols.forEach(function (stockSymbol) {
            //$.get("/StockVisServlet/TemporalPrediction", {"symbols[]": stockSymbol}, function (data, error) {
                var temporalprediction = new TemporalPrediction({
                    //encog_file: data,
                    stock_name: stockSymbol
                });

                temporalPredictors[stockSymbol] = temporalprediction;
            //});
        });

//        correlationViewer = new CorrelationChart({
//            selectedSymbolsData: selectedSymbolsData,
//            stocks: stocks,
//            selectedSymbols: selectedSymbols,
//            color: color,
//        });

//        correlationViewer.refresh();

    });

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
                            stockObject.normalize(close_values);

                            charts.push(new LineChart({
                                stockObject: stockObject,
                                id: selectedSymbols.indexOf(stock_id) % 10,
                                name: stock_name,
                                symbol: stock_id,
                                color: color,
                                trainingStocks: trainingStockList,
                                charts: charts,
                                columns: stockColumns,
                                spatialPrediction: spatialPrediction,
                                temporalPredictors: temporalPredictors
                            }));

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

                            document.getElementById(stock_id).style.color = color(selectedSymbols.indexOf(stock_id) % 10);

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

function createCorrelation () {
    correlationViewer.add ({
            selectedSymbolsData: selectedSymbolsData,
            stocks: stocks,
            selectedSymbols: selectedSymbols,
            color: color,
    });     
    correlationViewer.refresh();
}


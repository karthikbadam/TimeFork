/**
 * Created by karthik on 1/31/15.
 */

function Stock(options) {
    var _self = this;

    var csv = _self.csv = require('fast-csv');
    var fs = _self.fs = require('fs');
    var d3 = _self.d3 = require('d3');
    var brain = _self.brain = require('brain');

    _self.companyName = options.company;
    _self.symbol = options.symbol;
    _self.data = [];

    _self.min = 100000;
    _self.max = -100000;

    _self.temporalNet = new _self.brain.NeuralNetwork({
        hiddenLayers: [50, 60, 70],
        learningRate: 0.3 // global learning rate, useful when training using streams
    });

    _self.parseDate = _self.d3.time.format("%Y-%m-%d").parse;

    _self.TEMPORAL_INPUT_SIZE = 6;
    _self.TEMPORAL_OUTPUT_SIZE = 1;

    console.log("I am in child for " + _self.symbol);

    var getTemporalNetworkInput = function () {
        console.log("I am getting training data for " + _self.symbol);

        var trainingData = [];

        var dataSize = _self.data.length;

        if (dataSize < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE) {
            return;
        }

        for (var i = dataSize - 2; i >= _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE - 1; i--) {
            var tempInput = [];
            var tempOutput = [];

            var past = _self.data[i + 1];

            for (var j = 0; j < _self.TEMPORAL_INPUT_SIZE; j++) {
                var c = _self.data[i - j];
                var change = (c["Adj Close"] - past["Adj Close"]) * 10 / past["Adj Close"];
                if (change > 1) {

                    change = 1;

                } else if (change < -1) {

                    change = -1;
                }

                tempInput.push((1 + change) / 2);
            }

            //var past = _self.data[i-j+1];

            for (var j = _self.TEMPORAL_INPUT_SIZE; j < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE; j++) {

                var c = _self.data[i - j];
                var change = (c["Adj Close"] - past["Adj Close"]) * 10 / past["Adj Close"];

                if (change > 1) {

                    change = 1;

                } else if (change < -1) {

                    change = -1;
                }

                tempOutput.push((1 + change) / 2);
            }

            trainingData.push({
                input: tempInput,
                output: tempOutput
            })
        }

        return trainingData;
    }



    var trainTemporal = function () {
        console.log("I am training for " + _self.symbol);

        var trainingData = getTemporalNetworkInput();

        if (trainingData) {

            var info = _self.temporalNet.train(trainingData, {
                errorThresh: 0.0005, // error threshold to reach
                iterations: 10000, // maximum training iterations
                log: true, // console.log() progress periodically
                logPeriod: 10 // number of iterations between logging
            });

            console.log("training " + _self.companyName + ": " + JSON.stringify(info));

            if (info.error == "null") {
                console.log(trainingData);
            }

            //write weights to file

            //console.log(JSON.stringify(_self.temporalNet.weights));
            _self.fs.writeFileSync("public/data/train/train-" + _self.symbol + ".json", JSON.stringify(_self.temporalNet.toJSON()));

            return JSON.stringify(info);
        }

        return;
    }


    console.log("I am reading the stock data for " + _self.symbol);

    var loader = require('csv-load-sync');
    //var csv1 = loader("public/data/"+_self.symbol+".csv");
    var csv1 = JSON.parse(fs.readFileSync("public/data/" + _self.symbol + ".json"));

    for (var i = 0; i < csv1.length; i++) {
        var d = csv1[i];
        d["Date"] = _self.parseDate(String(d["Date"]));
        d["Adj Close"] = +d["Adj Close"];
        d["Volume"] = +d["Volume"];

        var close = d["Adj Close"];

        if (_self.min > close) {
            _self.min = close;
        }

        if (_self.max < close) {
            _self.max = close;
        }

        _self.data.push(d);
    }

    console.log("I am done with reading " + _self.symbol + " of size " + _self.data.length);


    trainTemporal();

}

module.exports = Stock;
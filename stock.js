/**
 * Created by karthik on 1/31/15.
 */

function Stock (options) {
    var _self = this;

    var csv = _self.csv = require('fast-csv');
    var fs = _self.fs =  require('fs');
    var d3 = _self.d3 = require('d3');
    var brain = _self.brain = require('brain');

    _self.companyName = options.company;
    _self.symbol = options.symbol;
    _self.data = [];

    _self.min = 100000;
    _self.max = -100000;

    _self.temporalNet = new _self.brain.NeuralNetwork({
        hiddenLayers: [40, 50, 20],
        learningRate: 0.3 // global learning rate, useful when training using streams
    });

    _self.parseDate =  _self.d3.time.format("%Y%m%d").parse;
    _self.TEMPORAL_INPUT_SIZE = 12;
    _self.TEMPORAL_OUTPUT_SIZE = 1;


    //_self.readStock();
}

Stock.prototype.readStock = function () {

    var _self = this;

    var stream = _self.fs.createReadStream("data/"+_self.symbol+".csv");

    var csvStream = _self.csv
        .fromStream(stream, {headers : true})
        .on("data", function(d){

            d["date"] = _self.parseDate(String(d["date"]));
            d["close price"] = +d["close price"];
            d["volume"] = +d["volume"];

            var close = d["close price"];

            if (_self.min > close) {
                _self.min = close;
            }

            if (_self.max < close) {
                _self.max = close;
            }

            _self.data.push(d);


        })
        .on("end", function(){

            console.log("done: "+_self.symbol+", size: "+_self.data.length);

            for (var i = 0; i < _self.data.length; i++) {
                if (_self.max - _self.min != 0)
                    _self.data[i].normalized = (_self.data[i]["close price"] - _self.min)/(_self.max - _self.min);
                else
                    _self.data[i].normalized = 0;

                //console.log(_self.data[i].normalized);
            }

            _self.trainTemporal();
        });

}

Stock.prototype.getTemporalNetworkInput = function () {

    //PAST SIX DAYS

    var _self = this;
    var trainingData = [];

    var dataSize = _self.data.length;

    if (dataSize < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE) {
        return;
    }

    for (var i = dataSize - 1; i >= _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE - 1; i--) {
        var tempInput = [];
        var tempOutput = [];

        for (var j = 0; j < _self.TEMPORAL_OUTPUT_SIZE; j++) {
            var d = _self.data[i-j];
            tempOutput.push(d["normalized"]);
        }

        for (var j = _self.TEMPORAL_OUTPUT_SIZE; j < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE; j++) {
            var d = _self.data[i-j];
            tempInput.push(d["normalized"]);
        }

        trainingData.push({
            input: tempInput,
            output: tempOutput
        })
    }

    return trainingData;
}

Stock.prototype.trainTemporal = function () {

    var _self = this;

    var trainingData = _self.getTemporalNetworkInput();

    //console.log(trainingData);

    if (trainingData) {

        var info = _self.temporalNet.train(trainingData, {
            errorThresh: 0.005,  // error threshold to reach
            iterations: 40000,   // maximum training iterations
            log: false,           // console.log() progress periodically
            logPeriod: 10       // number of iterations between logging
        });

        console.log("training "+_self.companyName+": "+JSON.stringify(info));

        if (info.error == "null") {
            console.log(trainingData);
        }

        //write weights to file

        //console.log(JSON.stringify(_self.temporalNet.weights));
        _self.fs.writeFile("data/train/train-"+_self.symbol+".json", JSON.stringify(_self.temporalNet.toJSON()), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file "+"data/train/t"+_self.symbol+".json"+" was saved!");
            }
        });

        return JSON.stringify(info);
    }

    return;

}

module.exports = Stock;

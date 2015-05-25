/**
 * Created by karthik on 5/24/15.
 */

/** 
 * Classifying into 100 classes
 **/

function Stock (options) {
    var _self = this;

    var csv = _self.csv = require('fast-csv');
    var fs = _self.fs =  require('fs');
    var d3 = _self.d3 = require('d3');
    var RandomForestClassifier = _self.RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;
    
    _self.parseDate =  _self.d3.time.format("%Y%m%d").parse;
    
    _self.companyName = options.company;
    _self.symbol = options.symbol;
    _self.data = [];

    _self.min = 100000;
    _self.max = -100000;
    
    _self.FOREST_SIZE = 10;
    _self.DECISION_TREE_SIZE = 4;
    _self.TEMPORAL_INPUT_SIZE = 5;
    _self.TEMPORAL_OUTPUT_SIZE = 1; 
    
    var rf = new RandomForestClassifier({
        n_estimators: _self.FOREST_SIZE
    });

    console.log("I am in child for "+_self.symbol);

    var getTemporalNetworkInput = function () {
    
        console.log("I am getting training data for "+_self.symbol);

        var trainingData = [];

        var dataSize = _self.data.length;

        if (dataSize < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE) {
            return;
        }

        for (var i = dataSize - 1; i >= _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE - 1; i--) {
            
            var inputDatum = {}; 

            for (var j = 0; j < _self.TEMPORAL_OUTPUT_SIZE; j++) {
                var d = _self.data[i-j];
                inputDatum["future"] = ""+ Math.round(d["normalized"]*10);
            }

            for (var j = _self.TEMPORAL_OUTPUT_SIZE; j < _self.TEMPORAL_INPUT_SIZE + _self.TEMPORAL_OUTPUT_SIZE; j++) {
                var d = _self.data[i-j];
                inputDatum["f"+j] = d["normalized"];
            }
            
            trainingData.push(inputDatum);
        }

        return trainingData;
    }



    var trainTemporal = function () {
        
        console.log("I am training for "+_self.symbol);

        var trainingData = getTemporalNetworkInput();

        console.log(trainingData);

        if (trainingData) {
            
            
            rf.fit(trainingData, null, "future", function(err, trees){
                
                console.log(JSON.stringify(trees, null, 4));
                
                var pred = rf.predict(trainingData.slice(1, 10), trees);

                console.log(pred);

            });
            
            
            //write weights to file

            //console.log(JSON.stringify(_self.temporalNet.weights));
            //_self.fs.writeFileSync("data/train/train-"+_self.symbol+".json", JSON.stringify(_self.temporalNet.toJSON()));

        }

    }


    console.log("I am reading the stock data for "+_self.symbol);

    var loader = require('csv-load-sync');
    var csv1 = loader("data/"+_self.symbol+".csv");
    
    // normalizing
    for (var i = 0; i < csv1.length; i++) {
        var d = csv1[i];
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
    }

    console.log("I am done with reading "+ _self.symbol + " of size " + _self.data.length);

    for (var i = 0; i < _self.data.length; i++) {
        if (_self.max - _self.min != 0)
            _self.data[i].normalized = (_self.data[i]["close price"] - _self.min)/(_self.max - _self.min);
        else
            _self.data[i].normalized = 0;

    }

    trainTemporal();

}

module.exports = Stock;

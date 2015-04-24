/* 
 * Created by Karthik Badam on Feb 10, 2015
 * 
 */

function TemporalPrediction(options) {
    var _self = this;

    _self.stockName = options.stock_name;
    
    _self.network = new brain.NeuralNetwork();
    
    d3.json("data/train/train-" + _self.stockName + ".json", function(error, json) {
        if (error) return console.warn(error);
        _self.network.fromJSON(json);
        console.log("Loaded network");
    });
    
    
    
};

/* calculates temporal prediction */
TemporalPrediction.prototype.predict = function(input) {
    var _self = this;
    console.log(input);
    //var output = new Array(1);
    var output = _self.network.run(input);
    console.log(output);
    return output;
};


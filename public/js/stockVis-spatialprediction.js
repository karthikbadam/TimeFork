//Class Spatial Prediction

function SpatialPrediction(options) {
    var _self = this;
    _self.weights = options.weights;
    _self.trainingStocks = options.trainingStocks;
    _self.stockSymbols = options.stockSymbols;

    console.log(_self.weights);
    _self.weightsSize = _self.weights.length;
    console.log(_self.weightsSize);

    _self.stocksSize = _self.stockSymbols.length;
    console.log(_self.stocksSize);
}

SpatialPrediction.prototype.getPredictions = function(prediction, stock_symbol) {
    var _self = this;
    _self.predictionArrays = [];
    _self.predictionOpacities = [];
    var stockIndex = _self.trainingStocks.indexOf(stock_symbol);
    
    /* Get the weights from the SOM to get the closest values from the history */
    for (var i = 0; i < _self.weightsSize; i++) {
        var distance = Math.abs(_self.weights[i][stockIndex]- prediction);
        if ( distance < 1 ) {
            var opacity = 1 - distance;
            _self.predictionArrays.push(_self.weights[i]);
            _self.predictionOpacities.push(opacity);
        }
    }

    var returnVal = [];
    returnVal.arrays = _self.predictionArrays;     
    returnVal.opacities = _self.predictionOpacities; 
    return returnVal;
};

//Class Spatial Prediction

function SpatialPrediction(options) {
    var _self = this;
    _self.weights = options.weights;
    _self.trainingStocks = options.trainingStocks;

}

SpatialPrediction.prototype.getPredictions = function (stock_symbol, prediction, query) {
    var _self = this;

    _self.predictionArrays = [];
    _self.predictionOpacities = [];

    var stockIndex = _self.trainingStocks.indexOf(stock_symbol);

    predictionObject.newSpatialPredictions();
    
    
    console.log(query);


    /* Get the weights from the SOM to get the closest values from the history */
    for (var i = 0; i < _self.weights.length; i++) {

        for (var j = 0; j < _self.weights[i].length; j++) {
            var weightArray = [];

            for (var k = 0; k < _self.weights[i][j].length; k++) {

                weightArray.push(_self.weights[i][j][k]);

                weightArray[k] = (2 * weightArray[k] - 1) * 100 / 10;

            }

            var stockIndices = Object.keys(query);

            var distance = 0;
            
            for (var z = 0; z < stockIndices.length; z++) {

                var stockIndex = _self.trainingStocks.indexOf(stockIndices[z]);

                distance += Math.pow(weightArray[stockIndex] -
                    query[stockIndices[z]], 2);

            }

            if (Math.abs(distance) < 20) {

                var opacity = Math.pow(1 - Math.pow(distance, 0.5) / 100, 2);
                predictionObject.addSpatialPrediction(weightArray,
                    opacity);

            }
        }
    }


    return predictionObject.getTopSpatialPredictions();

    //    var returnVal = [];
    //
    //    returnVal.arrays = _self.predictionArrays;
    //    returnVal.opacities = _self.predictionOpacities;
    //
    //    return returnVal;
};


SpatialPrediction.prototype.getPredictions2 = function (prediction, stock_symbol) {

    var _self = this;
    _self.predictionArrays = [];
    _self.predictionOpacities = [];
    var stockIndex = _self.trainingStocks.indexOf(stock_symbol);

    /* Get the weights from the SOM to get the closest values from the history */
    for (var i = 0; i < _self.weightsSize; i++) {
        var distance = Math.abs(_self.weights[i][stockIndex] - prediction);
        if (distance < 1) {
            var opacity = Math.pow(1 - distance, 2);
            _self.predictionArrays.push(_self.weights[i]);
            _self.predictionOpacities.push(opacity);
        }
    }

    var returnVal = [];
    returnVal.arrays = _self.predictionArrays;
    returnVal.opacities = _self.predictionOpacities;
    return returnVal;
};
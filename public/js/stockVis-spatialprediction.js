//Class Spatial Prediction

function SpatialPrediction(options) {
    var _self = this;
    _self.weights = options.weights;
    _self.trainingStocks = options.trainingStocks;
    _self.cache = [];

    console.log(_self.weights);

}

SpatialPrediction.prototype.getPredictions = function (stock_symbol, prediction) {
    var _self = this;

    _self.predictionArrays = [];
    _self.predictionOpacities = [];

    var stockIndex = _self.trainingStocks.indexOf(stock_symbol);

    predictionObject.newSpatialPredictions();

    var checkCount = 0;
    var stockIds = Object.keys(spatialUserPredictionBool);

    for (var i = 0; i < stockIds.length; i++) {

        if (spatialUserPredictionBool[stockIds[i]] == false) {

            checkCount++;
        }
    }

    var allPossibilites = _self.weights;

    if (false && (checkCount == 0 || checkCount == 3)) {

        //then is when you actually need to use the SOM, if not just use the cache
        allPossibilites = _self.cache;

        for (var i = 0; i < allPossibilites.length; i++) {

            var weightArray = [];

            for (var k = 0; k < allPossibilites[i].length; k++) {

                weightArray.push(allPossibilites[i][k]);

                weightArray[k] = (2 * weightArray[k] - 1) * 100 / 10;

                //var previous = stockObjects[_self.trainingStocks[stockIndex]].getRecentValue();

                //var actual = weightArray[k]*previous/10 + previous;

                //weightArray[k] = (actual - previous)*100/previous;

            }

            var distance = Math.abs(weightArray[stockIndex] - prediction);

            if (Math.abs(distance) < 10) {

                var opacity = Math.pow(1 - distance / 100, 2);

                predictionObject.addSpatialPrediction(weightArray, opacity);

            }

        }

        for (var i = 0; i < stockIds.length; i++) {

            spatialUserPredictionBool[stockIds[i]] = false; 
        }

    } else {
        
        _self.cache = []; 

        /* Get the weights from the SOM to get the closest values from the history */
        for (var i = 0; i < allPossibilites.length; i++) {

            for (var j = 0; j < allPossibilites[i].length; j++) {

                var weightArray = [];

                for (var k = 0; k < allPossibilites[i][j].length; k++) {

                    weightArray.push(allPossibilites[i][j][k]);

                    weightArray[k] = (2 * weightArray[k] - 1) * 100 / 10;

                    //var previous = stockObjects[_self.trainingStocks[stockIndex]].getRecentValue();

                    //var actual = weightArray[k]*previous/10 + previous;

                    //weightArray[k] = (actual - previous)*100/previous;

                }

                var distance = Math.abs(weightArray[stockIndex] - prediction);

                if (Math.abs(distance) < 10) {

                    var opacity = Math.pow(1 - distance / 100, 2);

                    predictionObject.addSpatialPrediction(weightArray, opacity);

                    _self.cache.push(weightArray);
                    //                _self.predictionOpacities.push(opacity);
                }
            }
        }
    }

    return predictionObject.getTopSpatialPredictions();

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
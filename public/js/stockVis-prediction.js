/* Created by Karthik Badam on 06/01/2015
 */


function Predictions(options) {

    var _self = this;

    _self.spatialPredictions = [];

    _self.sortedSpatialPredictions = [];

    _self.temporalPredictions = {};

    _self.stockPresent = {};

    _self.pastValues = {};

    _self.TEMPORAL_ALTERNATIVES = 4;

    _self.TEMPORAL_INPUT_SIZE = 15;

    _self.stockPastValues = {};

}

Predictions.prototype.newSpatialPredictions = function () {

    var _self = this;

    _self.spatialPredictions = [];


};

Predictions.prototype.newTemporalPredictions = function () {

    var _self = this;

    _self.temporalPredictions = [];

};


Predictions.prototype.addSpatialPrediction = function (predictions, opacity) {

    var _self = this;

    _self.spatialPredictions.push({
        predictions: predictions,
        opacity: opacity
    });

};

Predictions.prototype.sortSpatial = function (predictions, opacity) {

    var _self = this;

    // sort based on opacities
    _self.sortedSpatialPredictions = _self.spatialPredictions.sort(function (a, b) {
        return b.opacity - a.opacity
    });

};

Predictions.prototype.getTopSpatialPredictions = function () {

    var _self = this;

    _self.sortSpatial();

    var sp = _self.sortedSpatialPredictions.splice(0, 7);

    if (!sp)
        return;

    var min = sp[sp.length - 1].opacity;

    var max = sp[0].opacity;

    for (var i = 0; i < sp.length; i++) {

        sp[i].opacity = (sp[i].opacity - min) / (max - min);
    }

    return sp;
}

Predictions.prototype.getProcessedTemporalInput = function (input) {

    var _self = this;

    var processedInput = [];
    
    var past = input[0];

    for (var i = 1; i < input.length; i++) {

        var change = (input[i] - past) * 10 / past;

        if (change > 1) {

            change = 1;

        } else if (change < -1) {

            change = -1;
        }

        processedInput.push((1 + change) / 2);

    }
    
    return processedInput;

}

function processPrediction (prediction, previous) {
    
    prediction = (2*prediction - 1); 

    prediction = prediction*previous/10 + previous;
    
    return prediction;
    
}

Predictions.prototype.generateTemporalPredictions = function (stockId, input) {

    var _self = this;

    var actualInput = _self.getProcessedTemporalInput(input);

    var allInputs = [];

    allInputs.push({
        input: input,
        opacity: 1
    });
    
    for (var i = 0; i < _self.TEMPORAL_ALTERNATIVES; i++) {

        //var tempInput = actualInput.slice(0);
        var tempInput = input.slice(0);

        //get a random number 
        var alternations = Math.ceil(Math.random() * _self.TEMPORAL_ALTERNATIVES); //i

        for (var j = 0; j < alternations; j++) {

            var index = Math.floor(Math.random() * _self.TEMPORAL_ALTERNATIVES);

            if (Math.random() < 0.5) {
                
                tempInput[index] = tempInput[index] + 0.05*tempInput[index];
                //tempInput[index] = tempInput[index] + 0.4 > 1? 1: tempInput[index] + 0.4;

            } else {
                
                tempInput[index] = tempInput[index] - 0.05*tempInput[index];
                //tempInput[index] = tempInput[index] - 0.4 > -1? -1: tempInput[index] - 0.4;
            }
        }

        allInputs.push({
            input: tempInput,
            opacity: (_self.TEMPORAL_ALTERNATIVES - alternations) / _self.TEMPORAL_ALTERNATIVES
        });

    }

    var temporalPredictionArray = [];
    var predictor = temporalPredictors[stockId];

    var allPredictions = [];

    for (var i = 0; i < allInputs.length; i++) {

        var output = predictor.predict(_self.getProcessedTemporalInput(allInputs[i].input));

        var processedOutput = processPrediction(output[0], input[0]);
        
        allPredictions.push({
            prediction: processedOutput,
            opacity: allInputs[i].opacity, 
            input: allInputs[i].input
        });

    }
    
    return allPredictions;
}

Predictions.prototype.setCurrentPresent = function (stockId, dataFiltered) {

    var _self = this;

    if (dataFiltered.length == 0)
        return;

    _self.stockPresent[stockId] = dataFiltered[0][stockColumns[0]];

    var input = new Array(_self.TEMPORAL_INPUT_SIZE+1);

    //no normalization
    for (var i = _self.TEMPORAL_INPUT_SIZE; i >= 0; i--) {
        input[i] = dataFiltered[_self.TEMPORAL_INPUT_SIZE-i][stockColumns[6]];
    }

    _self.stockPastValues[stockId] = input;

}

//function getFutureDate(today) {
//
//    var tomorrow = new Date(today.getTime());
//
//    tomorrow.setMonth(today.getMonth());
//    tomorrow.setFullYear(today.getFullYear());
//
//    tomorrow.setDate(today.getDate() + 1);
//
//    if (today.getDay() === 6) {
//        tomorrow.setDate(today.getDate() + 2);
//    }
//    if (today.getDay() === 5) {
//        tomorrow.setDate(today.getDate() + 3);
//    }
//    
//    return tomorrow;
//
//}

Predictions.prototype.predictFutureSteps = function (stockId, nTimes, dataFiltered, predictSpatial) {

    var _self = this;

    var predictions = [];

    var previous = 0;

    var spatialPreds = [];

    _self.setCurrentPresent(stockId, dataFiltered);
    
    var future = new Date(_self.stockPresent[stockId].getTime());

    var pastBestPredictions = []; 
    
    for (var i = 0; i < nTimes; i++) {
        
        var presentDate = new Date(future.getTime());

        future = getFutureDate(future);

        var input = _self.stockPastValues[stockId].slice(i);

        input = input.concat(pastBestPredictions);

        previous = input[input.length-1];
        
        var output = _self.generateTemporalPredictions(stockId, input);

        for (var j = 0; j < output.length; j++) {

            var bestPrediction = output[j].prediction;

            predictions.push({
                prediction: bestPrediction,
                date: presentDate,
                past: previous,
                opacity: output[j].opacity,
                step: i
            });
            
        }
       
        pastBestPredictions.push(output[0].prediction);
        
        if (predictSpatial) {

            var change = (output[0].prediction - previous) * 100 / previous;

            var spatialPred = spatialPrediction.getPredictions(stockId, change);

            spatialPreds.push({
                predictions: spatialPred,
                date: presentDate,
                past: previous,
                step: i
            });

        }

    }

    return {
        temporal: predictions,
        spatial: spatialPreds
    };

}
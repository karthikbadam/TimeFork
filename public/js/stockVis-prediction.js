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

    _self.TEMPORAL_INPUT_SIZE = 6;

    _self.stockPastValues = {};

    _self.SPATIAL_ALTERNATIVES = 6;

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

    var sp = _self.sortedSpatialPredictions.splice(0, _self.SPATIAL_ALTERNATIVES);

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

function processPrediction(prediction, previous) {

    prediction = (2 * prediction - 1);

    prediction = prediction * previous / 10 + previous;

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

            //var index = Math.floor(Math.random() * _self.TEMPORAL_ALTERNATIVES);

            var index = _self.TEMPORAL_INPUT_SIZE - 1 - j < 0 ? 2 * _self.TEMPORAL_INPUT_SIZE - 1 - j : _self.TEMPORAL_INPUT_SIZE - 1 - j;

            if (Math.random() < 0.5) {

                tempInput[index] = tempInput[index] + 0.05 * tempInput[index];
                //tempInput[index] = tempInput[index] + 0.4 > 1? 1: tempInput[index] + 0.4;

            } else {

                tempInput[index] = tempInput[index] - 0.05 * tempInput[index];
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

    _self.stockPresent[stockId] = dataFiltered[0][dateCol];

    var input = new Array(_self.TEMPORAL_INPUT_SIZE + 1);

    //no normalization
    for (var i = _self.TEMPORAL_INPUT_SIZE; i >= 0; i--) {
        input[i] = dataFiltered[_self.TEMPORAL_INPUT_SIZE - i][adjCol];
    }

    _self.stockPastValues[stockId] = input;

}

Predictions.prototype.predictFutureSteps = function (stockId, nTimes, dataFiltered, predictSpatial, userPrediction) {

    var _self = this;

    var predictions = [];

    var previous = 0;

    var spatialPreds = [];

    _self.setCurrentPresent(stockId, dataFiltered);

    var future = new Date(_self.stockPresent[stockId].getTime());

    var pastBestPredictions = [];

    var temporalBands = [];

    var spatialBands = [];

    temporalBands.push({
        high: dataFiltered[0][adjCol],
        low: dataFiltered[0][adjCol],
        step: -1
    });

    for (var i = 0; i < nTimes; i++) {

        var presentDate = new Date(future.getTime());

        future = getFutureDate(future);

        var input = _self.stockPastValues[stockId].slice(i);

        input = input.concat(pastBestPredictions);

        previous = input[input.length - 1];

        var output = _self.generateTemporalPredictions(stockId, input);


        for (var j = 0; j < output.length; j++) {

            var currPrediction = output[j].prediction;

            predictions.push({
                prediction: currPrediction,
                date: presentDate,
                past: previous,
                opacity: output[j].opacity,
                step: i
            });

        }

        // lets fit the high confidence till the last step
        var bestPrediction = output[0].prediction;

        // get the band information from output variables
        var temporalBandData = getTPredictionBand(output, i);
        temporalBands.push(temporalBandData);

        if (i != nTimes - 1) {

            pastBestPredictions.push(bestPrediction);

        } else {

            var minIndex = 0;
            var min = 10000000;

            for (var j = 0; j < output.length; j++) {

                var currPrediction = output[j].prediction;

                var difference = Math.abs(currPrediction - userPrediction);

                if (min > difference) {

                    min = difference;

                    minIndex = j;
                }

            }

            bestPrediction = output[minIndex].prediction;

            pastBestPredictions.push(bestPrediction);
        }



        if (predictSpatial) {

            var change = (bestPrediction - previous) * 100 / previous;

            var spatialPred = spatialPrediction.getPredictions(stockId, change);

            var bands = getSPredictionBand(spatialPred, i);

            spatialPreds.push({
                predictions: spatialPred,
                date: presentDate,
                past: previous,
                step: i
            });

            spatialBands.push(bands);
        }

    }

    return {
        temporal: predictions,
        temporalband: temporalBands,
        spatial: spatialPreds,
        spatialband: spatialBands
    };

}

function getTPredictionBand(data, step) {

    var band = {}; //{ step: 0, low: 0, high: 0 }

    band.step = step;

    //    var low = d3.min(data, function (d) {
    //        return d.prediction;
    //    });
    //
    //    var high = d3.max(data, function (d) {
    //        return d.prediction;
    //    });
    //
    //    band.low = low;
    //    band.high = high;


    var wsum = d3.sum(data, function (d) {
        return d.prediction * d.opacity;
    });

    var osum = d3.sum(data, function (d) {
        return d.opacity;
    });

    var mean = wsum / osum;

    band.mean = mean;

    wsum = d3.sum(data, function (d) {
        return Math.pow(d.prediction - mean, 2) * d.opacity;
    });

    osum = d3.sum(data, function (d) {
        return d.opacity;
    });

    var stdDev = Math.pow((data.length * wsum) / ((data.length - 1) * osum), 0.5);

    band.low = mean - 2 * stdDev;
    band.high = mean + 2 * stdDev;

    return band;
}

function getSPredictionBand(data, step) {

    var bands = {}; //{ step: 0, low: 0, high: 0 }

    if (!data) {
        return;
    }

    var numOfStocks = data[0].predictions.length;

    for (var i = 0; i < numOfStocks; i++) {

        // get the actual value at that step
        var stockId = stockSymbols[i];

        if (selectedSymbols.indexOf(stockId) <= -1) {
            continue;
        }

        if (!bands[stockId]) {
            bands[stockId] = {};
        }

        var wsum = d3.sum(data, function (d) {
            var value = chartObjects[stockId].topTemporalPredictions[step] + chartObjects[stockId].topTemporalPredictions[step] * d.predictions[i] / 100;

            return value * d.opacity;
        });

        var osum = d3.sum(data, function (d) {
            return d.opacity;
        });

        var mean = wsum / osum;

        wsum = d3.sum(data, function (d) {
            var value = chartObjects[stockId].topTemporalPredictions[step] + chartObjects[stockId].topTemporalPredictions[step] * d.predictions[i] / 100;

            return Math.pow(value - mean, 2) * d.opacity;
        });

        osum = d3.sum(data, function (d) {
            return d.opacity;
        });

        var stdDev = Math.pow((data.length * wsum) / ((data.length - 1) * osum), 0.5);


        var low = mean - 2 * stdDev;

        var high = mean + 2 * stdDev;
        

        //        var low = d3.min(data, function (d) {
        //            var value = chartObjects[stockId].topTemporalPredictions[step] + chartObjects[stockId].topTemporalPredictions[step] * d.predictions[i] / 100;
        //
        //            return value;
        //        });
        //
        //        var high = d3.max(data, function (d) {
        //            var value = chartObjects[stockId].topTemporalPredictions[step] + chartObjects[stockId].topTemporalPredictions[step] * d.predictions[i] / 100;
        //
        //            return value;
        //        });
        //
        bands[stockId].high = high;

        bands[stockId].low = low;

        bands[stockId].mean = mean;

    }

    bands.step = step;

    return bands;
}
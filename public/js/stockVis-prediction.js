/* Created by Karthik Badam on 06/01/2015
 */


function Predictions(options) {

    var _self = this;

    _self.spatialPredictions = [];

    _self.sortedSpatialPredictions = [];

    _self.temporalPredictions = {};

}

Predictions.prototype.newSpatialPredictions = function () {

    var _self = this;

    _self.spatialPredictions.clear();


};

Predictions.prototype.newTemporalPredictions = function () {

    var _self = this;

    _self.temporalPredictions.clear();

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
    _self.sortedSpatialPredictions = _self.spatialPredictions.sort(function(a,b) { return b.opacity - a.opacity } );
    
};

Predictions.prototype.getTopSpatialPredictions = function () {

    var _self = this;
    
    _self.sortSpatial();
    
    var sp = _self.sortedSpatialPredictions.splice(0, 20);
    
    if (!sp)
        return; 
    
    var min = sp[sp.length-1].opacity;
    
    var max = sp[0].opacity;
    
    for (var i = 0; i < sp.length; i++) {
    
        sp[i].opacity = (sp[i].opacity - min)/(max - min);
    }

    return sp;
}


Predictions.prototype.addTemporalPrediction = function (stockId, prediction) {

    var _self = this;

    _self.temporalPredictions[stockId] = prediction;
}
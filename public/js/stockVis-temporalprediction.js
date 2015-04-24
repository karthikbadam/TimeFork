//Class Temporal Prediction

function TemporalPrediction(options) {
    var _self = this;
//    var layers = this.layers = [];
//    layers[0] = ENCOG.BasicLayer.create(ENCOG.ActivationTANH.create(), 15, 1);
//    layers[1] = ENCOG.BasicLayer.create(ENCOG.ActivationTANH.create(), 41, 1);
//    layers[2] = ENCOG.BasicLayer.create(ENCOG.ActivationTANH.create(), 41, 1);
//    layers[3] = ENCOG.BasicLayer.create(ENCOG.ActivationTANH.create(), 1, 1);
//    
//    var network = this.network =  ENCOG.BasicNetwork.create(layers);
//   
//    network.randomize();
//    var result = ENCOG.EGFILE.save(network);
//   
 
    _self.stockName = options.stock_name;
    _self.encogFileContent = options.encog_file; 
   
    _self.network = ENCOG.EGFILE.load(_self.encogFileContent);
    
    var result = ENCOG.EGFILE.save(_self.network);
    
    console.log("result --"+result);
};

/* calculates temporal prediction */
TemporalPrediction.prototype.predict = function(input) {
    var _self = this;
    
    var output = new Array(1);
    _self.network.compute(input, output);
   
    return output;
};


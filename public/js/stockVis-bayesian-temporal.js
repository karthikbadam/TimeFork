/* 
 * Created by Karthik Badam on Apr 30, 2015
 * 
 */

function TemporalPrediction(options) {
    var _self = this;

    _self.stockName = options.stock_name;
    
    _self.stockID = options.stock_id; 
    
    _self.stockObject = stockObjects[_self.stockID]; 
    
};

/* calculates temporal prediction */
TemporalPrediction.prototype.predict = function(input) {
    
    var _self = this; 
    
    // get the last 15 values
    for (int i = 0; i < _self.stockObject.data.length; i++) {
        
    }
    
    
};


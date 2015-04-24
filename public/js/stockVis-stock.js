//Stock datastructure to store value, volume, and manage operations on the stock

function Stock(options) {
    var _self = this;
    _self.data = options.data;
    _self.companyName = options.companyName;
    _self.symbol = options.symbol;
    _self.startDate = options.startDate; 
    _self.min = 0;
    _self.max = 0;
    _self.normalization = 0;
    _self.stockColumns = options.stockColumns;
   _self.dataFiltered = _self.data; 
} 

Stock.prototype.normalize = function(close_values) {
    var _self = this; 
    var max = Math.max.apply(Math, close_values) + 0.0001;
    var min = Math.min.apply(Math, close_values) - 0.0001;

    for (var i= 0; i < close_values.length; i++) {
        _self.data[i].normalized = (_self.data[i].normalized - min)/(max - min);
    }
    
    _self.min = 100000;
    _self.max = 0;
    for (var i = 0; i < _self.data.length; i++) {
        if( _self.min > _self.data[i][_self.stockColumns[6]] && _self.data[i][_self.stockColumns[0]] >  _self.startDate ) {
            _self.min = _self.data[i][_self.stockColumns[6]];
        }
        if( _self.max < _self.data[i][_self.stockColumns[6]] && _self.data[i][_self.stockColumns[0]] >  _self.startDate ) {
            _self.max = _self.data[i][_self.stockColumns[6]];
        }   
    }
    
    _self.min = _self.min - 0.0002;
    _self.normalization = _self.max - _self.min + 0.0003;
    console.log(_self.companyName +" min -" + _self.min+" norm -" + _self.normalization);
    
};

Stock.prototype.deNormalize = function(value) {
    var _self = this;
    return _self.min+value*_self.normalization; 
};

Stock.prototype.normalizeValue = function(value) {
    var _self = this;
    return (value - _self.min)/_self.normalization; 
};

Stock.prototype.getFilteredData = function(brush) {
    var _self = this;
    var dataFiltered = _self.dataFiltered = _self.data.filter(function(d, i) {
        if ( (d[_self.stockColumns[0]] >= brush[0]) && (d[_self.stockColumns[0]] <= brush[1]) ) {
            return d[_self.stockColumns[1]];
        }
    });
    
   return dataFiltered; 
}; 
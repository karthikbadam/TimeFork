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
    _self.dataFiltered = _self.data;
}

Stock.prototype.normalize = function (close_values) {
    var _self = this;
    var max = Math.max.apply(Math, close_values) + 0.0001;
    var min = Math.min.apply(Math, close_values) - 0.0001;

    for (var i = 0; i < close_values.length; i++) {
        _self.data[i].normalized = (_self.data[i].normalized - min) / (max - min);
    }

    _self.min = 100000;
    _self.max = 0;
    for (var i = 0; i < _self.data.length; i++) {
        if (_self.min > _self.data[i][adjCol] && _self.data[i][dateCol] > _self.startDate) {
            _self.min = _self.data[i][adjCol];
        }
        if (_self.max < _self.data[i][adjCol] && _self.data[i][dateCol] > _self.startDate) {
            _self.max = _self.data[i][adjCol];
        }
    }

    _self.min = _self.min - 0.0002;
    _self.normalization = _self.max - _self.min + 0.0003;
    console.log(_self.companyName + " min -" + _self.min + " norm -" + _self.normalization);

};

Stock.prototype.deNormalize = function (value) {
    var _self = this;
    return _self.min + value * _self.normalization;
};

Stock.prototype.normalizeValue = function (value) {
    var _self = this;
    return (value - _self.min) / _self.normalization;
};

Stock.prototype.getFilteredData = function (brush) {
    var _self = this;
    var dataFiltered = _self.dataFiltered =
        _self.data.filter(function (d, i) {
            if ((d[dateCol] >= brush[0]) && (d[dateCol] <= brush[1])) {
                return true;
            }
        });

    return dataFiltered;
};

Stock.prototype.getRawBandData = function (brush, n) {
    var _self = this;

    var index1 = 0,
        index2 = 0;
    
    var val1 = _self.dataFiltered[0];
    var val2 = _self.dataFiltered[_self.dataFiltered.length-1];

    for (var i = 0; i < _self.data.length; i++) {

        var d = _self.data[i];

        if (d[dateCol].getTime() === val1[dateCol].getTime()) {
            index1 = i;
        }


        if (d[dateCol].getTime() === val2[dateCol].getTime()) {
            index2 = i;
        }

    }

    index2 = index2 > _self.data.length - 1 - 20 ?
        _self.data.length - 1 : index2 + n;

    var rawData = _self.data.slice(index1, index2+1);

    return rawData;
};
/**
 * Created by karthik on 5/28/15.
 */

function SOM (options) {
    
    var _self = this;

    _self.symbols = options.symbols;
    
    _self.data = [];
    
    var d3 = _self.d3 = require('d3');
    var SOM = require('ml-som');
    var fs = _self.fs =  require('fs');
    
    
    _self.parseDate =  _self.d3.time.format("%Y-%m-%d").parse;
    
    _self.NETWORK_SIZE = 25; 
    
    if (!_self.symbols) {
        return;
    }
    
    console.log("I am in child for " + _self.symbols.toString());

    _self.som = new SOM(_self.NETWORK_SIZE, _self.NETWORK_SIZE, {
                            iterations: 1000, 
                            learningRate: 0.3, 
                            method: "random",
                            gridType: "rect"
                        }); 
    
    var getSpatialNetworkInput = function () {
        
        console.log("I am getting training data from "+_self.data.length);

        var trainingData = [];

        var dataSize = _self.data.length;
        
        for (var i = dataSize - 2; i >= 0; i--) {
            
            var tempInput = [];
            
            var past = _self.data[i+1]; 
            
            var curr = _self.data[i];
            
            console.log(curr.toString());
            
            for (var j = 0; j < curr.length; j++) {
                
                var change = (curr[j] - past[j])*10/past[j];
                
                 if (change > 1) {
                    
                    change = 1;
                
                } else if (change < -1) {
                
                    change = -1; 
                }
                
                tempInput.push((1+change)/2);
            
            }
            
             
            trainingData.push(tempInput);
        }
        
        return trainingData;
        
    }



    var trainSpatial = function () {
    
        console.log("I am training for SOM ");

        var trainingData = getSpatialNetworkInput();

        console.log(trainingData);

        if (trainingData) {
            
            //write weights to file
            _self.som.train(trainingData);
            
            //console.log(JSON.stringify(_self.temporalNet.weights));
            _self.fs.writeFileSync("public/data/train/som_weights.json", JSON.stringify(_self.som.export()));

            return 1;
        }

        return;
    }


    
    _self.csv = {};
    
    var loader = require('csv-load-sync');
    
    
    for (var i = 0; i < _self.symbols.length; i++) {
        
        console.log("I am reading the stock data for " + _self.symbols[i]);
        
        var csv1 = loader("data/"+_self.symbols[i]+".csv");
        
        _self.csv[_self.symbols[i]] = csv1;
    }
    
    for (var i = 0; i < csv1.length; i++) {
        
        var priceArray = []; 
        
        for (var j = 0; j < _self.symbols.length; j++) {
            
            var d = _self.csv[_self.symbols[j]][i];
        
            d["Date"] = _self.parseDate(String(d["Date"]));
            d["Adj Close"] = +d["Adj Close"];
            d["Volume"] = +d["Volume"];

            var close = d["Adj Close"];
            priceArray.push(close);
        }

        _self.data.push(priceArray);
        
    }
    
    console.log("I am done with reading all symbols for SOM");

    trainSpatial();

}

module.exports = SOM;

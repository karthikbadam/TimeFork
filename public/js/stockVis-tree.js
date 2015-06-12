// Created by Karthik Badam 06/06/2015

function Tree(options) {

    var _self = this;

    _self.rootInput = options.rootInput;

    _self.size = options.size;

    _self.branches = options.branches;

    _self.stockId = options.stockId;
    
    _self.startDate = options.startDate; 

}

Tree.prototype.getBranchesFromNode = function (parent, currentDate, step) {

    var _self = this;

    //process input from this
    var allPredictions = predictionObject.generateTemporalPredictions(parent.shift());
    var branches = []; 
    
    for (var i = 0; i < allPredictions.length; i++) {

        var output = allPredictions[i].prediction;
        var raw = allPredictions[i];
        
        TreeNode node = new TreeNode({
            input: allPredictions[i].input,
            parent: parent,
            output: allPredictions[i].prediction,
            opacity: allPredictions[i].opacity,
            date: currentDate,
            step: step
        });
        
        
    }
}

Tree.prototype.createTree = function () {

    var _self = this;
    
    var future = new Date(_self.startDate.getTime());
    
    var presentDate = new Date(future.getTime());
    
    future = getFutureDate(future);

    // create a bunch of branches for each node at the level
    var root = new TreeNode({
        input: _self.rootInput,
        parent: null, 
        output: null
    })
    
    var branchList = []; 
    
    branchList.push(_self.getBranchesFromNode(root, presentDate, 0));

    // number of tree
    for (var i = 0; i < _self.size - 1; i++) {
        
        var presentDate = new Date(future.getTime());
    
        future = getFutureDate(future);

        while(array.length != 0) {
            
            var node = branchList[0];
            
            branchList.push(getBranchesFromNode(node, presentDate, i));

            branchList = branchList.slice(1); 
        }
    }
}

function TreeNode (options) {
    
    var _self = this; 
    
    _self.input = options.input; 
    
    _self.output = options.output; 
    
    _self.parent = options.parent; 
    
    _self.date = options.date; 
    
    _self.opacity = options.opacity;
}

TreeNode.prototype.setOutput = function (output) {
 
    var _self = this; 
    
    _self.output = output; 
    
}

TreeNode.prototype.setParent = function (parent) {
 
    var _self = this; 
    
    _self.parent = parent; 
    
}

TreeNode.prototype.shift = function () {
    
    var _self = this; 
    
    if (_self.output == null) {
        return _self.input;
    }
    
    var newInput1 = _self.input.slice(1);
    
    newInput1.concat(_self.output.prediction); 
    
    return newInput1;
}

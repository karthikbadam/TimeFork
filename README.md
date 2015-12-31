TimeFork For Stock Market Data
====

**TimeFork** is a technique for interactive prediction of time-series data. To showcase this technique, we developed a stock market analytics tool (StockFork) using data from the Yahoo Finance API. With TimeFork, you can predict the future of stocks through an interactive dialogue with the interface (through 3 steps).

1. The interface first provides prediction suggestions for each stock based on its past trends (**temporal predictions**).
2. Based on these suggestions and other stock market data, an analyst can interact to make his/her own prediction for one or more stocks.
3. Following the analyst's interactions for specific stocks, the interface recalculates the predictions for other stocks (**conditional predictions**). In essence, this step answers "what if" questions that an analyst can have. For example, what if Tesla increase by 5\% over the next ten days. The dialogue goes back to Step 1 or 2 after. 

The analyst can go through these steps iteratively till he/she has enough information to make a decision regarding investment in the stocks.


## Repository Content 
In this repository, we provide two main things for developers and researchers interested in contributing to this project. 

1. The "main" branch contains our implementation of the stock market analytics tool---StockFork--- including its server and client components (described below).

2. The "user-study" contains the implementation including the code and data specifically used for a user study conducted to understand if TimeFork is successful improving the predictions and when/how it does do. 

Beyond the implementations, **our repository also offers sample stock market data in [public/data/](https://github.com/karthikbadam/TimeFork/tree/master/public/data) folder and the corresponding trained neural network files (containing fitted weights) in [public/data/train/](https://github.com/karthikbadam/TimeFork/tree/master/public/data/train).**


## Build Process

To deploy this Node.js application, you must have [npm](https://www.npmjs.com/) installed.

1. Run `npm install` in the TimeFork folder to install dependencies.
2. Run `node app.js` in the TimeFork folder to start the application at port 3000. Now, you can try it out by opening `localhost:3000` in your browser.


## StockFork Server-Side



## StockFork Client Interface



## How to use



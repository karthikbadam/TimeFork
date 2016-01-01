User Study: TimeFork for Stock Market Data
====

We conducted an evaluation of our stock market analytics tool with the general population at our University including students, staff, and faculty (13 participants, age range: 18-50). This branch consists of the version of the tool used for the user study, as well as the training data for the prediction models, trained neural network files (with fitted weights), and the datasets used for the tasks in the study.

## Build Process

To deploy this application, you must have [node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed.

1. Run `npm install` to install dependencies.
2. Run `node app.js` to start the application at port 3000. 


## How to use

In our study, we evaluated TimeFork prediction (where the computer helps the user predict by providing suggestions) against manual prediction (where the users have to predict by themselves just by looking at the data).

To test them both, we used two sets of stock market data for three stocks (Apple, Tesla, FB):

1. **Data after second quarter of 2014**: Stock market data between July and Aug 2014. To test TimeFork on this data, open `http://localhost:3000/?pred=1&data=1` on the web browser.

2. **Data after fourth quarter of 2014**: Stock market data between Jan and March 2015. To test TimeFork on this data, open `http://localhost:3000/?pred=1&data=2` on the web browser.

To test manual prediction on these datasets, set the `pred` parameter to 0.

These datasets are available in [public/data/](https://github.com/karthikbadam/TimeFork/tree/user-study/public/data) in CSV format.


## Training Data: Prediction Models

The prediction models (MLP and SOM) are trained by the server on the stock market data for the above stocks from July 2012 till March 2014. 

This data is available in the [data/](https://github.com/karthikbadam/TimeFork/tree/user-study/data) folder in CSV format.


## Fitted Weights: Prediction Models

The fitted weights of the prediction models (after training), are available in [public/data/train](https://github.com/karthikbadam/TimeFork/tree/user-study/public/data/train) in JSON format. These files can be used in [Brain](https://www.npmjs.com/package/brain) and [ML-SOM](https://www.npmjs.com/package/ml-som) to recreate the corresponding models.


## Study Results

If you are interested in running your tests on the investments and profits made by our participants (fully anonymized) using TimeFork. Please look into the [results/](https://github.com/karthikbadam/TimeFork/tree/user-study/results/) folder.

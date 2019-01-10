/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose = require('mongoose');
var fetch = require('node-fetch');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

const stockSchema = mongoose.Schema({
  stock: {type: String, required: true},
  price: {type: String, required: true},
  likes: {type: Number, required: true, default: 0}
})

const Stock = mongoose.model('Stock', stockSchema);

module.exports = function (app) {
  
  function getStockData(stock){
    var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY
    return fetch(url)
      .then(response=>{
        return response.json()
      })
      .then(theJson)
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      var query = req.query;
      if (query.stock.isArray){
        console.log('double stock');
      } else {
        var jsonresult = await getStockData(query.stock);
        console.log(jsonresult['Global Quote']);
      
        
      }
      
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};

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
      .then(theJson=>{
        return ({stock: theJson['Global Quote']['01. symbol'], price: theJson['Global Quote']['05. price']})
      })
  }
  
  function createNewStock(stockObj){
    var newStock = new Stock({
      stock: stockObj.stock,
      price: stockObj.price,
      likes: stockObj.likes
    })
    newStock.save((err,data)=>{
      if (err) return {error: err}
      return data;
    })
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      var reqIp = req.headers['x-forwarded-for'];
      console.log(reqIp);
      var query = req.query;
      if (query.stock.isArray){
        console.log('double stock');
      } else {
        try {
        var fetchData = await getStockData(query.stock);
        console.log(fetchData)
        Stock.findOne({stock: fetchData.stock}, (err,stock)=>{
          if (err) res.json({error: err})
          if (!stock){
            fetchData.likes = query.like ? 1 : 0
            return res.json(createNewStock(fetchData));
          } else {
            stock.price = fetchData.price;
            return stock.save((err,data)=>{
              if (err) return res.json({error: err})
              return res.json(data);
            })
          }
        })
        } catch (err){
          console.log(err)
        }
        
      }
      
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};

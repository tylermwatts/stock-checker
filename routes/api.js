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
var expressip = require('express-ip');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

const stockSchema = mongoose.Schema({
  stock: {type: String, required: true},
  price: {type: String, required: true},
  likes: {type: Number, required: true, default: 0},
  ip: {type: String, required: true}
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
      likes: stockObj.likes,
      ip: stockObj.ip,
    })
    newStock.save((err,data)=>{
      if (err) return {error: err}
      return data;
    })
  }
  
  function stockSearch(stockToSearch, bool){
    Stock.findOne({stock: stockToSearch.stock}, (err,stock)=>{
      if (err) return ({error: err})
          if (!stock){
            stockToSearch.likes = bool === true ? 1 : 0
            var newStock = createNewStock(stockToSearch)
            return {stock: newStock.stock, price: newStock.price, likes: newStock.likes}
          } else {
            stock.price = stockToSearch.price;
            if (stock.ip !== stockToSearch.ip && bool === true){
              stock.likes += 1;
            } else {
              return stock.save((err,data)=>{
                if (err) return ({error: err})
                return {stock: data.stock, price: data.price, likes: data.likes}
              })
            }
          }
        })
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      var query = req.query;
      var boolToPass = query.like ? true : false
      try{
        if (query.stock.isArray){
          var stock1 = await getStockData(query.stock[0]);
          var stock2 = await getStockData(query.stock[1]);
          stock1.ip = req.connection.remoteAddress;
          stock2.ip = req.connection.remoteAddress;
          var stockObj1 = stockSearch(stock1, boolToPass);
          var stockObj2 = stockSearch(stock2, boolToPass);
          return res.json({stockData: [stockObj1, stockObj2]});        
        } else {
          var fetchData = await getStockData(query.stock);
          fetchData.ip = req.connection.remoteAddress;
          var stockDoc = stockSearch(fetchData, boolToPass);
          return res.json({stockData: stockDoc});
        }
      } catch (err){
        res.json(err)
      }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};

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
  
  function stockSearch(stockToSearch){
    Stock.findOne({stock: stockToSearch.stock}, (err,stock)=>{
      if (err) return ({error: err})
          if (!stock){
            stockToSearch.likes = query.like ? 1 : 0
            var newStock = createNewStock(fetchData)
            var stockData = {stockData: {stock: newStock.stock, price: newStock.price, likes: newStock.likes}}
            return res.json(stockData);
          } else {
            stock.price = fetchData.price;
            if (stock.ip !== fetchData.ip && query.like){
              stock.likes += 1;
            } else {
              return stock.save((err,data)=>{
                if (err) return res.json({error: err})
                var stockReturn = {stockData: {stock: data.stock, price: data.price, likes: data.likes}}
                return res.json(stockReturn);
              })
            }
          }
        })
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      console.log(req.connection.remoteAddress);
      var query = req.query;
      if (query.stock.isArray){
        var stock1 = await getStockData(query.stock[0]);
        var stock2 = await getStockData(query.stock[1]);
      } else {
        try {
        var fetchData = await getStockData(query.stock);
        fetchData.ip = req.connection.remoteAddress;
        Stock.findOne({stock: fetchData.stock}, (err,stock)=>{
          if (err) res.json({error: err})
          if (!stock){
            fetchData.likes = query.like ? 1 : 0
            var newStock = createNewStock(fetchData)
            var stockData = {stockData: {stock: newStock.stock, price: newStock.price, likes: newStock.likes}}
            return res.json(stockData);
          } else {
            stock.price = fetchData.price;
            if (stock.ip !== fetchData.ip && query.like){
              stock.likes += 1;
            } else {
              return stock.save((err,data)=>{
                if (err) return res.json({error: err})
                var stockReturn = {stockData: {stock: data.stock, price: data.price, likes: data.likes}}
                return res.json(stockReturn);
              })
            }
          }
        })
        } catch (err){
          console.log(err)
        }
        
      }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};

const express  = require("express");
const app = express(); 
const port = 3000;
const ejs = require('ejs');
const multer = require("multer");
const http = require("http");
const data = [];
const upload =  multer();

//app.use(express.static("views/vendor/bootstrap/css/bootstrap.min.css"));
app.use(express.static(__dirname + '/'));
app.set ("view engine", "ejs");

app.get("/", function(req, res){
    res.render("home");
});

app.post("/result", upload.fields([]),function(req, res){
  console.log("Requested Data");
  var keyword = req.body.keyword;
  console.log(JSON.stringify(keyword));

  var dateTo = req.body.dateTo;
  console.log(JSON.stringify(dateTo));

  var dateFrom = req.body.dateFrom;
  console.log(JSON.stringify(dateFrom));

  var inputData = {dateFrom: dateFrom, dateTo: dateTo,keyword:keyword};
  data.push(inputData);
  res.redirect("/result");
});


app.get("/result", function(req, res){
  res.render("result", {data: data})
});

app.listen(port, function (){
  console.log("Server running");
});
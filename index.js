const express  = require("express");
const app = express(); 
const port = 3000;
const ejs = require('ejs');
const multer = require("multer");
const http = require("http");
const data = [];
const upload =  multer();
const AIdata = [];

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
  searchAndReturnTwitter(keyword,dateFrom);
  data.push(inputData);
  res.redirect("/result");
});


app.get("/result", function(req, res){
  res.render("result", {data: data})
});

app.listen(port, function (){
  console.log("Server running");
});

//Code for Twitter API
// This app takes data from twitter, analyzes the text of each tweet, and outputs an object with the data it gathered
function searchAndReturnTwitter(keyword,untilDate){
// Test JSON
const test_json =
'{"statuses": [{"full_text": "Wow! JetBlue is pretty awesome!"}, {"full_text": "I hate JetBlue, they suck!!!!!"}, {"full_text": "JetBlue changed my life."}]}'

// Initialize Google Cloud
// Imports the Google Cloud client library
const language = require('@google-cloud/language');
  
// Instantiates a client
const client = new language.LanguageServiceClient();

// Callback functions
var error = function (err, response, body) {
    console.log('ERROR [%s]', err);
};
var success = async function (data) {
	// Takes the data from each tweet's text and stores it in an array
	var obj = JSON.parse(data);
	var text = [];
    for (var i = 0; i < obj.statuses.length; i++) {
		text[i] = obj.statuses[i].full_text;
		console.log(text[i]);
	}
	
	console.log(text);
	var data = [];
	var overall_text = "";
	for (var i = 0; i < text.length; i++) {
		overall_text += text[i];
		data[i] = analyze(text[i]);
	}	
	
	var overall_data = await analyze(overall_text);
	var output = {
		overall_score : overall_data.score,
		overall_magnitude : overall_data.magnitude,
		data : await Promise.all(data)
  }
  

	console.log(output);
}

// Language analysis, returns an object containing the text, sentiment score, and sentiment magnitude
async function analyze(text) {
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
	};
	
	return client.analyzeSentiment({document})
		.then(responses => {
      const response = responses[0];
			
			var obj = {
				text: text,
				score: response.documentSentiment.score,
				magnitude: response.documentSentiment.magnitude
			}
			return obj;
		});
}

var Twitter = require('twitter-node-client').Twitter;

//Twitter API config
var config = {
    "consumerKey": "N5kpAuGk3i5k29DzpKqVqAayp",
    "consumerSecret": "0KvDUq0q8wowbCkTBdmQrbNJKSQBUU9E7KwckD5eRiqXgoLgTN",
    "accessToken": "4824483053-8truFIk1DI7y7t4q0RnxrFf01g16nD7XliPL5dk",
    "accessTokenSecret": "Ncjpg4ggPvRvEtlQxXCupucthliFbJONLKwiCxpKfFAmR",
}

var twitter = new Twitter(config);

twitter.getSearch({'q':'JetBlue '+keyword,'count': 5, 'tweet_mode': 'extended','lang':'en','until':untilDate}, error, success);

}


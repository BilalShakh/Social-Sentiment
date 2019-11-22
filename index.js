const express  = require("express");
const app = express(); 
const port = 3000;
const ejs = require('ejs');
const multer = require("multer");
const http = require("http");
var data = [];
const upload =  multer();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

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
  searchAndReturnTwitter(keyword,dateFrom, (output) => {
	  data[0] = inputData;
	  data[1] = output;
	  data[2] = generatePercentage(output.data)
	  data[3] = findCustomerFeeling(output.overall_score);
	//   console.log(output.data);
	  res.redirect("/result");
  });
//   searchAndReturnReddit(keyword, (output) => {
// 	  data[0] = inputData;
// 	  data[1] = output;
// 	  data[2] = generateLabels(output.data);
// 	  console.log(data[1]);
// 	  res.redirect("/result");
//   });
});


app.get("/result", function(req, res){
	res.render("result", {data})
});

//Code for Twitter API
// This app takes data from twitter, analyzes the text of each tweet, and outputs an object with the data it gathered
function searchAndReturnTwitter(keyword,untilDate,callback){
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
		console.log(obj);
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
	
		callback(output);
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
		"consumerKey": "//",
		"consumerSecret": "//",
		"accessToken": "//",
		"accessTokenSecret": "//",
	}

	var twitter = new Twitter(config);

	twitter.getSearch({'q':'JetBlue '+keyword,'count': 100, 'tweet_mode': 'extended','lang':'en','until':untilDate}, error, success);

}

function searchAndReturnReddit(keyword, callback) {
	const request = require('request');
	const qs = require('qs');

	// Initialize Google Cloud
	// Imports the Google Cloud client library
	const language = require('@google-cloud/language');

	// Instantiates a client
	const client = new language.LanguageServiceClient();

	var query = {'q': 'JetBlue ' + keyword};

	var Url = 'https://www.reddit.com/search.json?' + qs.stringify(query);

	var data = request(Url, { json: true }, async function (err, res, body) {
		if (err) { return console.log(err); }

		var self_text = [];
		var title = [];
		for (var i = 0; i < body.data.children.length; i++) {
			self_text[i] = body.data.children[i].data.selftext;
			title[i] = body.data.children[i].data.title;
			// console.log(self_text[i] + title[i]);
		}

		var data = [];
		var overall_text = "";

		for (var i = 0; i < body.data.children.length; i += 2) {
			overall_text += " " + title[i];
			overall_text += " " + self_text[i];
			data[i] = analyze(title[i]);
			data[i+1] = analyze(self_text[i]);
		}

		// console.log(self_text);

		var overall_data = await analyze(overall_text);
		var output = {
			overall_score : overall_data.score,
			overall_magnitude : overall_data.magnitude,
			data : await Promise.all(data)
		}

		console.log(output);
	});

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
	}

	function generatePercentage(data,magnitude){
		var temp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		data.forEach(element => {
			console.log(Math.floor((element.score+1)/2*10));
			temp[Math.floor((element.score+1)/2*10)]++;
		});

		var labels = [];

		for (var i = 0; i < temp.length; i++) {
			labels[i] = temp[i] / data.length;
		}

		console.log(labels);

		return labels;
	}
	
	function findCustomerFeeling(overall_score,magnitude){
		
		if(overall_score<=1&&overall_score>0.6){
			return "Very Good";
		}
		else if(overall_score<=0.6&&overall_score>0.2){
			return "Good";
		}
		else if(overall_score<=0.2&&overall_score>=-0.2){
			if(magnitude>=4)
				return "Mixed";
			else
				return "Neutral";
		}
		else if(overall_score<-0.2&&overall_score>=-0.6){
			return "Bad";
		}
		else if(overall_score<-0.6&&overall_score>=-1){
			return "Very Bad";
		}
	
	}

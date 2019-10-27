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
//   console.log("Requested Data");
  var keyword = req.body.keyword;
//   console.log(JSON.stringify(keyword));

  var dateTo = req.body.dateTo;
//   console.log(JSON.stringify(dateTo));

  var dateFrom = req.body.dateFrom;
//   console.log(JSON.stringify(dateFrom));

  var inputData = {dateFrom: dateFrom, dateTo: dateTo,keyword:keyword};
  searchAndReturnTwitter(keyword,dateFrom, (copyAIData) => {
	AIdata.push(copyAIData);
	data.push(inputData); 
	res.redirect("/result");
  });

});


app.get("/result", function(req, res){
	console.log("Data: \n" + data);
	console.log("AIData: \n" + AIdata);
	var returnData = JSON.stringify({data: data, AIdata: AIdata});
	console.log(returnData);
	console.log(JSON.parse(returnData).AIdata[0].percentScoreList);
  	res.render("result", {returnData})
});

app.listen(port, function (){
  console.log("Server running");
});

//Code for Twitter API
function searchAndReturnTwitter(keyword,untilDate, callback){
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
    // console.log('ERROR [%s]', err);
};
var success = async function (data) {
	// console.log("STARTING SUCCESS FUNCTION");
	// console.log(data);
	// Takes the data from each tweet's text and stores it in an array
	var obj = JSON.parse(data);
	var text = [];
	var percentScoreList = [];
	var copyAIData =[];
	

    for (var i = 0; i < obj.statuses.length; i++) {
		text[i] = obj.statuses[i].full_text;
		// console.log(text[i]);
	}
	
	// console.log(text);
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
  
    percentScoreList=findpercentList(output.data,output.overall_magnitude);

	copyAIData = {percentScoreList : percentScoreList, feeling:findCustomerFeeling(output.overall_score,output.overall_magnitude),overallScore : output.overall_score, overallMagnitude : output.overall_magnitude};
	console.log('******');
	console.log(copyAIData);

	callback(copyAIData);
  

	// console.log(output);
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

function findpercentList(data,magnitude){
	let rawScoreList = [];
	let percentScoreList = [];
	let ScoreList= [];
	let numScorers = [];

	for (var key in data){
    	  rawScoreList.push(data[key].score);
   }

   for (var i=0;i < 10;i++){
	   numScorers.push(0);
   }

   

   console.log('""""""""""""""');
   console.log(rawScoreList);
   var totalNumScorers=0;
   for(var i in rawScoreList){
	   i = rawScoreList[i];
	   console.log(i);
	   if(rawScoreList[i]>=-1 &&i <-0.8){
		   numScorers[0]++;
		   totalNumScorers++;
		   console.log(numScorers);
		   console.log(totalNumScorers);
	   }
	   else if(i>=-0.8&& i<-0.6){
		   numScorers[1]++;
		   totalNumScorers++;
		   console.log(numScorers);
		   console.log(totalNumScorers);
	   }
	   else if(i>=-0.6&&i<-0.4){
		   numScorers[2]++;
		   totalNumScorers++;
		   console.log(numScorers);
		   console.log(totalNumScorers);
	   }
	   else if(i>=-0.4&&i<-0.2){
			numScorers[3]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=-0.2&&i<0){
			numScorers[4]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=0&&i<0.2){
			numScorers[5]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=0.2&&i<0.4){
			numScorers[6]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=0.4&&i<0.6){
			numScorers[7]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=0.6&&i<0.8){
			numScorers[8]++;
			totalNumScorers++;
			console.log(numScorers);
			console.log(totalNumScorers);
		}
		else if(i>=0.8&&i<=1){
			numScorers[9]++;
			totalNumScorers++;
		}
   }
   console.log('""""""""""""""');
   console.log(numScorers);
   console.log(totalNumScorers);

   for (var i in numScorers){
	   percentScoreList.push((numScorers[i]/totalNumScorers)*100);
   }

   return percentScoreList;
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

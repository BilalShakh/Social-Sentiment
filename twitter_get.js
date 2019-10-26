// This app takes data from twitter, analyzes the text of each tweet, and outputs an object with the data it gathered

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
	var data = []
	for (var i = 0; i < text.length; i++) {
		data[i] = analyze(text[i]);
	}
	Promise.all(data).then(result => console.log(result));
		
	// var output = {
	// 	overall_score : 0,
	// 	overall_magnitude : 0,
	// 	data : await Promise.all(data)
	// }

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

			// return entities.filter(
			// 	entity => entity.name == 'JetBlue'
			// ).map(entity => {
			// 		var obj = {
			// 			text: text,
			// 			score: entity.sentiment.score,
			// 			magnitude: entity.sentiment.magnitude
			// 		}
			// 		return obj;
			// 	}
			// )[0];
		});
}

//
var Twitter = require('twitter-node-client').Twitter;

//Twitter API config
var config = {
    "consumerKey": "N5kpAuGk3i5k29DzpKqVqAayp",
    "consumerSecret": "0KvDUq0q8wowbCkTBdmQrbNJKSQBUU9E7KwckD5eRiqXgoLgTN",
    "accessToken": "4824483053-8truFIk1DI7y7t4q0RnxrFf01g16nD7XliPL5dk",
    "accessTokenSecret": "Ncjpg4ggPvRvEtlQxXCupucthliFbJONLKwiCxpKfFAmR",
}

var twitter = new Twitter(config);

twitter.getSearch({'q':'JetBlue','count': 10, 'tweet_mode': 'extended'}, error, success);
//success(test_json);
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
    "consumerKey": "//",
    "consumerSecret": "//",
    "accessToken": "//",
    "accessTokenSecret": "//",
}

var twitter = new Twitter(config);

// twitter.getSearch({'q':'JetBlue','count': 10, 'tweet_mode': 'extended', 'lang': 'en'}, error, success);
success(test_json);

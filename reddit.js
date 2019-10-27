const request = require('request');
const qs = require('qs');

// Initialize Google Cloud
// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const client = new language.LanguageServiceClient();

var query = {'q': 'JetBlue'};

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

    // console.log(output);
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

// Takes the data from each tweet's text and stores it in an array


// console.log(text);
// var data = [];
// var overall_text = "";
// for (var i = 0; i < text.length; i++) {
//     overall_text += text[i];
//     data[i] = analyze(text[i]);
// }	

// var overall_data = await analyze(overall_text);
// var output = {
//     overall_score : overall_data.score,
//     overall_magnitude : overall_data.magnitude,
//     data : await Promise.all(data)
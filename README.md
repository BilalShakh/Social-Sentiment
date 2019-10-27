# JetBlueScraper

`Coded at YHack 2019`

# Summary
A web-app made designed for the JetBlue challenge at YHack 2019. The challenge was to find out what the public thinks of JetBlue and come up with a hypothesis. Uses Google Cloud's Natural Language API to analyze the sentiment from posts scraped on social media and displays the data in a bar graph, as well as the accompanying details. 

# Features

* Utilizes __Google Cloud's Natural Language__ API to analyze the sentiments of a sentence.  
* Displays analyzed data in a bar graph using __Charts.js__
* Front-end designed and built with the help of __Bootstrap__ templates
* Back-end built with __nodeJS__ and __ExpressJS__
* Uses the __Twitter__ and __Reddit API__ to search for posts containing the keyword(s).

# How to Run/Use

```
npm install twitter-node-client  
npm install --save @google-cloud/language  

set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\crmur\Documents\_YHack\password.json
```

1. Enter a keyword. The current keyword style is "JetBlue" + "keyword".
2. (Optional) Pick a Starting date and/or an Ending date. If no Ending date is entered it is defaulted to today.
3. A graph will be displayed and an average rating will be calculated from the internet posts.
4. Click on an area of the graph to display the text analyzed within the range of the bar graph. 

# F.A.Q

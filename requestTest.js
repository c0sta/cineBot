var request = require('request');
request('https://api-content.ingresso.com/v0/sessions/city/46/theater/url-key/cinemark-center-vale/partnership/moviebot', 
 function (error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode); 
  var parsedAPI = JSON.parse(body);
  console.log(parsedAPI);
});
const Bot = require('node-telegram-bot-api');
const request = require('request');
const token = require('./config');

const trigger = 'I want to travel!';

const bot = new Bot(token.telegramToken, {polling: true});

const prepareData = (body) => {
	const resposta = JSON.parse(body);

	var filme = {
		id: "",
		title: "",
		duration: "",
		image: "",
	}

	return resposta.filter( (session) => session !== undefined)
		.map( session => `DAY: ${session.dayOfWeek}  
		\n SESSIONS: \n${ session.movies.map( (movie)=>movie.title ).join('\n')}
		
		
		`)
		
		 .join('\n');

	
};

bot.on('message', (msg) => {
	if (msg.text.toString() === trigger) {
		return request(token.url, (err, resp, body) => {
			bot.sendMessage(msg.chat.id, prepareData(body));
		});
	}

 	bot.sendMessage(msg.chat.id, 'Hi, do you want to travel?', {
		reply_markup: {
		    	keyboard: [[trigger], ['Bulk option']]
		    }
		}
	);
});



const telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const request = require('request');
const token = require('./config');

const sessoesURL = 'https://api-content.ingresso.com/v0/sessions/city/46/theater/url-key/cinemark-center-vale/partnership/moviebot'
const filmeURL = ''

const bot = new telegraf(token.telegramToken);

const prepareData = (body, button) => {
	const resposta = JSON.parse(body);
	

	if(button === '🍿 Sessões'){
		return resposta.filter( (session) => session !== undefined)
		.map( session => `
		Dia: ${session.dateFormatted} - ${session.dayOfWeek}\n
		Sessões: ${session.movies.map( movie => movie.title) }\n

		`)
		 .join('\n');
	}
	
};

bot.start((ctx) => {
	return ctx.reply(`Olá ${ctx.from.first_name} ;) Então você está afim de ir ao cinema? \n Para checar os filmes em cartaz clique em "🎬 Em cartaz" \n Para ver as sessões  disponíveis clique em "🍿 Sessões"`,Markup
	.keyboard([
	  ['🎬 Em cartaz', '🍿 Sessões'], // Row1 with 2 buttons

	])
	.resize()
	.extra())
});

bot.hears('🍿 Sessões', (ctx)=>{
	return request(sessoesURL, (err, resp, body) => {
		ctx.reply(prepareData(body, '🍿 Sessões'));
	});	
} )


	
bot.launch();
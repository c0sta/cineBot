const telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const request = require('request');
const token = require('./config');

const filmeURL = 'https://api-content.ingresso.com/v0/templates/nowplaying/46/partnership/moviebot?limit=15&skip=0'

const bot = new telegraf(token.telegramToken);

bot.start( (ctx) => {
	return ctx.replyWithHTML(`<b>Olá ${ctx.from.first_name} 😃 </b> Afim de ir ao cinema?\n Para checar os filmes em cartaz clique em 🎬 Em cartaz. \n 
	Para ver as sessões  disponíveis de cada filme, basta clicar no botão <i>abaixo</i> de cada filme.
	\n Para checar os filmes que serão lançados clique em 🌟 Em Breve.`,Markup
	.keyboard([
	  ['🎬 Em cartaz', '🌟 Em Breve'], // Row1 with 2 buttons

	])
	.resize()
	.extra())
});

const dataFilme = (body, ctx) => {
	const resposta = JSON.parse(body);
	const ids = resposta.items.filter( filme => (filme !== undefined) ).map( filme => filme.id )
	
	return resposta.items.map(  filme => ctx.reply(`\n  ${filme.title.toUpperCase()}\n\n 📃Sinopse: \n${filme.synopsis}\n🎭 Gênero: ${ filme.genres? filme.genres.map((genre)=>genre): filme.genre }\n🕒 Duração: ${filme.duration+' min'}
	\n${filme.siteURL}`, Extra.HTML().markup((m) =>
	m.inlineKeyboard([
	  m.callbackButton(`Ver Sessões - ${filme.title}`,`${filme.id}|${filme.title}`)
	]))))
	
};

function dataSessoes(id, title, ctx){
		return request(`https://api-content.ingresso.com/v0/sessions/city/46/event/${id}/dates/partnership/moviebot`, (err, resp, body)=>{
			const resposta = JSON.parse(body)
		
			return ctx.replyWithHTML(`\n📽️Filme: ${title.toUpperCase()}\n` + resposta.map( session => `\n📆 Dia: ${session.dateFormatted} - ${session.dayOfWeek}\n Tipo da Sessão: ${session.sessionTypes+" "}`).join('\n'))
		})}
	
function dataEmBreve(body, ctx){
	const resposta = JSON.parse(body)
	const filmes = resposta.items.map( filme => ctx.reply(`\n  ${filme.title.toUpperCase()}\n
	📃Sinopse: \n${filme.synopsis}
	\n 🎭 Gênero: ${ filme.genres? filme.genres.map((genre)=>genre): filme.genre }\n🕒 Duração: ${filme.duration+' min'}\n📆 Data estréia: ${filme.premiereDate.dayAndMonth} - ${filme.premiereDate.hour}\n
	\nVer mais sobre o filme: ${filme.siteURL}
	`) )
	return ctx.reply()
}
	
	

	bot.action(/.+/, (ctx) => {
		var filtered = ctx.match[0].split('|')
		return dataSessoes(filtered[0], filtered[1], ctx)
	})

	bot.hears('🌟 Em Breve', (ctx)=>{
		return request('https://api-content.ingresso.com/v0/events/coming-soon/partnership/moviebot?limit=5', (err, resp, body) => {
			ctx.reply(dataEmBreve(body, ctx));
		});	
	} )

bot.hears('🎬 Em cartaz', (ctx)=>{
	return request(filmeURL, (err, resp, body) => {
		ctx.reply(dataFilme(body, ctx));
	});	
} )
	
bot.launch();
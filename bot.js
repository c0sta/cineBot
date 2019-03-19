const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
//const imdb = require('imdb-api')*
const TOKEN = require('./config.js')

//Comentarios com * são relacionado ao IMDB

// Creating bot *
const bot = new Telegraf(TOKEN.telegraf_token, process.env.BOT_TOKEN)
//const cli = new imdb.Client({apiKey: TOKEN.imdb}); *

// On start
bot.start((ctx) => {
  return ctx.reply('Olá, sou o GuiaFilmes :) \n Clique em 🌍 Local para verificar o Cinemark de sua cidade. \n Clique em 🎬 Programação para verificar os filmes em cartaz do Cinemark de sua região.', Markup
  .keyboard([
    ['🎬 Programação', '🌍 Local'], // Row1 with 2 buttons
    ['🔍 Procurar']
  ])
    .resize()
    .extra()
  )
})
  
  bot.hears('🔍 Procurar', ctx => ctx.reply('Digite "/procurar nomeDoFilme" '))

  
  bot.hears(/\/procurar (.+)/i, (ctx) => {
      let resultado;
      const movie = ctx.match[1];
      //console.log(movie) 
      cli.search({'name': movie}).then( (search, ctx) => {
        for (const result of search.results) {
          resultado = result;
        }
      })
      
      
    })




  bot.hears('🌍 Local', ctx => ctx.reply('Local do cinema'))
  bot.hears('🎬 Programação', ctx => ctx.reply('Programação do dia') )

bot.launch()



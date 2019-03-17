const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const TOKEN = require('./config.js')

const bot = new Telegraf(TOKEN.telegraf_token, process.env.BOT_TOKEN)

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
  
  bot.hears('🔍 Procurar', ctx => ctx.reply('Yay!'))
  bot.hears('🌍 Local', ctx => ctx.reply('Local do cinema'))
  bot.hears('🎬 Programação', ctx => ctx.reply('Programação do dia') )

bot.launch()



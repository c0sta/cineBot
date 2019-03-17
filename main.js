const Telegraf = require('telegraf')

const bot = new Telegraf('807111944:AAEpwhrE1Pq4v7RrA8BRak6tW-AsjgyjztU', process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Olá, sou o GuiaFilmes :) digite /filme e o mês para saber quais filmes serão lançados.'))



bot.launch()



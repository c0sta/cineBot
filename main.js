
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

    const bot = new Telegraf(process.env.BOT_TOKEN)
    bot.token=['627176259:AAE9-8Kit0nzuvoylgW2hU808FaFxmQd0Q8'];


    


    // ESCUTADOR DE EVENTOS
    // bot.hears('💰 Entrada', ctx => ctx.reply('Digite /entrada em seguida o "titulo" e o "valor"'))
    //bot.hears('💸 Saída', ctx => ctx.reply('Digite /saida em seguida o "titulo" e o "valor"'))

    bot.hears('✔️ Sim', ctx => ctx.reply('Adicionado :)'))
    bot.hears('❌ Não', ctx => ctx.reply('Não foi adicionado'))
    

    // COMANDOS

    // ENTRADA E SAIDA DO CHAT
    bot.command('start', (ctx) => {
      return ctx.reply('Olá! :) clique em "Adicionar" para inserir um gasto ou um ganho', Extra.markup(
        Markup.keyboard(['➕ Adicionar'])
        .resize()
        .oneTime(true)
      ))
    })

    bot.command('quit', (ctx) => {
      // Using shortcut
      ctx.leaveChat()
    })


    // ADICIONAR  Entrada||Saida
    const add = (ctx) => {
      return ctx.reply('Você tem certeza que deseja Adicioná-lo ?', Markup.keyboard([
        ['✔️ Sim', '❌ Não'],
      ])
      .oneTime(true)
      .resize()
      .extra()
     
        )
    }
    
    const remove = (ctx) => {
      return ctx.reply('Você tem certeza que deseja remove-lo ?', Markup.keyboard([
        ['✔️ Sim', '❌ Não'],
      ])
      .oneTime(true)
      .resize()
      .extra()
     
        )
    }

    bot.hears('➕ Adicionar', (ctx) => {
    return ctx.reply('Você deseja adicionar uma Entrada ou uma Saída?', Markup.keyboard([
        ['💰 Entrada', '💸 Saída'], // Row1 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )})

    bot.hears('💰 Entrada', (ctx) => {
        return ctx.reply('Digite /entrada em seguida o "titulo" e o "valor"')
    })

    bot.hears('💸 Saída', (ctx) => {
        return ctx.reply('Digite /saida em seguida o "titulo" e o "valor"')
    })

    bot.action(/\/entrada (.+)/ )

    bot.launch()

const telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const Extra = require('telegraf/extra');
const request = require('request-promise');
const token = require('./config');
const bot = new telegraf(token.telegramToken);
const googleMapsClient = require('@google/maps').createClient({
  key: token.google
});

/* 
	Links das API's 
*/
const links = {
	cidades: 'https://api-content.ingresso.com/v0/states/city/name/',
	geolocation: 'http://maps.google.com/maps/geo?ll=',
	cinemas: 'https://api-content.ingresso.com/v0/theaters/city/',
	sessoes: 'https://api-content.ingresso.com/v0/sessions/city/46/theater/1064/partnership/moviebot'
};

/*
	Funções 
*/
// recebe uma cidade como parametro passado pela api do google maps
async function getCityId( cidade ) {

	// concatena o nome da cidade ao link da API
	let url = links.cidades+cidade;
	//console.log(url)
	//faz a requisição na api com a url da API+NomeCidade
	return await getData(url).then(r=>r.id).catch( e => console.log(e) );
}

/* recebe o id da funcao getCityId() e passa para a funcao que listara todos os cinemas disponiveis na cidade */
async function getCinemas( id ){
	let url = links.cinemas+id+`/partnership/${token.code}`;

	/* o parametro data sera todos os cinemas disponiveis na API da respectiva cidade */
	return await getData(url).then( (data) => data).catch( e => console.log(e) );
}
/* 

Recebe os cinemas presentes na cidade e filtra os dados em um objeto

*/
function cinemasHandler( data ){
	//console.log(data)
	let cinemas = []
	let func = data.items.map( cine => {
		let cinema = {
			id: cine.id,
			nome: cine.name,
			cidade: cine.cityName,
			cidadeId: cine.cityId,
			endereco: cine.address,
			bairro: cine.neighborhood,
			url: cine.siteURL
		}
		cinemas.push(cinema);
	});
	//console.log(cinemas)
	return cinemas;

}

/**
 * Recebe os dados do filme
 *  
 */
function emCartazHandler(data, theaterID,cityID,ctx){
	//console.log(theaterID)
	
	const ids = data
	.filter( filme => (filme !== undefined) )
	.map( filme => filme.id )
	//console.log(ids)
	return data.map(  filme => ctx.replyWithHTML(`\n  <b>${filme.title.toUpperCase()}</b>\n\n 📃 <b>Sinopse: </b>\n${filme.synopsis}\n🎭<b> Gênero: </b>${ filme.genres? filme.genres.map( genre => genre): filme.genre }\n🕒<b> Duração: </b>${filme.duration+' min'}
	\n${filme.images[0].url}`, Extra.HTML().markup((m) =>
	m.inlineKeyboard([
		m.callbackButton(`📅 Ver Sessões`,`sessoes - ${cityID}|${theaterID}|${filme.id}`)
	]))))
	
};


function exibeBotoesDia( dias, ctx ){
	/**
	 * Divide a lista de dias pela metade, pegando apenas o lado esquerdo
	 * ou seja, a metade contendo o dia atual
	 */
	//console.log(dias)
	
	let diasL = dias.map( dia => `🎟 ${dia.dia} - ${dia.diaSemana}\n${dia.tipos.map(i => i)}` )

	return ctx.reply('📅 Selecione o dia: \n', Extra.markup( markup => {

		return markup.keyboard([...diasL]).resize()
		
}))
}

function emBreveHandler(data, ctx){
		
		
	const filmes = data.items.map( filme => ctx.replyWithHTML(`\n<b>${filme.title.toUpperCase()}</b>\n
	<b>📃Sinopse:</b> \n${filme.synopsis}
	\n <b>🎭 Gênero:</b> ${ filme.genres? filme.genres.map((genre)=>genre): filme.genre }\n<b>🕒 Duração:</b> ${filme.duration+' min'}\n<b>📆 Data estréia:</b> ${filme.premiereDate.dayAndMonth} - ${filme.premiereDate.hour}\n
	\n${filme.images[0].url}
	`) )
	return filmes
}


// wrapper para as requisições
async function getData(url) {
  const options = {
    url: url,
    method: 'GET',
  };

  // retorna uma promessa contendo o body
  return new Promise(function(resolve, reject) {

    request.get(options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

/**Funções telegraf API */

/*
	Mensagem e botão que serão enviados quando o usuário iniciar o bot
*/
bot.start( (ctx) => {
	return ctx.reply(`E aí, ${ctx.from.first_name} 😃. Afim de ir ao cinema?\n Me envie sua localização, para que eu lhe mostre os cinemas da sua cidade.`, Extra.markup( (m) => {
		return m.keyboard([
			m.locationRequestButton('🗺️ localização')
		])
		.oneTime()
		.resize()
  }));
});


/* 
quando receber uma localização irá procurar na api do maps a cidade e o estado correspondente com a latitude
e longitude recebida
*/
bot.on('location', ctx => {

	//armazena latitude e longitude recebida do usuário
	const latitude = ctx.message.location.latitude;
	const longitude = ctx.message.location.longitude;
	
	/* 
		Procura na api do google maps pela latitude e longitude recebida e filtra o resultado
	*/
	googleMapsClient.reverseGeocode({
		latlng: [`${latitude},${longitude}`]
	}, async (err, response) => {
		if (!err) {

			/* Extrai o nome da cidade do JSON */
			const dadosEndereço = response.json.results[0].address_components;
			//console.log(dadosEndereço)
			let cidadeHandler = dadosEndereço.map( async item => {
				//console.log('TIPOS posição 0: \n', item.types[0])
				//console.log('ITEM: \n', item )	
				//console.log('-------------------------')
				
				let isCity = item.types.indexOf('administrative_area_level_2') != -1 ? item.long_name: 0
				if(isCity != 0){
					let cidade = isCity.toLowerCase();
					/*Passa a cidade obtida na resposta do googleMaps para a função getCityId() que irá proucurar pelo ID 
					da cidade, depois passará o ID para a função getCinemas() que retornará uma lista com os cinemas disponiveis na cidade*/
				
				const cinemas = await getCityId( cidade )
				.then( r => getCinemas( r ))
				.catch( e => console.log(e))
				.then( data => cinemasHandler( data ))
				.catch( e => console.log(e))
				.then( cinemas => {
								//console.log(cinemas)
								let res = cinemas.map( cinema => {
				
									let cine = {
										id: cinema.id,
										cityId: cinema.cidadeId,
										nome:	cinema.nome,
										endereco: cinema.endereco,
										bairro: cinema.bairro,
										url: cinema.url
										
									}
									return cine
								})
								//console.log(res)
								return res

								}).catch( e => console.log(e) );
				
			    return cinemas.map( cinema => ctx.replyWithHTML(`<b>🎥 ${cinema.nome}\n</b>📍 ${cinema.endereco}/${cinema.bairro}`, Extra.markup( m => {
					let  ids = `${cinema.id}|${cinema.cityId}`
					 return m.inlineKeyboard([
						m.callbackButton('🍿 Filmes em cartaz', `cartaz -${ids}`),
						/*markup.callbackButton('🎥 Sessões',`sessoes -${ids}`),*/
						m.callbackButton('🌟 Em breve',`em breve -${ids}`)
					])

				 })))
				}
			})


		} else console.log(err);
	});
	
});

/*
	Retorna botões para saber as sessões, filmes em cartaz e os filmes em breve de acordo com o cinema
	selecionado pelo usuário
*/
bot.action(/^cine-(.+)/, ctx => {
	//console.log(ctx.match[0])
	//Separa os dados obtidos {ids, nomeCinema}
	
	let splited = ctx.match[0].split('-')
	let info = splited[1].split('|')
	//console.log(info)
	/*
		Armazena os ids na váriavel "ids" e o nome do cinema na váriavel "nome" 
	*/
	let ids = `${info[1]}|${info[2]}`
	let nome = `${info[0]}`
	/*
		Retorna o nome do cinema + respectivos botões de sessoes,em cartaz e em breve
	*/
	return ctx.reply(`${nome}`, Extra.markup((markup) => {

    return markup.inlineKeyboard([

        markup.callbackButton('🍿 Em cartaz', `cartaz -${ids}`),
				/*markup.callbackButton('🎥 Sessões',`sessoes -${ids}`),*/
				markup.callbackButton('🌟 Em breve',`em breve -${ids}`)

			]).resize()
			
}))
})


/*
	Lida com o botão de '🎥 Sessões', com o ID da cidade e do cinema faz uma requisição na API 
	e retorna os filmes disponiveis para os próximos 12 dias
*/
bot.action(/^sessoes - (.+)/, async ctx => {
	//console.log(ctx.match[0])
	//
	let split = ctx.match[0].split('-')
	//dados[0] == FilmeID && dados[1] === cityName && dados[2] === filmeID
	let dados = split[1].split('|')
  let url = `https://api-content.ingresso.com/v0/sessions/city/${dados[0].trim()}/event/${dados[2].trim()}/dates/partnership/moviebot
	`
	/*
		Faz a requisição para buscar as sessões de acordo com o ID da cidade e ID do cinema 
		e filtra os dados, armazenando apenas o Dia e a lista de Filmes
	*/
	
	let sessoes = request(url, (err, resp, body) => {
		if(!err){
			const resposta = JSON.parse(body)
			/*Salva em um objeto o DIA e os FILMES*/
			const dias = resposta.map( d => {
			//console.log('DIA =>',d)
				const dia = {
					dia: d.dateFormatted,
					diaSemana: d.dayOfWeek,
					tipos: d.sessionTypes.map( tipo => tipo )
				};
				
				//console.log(dia)
				return dia
			});
			
			//console.log('DIAS: ',dias)
			return exibeBotoesDia(dias, ctx)
		} else console.log(err)

	});
	
})

	bot.action(/^cartaz -(.+)/, async ctx => {
		//console.log(ctx.match[0])
		let split = ctx.match[0].split('-')
		let ids = split[1].split('|')
	  //console.log("DENTRO  -",ids)
		let url = `https://api-content.ingresso.com/v0/templates/nowplaying/${ids[1].trim()}/partnership/moviebot`
		let filmesEmCartaz = await getData(url).then( (data) => {
			return data
		});
	  //console.log(ids[0], ids[1])
		return emCartazHandler(filmesEmCartaz.items,ids[0], ids[1], ctx)
	})
	
	bot.action(/^em breve -(.+)/, async ctx => {
		//console.log(ctx.match[0])
		let split = ctx.match[0].split('-')
		let ids = split[1].split('|')
		//console.log(ids)
		let url = `https://api-content.ingresso.com/v0/templates/soon/${ids[1].trim()}/partnership/moviebot`
		let data = await getData(url)
			.then( body => body ).catch( e => console.log(e) )
		//console.log(data)
		return emBreveHandler(data, ctx)
	
	} )

bot.launch();
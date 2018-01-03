const Telegraf = require('telegraf')
const request=require('request')
const { reply } = Telegraf
const express= require('express')
const expressApp=express();
const PORT = process.env.PORT || 3000;
const API_TOKEN="";
const URL = process.env.URL || ''
const Cron= require('cron').CronJob
var json=[];
var crono=[];
const bot = new Telegraf(API_TOKEN)
bot.telegram.getMe().then((bot_info)=>{
	bot.options.username = bot_info.username;
})
var http = require("http");
setInterval(function() {
    http.get("");
}, 300000); // every 5 minutes (300000)

expressApp.use(bot.webhookCallback(`/bot${API_TOKEN}`));
bot.start((ctx) => {
  console.log('started:', ctx.from.id)
  return ctx.reply('Welcome!')
})
bot.command('help', (ctx) => {
	ctx.reply("To watch a round type \"Watch <battleId>\"")
})
bot.hears('Ciao', (ctx) => ctx.reply('Hey bello!'))
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears(/Watch (.+)/, 
	(match)=>
		{
			m=match['match'][1];
			console.log(m);
			//console.log(json);
			if(json[m]==undefined)
			{
				doRequestAndCron(m, match);
			}
			else{match.reply('I\'m already watching this battle.')}
		}
	)
const doRequestAndCron= (m, match) =>
{
	request('https://www.cscpro.org/suna/battle/'.concat(m).concat('.json'), (err,response,body)=>
	{
		json[m]=JSON.parse(body);

		//console.log(json[m].error)
		if(json[m].error)
		{
			match.reply("This battle doesn't exist!");
			json[m]=undefined;
		}else
		{
		console.log("added ".concat(m));
		match.reply("Very well! I'll notice you at t10-5-2 :)")
		crono[m]=new Cron('00 * * * * *',()=>{
			//console.log(m);
			//console.log('sto facendo il crono'.concat(json[m].time['minute']).concat(json[m].region['name']))
			json[m].time['minute']--;
			if(json[m].time['hour']==0 && json[m].time['minute']==10 || json[m].time['minute']==5 || json[m].time['minute']==2)
				match.reply('t'.concat(json[m].time['minute']).concat(" of ").concat(json[m].defender['name']).concat(" vs ").concat(json[m].attacker['name']).concat(" in ").concat(json[m].region['name']));
			if(json[m].time['hour']==0 && json[m].time['minute']==0)
				 {
					console.log("tempo finito")
					crono[m]=crono[m].stop();
					json[m]=undefined;
				 }
		},null,true)
	}
		//crono[m].start;
	})
}
bot.startPolling()
expressApp.listen(PORT,()=>{
	console.log(`Listening on ${PORT}`)
})

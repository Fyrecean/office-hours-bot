require('dotenv').config();
const Discord = require('discord.js');
const { prefix } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});


let waiting = [];
client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    switch (commandName) {
        case 'next':
            if (!waiting.length) {
                message.channel.send("Queue is empty");
            } else {
                let member = waiting.shift();
                try {
                    message.channel.send(`Bringing ${member.displayName} into The Office.`);
                    member.voice.setChannel("798350259721601094");
                } catch (error) {
                    message.channel.send(`Something went wrong.`);
                    console.error(error);
                }
            }
            break;
        default:
            message.channel.send("Unknown Command.");
    }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (oldMember.channel !== newMember.channel) {
        if (newMember.channel) {
            if (newMember.channel.name == "The Foyer") {
                client.channels.fetch("798399020136792086").then(channel => {
                    channel.send(`${newMember.member.displayName} has joined ${newMember.channel.name}`)
                });
                waiting.push(newMember.member);
                console.log(`${newMember.member.displayName} has joined ${newMember.channel.name}`);
            }
        }
        if (oldMember.channel) {     
            if (oldMember.channel.name === "The Foyer" && !newMember.channel || newMember.channel.name !== "The Foyer") {
                const index = waiting.indexOf(newMember.member);
                if (index !== -1) {
                    waiting.splice(index, 1);
                }
            }
        }
        client.channels.fetch("798350259721601094").then(channel => {
            console.log(`Members: ${channel.members.map(member => member.displayName)}`)
            console.log(`Queue: ${waiting.map(member => member.displayName)}`);
        });
    }
});

client.login(process.env.BOT_TOKEN);
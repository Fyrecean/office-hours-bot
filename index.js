#!/usr/bin/env node

require('dotenv').config();
const Discord = require('discord.js');
const { prefix, foyer, office, bottext } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});


let waiting = [];
client.on('message', message => {
    if (message.channel.id !== bottext || !message.content.startsWith(prefix) || message.author.bot) return;
    
	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    switch (commandName) {
        case 'next':
            // TODO: Check if role matches
            if (!waiting.length) {
                message.channel.send("Queue is empty");
            } else {
                let member = waiting.shift();
                try {
                    message.channel.send(`Bringing ${member.displayName} into The Office.`);
                    member.voice.setChannel(office);
                } catch (error) {
                    message.channel.send(`Something went wrong.`);
                    console.error(error);
                }
            }
            break;
        case 'ping':
            message.channel.send("Pong");
            break;
        case 'queue':
            message.channel.send(`Queue: ${waiting.map(member => member.displayName)}`);
            break;
        default:
            message.channel.send("Unknown Command.");
    }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    if (oldMember.channel !== newMember.channel) {
        if (newMember.channel) {
            if (newMember.channel.id === foyer) {
                client.channels.fetch(bottext).then(channel => {
                    channel.send(`${newMember.member.displayName} has joined ${newMember.channel.name}`)
                });
                waiting.push(newMember.member);
                console.log(`${newMember.member.displayName} has joined ${newMember.channel.name}`);
            }
        }
        if (oldMember.channel) {     
            if (oldMember.channel.id === foyer && !newMember.channel || newMember.channel.id !== foyer) {
                const index = waiting.indexOf(newMember.member);
                if (index !== -1) {
                    waiting.splice(index, 1);
                }
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);
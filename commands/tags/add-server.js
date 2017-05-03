const { Command } = require('discord.js-commando');
const colors = require('../../assets/_data/colors.json');
const Tag = require('../../models/Tag');
const Util = require('../../util/Util');
const { PERMITTED_GROUP } = require('../../assets/_data/settings.json');

module.exports = class ServerTagAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'add-server-tag',
			aliases: ['tag-add-server', 'add-servertag', 'servertag-add', 'servertag'],
			group: 'tags',
			memberName: 'add-server',
			description: 'Adds a server tag.',
			details: `Adds a server tag, usable for everyone on the server. (Markdown can be used.)`,
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'name',
					label: 'tagname',
					prompt: 'what would you like to name it?\n',
					type: 'string'
				},
				{
					key: 'content',
					label: 'tagcontent',
					prompt: 'what content would you like to add?\n',
					type: 'string',
					max: 1800
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.roles.exists('name', PERMITTED_GROUP);
	}

	async run(msg, args) {
		const name = Util.cleanContent(msg, args.name.toLowerCase());
		const content = Util.cleanContent(msg, args.content);

		const tag = await Tag.findOne({ where: { name, guildID: msg.guild.id } });
		if (tag) {
			return msg.embed({
				color: colors.red,
				description: `A server tag with the name **${name}** already exists, ${msg.author}`
			});
		}
		await Tag.create({
			userID: msg.author.id,
			userName: `${msg.author.username}#${msg.author.discriminator}`,
			guildID: msg.guild.id,
			guildName: msg.guild.name,
			channelID: msg.channel.id,
			channelName: msg.channel.name,
			name,
			content,
			type: true
		});
		return msg.embed({
			color: colors.green,
			description: `A server tag with the name **${name}** has been added, ${msg.author}`
		});
	}
};

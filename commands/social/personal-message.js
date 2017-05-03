const { Command } = require('discord.js-commando');
const colors = require('../../assets/_data/colors.json');
const UserProfile = require('../../models/UserProfile');

module.exports = class PersonalMessageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'personal-message',
			aliases: ['set-personal-message', 'set-biography', 'biography', 'set-bio', 'bio'],
			group: 'social',
			memberName: 'personal-message',
			description: 'Set your personal message for your profile.',
			details: 'Set your personal message for your profile.',
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 30
			},

			args: [
				{
					key: 'personalMessage',
					prompt: 'what would you like to set as your personal message?\n',
					type: 'string',
					validate: value => {
						let bLength = encodeURI(value).split(/%..|./).length - 1;
						if (value.length > 130 || bLength > 250) {
							return `
								your message was ${value.length > 130 ? `${value.length} characters` : `${bLength} bytes`} long.
								Please limit your personal message to ${value.length > 130 ? '130 characters' : '250 bytes'}
							`;
						}
						return true;
					}
				}
			]
		});
	}

	async run(msg, { personalMessage }) {
		const profile = await UserProfile.findOne({ where: { userID: msg.author.id } });
		if (!profile) {
			await UserProfile.create({
				userID: msg.author.id,
				personalMessage
			});
			return msg.embed({ color: colors.green, description: `${msg.author}, your message has been updated!` });
		}

		profile.personalMessage = personalMessage;
		await profile.save();
		return msg.embed({ color: colors.green, description: `${msg.author}, your message has been updated!` });
	}
};

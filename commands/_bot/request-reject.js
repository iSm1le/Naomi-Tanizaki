const { Command } = require('discord.js-commando');
const colors = require('../../assets/_data/colors.json');
const Request = require('../../models/Request');
const { REQUEST_CHANNEL } = require('../../assets/_data/settings.json');

module.exports = class RejectRequestCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'request-reject',
			aliases: ['req-r'],
			group: 'bot',
			memberName: 'request-reject',
			description: 'Reject a requested feature.',

			args: [
				{
					key: 'requestID',
					prompt: 'which feature request would you like to reject?\n',
					type: 'integer'
				},
				{
					key: 'reason',
					prompt: 'why did the request get rejected?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, { requestID, reason }) {
		if (msg.channel.id !== REQUEST_CHANNEL) {
			return msg.embed({
				color: colors.red,
				description: `${msg.author}, this command can only be used in the requests channel.`
			});
		}

		const request = await Request.findById(requestID);
		if (!request) {
			return msg.embed({ color: colors.red, description: `${msg.author}, you provided an invalid request id.` });
		}
		await request.save({
			processed: true,
			processedBy: msg.author.id,
			approved: false,
			reason
		});

		await this.client.users.get(request.requester).send({
			embed: {
				color: colors.red,
				author: {
					name: 'Request rejected',
					icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
				},
				description: reason,
				fields: [
					{
						name: 'Your request:',
						value: request.request.length <= 1024 ? request.request : `${request.request.substr(0, 1021)}...`
					}
				]
			}
		});

		return msg.embed({
			color: colors.green,
			description: `${msg.author}, successfully rejected request #${request.id}!`
		})
			.then(async () => {
				const messages = await msg.channel.fetchMessages({ after: msg.id });
				const requestMessage = await msg.channel.fetchMessage(request.requestMessage);
				messages.deleteAll();
				msg.delete();
				requestMessage.delete();
			});
	}
};

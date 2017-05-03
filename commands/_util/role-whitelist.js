const { Command } = require('discord.js-commando');
const { PERMITTED_GROUP } = require('../../assets/_data/settings.json');
const colors = require('../../assets/_data/colors.json');

module.exports = class RoleWhitelistCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'role-whitelist',
			aliases: ['rw'],
			group: 'util',
			memberName: 'role-whitelist',
			description: 'Add/remove role to/from a whitelist',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 5
			},

			args: [
				{
					key: 'job',
					prompt: 'add or remove role?\n',
					type: 'string',
					validate: job => {
						if (['add', 'remove'].includes(job)) {
							return true;
						}
						return `Job name must be **add** or **remove**`;
					}
				},

				{
					key: 'role',
					prompt: 'what role?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.provider.get(msg.author.id, 'userLevel') >= 3
		|| msg.member.roles.exists('name', PERMITTED_GROUP);
	}

	async run(msg, { job, role }) {  // eslint-disable-line consistent-return, require-await
		let _role = msg.guild.roles.find('name', role);
		if (!_role) { return msg.embed({ color: colors.red, description: `${role} group is not exist on server` }); }
		const _job = job.toLowerCase() === 'add';

		const roleWhitelist = this.client.provider.get(msg.guild.id, 'roleWhitelist', []);
		if (_job) {
			if (roleWhitelist.includes(_role.id)) {
				return msg.embed({ color: colors.red, description: `${_role} is already whitelisted.` });
			}

			roleWhitelist.push(_role.id);
			this.client.provider.set(msg.guild.id, 'roleWhitelist', roleWhitelist);

			return msg.embed({ color: colors.green, description: `${_role} has been added to the whitelist.` });
		} else {
			if (!roleWhitelist.includes(_role.id)) {
				return msg.embed({ color: colors.red, description: `${_role} is not whitelisted.` });
			}

			const index = roleWhitelist.indexOf(_role.id);
			roleWhitelist.splice(index, 1);

			if (roleWhitelist.length === 0) {
				this.client.provider.remove(msg.guild.id, 'roleWhitelist');
			} else {
				this.client.provider.set(msg.guild.id, 'roleWhitelist', roleWhitelist);
			}

			return msg.embed({ color: colors.green, description: `${_role} has been removed from the whitelist.` });
		}
	}
};

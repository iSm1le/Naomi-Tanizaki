const { Command } = require('discord.js-commando');
const { PERMITTED_GROUP } = require('../../assets/_data/settings.json');
const { oneLine } = require('common-tags');
const colors = require('../../assets/_data/colors.json');

module.exports = class RoleControlCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'role-control',
			aliases: ['rc'],
			group: 'util',
			memberName: 'role-control',
			description: 'Control whitelisted roles on user',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 10
			},

			args: [
				{
					key: 'job',
					prompt: 'add or remove role?',
					type: 'string',
					validate: job => {
						if (['add', 'remove'].includes(job)) {
							return true;
						}
						return `Job name must be **add** or **remove**`;
					}
				},

				{
					key: 'member',
					prompt: 'Add role to who?\n',
					type: 'member'
				},

				{
					key: 'role',
					prompt: 'which role you want to manipulate?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.provider.get(msg.author.id, 'userLevel') >= 2
			|| msg.member.roles.exists('name', PERMITTED_GROUP);
	}

	async run(msg, { member, role, job }) { // eslint-disable-line consistent-return, require-await
			// Checks
		if (!msg.guild.member(this.client.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) {
			return 	msg.embed({ color: colors.red, description: `I don't have **MANAGE_ROLES_OR_PERMISSIONS** permission.` });
		}

		const _job = job.toLowerCase() === 'add';

		if (msg.author.id === member.id) {
			return msg.embed({ color: colors.red, description: 'You cant operate with himself' });
		}

		let _role = msg.guild.roles.find('name', role);
		if (!_role) { return msg.embed({ color: colors.red, description: `${role} role does not exist on server.` }); }

		const roleWhitelist = this.client.provider.get(msg.guild.id, 'roleWhitelist', []);
		if (!roleWhitelist.includes(_role.id)) {
			return msg.embed(
				{
					color: colors.red,
					description: `${_role} is not whitelisted to manage. Add it to whitelist first.`
				});
		}

		const roleAdminList = this.client.provider.get(msg.guild.id, `${_role.id}_admins`, []);

		if (roleAdminList.length !== 0 && !this.client.isOwner(msg.member)) {
			if (!roleAdminList.includes(msg.member.id)) {
				return msg.embed({ color: colors.red, description: `${msg.author}, you are not admin of ${_role}.` });
			}
		}

		const userRoleLvl = msg.member.highestRole.position;
		const targetUserRoleLvl = member.highestRole.position;
		const userRoleLvlWant = _role.position;
		if (!_job && !member.roles.has(_role.id)) {
			return msg.embed({
				color: colors.blue,
				description: `${member} already don't have ${_role} role on this server.`
			});
		} else if (_job && member.roles.has(_role.id)) {
			return msg.embed({ color: colors.blue, description: `${member} already have ${_role} role on this server.` });
		}
		if (userRoleLvl <= targetUserRoleLvl) {
			return msg.embed({
				color: colors.red,
				description: oneLine`
					You cant ${_job ? 'add' : 'remove'} ${_role} ${_job ? 'to' : 'from'} ${member} because your highest
					role is ${msg.member.highestRole}
					and his highest role is biggest or equal to yours(${member.highestRole})`
			});
		} else if (userRoleLvl <= userRoleLvlWant) {
			return msg.embed({
				color: colors.red,
				description: oneLine`
					You cant ${_job ? 'add' : 'remove'} ${_role} ${_job ? 'to' : 'from'} ${member} because your highest
					role is ${msg.member.highestRole}`
			});
		}
			// Checks end
		if (_job) {
			member.addRole(_role).then(() => {
				msg.embed(
					{
						color: colors.green,
						description: `${msg.author} successfully added ${_role} to ${member}`
					});
			});
		} else {
			member.removeRole(_role).then(() => {
				msg.embed(
					{
						color: colors.green,
						description: `${msg.author} successfully removed ${_role} from ${member}`
					});
			});
		}
	}

};

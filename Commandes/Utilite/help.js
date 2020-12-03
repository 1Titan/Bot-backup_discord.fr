const { Command, RichDisplay, util: { isFunction } } = require('klasa');
const { MessageEmbed, Permissions } = require('discord.js');
const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
const time = 1000 * 60 * 3;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['commands', 'cmd', 'cmds'],
            guarded: true,
            description: (language) => language.get('COMMANDE_HELP_DESCRIPTION'),
            usage: '(Command:command)'
        });
        this.createCustomResolver('command', (arg, possible, message) => {
            if (!arg || arg === '') return undefined;
            return this.client.arguments.get('command').run(arg, possible, message);
        });

        // Cache the handlers
        this.handlers = new Map();
    }

    async run(message, [command]) {
        if (command) {
            let desc = isFunction(command.description) ? command.description(message.language) : command.description;
            desc += "\n" + message.language.get('COMMANDE_HELP_EXTENDED').replace(`Extended Help ::`, ``).replace(`No extended help provided.`, ``);
            let e = new MessageEmbed()
                .setTitle(`${command.name.capitalize()}`)
                .setDescription(desc)
                .setTimestamp()
                .setColor(0xff0050)
                .setFooter(`Demandé par ${message.author.tag}`, message.author.displayAvatarURL())
            return message.channel.send({ embed: e })
        } else {
            if ((!('tout' in message.flags) && message.guild && message.channel.permissionsFor(this.client.user).has(PERMISSIONS_RICHDISPLAY))) {
                // Finish the previous handler
                const previousHandler = this.handlers.get(message.author.id);
                if (previousHandler) previousHandler.stop();

                const handler = await (await this.buildDisplay(message)).run(await message.send('Commandes de chargement...'), {
                    filter: (reaction, user) => user.id === message.author.id,
                    time
                });
                handler.on('end', () => this.handlers.delete(message.author.id));
                this.handlers.set(message.author.id, handler);
                return handler;
            }
            return message.author.send(await this.buildHelp(message), { split: { char: '\n' } })
                .then(() => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMANDE_HELP_DM')); })
                .catch(() => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMANDE_HELP_NODM')); });
        }
    }

    async buildDisplay(message) {
        const commands = await this._fetchCommands(message);

        const { PREFIX } = message.guildSettings;
        const display = new RichDisplay();
        display.addPage(new MessageEmbed()
            .setTitle(`Help`)
            .setColor(0xff0050)
            .setDescription(`Bienvenue à \`Backup\`. Utilise [our web interface](${process.env.domain}) pour gérer vos serveurs Discord de n'importe où.\nPour consulter les commandes, faites défiler.\nPour plus d'aide ou de support, rejoignez notre serveur de support: https://discord.gg/W97RXn57Tg`)
        )
        for (const [category, list] of commands) {
            display.addPage(new MessageEmbed()
                .setTitle(`${category} Commands`)
                .setColor(0xff0050)
                .setDescription(list.map(this.formatCommand.bind(this, message, PREFIX, true)).join('\n'))
            );
        }
        return display;
    }
    async buildHelp(message) {
        const commands = await this._fetchCommands(message);
        const { PREFIX } = message.guildSettings;

        const helpMessage = [];
        for (const [category, list] of commands) {
            helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, PREFIX, false)).join('\n'), '');
        }
        return helpMessage.join('\n');
    }

    async _fetchCommands(message) {
        const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
        const commands = new Map();
        await Promise.all(this.client.commands.map((command) => {
            const category = commands.get(command.category);
            if (command.category !== "Admin" && command.category !== "General" && category) category.push(command);
            else if (command.category !== "Admin" && command.category !== "General") commands.set(command.category, [command]);
        }));

        return commands;
    }

    formatCommand(message, PREFIX, richDisplay, command) {
        const description = isFunction(command.description) ? command.description(message.language) : command.description;
        return richDisplay ? `■ \`${PREFIX}${command.name}\` : ${description}` : `■ **\`${PREFIX}${command.name}\`** : ${description}`;
    }
};
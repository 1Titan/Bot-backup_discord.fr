const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['setPrefix'],
            cooldown: 5,
            description: 'Changer le préfixe de commande utilisé par le bot sur votre serveur.',
            permissionLevel: 6,
            runIn: ['text'],
            usage: '[reset|prefix:str{1,10}]'
        });
    }

    async run(msg, [prefix]) {
        if (prefix === 'reset') return this.reset(msg);
        if (msg.guild.settings.prefix === prefix) throw msg.language.get('CONFIGURATION_EQUALS');
        await msg.guild.settings.update('prefix', prefix);
        return msg.sendMessage(`Le préfixe de cette guilde a été défini sur \`${prefix}\``);
    }

    async reset(msg) {
        await msg.guild.settings.update('prefix', this.client.options.prefix);
        return msg.sendMessage(`Remplacement du préfixe de la guilde \`${this.client.options.prefix}\``);
    }

};
const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Réinitialiser les backup",
            permissionLevel: 10
        });
    }
    async run(message) {
      message.client.settings.reset('backups')
      message.channel.send(`✅ Réinitialiser les backup.`)
    }
};
const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["pong", "latency"],
            botPerms: ["SEND_MESSAGES"],
            description: "Vérifiez la latence du bot",
        });
    }

    async run(message, [...params]) {
        let then = Date.now()
        let m = await message.channel.send(`Pinging...`);
        m.edit(`Pong! \`${Date.now() - then}\`ms`)
    }

};
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Backup le serveur"
        });
    }
    async run(message) {
      if (!message.member.hasPermission('MANAGE_GUILD'))
          return message.channel.send(`Vous ne disposez pas des autorisations suffisantes pour exécuter un backup. Vous avez besoin de \`Manage Guild\`.`)
      let res = await this.prompt(message)
      if (res) {
        message.client.tasks.first().run(message.guild, message.author);
        message.channel.send(`✅ Backup le serveur. Vérifiez vos DM pour la clé de sauvegarde`)
      }
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Voulez-vous vraiment exécuter une sauvegarde? Il remplacera toutes les backup précédentes de ce serveur par tous les autres administrateurs.\nRépondre avec \`confirm\` pour continuer`)
      .setFooter(`Cancelling in 30s`)
      message.channel.send(e);
      const filter = m => m.author.id === message.author.id;
      let msg = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
      msg = msg.first().content.toLowerCase();
      if (msg !== "confirm") message.channel.send('Cancelled')
      else return true;
      return false;
    }
};
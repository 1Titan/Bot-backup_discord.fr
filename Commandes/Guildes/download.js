const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Téléchargez une backup en utilisant son ID",
            permissionLevel: 6,
            usage: "[ID:string]"
        });
    }
    async run(message, [ID]) {
      let b = JSON.parse(message.client.settings.backups);
      let chosen = b.find(b => b.backupID == ID);
      if (!chosen) return message.channel.send(`❌ Invalide backup ID`);
      else message.delete();
      
      let buf = Buffer.from(JSON.stringify(chosen), 'utf8');
      
      if (message.guild) {
        message.author.send({files: [{attachment: buf, name: `backup-${ID}.json`}]}).then(() => 
          message.channel.send(`Je t'ai envoyé un MP avec la sauvegarde.`)
        ).catch(e => 
          message.channel.send(`Je ne pourrais pas vous envoyer de PM. Vérifiez que les MP sont activés dans les paramètres.`)
        )
      } else {
        message.channel.send(`Voici votre backup`, {files: [{attachment: buf, name: `backup-${ID}.json`}]})
      }
    }
};
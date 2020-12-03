const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Installer une sauvegarde sur le serveur",
            permissionLevel: 6,
            requiredPermissions: 8,
            runIn: ["text"],
            usage: "[ID:string]"
        });
    }
    async run(message, [ID]) {
      let b = JSON.parse(message.client.settings.backups);
      let chosen = b.find(b => b.backupID == ID);
      if (!chosen) return message.channel.send(`❌ Invalid backup ID`);
      else message.delete();
      
      
      if (
          (message.guild.me.roles.cache.find(x => x.managed).rawPosition &&
          ((message.guild.roles.size - 1) - message.guild.me.roles.cache.find(x => x.managed).rawPosition !== 0))
         ) 
        return message.channel.send(`❌ Je n'ai pas assez d'autorisations pour installer une backup. Veuillez vous assurer que le rôle appelé \`${message.guild.me.roles.find(x => x.managed).name}\` est au-dessus de tous les autres en \`Server Settings > Roles\` et réessayez cette commande.`)
      else if (
          !message.guild.me.roles.cache.find(x => x.managed).rawPosition &&
          message.guild.me.roles.size > 0 &&
          ((message.guild.roles.size - 1) - message.guild.me.roles.highest !== 0)
          )
          return message.channel.send(`❌ Je n'ai pas assez d'autorisations pour installer une backup. Veuillez vous assurer que mon rôle le plus élevé, (\`${message.guild.me.roles.highest.name}\` est au-dessus de tous les autres en \`Server Settings > Roles\` et réessayez cette commande.`)
      let res = await this.prompt(message)
      if (!res) return;
      
      this.client.tasks.find(x => x.name == "install").run(message.guild, ID)
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Êtes-vous sûr de vouloir installer une backup. Il remplacera le serveur actuel.\nRepondre avec \`confirm\` pour continuer`)
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
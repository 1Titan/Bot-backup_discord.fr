const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

const { DOMAIN } = process.env;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            description: "Vérification de la configuration du serveur",
            permissionLevel: 6
        });
    }
    async run(message) {
        if (!message.guild.me.hasPermission(268435472)) 
            return message.channel.send(`Je n'ai pas assez d'autorisations. Assurez-vous que j'ai \`Admin\` réglages.`);
        
        let p = await this.prompt(message);
        if (p) {
            message.guild.roles.everyone.setPermissions(0)
            let role = await message.guild.roles.create({
                data: {
                    name: "Verified",
                    position: 0,
                    permissions: 3072
                }
            })
            let channel = await message.guild.channels.create("verification", {
                type: "text",
                topic: "Pour rejoindre le serveur, vous devez suivre les étapes décrites ci-dessous.",
                position: 0,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        allow: 1024,
                        deny: 2048,
                        type: "role"
                    },
                    {
                        id: role.id,
                        deny: 3072,
                        type: "role"
                    }
                ]
            });
            let e = new MessageEmbed()
            .setColor(0xff0050)
            .setDescription(`Pour accéder au serveur, vous devez vous connecter à l'adresse ${DOMAIN}/verify/${message.guild.id}`)
            channel.send(e)
        }
    }
  
    async prompt(message) {
      let e = new MessageEmbed()
      .setColor(0xff0050)
      .setDescription(`Voulez-vous vraiment configurer la vérification?
      Cela créera un canal de vérification et un rôle vérifié.
      Les utilisateurs devront confirmer en se connectant avec discord sur l'interface Web.
      Répondre avec \`confirm\` pour continuer`)
      .setFooter(`Annulation dans 30s`)
      message.channel.send(e);
      const filter = m => m.author.id === message.author.id;
      let msg = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
      msg = msg.first().content.toLowerCase();
      if (msg !== "confirm") message.channel.send('Cancelled')
      else return true;
      return false;
    }
};
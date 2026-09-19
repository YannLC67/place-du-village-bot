require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, (client) => {
  console.log(`🤖 ${client.user.tag} est prêt !`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.id !== process.env.TARGET_USER_ID) return;

  const channel = member.guild.channels.cache.get(
    process.env.CHANNEL_ID
  );

  if (!channel) return;

  channel.send(
    `🚨 **ALERTE AU VILLAGE** 🚨\n\n` +
    `🐗 **${member.user.username} vient de pénétrer sur le territoire.**\n\n` +
    `Que chacun cache ses provisions. 🥔`
  );
});

client.login(process.env.DISCORD_TOKEN);
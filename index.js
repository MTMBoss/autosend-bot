require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");
const cron = require("node-cron");
const servers = require("./config/servers");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  // TRAINING → SOLO SERVER 1
  Object.entries(servers).forEach(([guildId, cfg]) => {
    if (!cfg.sendTraining) return;

    cron.schedule("0 8 * * 5", async () => {
      try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(cfg.trainingChannelId);
        if (!channel) return;

        const giorni = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
        const today = new Date();
        const day = today.getDay();
        const daysUntilNextMonday = ((8 - day) % 7) + 7;

        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilNextMonday);

        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(nextMonday);
          d.setDate(nextMonday.getDate() + i);
          return d;
        });

        const format = d =>
          `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        await channel.send(
          `## **TRAINING SCHEDULE ${format(weekDates[0])} - ${format(weekDates[6])}**`
        );

        for (let i = 0; i < 7; i++) {
          const msg = await channel.send(
            `> **__${giorni[i]} ${format(weekDates[i])}__**:\n> 9:00 PM, 10:00 PM, 11:00 PM`
          );
          await msg.react("1️⃣");
          await msg.react("2️⃣");
          await msg.react("3️⃣");
        }

        console.log(`📅 Training inviato in ${cfg.name}`);
      } catch (err) {
        console.error("❌ Training error:", err);
      }
    }, { timezone: "Europe/Rome" });
  });
});

// 🎫 TICKET
client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;

    const cfg = servers[channel.guild.id];
    if (!cfg) return;

    if (channel.parentId !== cfg.trialCategoryId) return;

    const name = channel.name.toLowerCase();
    if (!cfg.triggerWords.some(w => name.includes(w))) return;

    const opener = channel.permissionOverwrites.cache.find(
      p => p.type === 1 && p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );
    if (!opener) return;

    const member = await channel.guild.members.fetch(opener.id);
    const username = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, "");

    await channel.setName(`ticket-${username}`);

    const msg = cfg.message
      .replace("{USER}", opener.id)
      .replace("{STAFF}", cfg.staffRoleId);

    await channel.send(msg);

    console.log(`🎫 Ticket creato in ${cfg.name}`);
  } catch (err) {
    console.error("❌ Ticket error:", err);
  }
});

client.login(process.env.TOKEN);

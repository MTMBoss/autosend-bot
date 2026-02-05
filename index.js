require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");
const cron = require("node-cron");
const SERVERS = require("./config/servers");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  /* ==========================
     📅 TRAINING SCHEDULE
     SOLO SERVER CON
     training.enabled === true
  ========================== */

  cron.schedule(
    "0 8 * * 5", // venerdì 08:00 IT
    async () => {
      for (const guildId in SERVERS) {
        const cfg = SERVERS[guildId];
        if (!cfg.training?.enabled) continue;

        try {
          const channel = await client.channels
            .fetch(cfg.training.channelId)
            .catch(() => null);

          if (!channel) continue;

          const giorni = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
          const today = new Date();

          const day = today.getDay();
          const daysUntilNextMonday = ((8 - day) % 7) + 7;

          const nextMonday = new Date(today);
          nextMonday.setDate(today.getDate() + daysUntilNextMonday);

          const formatDate = (d) =>
            `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

          await channel.send(
            `## **TRAINING SCHEDULE ${formatDate(nextMonday)} - ${formatDate(
              new Date(nextMonday.getTime() + 6 * 86400000)
            )}**`
          );

          for (let i = 0; i < 7; i++) {
            const d = new Date(nextMonday);
            d.setDate(nextMonday.getDate() + i);

            const msg = await channel.send(
              `> **__${giorni[i]} ${formatDate(d)}__**:\n> 9:00 PM, 10:00 PM, 11:00 PM`
            );

            await msg.react("1️⃣");
            await msg.react("2️⃣");
            await msg.react("3️⃣");
          }

          console.log(`📅 Training inviato in ${channel.guild.name}`);
        } catch (err) {
          console.error("❌ Errore training:", err);
        }
      }
    },
    { timezone: "Europe/Rome" }
  );
});

/* ==========================
   🎫 TICKET (TUTTI I SERVER)
========================== */

client.on("channelCreate", async (channel) => {
  if (channel.type !== ChannelType.GuildText) return;

  const cfg = SERVERS[channel.guild.id];
  if (!cfg) return;

  if (channel.parentId !== cfg.trialCategoryId) return;
  if (!channel.name.toLowerCase().includes(cfg.triggerWord)) return;

  const opener = channel.permissionOverwrites.cache.find(
    (p) => p.type === 1 && p.allow.has(PermissionsBitField.Flags.ViewChannel)
  );
  if (!opener) return;

  const userId = opener.id;
  const member = await channel.guild.members.fetch(userId);

  const username = member.user.username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  await channel.setName(`${cfg.triggerWord}-${username}`);

  const msg = cfg.message.replace("{{USER}}", userId);
  await channel.send(msg);

  console.log(`🎫 Ticket creato in ${channel.guild.name}`);
});

client.login(process.env.TOKEN);

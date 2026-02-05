require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");
const cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* ==========================
   ⚙️ CONFIG PER SERVER
========================== */

const CONFIG = {
  "SERVER_ID_1": {
    STAFF_ROLE_ID: "1420070654140481657",
    TRIAL_CATEGORY_ID: "1459121470058922101",
    TRAINING_CHANNEL_ID: "1428766410170957895"
  },
  "SERVER_ID_2": {
    STAFF_ROLE_ID: "557628352828014614",
    TRIAL_CATEGORY_ID: "1467540411173044395",
    TRAINING_CHANNEL_ID: "INSERISCI_ID_CHANNEL"
  }
};

/* ==========================
   🤖 BOT READY
========================== */

client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  /* ==========================
     📅 TRAINING SCHEDULE
  ========================== */

  // OGNI VENERDÌ alle 8:00 (ora italiana)
  cron.schedule(
    "0 8 * * 5",
    async () => {
      try {
        console.log("📅 Invio training schedule");

        for (const guildId in CONFIG) {
          const { TRAINING_CHANNEL_ID } = CONFIG[guildId];

          if (!TRAINING_CHANNEL_ID) continue;

          const channel = await client.channels.fetch(TRAINING_CHANNEL_ID).catch(() => null);
          if (!channel) continue;

          const giorni = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
          const today = new Date();

          const day = today.getDay(); // 0 = dom
          const daysUntilNextMonday = ((8 - day) % 7) + 7;

          const nextMonday = new Date(today);
          nextMonday.setDate(today.getDate() + daysUntilNextMonday);

          const weekDates = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(nextMonday);
            d.setDate(nextMonday.getDate() + i);
            weekDates.push(d);
          }

          const formatDate = (d) =>
            `${String(d.getDate()).padStart(2, "0")}/${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`;

          await channel.send(
            `## **TRAINING SCHEDULE ${formatDate(
              weekDates[0]
            )} - ${formatDate(weekDates[6])}**`
          );

          for (let i = 0; i < 7; i++) {
            const msg = await channel.send(
              `> **__${giorni[i]} ${formatDate(
                weekDates[i]
              )}__**:\n> 9:00 PM, 10:00 PM, 11:00 PM`
            );

            await msg.react("1️⃣");
            await msg.react("2️⃣");
            await msg.react("3️⃣");
          }

          console.log(`✅ Training schedule inviato in ${channel.guild.name}`);
        }
      } catch (err) {
        console.error("❌ Errore training schedule:", err);
      }
    },
    {
      timezone: "Europe/Rome"
    }
  );
});

/* ==========================
   🎫 TICKET TRIAL
========================== */

client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;

    const guildConfig = CONFIG[channel.guild.id];
    if (!guildConfig) return;

    if (channel.parentId !== guildConfig.TRIAL_CATEGORY_ID) return;
    if (!channel.name.toLowerCase().includes("ticket")) return;

    const openerOverwrite = channel.permissionOverwrites.cache.find(
      (p) =>
        p.type === 1 &&
        p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );

    if (!openerOverwrite) return;

    const openerId = openerOverwrite.id;
    const member = await channel.guild.members.fetch(openerId);

    const username = member.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    await channel.setName(`ticket-${username}`);

    const message = `
👤 **Utente:** <@${openerId}>
🛠 **Staff:** <@&${guildConfig.STAFF_ROLE_ID}>

**Compila questo form per richiedere un provino ed entrare nel clan competitive Evergreen**

≫ **Nome:**
≫ **Età:**
≫ **Nick e UID:**
≫ **Da che season giochi?**
≫ **Disponibile per tornei/allenamenti?**
≫ **Hai esperienza di tornei?**
≫ **Elenca i precedenti clan:**
≫ **Ruolo in game?**
≫ **Categoria arma utilizzata?**
≫ **Dichiarare i propri obiettivi:**
≫ **Quante dita usi?**
≫ **Con che dispositivo/i giochi?**
≫ **Quanto siete disponibili?**
≫ **Screen profilo:**
`;

    await channel.send(message);
    console.log(`🎫 Ticket trial creato in ${channel.guild.name}`);
  } catch (err) {
    console.error("❌ Errore ticket:", err);
  }
});

/* ==========================
   🔑 LOGIN
========================== */

client.login(process.env.TOKEN);

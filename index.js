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

/* ===== CONFIG ===== */

const STAFF_ROLE_ID = "1420070654140481657";
const TRIAL_CATEGORY_ID = "1459121470058922101";
const TRAINING_CHANNEL_ID = "1428766410170957895";

/* ================== */

client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  /* ===========================
     📅 TRAINING SCHEDULE
  =========================== */

  // ogni giovedì alle 08:00 (ORA ITALIANA)
  cron.schedule(
    "20 12 * * 1",
    async () => {
      try {
        console.log("📅 Invio training schedule");

        const channel = await client.channels.fetch(TRAINING_CHANNEL_ID);
        if (!channel) return;

        const giorni = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];

        const today = new Date();

        // calcola SEMPRE il lunedì della settimana successiva
        const day = today.getDay(); // 0=dom, 4=gio
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

        // titolo
        await channel.send(
          `## **TRAINING SCHEDULE ${formatDate(
            weekDates[0]
          )} - ${formatDate(weekDates[6])}**`
        );

        // 7 messaggi
        for (let i = 0; i < 7; i++) {
          await channel.send(
            `> **__${giorni[i]} ${formatDate(
              weekDates[i]
            )}__**:\n> 9:00 PM, 10:00 PM, 11:00 PM`
          );
        }

        console.log("✅ Training schedule inviato");
      } catch (err) {
        console.error("❌ Errore training schedule:", err);
      }
    },
    {
      timezone: "Europe/Rome"
    }
  );
});

/* ===========================
   🎫 TICKET TRIAL
=========================== */

client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.parentId !== TRIAL_CATEGORY_ID) return;
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
🛠 **Staff:** <@&${STAFF_ROLE_ID}>

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
    console.log("🎫 Ticket trial gestito");
  } catch (err) {
    console.error("❌ Errore ticket:", err);
  }
});

client.login(process.env.TOKEN);

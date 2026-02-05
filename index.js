const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot online 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Web server attivo");
});


require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");
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

  // TRAINING → solo server che lo richiedono
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

        const week = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(nextMonday);
          d.setDate(nextMonday.getDate() + i);
          return d;
        });

        const f = d =>
          `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        await channel.send(
          `## **TRAINING SCHEDULE ${f(week[0])} - ${f(week[6])}**`
        );

        for (let i = 0; i < 7; i++) {
          const msg = await channel.send(
            `> **__${giorni[i]} ${f(week[i])}__**:\n> 9:00 PM, 10:00 PM, 11:00 PM`
          );
          await msg.react("1️⃣");
          await msg.react("2️⃣");
          await msg.react("3️⃣");
        }

        console.log(`📅 Training inviato in ${cfg.name}`);
      } catch (e) {
        console.error("❌ Training error:", e);
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

    const opener = channel.permissionOverwrites.cache.find(
      p => p.type === 1 && p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );
    if (!opener) return;

    const member = await channel.guild.members.fetch(opener.id);
    const username = member.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    await channel.setName(`ticket-${username}`);

    const msg = cfg.message
      .replace("{USER}", opener.id)
      .replace("{STAFF}", cfg.staffRoleId);

    await channel.send(msg);

    console.log(`🎫 Ticket ${cfg.ticketTitle} creato in ${cfg.name}`);
  } catch (e) {
    console.error("❌ Ticket error:", e);
  }
});

client.login(process.env.TOKEN);







require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const cron = require("node-cron");
const servers = require("./config/servers");

const SCRIM_CHANNEL_NAME = "scrim-archive";
const SCRIM_FILE = "./scrims.json";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* ================= READY ================= */

client.once("clientReady", async () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  // registra slash command
  const scrimCommand = new SlashCommandBuilder()
    .setName("scrim")
    .setDescription("Gestione scrim")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Aggiungi una nuova scrim")
        .addStringOption(o =>
          o.setName("team").setDescription("Team avversario").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("data").setDescription("Data (es. 4 Febbraio)").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("ora").setDescription("Orario (es. 22:00)").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("risultato").setDescription("Risultato (es. 0-2)").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("note").setDescription("Mappe / Note").setRequired(true)
        )
    );

  await client.application.commands.set([scrimCommand]);
});

/* ================= SCRIM COMMAND ================= */

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "scrim") return;

  if (interaction.options.getSubcommand() === "add") {
    const team = interaction.options.getString("team");
    const data = interaction.options.getString("data");
    const ora = interaction.options.getString("ora");
    const risultato = interaction.options.getString("risultato");
    const note = interaction.options.getString("note");

    const guild = interaction.guild;

    const channel = guild.channels.cache.find(
      c => c.name === SCRIM_CHANNEL_NAME && c.type === ChannelType.GuildText
    );

    if (!channel) {
      return interaction.reply({
        content: `❌ Canale **#${SCRIM_CHANNEL_NAME}** non trovato`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`EverGreen 🆚 ${team}`)
      .setColor(0x2ecc71)
      .addFields(
        { name: "📅 Data", value: data, inline: true },
        { name: "⏰ Ora", value: ora, inline: true },
        { name: "🏆 Risultato", value: risultato, inline: true },
        { name: "🗺️ Mappe / Note", value: note }
      )
      .setFooter({ text: `Inserito da ${interaction.user.username}` })
      .setTimestamp();

    // salva JSON
    const scrims = JSON.parse(fs.readFileSync(SCRIM_FILE));
    scrims.push({
      team,
      data,
      ora,
      risultato,
      note,
      author: interaction.user.id,
      timestamp: Date.now()
    });
    fs.writeFileSync(SCRIM_FILE, JSON.stringify(scrims, null, 2));

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      content: "✅ Scrim archiviata correttamente",
      ephemeral: true
    });

    console.log(`📊 Scrim vs ${team} salvata`);
  }
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);

const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const STAFF_ROLE_ID = "1420070654140481657";
const TRIAL_CATEGORY_ID = "1459121470058922101";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.parentId !== TRIAL_CATEGORY_ID) return;
    if (!channel.name.toLowerCase().includes("ticket")) return;

    console.log(`🎫 Ticket creato: ${channel.name}`);

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
    console.log(`✏️ Canale rinominato in ticket-${username}`);

    const message = `
👤 Utente: <@${openerId}>
🛠 Staff: <@&${STAFF_ROLE_ID}>
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
    console.log("✅ Messaggio trial inviato");
  } catch (err) {
    console.error("❌ Errore ticket trial:", err);
  }
});

client.login(process.env.TOKEN);

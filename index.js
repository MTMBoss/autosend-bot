const { 
  Client, 
  GatewayIntentBits, 
  ChannelType, 
  PermissionsBitField 
} = require("discord.js");

// 🔧 CONFIG
const STAFF_ROLE_ID = "1459593748135542946";
const TRIAL_CATEGORY_ID = "1459121470058922101";

// 🤖 CREA IL CLIENT PRIMA DI USARLO
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ✅ BOT ONLINE
client.once("clientReady", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

// 🎫 QUANDO VIENE CREATO UN CANALE
client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.parentId !== TRIAL_CATEGORY_ID) return;
    if (!channel.name.toLowerCase().includes("ticket")) return;

    console.log(`🎫 Ticket creato: ${channel.name}`);

    // 🔍 trova l’utente che ha aperto il ticket
    const openerOverwrite = channel.permissionOverwrites.cache.find(
      (p) =>
        p.type === 1 &&
        p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );

    if (!openerOverwrite) {
      console.log("⚠️ Utente opener non trovato");
      return;
    }

    const openerId = openerOverwrite.id;
    const member = await channel.guild.members.fetch(openerId);

    const username = member.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // ✏️ rinomina il canale
    await channel.setName(`ticket-${username}`);
    console.log(`✏️ Canale rinominato in ticket-${username}`);

    // 📩 messaggio automatico
    const message = `
**Compila questo form per richiedere un provino ed entrare nel clan competitive Evergreen** @capo del reame

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

👤 Utente: <@${openerId}>
🛠 Staff: <@&${STAFF_ROLE_ID}>
`;

    await channel.send(message);
    console.log("✅ Messaggio trial inviato");

  } catch (err) {
    console.error("❌ Errore ticket trial:", err);
  }
});

// 🔐 LOGIN (SEMPRE ALLA FINE)
client.login(process.env.TOKEN);

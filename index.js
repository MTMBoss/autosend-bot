require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* ===== CONFIG ===== */

// ID ruolo "Capo del Reame"
const CAPO_REAME_ROLE_ID = "1459593748135542946";

// ID categoria dove Ticket Tool crea i ticket
const TICKET_CATEGORY_ID = "1459121470058922101";

// parola chiave per riconoscere i ticket trial
const TRIAL_KEYWORD = "trial";

/* ================== */

client.once("ready", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

client.on("channelCreate", async (channel) => {
  try {
    // solo canali testuali
    if (channel.type !== ChannelType.GuildText) return;

    // solo nella categoria ticket
    if (channel.parentId !== TICKET_CATEGORY_ID) return;

    // solo ticket trial
    if (!channel.name.toLowerCase().includes(TRIAL_KEYWORD)) return;

    // trova l'utente che ha aperto il ticket
    const openerOverwrite = channel.permissionOverwrites.cache.find(
      p =>
        p.type === 1 &&
        p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );

    if (!openerOverwrite) return;

    const openerId = openerOverwrite.id;
    const openerMember = await channel.guild.members.fetch(openerId);

    // rinomina il canale → ticket-nomeutente
    const newChannelName = `ticket-${openerMember.user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

    await channel.setName(newChannelName);

    // messaggio automatico (FORMATO COME RICHIESTO)
    const message = `
<@&${CAPO_REAME_ROLE_ID}>
👤 **Utente:** <@${openerId}>

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

    console.log(
      `🎫 Ticket trial creato da ${openerMember.user.tag} (${newChannelName})`
    );
  } catch (err) {
    console.error("❌ Errore ticket trial:", err);
  }
});

client.login(process.env.TOKEN);

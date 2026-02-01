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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔧 CONFIG
const STAFF_ROLE_ID = "@capo del reame";

// parole chiave che identificano un ticket TRIAL
const TRIAL_KEYWORDS = ["trial"];

client.once("ready", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

client.on("channelCreate", async (channel) => {
  if (channel.type !== ChannelType.GuildText) return;

  // aspettiamo che il bot ticket mandi il primo messaggio
  setTimeout(async () => {
    try {
      const messages = await channel.messages.fetch({ limit: 5 });
      const firstMessage = messages.last(); // primo messaggio del canale
      if (!firstMessage) return;

      const content = firstMessage.content.toLowerCase();

      // controllo parole chiave TRIAL
      const isTrial = TRIAL_KEYWORDS.some(word => content.includes(word));
      if (!isTrial) return;

      // troviamo chi ha aperto il ticket
      const opener = channel.permissionOverwrites.cache.find(
        p =>
          p.type === 1 &&
          p.allow.has(PermissionsBitField.Flags.ViewChannel)
      );

      const openerMention = opener ? `<@${opener.id}>` : "";

      const message = `
${openerMention} <@&${STAFF_ROLE_ID}>

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
    } catch (err) {
      console.error("Errore ticket trial:", err);
    }
  }, 2000); // 2 secondi di attesa
});

client.login(process.env.TOKEN);

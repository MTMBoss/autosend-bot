module.exports = {
  // SERVER 1 – con TRAINING
  "1393236722137038918": {
    staffRoleId: "1420070654140481657",
    trialCategoryId: "1459121470058922101",

    triggerWord: "ticket",

    training: {
      enabled: true,
      channelId: "1428766410170957895"
    },

    message: `
👤 **Utente:** <@{{USER}}>
🛠 **Staff:** <@&1420070654140481657>

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
`
  },

  // SERVER 2 – SOLO TICKET
  "1467171206166741190": {
    staffRoleId: "1469037236673708032",
    trialCategoryId: "1467540411173044395",

    triggerWord: "provino",

    training: {
      enabled: false
    },

    message: `
👋 Ciao <@{{USER}}>!

Grazie per aver aperto un **ticket provino**.
Uno staffer <@&1469037236673708032> ti risponderà a breve.

📋 **Compila:**
• Nome:
• Età:
• Nick:
• Esperienza:
• Disponibilità:
`
  }
};

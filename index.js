client.on("channelCreate", async (channel) => {
  try {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.parentId !== TRIAL_CATEGORY_ID) return;
    if (!channel.name.toLowerCase().includes("ticket")) return;

    // 🔍 trova l’utente che ha aperto il ticket
    const openerOverwrite = channel.permissionOverwrites.cache.find(
      (p) =>
        p.type === 1 && // USER
        p.allow.has(PermissionsBitField.Flags.ViewChannel)
    );

    if (!openerOverwrite) {
      console.log("⚠️ Utente opener non trovato");
      return;
    }

    const openerId = openerOverwrite.id;
    const openerUser = await channel.guild.members.fetch(openerId);

    const username = openerUser.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // ✏️ rinomina il canale
    await channel.setName(`ticket-${username}`);

    console.log(`✏️ Canale rinominato in ticket-${username}`);

    // 📩 messaggio automatico
    const message = `
**Compila questo form per richiedere un provino ed entrare nel clan competitive Evergreen** @Capo del reame

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

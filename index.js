
require("dotenv").config();

const fs = require("fs");

const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const CLIENT_ID = "1550855745719902218";
const GUILD_ID = process.env.GUILD_ID;

const STATS_FILE = "./stats.json";

// ======================================================
// 📊 STATISTIQUES DU VILLAGE
// ======================================================

const statNames = {
  plouc: "🗣️ « Plouc »",
  pecno: "🗣️ « Pécno »",
  incroyable: "😱 « Incroyable »",
  plaques: "🚗 « J’ai besoin de plaques »",
};

const statPeople = {
  plouc: "Lisa",
  pecno: "Lisa",
  incroyable: "Antoine",
  plaques: "Antoine",
};

let statsData = {
  users: {},
  weekly: {
    nextAt: 0,
  },
};

// ======================================================
// 📂 CHARGEMENT DES STATS
// ======================================================

function chargerStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, "utf8");
      statsData = JSON.parse(data);
    }
  } catch (error) {
    console.error("❌ Impossible de charger stats.json :", error);
  }
}

// ======================================================
// 💾 SAUVEGARDE DES STATS
// ======================================================

function sauvegarderStats() {
  try {
    fs.writeFileSync(
      STATS_FILE,
      JSON.stringify(statsData, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("❌ Impossible de sauvegarder stats.json :", error);
  }
}

// ======================================================
// 🔢 OBTENIR UNE STAT
// ======================================================

function obtenirStat(type) {
  if (!statsData.users[type]) {
    statsData.users[type] = 0;
  }

  return statsData.users[type];
}

// ======================================================
// ➕ AJOUTER +1
// ======================================================

function ajouterStat(type) {
  if (!statsData.users[type]) {
    statsData.users[type] = 0;
  }

  statsData.users[type]++;

  sauvegarderStats();

  return statsData.users[type];
}

// ======================================================
// 📢 MESSAGE APRÈS UN +1
// ======================================================

function creerMessageStats(type, total) {
  const personne = statPeople[type];

  return (
    "📢 **NOUVELLE STATISTIQUE DU VILLAGE !** 📢\n\n" +
    "👤 **" + personne + "**\n" +
    statNames[type] + "\n\n" +
    "📈 **+1**\n" +
    "🔢 Total : **" + total + " fois**\n\n" +
    "🏡 *Le village n'oublie rien...*"
  );
}

// ======================================================
// 📅 STATISTIQUES HEBDOMADAIRES
// ======================================================

async function envoyerStatsHebdomadaires(guild) {
  try {
    let channel = guild.channels.cache.find(
      (ch) =>
        ch.name === "général" ||
        ch.name === "general"
    );

    if (!channel && process.env.CHANNEL_ID) {
      channel = guild.channels.cache.get(
        process.env.CHANNEL_ID
      );
    }

    if (!channel) {
      console.log(
        "❌ Salon général introuvable pour les statistiques."
      );
      return;
    }

    const statsActives = Object.keys(statNames).filter(
      (type) => obtenirStat(type) > 0
    );

    if (statsActives.length === 0) {
      await channel.send(
        "📊 **STATISTIQUES DU VILLAGE** 📊\n\n" +
        "Cette semaine, le village n'a rien à signaler...\n\n" +
        "🏡 *Tout le monde a été étrangement sage.*"
      );

      return;
    }

    const melangees = [...statsActives].sort(
      () => Math.random() - 0.5
    );

    const selection = melangees.slice(0, 5);

    let message =
      "📊 **LES STATISTIQUES DU VILLAGE** 📊\n\n";

    for (const type of selection) {
      const total = obtenirStat(type);
      const personne = statPeople[type];

      message +=
        "👤 **" + personne + "** — " +
        statNames[type] + "\n" +
        "🔢 **" + total + " fois**\n\n";
    }

    message +=
      "🏡 *Le village n'oublie rien... même les choses inutiles.*";

    await channel.send(message);

  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi des statistiques hebdomadaires :",
      error
    );
  }
}

// ======================================================
// ⏰ VÉRIFICATION DES STATS HEBDOMADAIRES
// ======================================================

async function verifierStatsHebdomadaires() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
      return;
    }

    const maintenant = Date.now();

    if (!statsData.weekly.nextAt) {
      statsData.weekly.nextAt =
        maintenant +
        7 * 24 * 60 * 60 * 1000;

      sauvegarderStats();

      console.log(
        "📅 Première statistique hebdomadaire programmée dans 7 jours."
      );

      return;
    }

    if (maintenant >= statsData.weekly.nextAt) {
      await envoyerStatsHebdomadaires(guild);

      statsData.weekly.nextAt =
        maintenant +
        7 * 24 * 60 * 60 * 1000;

      sauvegarderStats();

      console.log(
        "📊 Statistiques hebdomadaires envoyées !"
      );
    }

  } catch (error) {
    console.error(
      "❌ Erreur vérification statistiques :",
      error
    );
  }
}

// ======================================================
// 🚀 COMMANDES
// ======================================================

const commands = [

  // ====================================================
  // 🤔 TU PRÉFÈRES
  // ====================================================

  new SlashCommandBuilder()
    .setName("tu-preferes")
    .setDescription(
      "Lancer un Tu préfères dans le village"
    ),

  // ====================================================
  // 🎰 CASINO
  // ====================================================

  new SlashCommandBuilder()
    .setName("casino")
    .setDescription(
      "Lancer une partie de casino"
    ),

  // ====================================================
  // 🎡 ROULETTE
  // ====================================================

  new SlashCommandBuilder()
    .setName("roulette")
    .setDescription(
      "Lancer la roulette du village"
    ),

  // ====================================================
  // 🗣️ POTIN
  // ====================================================

  new SlashCommandBuilder()
    .setName("potin")
    .setDescription(
      "Lancer un potin du village"
    ),

  // ====================================================
  // ⚔️ ACCUSER
  // ====================================================

  new SlashCommandBuilder()
    .setName("accuser")
    .setDescription(
      "Accuser quelqu'un au village"
    )
    .addUserOption((option) =>
      option
        .setName("personne")
        .setDescription(
          "La personne à accuser"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("theme")
        .setDescription(
          "Le thème de l'accusation"
        )
        .setRequired(true)
        .addChoices(
          {
            name: "🍻 BUVERIE",
            value: "buverie",
          },
          {
            name: "🎿 SKI",
            value: "ski",
          },
          {
            name: "🎉 SOIRÉES",
            value: "soirees",
          },
          {
            name: "🎲 GAGES DE SOIRÉE",
            value: "gages",
          }
        )
    ),

  // ====================================================
  // ⚖️ TRIBUNAL
  // ====================================================

  new SlashCommandBuilder()
    .setName("tribunal")
    .setDescription(
      "Ouvrir un tribunal du village"
    ),

  // ====================================================
  // 🐗 POUMBA
  // ====================================================

  new SlashCommandBuilder()
    .setName("poumba")
    .setDescription(
      "Déclencher manuellement une alerte Poumba"
    ),

  // ====================================================
  // 🏆 HALL OF FAME
  // ====================================================

  new SlashCommandBuilder()
    .setName("halloffame")
    .setDescription(
      "Afficher le Hall of Fame du village"
    ),

  // ====================================================
  // 📸 PHOTO
  // ====================================================

  new SlashCommandBuilder()
    .setName("photo")
    .setDescription(
      "Lancer un vote pour une photo"
    ),

  // ====================================================
  // 📊 STAT
  // ====================================================

  new SlashCommandBuilder()
    .setName("stat")
    .setDescription(
      "Ajouter +1 à une statistique du village"
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription(
          "Quelle statistique veux-tu ajouter ?"
        )
        .setRequired(true)
        .addChoices(
          {
            name: "🗣️ Plouc — Lisa dit « Plouc »",
            value: "plouc",
          },
          {
            name: "🗣️ Pécno — Lisa dit « Pécno »",
            value: "pecno",
          },
          {
            name: "😱 Incroyable — Antoine dit « Incroyable »",
            value: "incroyable",
          },
          {
            name: "🚗 Plaques — Antoine dit « J’ai besoin de plaques »",
            value: "plaques",
          }
        )
    ),

  // ====================================================
  // 📊 STATS
  // ====================================================

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription(
      "Afficher les statistiques du village"
    ),

].map((command) => command.toJSON());

// ======================================================
// 🤖 BOT PRÊT
// ======================================================

client.once(
  Events.ClientReady,
  async (readyClient) => {

    console.log(
      "🤖 " +
      readyClient.user.tag +
      " est prêt !"
    );

    console.log(
      "🆔 Bot ID : " +
      readyClient.user.id
    );

    console.log(
      "🏠 Guild ID : " +
      GUILD_ID
    );

    try {

      await readyClient.application.commands.set(
        commands,
        GUILD_ID
      );

      console.log(
        "✅ Commandes enregistrées !"
      );

      console.log(
        "📋 Commandes : tu-preferes, casino, roulette, potin, accuser, tribunal, poumba, halloffame, photo, stat, stats"
      );

    } catch (error) {

      console.error(
        "❌ Erreur lors de l'enregistrement des commandes :",
        error
      );
    }

    setInterval(
      verifierStatsHebdomadaires,
      60 * 60 * 1000
    );

    verifierStatsHebdomadaires();
  }
);

// ======================================================
// 💬 INTERACTIONS
// ======================================================

client.on(
  Events.InteractionCreate,
  async (interaction) => {

    try {

      // ==================================================
      // 📊 /STAT
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "stat"
      ) {

        const type =
          interaction.options.getString("type");

        const total =
          ajouterStat(type);

        await interaction.reply(
          creerMessageStats(type, total)
        );

        return;
      }

      // ==================================================
      // 📊 /STATS
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "stats"
      ) {

        let message =
          "📊 **STATISTIQUES DU VILLAGE** 📊\n\n";

        for (
          const type of Object.keys(statNames)
        ) {

          const total =
            obtenirStat(type);

          const personne =
            statPeople[type];

          message +=
            "👤 **" +
            personne +
            "**\n" +
            statNames[type] +
            "\n" +
            "🔢 **" +
            total +
            " fois**\n\n";
        }

        message +=
          "🏡 *Le village n'oublie rien...*";

        await interaction.reply(message);

        return;
      }

      // ==================================================
      // 🤔 /TU-PREFERES
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "tu-preferes"
      ) {

        const modal =
          new ModalBuilder()
            .setCustomId(
              "tu_preferes_modal"
            )
            .setTitle(
              "🤔 Tu préfères ?"
            );

        const question1 =
          new TextInputBuilder()
            .setCustomId("question1")
            .setLabel("Option 1")
            .setStyle(
              TextInputStyle.Short
            )
            .setRequired(true);

        const question2 =
          new TextInputBuilder()
            .setCustomId("question2")
            .setLabel("Option 2")
            .setStyle(
              TextInputStyle.Short
            )
            .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            question1
          ),
          new ActionRowBuilder().addComponents(
            question2
          )
        );

        await interaction.showModal(
          modal
        );

        return;
      }

      // ==================================================
      // 🎰 /CASINO
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "casino"
      ) {

        const nombre =
          Math.floor(
            Math.random() * 100
          ) + 1;

        let resultat;

        if (nombre >= 90) {

          resultat =
            "💰 **JACKPOT !** Le village est en feu !";

        } else if (nombre >= 60) {

          resultat =
            "🍀 Pas mal ! La mairie approuve.";

        } else if (nombre >= 30) {

          resultat =
            "😐 Mouais... on fera mieux demain.";

        } else {

          resultat =
            "💀 Catastrophe. Tu viens de financer le bar.";
        }

        await interaction.reply(
          "🎰 **CASINO DU VILLAGE** 🎰\n\n" +
          "🎲 Résultat : **" +
          nombre +
          "/100**\n\n" +
          resultat
        );

        return;
      }

      // ==================================================
      // 🎡 /ROULETTE
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "roulette"
      ) {

        const nombre =
          Math.floor(
            Math.random() * 37
          );

        let couleur;

        if (nombre === 0) {

          couleur = "🟢 VERT";

        } else if (
          [
            1, 3, 5, 7, 9,
            12, 14, 16, 18,
            19, 21, 23, 25,
            27, 30, 32, 34, 36,
          ].includes(nombre)
        ) {

          couleur = "🔴 ROUGE";

        } else {

          couleur = "⚫ NOIR";
        }

        await interaction.reply(
          "🎡 **ROULETTE DU VILLAGE** 🎡\n\n" +
          "🎯 Numéro : **" +
          nombre +
          "**\n" +
          couleur +
          "\n\n" +
          "🏡 *Le village a parlé.*"
        );

        return;
      }

      // ==================================================
      // 🗣️ /POTIN
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "potin"
      ) {

        const potins = [

          "👀 Quelqu'un a encore regardé les messages sans répondre.",

          "🍺 Une personne du village connaît probablement trop bien le bar.",

          "🎮 Quelqu'un a dit « dernière partie » avant de jouer encore 3 heures.",

          "🏃 Quelqu'un a probablement promis de venir... puis a disparu.",

          "📦 Quelqu'un a encore volé un coffre.",

          "🐌 Quelqu'un n'a absolument pas rush quand il fallait.",

          "🤨 Une personne du village cache quelque chose.",

          "🏡 La mairie enquête actuellement sur tout le monde.",

        ];

        const potin =
          potins[
            Math.floor(
              Math.random() *
              potins.length
            )
          ];

        await interaction.reply(
          "🗣️ **POTIN DU VILLAGE** 🗣️\n\n" +
          potin +
          "\n\n" +
          "🤫 *Source : absolument pas fiable.*"
        );

        return;
      }

      // ==================================================
      // ⚔️ /ACCUSER
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "accuser"
      ) {

        const personne =
          interaction.options.getUser(
            "personne"
          );

        const theme =
          interaction.options.getString(
            "theme"
          );

        const themes = {

          buverie: "🍻 BUVERIE",

          ski: "🎿 SKI",

          soirees: "🎉 SOIRÉES",

          gages: "🎲 GAGES DE SOIRÉE",

        };

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId(
                "tribunal_coupable"
              )
              .setLabel(
                "⚖️ COUPABLE"
              )
              .setStyle(
                ButtonStyle.Danger
              ),

            new ButtonBuilder()
              .setCustomId(
                "tribunal_innocent"
              )
              .setLabel(
                "😇 INNOCENT"
              )
              .setStyle(
                ButtonStyle.Success
              )
          );

        await interaction.reply({

          content:
            "⚔️ **ACCUSATION OFFICIELLE** ⚔️\n\n" +
            "👤 Accusé : **" +
            personne.username +
            "**\n" +
            "📂 Dossier : **" +
            themes[theme] +
            "**\n\n" +
            "🏡 Le tribunal du village est ouvert !\n\n" +
            "Votez ci-dessous :",

          components: [row],

        });

        return;
      }

      // ==================================================
      // ⚖️ /TRIBUNAL
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "tribunal"
      ) {

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId(
                "tribunal_coupable"
              )
              .setLabel(
                "⚖️ COUPABLE"
              )
              .setStyle(
                ButtonStyle.Danger
              ),

            new ButtonBuilder()
              .setCustomId(
                "tribunal_innocent"
              )
              .setLabel(
                "😇 INNOCENT"
              )
              .setStyle(
                ButtonStyle.Success
              )
          );

        await interaction.reply({

          content:
            "⚖️ **TRIBUNAL DU VILLAGE** ⚖️\n\n" +
            "Le procès commence !\n\n" +
            "Votez :",

          components: [row],

        });

        return;
      }

      // ==================================================
      // 🐗 /POUMBA
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "poumba"
      ) {

        await interaction.reply(
          "🚨🐗 **ALERTE POUMBA !** 🐗🚨\n\n" +
          "🥔 **PROTÉGEZ LES PATATES !**\n" +
          "🍺 **LE BAR EST DÉSORMAIS SOUS SURVEILLANCE !**\n" +
          "🏃💨 **FUYEZ, LE POUMBA EST LÀ !**"
        );

        return;
      }

      // ==================================================
      // 🏆 /HALLOFFAME
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "halloffame"
      ) {

        await interaction.reply(
          "🏆 **HALL OF FAME DU VILLAGE** 🏆\n\n" +
          "📦 **Le Grand Voleur de Coffres**\n" +
          "🏅 Champion officiel des coffres disparus.\n\n" +
          "🐌 **Ministre du Non-Rush**\n" +
          "🏅 Pour les joueurs qui attendent... encore...\n\n" +
          "🗣️ **Impératrice du « Plouc »**\n" +
          "🏅 Un titre qui se mérite chaque jour.\n\n" +
          "🏡 *La mairie observe vos exploits.*"
        );

        return;
      }

      // ==================================================
      // 📸 /PHOTO
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "photo"
      ) {

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId(
                "photo_vote_1"
              )
              .setLabel(
                "🔥 Vote"
              )
              .setStyle(
                ButtonStyle.Primary
              )

          );

        await interaction.reply({

          content:
            "📸 **PHOTO DU VILLAGE** 📸\n\n" +
            "Une nouvelle photo est proposée au vote !\n\n" +
            "🔥 Votez avec le bouton ci-dessous.",

          components: [row],

        });

        return;
      }

      // ==================================================
      // 📝 MODAL TU PRÉFÈRES
      // ==================================================

      if (
        interaction.isModalSubmit() &&
        interaction.customId ===
          "tu_preferes_modal"
      ) {

        const option1 =
          interaction.fields.getTextInputValue(
            "question1"
          );

        const option2 =
          interaction.fields.getTextInputValue(
            "question2"
          );

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()
              .setCustomId(
                "tp_option1"
              )
              .setLabel(
                "1️⃣ " + option1
              )
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "tp_option2"
              )
              .setLabel(
                "2️⃣ " + option2
              )
              .setStyle(
                ButtonStyle.Secondary
              )

          );

        await interaction.reply({

          content:
            "🤔 **TU PRÉFÈRES ?** 🤔\n\n" +
            "1️⃣ **" +
            option1 +
            "**\n" +
            "2️⃣ **" +
            option2 +
            "**\n\n" +
            "Votez !",

          components: [row],

        });

        return;
      }

      // ==================================================
      // 🔘 BOUTONS
      // ==================================================

      if (interaction.isButton()) {

        // Tribunal
        if (
          interaction.customId ===
            "tribunal_coupable" ||
          interaction.customId ===
            "tribunal_innocent"
        ) {

          const choix =
            interaction.customId ===
            "tribunal_coupable"
              ? "⚖️ COUPABLE"
              : "😇 INNOCENT";

          await interaction.reply({

            content:
              "🗳️ **Vote enregistré !**\n\n" +
              choix +
              "\n\n" +
              "👤 Vote de **" +
              interaction.user.username +
              "**",

            ephemeral: true,

          });

          return;
        }

        // Tu préfères
        if (
          interaction.customId ===
            "tp_option1" ||
          interaction.customId ===
            "tp_option2"
        ) {

          const choix =
            interaction.customId ===
            "tp_option1"
              ? "1️⃣ Option 1"
              : "2️⃣ Option 2";

          await interaction.reply({

            content:
              "✅ **Vote enregistré !**\n\n" +
              choix,

            ephemeral: true,

          });

          return;
        }

        // Photo
        if (
          interaction.customId ===
          "photo_vote_1"
        ) {

          await interaction.reply({

            content:
              "📸 **Vote enregistré !** 🔥",

            ephemeral: true,

          });

          return;
        }
      }

    } catch (error) {

      console.error(
        "❌ Erreur interaction :",
        error
      );

      if (!interaction.replied) {

        await interaction.reply({

          content:
            "❌ Une erreur est survenue.",

          ephemeral: true,

        });
      }
    }
  }
);

// ======================================================
// 🐗 ALERTE POUMBA AUTOMATIQUE
// ======================================================

client.on(
  Events.VoiceStateUpdate,
  async (oldState, newState) => {

    if (
      !newState.member ||
      newState.member.id !==
        process.env.TARGET_USER_ID
    ) {
      return;
    }

    if (
      !oldState.channelId &&
      newState.channelId
    ) {

      const channel =
        newState.guild.channels.cache.get(
          process.env.CHANNEL_ID
        );

      if (!channel) {

        console.log(
          "❌ CHANNEL_ID introuvable pour Poumba."
        );

        return;
      }

      await channel.send(
        "🚨🐗 **ALERTE POUMBA !** 🐗🚨\n\n" +
        "**" +
        newState.member.displayName +
        "** vient d'entrer dans le vocal !\n\n" +
        "🥔 **PROTÉGEZ LES PATATES !**\n" +
        "🍺 **LE BAR EST DÉSORMAIS SOUS SURVEILLANCE !**\n" +
        "🏃💨 **FUYEZ, LE POUMBA EST LÀ !**"
      );
    }
  }
);

// ======================================================
// 📊 CHARGEMENT DES STATS
// ======================================================

chargerStats();

// ======================================================
// 🔑 CONNEXION
// ======================================================

client.login(
  process.env.DISCORD_TOKEN
);


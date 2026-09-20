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
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const GUILD_ID = process.env.GUILD_ID;
const STATS_FILE = "./stats.json";

// ======================================================
// 📊 STATISTIQUES DU VILLAGE
// ======================================================

const statsDeBase = {
  plouc: {
    personne: "Lisa",
    expression: "🗣️ « Plouc »",
    total: 0,
  },

  pecno: {
    personne: "Lisa",
    expression: "🗣️ « Pécno »",
    total: 0,
  },

  incroyable: {
    personne: "Antoine",
    expression: "😱 « Incroyable »",
    total: 0,
  },

  plaques: {
    personne: "Antoine",
    expression: "🚗 « J’ai besoin de plaques »",
    total: 0,
  },
};

let statsData = {
  stats: {},
  weekly: {
    nextAt: 0,
  },
};

// ======================================================
// 🐗 PUMBAA
// ======================================================

const messagesPumbaa = [
  "🐗 **Pumbaa est arrivée. Ça va être compliqué de lui dire non.**",
  "🐗 **Pumbaa vient d’entrer. La diplomatie est officiellement terminée.**",
  "🐗 **Pumbaa est dans le vocal. Bon courage à ceux qui comptaient avoir le dernier mot.**",
  "🐗 **Pumbaa vient d’arriver. Elle a déjà décidé comment ça allait se passer.**",
  "🐗 **Pumbaa est là. Quelqu’un a pensé à prévenir les autres ?**",
  "🐗 **Pumbaa vient d’entrer. Faites vos choix, elle fera les siens.**",
  "🐗 **Pumbaa est dans le vocal. Le débat est ouvert, sa décision est déjà prise.**",
  "🐗 **Pumbaa vient d’arriver. Elle n’a peur de personne, surtout pas de vos avis.**",
  "🐗 **Pumbaa est là. La seule personne capable de transformer une discussion en ultimatum.**",
  "🐗 **Pumbaa vient d’entrer. Évitez de lui dire « calme-toi ».**",
];

function messagePumbaaAleatoire() {
  return messagesPumbaa[
    Math.floor(Math.random() * messagesPumbaa.length)
  ];
}

// ======================================================
// 📂 CHARGEMENT DES STATS
// ======================================================

function chargerStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) {
      return;
    }

    const data = fs.readFileSync(STATS_FILE, "utf8");
    const ancien = JSON.parse(data);

    if (ancien.users && !ancien.stats) {
      statsData = {
        stats: {},
        weekly: ancien.weekly || {
          nextAt: 0,
        },
      };

      for (const [id, stat] of Object.entries(statsDeBase)) {
        statsData.stats[id] = {
          personne: stat.personne,
          expression: stat.expression,
          total: Number(ancien.users[id] || 0),
        };
      }

      sauvegarderStats();

      console.log(
        "🔄 Anciennes statistiques converties vers le nouveau système."
      );

      return;
    }

    statsData = ancien;

    if (!statsData.stats) {
      statsData.stats = {};
    }

    if (!statsData.weekly) {
      statsData.weekly = {
        nextAt: 0,
      };
    }

    for (const [id, stat] of Object.entries(statsDeBase)) {
      if (!statsData.stats[id]) {
        statsData.stats[id] = {
          personne: stat.personne,
          expression: stat.expression,
          total: 0,
        };
      }
    }

    sauvegarderStats();
  } catch (error) {
    console.error(
      "❌ Impossible de charger stats.json :",
      error
    );
  }
}

// ======================================================
// 💾 SAUVEGARDE
// ======================================================

function sauvegarderStats() {
  try {
    fs.writeFileSync(
      STATS_FILE,
      JSON.stringify(statsData, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error(
      "❌ Impossible de sauvegarder stats.json :",
      error
    );
  }
}

// ======================================================
// 🔢 OBTENIR LES STATS
// ======================================================

function obtenirToutesLesStats() {
  if (!statsData.stats) {
    statsData.stats = {};
  }

  for (const [id, stat] of Object.entries(statsDeBase)) {
    if (!statsData.stats[id]) {
      statsData.stats[id] = {
        personne: stat.personne,
        expression: stat.expression,
        total: 0,
      };
    }
  }

  return statsData.stats;
}

function obtenirStat(id) {
  return obtenirToutesLesStats()[id] || null;
}

// ======================================================
// ➕ AJOUTER +1
// ======================================================

function ajouterStat(id) {
  const stat = obtenirStat(id);

  if (!stat) {
    return 0;
  }

  stat.total = Number(stat.total || 0) + 1;

  sauvegarderStats();

  return stat.total;
}

// ======================================================
// 🆕 CRÉER UNE NOUVELLE STAT
// ======================================================

function creerNouvelleStat(
  personneId,
  personneNom,
  expression
) {
  const stats = obtenirToutesLesStats();

  const id =
    "stat_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 1000);

  stats[id] = {
    personne: personneNom,
    personneId: personneId,
    expression: "💬 « " + expression + " »",
    total: 1,
  };

  sauvegarderStats();

  return {
    id: id,
    stat: stats[id],
  };
}

// ======================================================
// 📢 MESSAGE STAT
// ======================================================

function creerMessageStats(
  stat,
  total,
  nouvelle = false
) {
  const titre = nouvelle
    ? "🆕 **NOUVELLE STAT DU VILLAGE !**"
    : "📢 **NOUVELLE STATISTIQUE DU VILLAGE !**";

  return (
    titre +
    "\n\n" +
    "👤 **" +
    stat.personne +
    "**\n" +
    stat.expression +
    "\n\n" +
    "📈 **+1**\n" +
    "🔢 Total : **" +
    total +
    " fois**\n\n" +
    "🏡 *Le village n'oublie rien...*"
  );
}

// ======================================================
// 📋 MENU /STAT
// ======================================================

function creerMenuStats() {
  const stats = Object.entries(
    obtenirToutesLesStats()
  );

  const choix = stats
    .slice(0, 24)
    .map(([id, stat]) => ({
      label: (
        stat.expression +
        " — " +
        stat.personne
      ).slice(0, 100),

      value: id,

      description:
        Number(stat.total || 0) +
        " point(s)",
    }));

  choix.push({
    label: "🆕 Nouvelle expression",
    value: "nouvelle_stat",
    description: "Créer une nouvelle statistique",
  });

  const menu =
    new StringSelectMenuBuilder()
      .setCustomId("stat_selection")
      .setPlaceholder(
        "Choisis une statistique..."
      )
      .addOptions(choix);

  return new ActionRowBuilder().addComponents(menu);
}

// ======================================================
// 📅 STATS HEBDOMADAIRES
// ======================================================

async function envoyerStatsHebdomadaires(guild) {
  try {
    let channel =
      guild.channels.cache.find(
        (ch) =>
          ch.name === "général" ||
          ch.name === "general"
      );

    if (!channel && process.env.CHANNEL_ID) {
      channel =
        guild.channels.cache.get(
          process.env.CHANNEL_ID
        );
    }

    if (!channel) {
      console.log(
        "❌ Salon général introuvable pour les statistiques."
      );
      return;
    }

    const statsActives =
      Object.values(obtenirToutesLesStats())
        .filter(
          (stat) =>
            Number(stat.total || 0) > 0
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    if (statsActives.length === 0) {
      await channel.send(
        "📊 **STATISTIQUES DU VILLAGE** 📊\n\n" +
        "Cette semaine, le village n'a rien à signaler...\n\n" +
        "🏡 *Tout le monde a été étrangement sage.*"
      );

      return;
    }

    let message =
      "📊 **LES STATISTIQUES DU VILLAGE** 📊\n\n";

    for (const stat of statsActives) {
      message +=
        "👤 **" +
        stat.personne +
        "** — " +
        stat.expression +
        "\n" +
        "🔢 **" +
        stat.total +
        " fois**\n\n";
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
// ⏰ VÉRIFICATION HEBDOMADAIRE
// ======================================================

async function verifierStatsHebdomadaires() {
  try {
    const guild =
      client.guilds.cache.get(GUILD_ID);

    if (!guild) {
      return;
    }

    const maintenant = Date.now();

    if (!statsData.weekly.nextAt) {
      statsData.weekly.nextAt =
        maintenant +
        7 *
          24 *
          60 *
          60 *
          1000;

      sauvegarderStats();

      console.log(
        "📅 Première statistique hebdomadaire programmée dans 7 jours."
      );

      return;
    }

    if (
      maintenant >=
      statsData.weekly.nextAt
    ) {
      await envoyerStatsHebdomadaires(guild);

      statsData.weekly.nextAt =
        maintenant +
        7 *
          24 *
          60 *
          60 *
          1000;

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
  new SlashCommandBuilder()
    .setName("tu-preferes")
    .setDescription(
      "Lancer un Tu préfères dans le village"
    ),

  new SlashCommandBuilder()
    .setName("casino")
    .setDescription(
      "Lancer une partie de casino"
    ),

  new SlashCommandBuilder()
    .setName("roulette")
    .setDescription(
      "Lancer la roulette du village"
    ),

  new SlashCommandBuilder()
    .setName("potin")
    .setDescription(
      "Lancer un potin du village"
    ),

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

  new SlashCommandBuilder()
    .setName("tribunal")
    .setDescription(
      "Ouvrir un tribunal du village"
    ),

  new SlashCommandBuilder()
    .setName("pumbaa")
    .setDescription(
      "Déclencher une alerte Pumbaa"
    ),

  new SlashCommandBuilder()
    .setName("halloffame")
    .setDescription(
      "Afficher le Hall of Fame du village"
    ),

  new SlashCommandBuilder()
    .setName("photo")
    .setDescription(
      "Lancer un vote pour une photo"
    ),

  new SlashCommandBuilder()
    .setName("stat")
    .setDescription(
      "Ajouter un point à une statistique"
    ),

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
        "📋 Commandes : tu-preferes, casino, roulette, potin, accuser, tribunal, pumbaa, halloffame, photo, stat, stats"
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
        await interaction.reply({
          content:
            "📊 **STATISTIQUES DU VILLAGE**\n\n" +
            "Choisis une statistique à augmenter ou crée une nouvelle expression.",

          components: [
            creerMenuStats(),
          ],
        });

        return;
      }

      // ==================================================
      // 📊 /STATS
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName === "stats"
      ) {
        const stats =
          Object.values(
            obtenirToutesLesStats()
          ).sort(
            (a, b) =>
              Number(b.total || 0) -
              Number(a.total || 0)
          );

        let message =
          "📊 **STATISTIQUES DU VILLAGE** 📊\n\n";

        stats.forEach(
          (stat, index) => {
            const position =
              index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : index === 2
                    ? "🥉"
                    : "▫️";

            message +=
              position +
              " 👤 **" +
              stat.personne +
              "** — " +
              stat.expression +
              "\n" +
              "   🔢 **" +
              Number(
                stat.total || 0
              ) +
              " point(s)**\n\n";
          }
        );

        message +=
          "🏡 *Le village n'oublie rien...*";

        await interaction.reply(message);

        return;
      }

      // ==================================================
      // 🆕 SÉLECTION D'UNE STAT
      // ==================================================

      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "stat_selection"
      ) {
        const choix =
          interaction.values[0];

        if (
          choix === "nouvelle_stat"
        ) {
          const row =
            new ActionRowBuilder().addComponents(
              new UserSelectMenuBuilder()
                .setCustomId(
                  "nouvelle_stat_personne"
                )
                .setPlaceholder(
                  "Choisis la personne qui a dit ça"
                )
                .setMinValues(1)
                .setMaxValues(1)
            );

          await interaction.update({
            content:
              "🆕 **NOUVELLE EXPRESSION**\n\n" +
              "👤 Choisis d'abord la personne qui a dit l'expression.",

            components: [row],
          });

          return;
        }

        const total =
          ajouterStat(choix);

        const stat =
          obtenirStat(choix);

        if (!stat) {
          await interaction.update({
            content:
              "❌ Cette statistique n'existe plus.",
            components: [],
          });

          return;
        }

        await interaction.update({
          content:
            creerMessageStats(
              stat,
              total
            ),
          components: [],
        });

        return;
      }

      // ==================================================
      // 👤 CHOIX DE LA PERSONNE
      // ==================================================

      if (
        interaction.isUserSelectMenu() &&
        interaction.customId ===
          "nouvelle_stat_personne"
      ) {
        const personneId =
          interaction.values[0];

        const personne =
          await interaction.guild.members.fetch(
            personneId
          );

        const modal =
          new ModalBuilder()
            .setCustomId(
              "nouvelle_stat_modal:" +
                personneId
            )
            .setTitle(
              "🆕 Nouvelle expression"
            );

        const expression =
          new TextInputBuilder()
            .setCustomId(
              "expression"
            )
            .setLabel(
              "Quelle expression ?"
            )
            .setPlaceholder(
              "Ex : Mais t'es sérieux là ?"
            )
            .setStyle(
              TextInputStyle.Short
            )
            .setMaxLength(100)
            .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            expression
          )
        );

        await interaction.showModal(
          modal
        );

        return;
      }

      // ==================================================
      // 📝 NOUVELLE STAT
      // ==================================================

      if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith(
          "nouvelle_stat_modal:"
        )
      ) {
        const personneId =
          interaction.customId.split(":")[1];

        const personne =
          await interaction.guild.members.fetch(
            personneId
          );

        const expression =
          interaction.fields
            .getTextInputValue(
              "expression"
            )
            .trim();

        if (!expression) {
          await interaction.reply({
            content:
              "❌ L'expression ne peut pas être vide.",
            ephemeral: true,
          });

          return;
        }

        const resultat =
          creerNouvelleStat(
            personneId,
            personne.displayName,
            expression
          );

        await interaction.reply(
          creerMessageStats(
            resultat.stat,
            resultat.stat.total,
            true
          )
        );

        return;
      }

      // ==================================================
      // 🤔 /TU-PREFERES
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName ===
          "tu-preferes"
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
            .setCustomId(
              "question1"
            )
            .setLabel(
              "Option 1"
            )
            .setStyle(
              TextInputStyle.Short
            )
            .setRequired(true);

        const question2 =
          new TextInputBuilder()
            .setCustomId(
              "question2"
            )
            .setLabel(
              "Option 2"
            )
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
        interaction.commandName ===
          "casino"
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
        interaction.commandName ===
          "roulette"
      ) {
        const nombre =
          Math.floor(
            Math.random() * 37
          );

        let couleur;

        if (nombre === 0) {
          couleur =
            "🟢 VERT";
        } else if (
          [
            1, 3, 5, 7, 9,
            12, 14, 16, 18,
            19, 21, 23, 25,
            27, 30, 32, 34, 36,
          ].includes(nombre)
        ) {
          couleur =
            "🔴 ROUGE";
        } else {
          couleur =
            "⚫ NOIR";
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
        interaction.commandName ===
          "potin"
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
        interaction.commandName ===
          "accuser"
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
          buverie:
            "🍻 BUVERIE",
          ski:
            "🎿 SKI",
          soirees:
            "🎉 SOIRÉES",
          gages:
            "🎲 GAGES DE SOIRÉE",
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
        interaction.commandName ===
          "tribunal"
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
      // 🐗 /PUMBAA
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName ===
          "pumbaa"
      ) {
        await interaction.reply(
          messagePumbaaAleatoire()
        );

        return;
      }

      // ==================================================
      // 🏆 /HALLOFFAME
      // ==================================================

      if (
        interaction.isChatInputCommand() &&
        interaction.commandName ===
          "halloffame"
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
        interaction.commandName ===
          "photo"
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
                "1️⃣ " +
                option1
              )
              .setStyle(
                ButtonStyle.Primary
              ),

            new ButtonBuilder()
              .setCustomId(
                "tp_option2"
              )
              .setLabel(
                "2️⃣ " +
                option2
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

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
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
// 🐗 ARRIVÉE DE PUMBAA DANS LE VOCAL
// ======================================================

client.on(
  Events.VoiceStateUpdate,
  async (
    oldState,
    newState
  ) => {
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
          "❌ CHANNEL_ID introuvable pour Pumbaa."
        );

        return;
      }

      await channel.send(
        messagePumbaaAleatoire()
      );
    }
  }
);

// ======================================================
// 📊 CHARGEMENT
// ======================================================

chargerStats();

// ======================================================
// 🔑 CONNEXION
// ======================================================

client.login(
  process.env.DISCORD_TOKEN
);
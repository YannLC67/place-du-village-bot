require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

/* =====================================================
   CLIENT DISCORD
===================================================== */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});


/* =====================================================
   COMMANDES
===================================================== */

const commands = [

  // TU PRÉFÈRES
  new SlashCommandBuilder()
    .setName("tu-preferes")
    .setDescription("Crée un Tu préfères et fais voter le village 🤔"),

  // CASINO
  new SlashCommandBuilder()
    .setName("casino")
    .setDescription("Joue à la machine à sous du village 🎰"),

  // ROULETTE
  new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Désigne un villageois au hasard 🎯"),

  // POTIN
  new SlashCommandBuilder()
    .setName("potin")
    .setDescription("Découvre un potin du village 🗣️"),

  // ACCUSER
  new SlashCommandBuilder()
    .setName("accuser")
    .setDescription("Accuse quelqu'un d'un crime ridicule 🚨")
    .addUserOption(option =>
      option
        .setName("personne")
        .setDescription("La personne accusée")
        .setRequired(true)
    ),

  // TRIBUNAL
  new SlashCommandBuilder()
    .setName("tribunal")
    .setDescription("Organise un procès du village ⚖️")
    .addUserOption(option =>
      option
        .setName("personne")
        .setDescription("La personne jugée")
        .setRequired(true)
    ),

  // POUMBA MANUEL
  new SlashCommandBuilder()
    .setName("poumba")
    .setDescription("Déclenche l'alerte Poumba 🐗"),

  // HALL OF FAME
  new SlashCommandBuilder()
    .setName("halloffame")
    .setDescription("Ajoute un message au Hall of Fame 🏆")
    .addStringOption(option =>
      option
        .setName("moment")
        .setDescription("Décris le moment légendaire")
        .setRequired(true)
    ),

  // PHOTO
  new SlashCommandBuilder()
    .setName("photo")
    .setDescription("Lance un vote sur une photo 📸")
    .addStringOption(option =>
      option
        .setName("description")
        .setDescription("Décris la photo")
        .setRequired(true)
    ),

].map(command => command.toJSON());


/* =====================================================
   DONNÉES
===================================================== */

const activeTuPreferes = new Map();
const activeTribunaux = new Map();


/* =====================================================
   TU PRÉFÈRES
===================================================== */

function afficherTuPreferes(poll) {

  const votes = Object.values(poll.votes);

  const voteA =
    votes.filter(vote => vote === "A").length;

  const voteB =
    votes.filter(vote => vote === "B").length;

  const total = votes.length;

  const pourcentageA =
    total === 0
      ? 0
      : Math.round((voteA / total) * 100);

  const pourcentageB =
    total === 0
      ? 0
      : Math.round((voteB / total) * 100);

  return (
    `🤔 **TU PRÉFÈRES ?** 🤔\n\n` +
    `**${poll.question}**\n\n` +
    `🅰️ **${poll.choixA}**\n` +
    `➡️ ${voteA} vote(s) — **${pourcentageA}%**\n\n` +
    `🅱️ **${poll.choixB}**\n` +
    `➡️ ${voteB} vote(s) — **${pourcentageB}%**\n\n` +
    `👥 **${total}** participant(s)`
  );
}


function afficherResultatTuPreferes(poll) {

  const votes = Object.values(poll.votes);

  const voteA =
    votes.filter(vote => vote === "A").length;

  const voteB =
    votes.filter(vote => vote === "B").length;

  const total = votes.length;

  const pourcentageA =
    total === 0
      ? 0
      : Math.round((voteA / total) * 100);

  const pourcentageB =
    total === 0
      ? 0
      : Math.round((voteB / total) * 100);

  let resultat;

  if (voteA > voteB) {

    resultat =
      `🏆 **Le choix A gagne !**`;

  } else if (voteB > voteA) {

    resultat =
      `🏆 **Le choix B gagne !**`;

  } else {

    resultat =
      `🤝 **Égalité parfaite !**`;
  }

  return (
    `📊 **RÉSULTAT DU TU PRÉFÈRES** 📊\n\n` +

    `**${poll.question}**\n\n` +

    `🅰️ **${poll.choixA}**\n` +
    `➡️ ${voteA} vote(s) — **${pourcentageA}%**\n\n` +

    `🅱️ **${poll.choixB}**\n` +
    `➡️ ${voteB} vote(s) — **${pourcentageB}%**\n\n` +

    `👥 **${total}** participant(s)\n\n` +

    `${resultat}`
  );
}


function boutonsTuPreferes(id) {

  return [
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`tp_A_${id}`)
        .setLabel("🅰️ Choix A")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`tp_B_${id}`)
        .setLabel("🅱️ Choix B")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`tp_edit_${id}`)
        .setLabel("✏️ Modifier")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`tp_end_${id}`)
        .setLabel("🔒 Terminer")
        .setStyle(ButtonStyle.Danger),

    ),
  ];
}


/* =====================================================
   ACCUSATIONS
===================================================== */

const accusations = [

  {
    theme: "🍻 BUVERIE",
    phrases: [
      "a fini une bouteille qui ne lui appartenait pas",
      "a commandé une tournée sans prévenir personne",
      "a mystérieusement perdu son verre",
      "a dit « je bois juste un verre »",
      "a passé beaucoup trop de temps au bar",
      "a été incapable de retrouver son verre alors qu'il était dans sa main",
      "a prétendu ne pas être bourré alors que personne ne le croyait",
      "a participé activement à la disparition des provisions du village",
    ],
  },

  {
    theme: "🎿 SKI",
    phrases: [
      "a passé plus de temps au bar qu'à skier",
      "a pris une piste noire avec une confiance injustifiée",
      "a accusé ses skis de tous ses problèmes",
      "a fait une pause vin chaud de trois heures",
      "a réussi à se perdre sur une piste parfaitement balisée",
      "a préféré l'après-ski au ski",
      "a chuté avec une élégance absolument inexistante",
      "a annoncé qu'il maîtrisait le ski alors que personne ne l'avait demandé",
    ],
  },

  {
    theme: "🎉 SOIRÉES",
    phrases: [
      "a dit « je rentre tôt » avant de finir dernier",
      "a disparu pendant 45 minutes sans aucune explication",
      "a lancé une soirée alors que personne n'avait rien demandé",
      "a raconté une histoire que personne n'avait demandée",
      "a oublié comment il était rentré",
      "a fini par parler à des inconnus comme s'ils étaient ses meilleurs amis",
      "a déclaré que la soirée était calme alors qu'elle ne l'était absolument pas",
      "a été responsable d'au moins une mauvaise décision collective",
    ],
  },

  {
    theme: "🎲 GAGES DE SOIRÉE",
    phrases: [
      "doit faire un discours officiel devant le village",
      "doit faire une imitation pendant 30 secondes",
      "doit parler avec un accent pendant 5 minutes",
      "doit laisser le village choisir sa prochaine photo de profil",
      "doit raconter sa pire anecdote de soirée",
      "doit chanter le refrain d'une chanson choisie par le village",
      "doit envoyer un message choisi par le village",
      "doit porter un surnom ridicule pendant toute la soirée",
    ],
  },

];


function accusationAleatoire() {

  const theme =
    accusations[
      Math.floor(Math.random() * accusations.length)
    ];

  const phrase =
    theme.phrases[
      Math.floor(Math.random() * theme.phrases.length)
    ];

  return {
    theme: theme.theme,
    phrase,
  };
}


/* =====================================================
   TRIBUNAL
===================================================== */

function boutonsTribunal(id) {

  return [
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`tribunal_coupable_${id}`)
        .setLabel("⚖️ COUPABLE")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`tribunal_innocent_${id}`)
        .setLabel("🕊️ INNOCENT")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`tribunal_end_${id}`)
        .setLabel("🔒 Terminer")
        .setStyle(ButtonStyle.Secondary),

    ),
  ];
}


function afficherTribunal(tribunal) {

  const coupable =
    Object.values(tribunal.votes)
      .filter(vote => vote === "coupable")
      .length;

  const innocent =
    Object.values(tribunal.votes)
      .filter(vote => vote === "innocent")
      .length;

  const total =
    coupable + innocent;

  return (
    `⚖️ **TRIBUNAL DU VILLAGE** ⚖️\n\n` +

    `👤 **Accusé :** ${tribunal.personne}\n\n` +

    `🚨 **Accusation :**\n` +
    `**${tribunal.accusation}**\n\n` +

    `⚖️ **Votes du village**\n\n` +

    `🔴 Coupable : **${coupable}**\n` +
    `🟢 Innocent : **${innocent}**\n\n` +

    `👥 ${total} vote(s)`
  );
}


/* =====================================================
   POUMBA AUTOMATIQUE
===================================================== */

client.on(
  Events.VoiceStateUpdate,
  async (oldState, newState) => {

    // Vérifie la personne ciblée
    if (
      !newState.member ||
      newState.member.id !== process.env.TARGET_USER_ID
    ) {
      return;
    }

    // Vérifie qu'elle vient d'entrer dans un vocal
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
        `🚨🐗 **ALERTE POUMBA !** 🐗🚨\n\n` +

        `**${newState.member.displayName}** ` +
        `vient d'entrer dans le vocal !\n\n` +

        `🥔 **PROTÉGEZ LES PATATES !**\n` +
        `🍺 **LE BAR EST DÉSORMAIS SOUS SURVEILLANCE !**\n` +
        `🏃💨 **FUYEZ, LE POUMBA EST LÀ !**`
      );
    }
  }
);


/* =====================================================
   BOT PRÊT
===================================================== */

client.once(
  Events.ClientReady,
  async readyClient => {

    console.log(
      `🤖 ${readyClient.user.tag} est prêt !`
    );

    console.log(
      `🆔 Bot ID : ${readyClient.user.id}`
    );

    console.log(
      `🏠 Guild ID : ${process.env.GUILD_ID}`
    );

    const rest =
      new REST({ version: "10" })
        .setToken(process.env.DISCORD_TOKEN);

    try {

      await rest.put(
        Routes.applicationGuildCommands(
          readyClient.user.id,
          process.env.GUILD_ID
        ),
        {
          body: commands,
        }
      );

      const registered =
        await rest.get(
          Routes.applicationGuildCommands(
            readyClient.user.id,
            process.env.GUILD_ID
          )
        );

      console.log(
        "✅ Commandes enregistrées !"
      );

      console.log(
        "📋 Commandes :",
        registered
          .map(command => command.name)
          .join(", ")
      );

    } catch (error) {

      console.error(
        "❌ Erreur commandes :",
        error
      );
    }
  }
);


/* =====================================================
   INTERACTIONS
===================================================== */

client.on(
  Events.InteractionCreate,
  async interaction => {

    try {

      /* =================================================
         MODALS
      ================================================= */

      if (interaction.isModalSubmit()) {

        /* -----------------------------------------------
           CRÉATION TU PRÉFÈRES
        ------------------------------------------------ */

        if (
          interaction.customId === "tp_creation"
        ) {

          const question =
            interaction.fields
              .getTextInputValue("tp_question");

          const choixA =
            interaction.fields
              .getTextInputValue("tp_choix_a");

          const choixB =
            interaction.fields
              .getTextInputValue("tp_choix_b");

          const id =
            Date.now().toString();

          const poll = {

            id,

            creatorId:
              interaction.user.id,

            question,

            choixA,

            choixB,

            votes: {},

            channelId:
              interaction.channelId,

            messageId:
              null,
          };

          activeTuPreferes.set(
            id,
            poll
          );

          const message =
            await interaction.reply({

              content:
                `🤔 **NOUVEAU TU PRÉFÈRES !** 🤔\n\n` +

                `👤 Créé par <@${poll.creatorId}>\n\n` +

                afficherTuPreferes(poll),

              components:
                boutonsTuPreferes(id),

              fetchReply:
                true,
            });

          poll.messageId =
            message.id;

          return;
        }


        /* -----------------------------------------------
           MODIFICATION
        ------------------------------------------------ */

        if (
          interaction.customId
            .startsWith("tp_edit_modal_")
        ) {

          const id =
            interaction.customId
              .replace(
                "tp_edit_modal_",
                ""
              );

          const poll =
            activeTuPreferes.get(id);

          if (!poll) {

            await interaction.reply({
              content:
                "❌ Ce Tu préfères n'existe plus.",
              ephemeral:
                true,
            });

            return;
          }

          if (
            interaction.user.id !==
            poll.creatorId
          ) {

            await interaction.reply({
              content:
                "❌ Seul le créateur peut modifier ce vote.",
              ephemeral:
                true,
            });

            return;
          }

          if (
            Object.keys(poll.votes).length > 0
          ) {

            await interaction.reply({
              content:
                "❌ Impossible de modifier après le premier vote.",
              ephemeral:
                true,
            });

            return;
          }

          poll.question =
            interaction.fields
              .getTextInputValue("tp_question");

          poll.choixA =
            interaction.fields
              .getTextInputValue("tp_choix_a");

          poll.choixB =
            interaction.fields
              .getTextInputValue("tp_choix_b");

          try {

            const channel =
              await client.channels.fetch(
                poll.channelId
              );

            const message =
              await channel.messages.fetch(
                poll.messageId
              );

            await message.edit({

              content:
                `🤔 **TU PRÉFÈRES MODIFIÉ !** 🤔\n\n` +

                `👤 Créé par <@${poll.creatorId}>\n\n` +

                afficherTuPreferes(poll),

              components:
                boutonsTuPreferes(id),
            });

          } catch (error) {

            console.error(
              "Erreur modification Tu préfères :",
              error
            );
          }

          await interaction.reply({

            content:
              "✅ Ton Tu préfères a été modifié !",

            ephemeral:
              true,
          });

          return;
        }
      }


      /* =================================================
         BOUTONS
      ================================================= */

      if (interaction.isButton()) {

        const parts =
          interaction.customId.split("_");

        /* -----------------------------------------------
           TU PRÉFÈRES
        ------------------------------------------------ */

        if (
          parts[0] === "tp"
        ) {

          const action =
            parts[1];

          const id =
            parts.slice(2).join("_");

          const poll =
            activeTuPreferes.get(id);

          if (!poll) {

            await interaction.reply({
              content:
                "❌ Ce Tu préfères n'est plus actif.",
              ephemeral:
                true,
            });

            return;
          }


          // VOTE
          if (
            action === "A" ||
            action === "B"
          ) {

            poll.votes[
              interaction.user.id
            ] = action;

            await interaction.update({

              content:
                `🤔 **TU PRÉFÈRES ?** 🤔\n\n` +

                `👤 Créé par <@${poll.creatorId}>\n\n` +

                afficherTuPreferes(poll),

              components:
                boutonsTuPreferes(id),
            });

            return;
          }


          // MODIFIER
          if (
            action === "edit"
          ) {

            if (
              interaction.user.id !==
              poll.creatorId
            ) {

              await interaction.reply({
                content:
                  "❌ Seul le créateur peut modifier ce vote.",
                ephemeral:
                  true,
              });

              return;
            }

            if (
              Object.keys(poll.votes).length > 0
            ) {

              await interaction.reply({
                content:
                  "❌ Impossible de modifier après le premier vote.",
                ephemeral:
                  true,
              });

              return;
            }

            const modal =
              new ModalBuilder()
                .setCustomId(
                  `tp_edit_modal_${id}`
                )
                .setTitle(
                  "Modifier ton Tu préfères"
                );

            const questionInput =
              new TextInputBuilder()
                .setCustomId(
                  "tp_question"
                )
                .setLabel(
                  "Question"
                )
                .setStyle(
                  TextInputStyle.Paragraph
                )
                .setRequired(true)
                .setValue(
                  poll.question
                );

            const choixAInput =
              new TextInputBuilder()
                .setCustomId(
                  "tp_choix_a"
                )
                .setLabel(
                  "Choix A"
                )
                .setStyle(
                  TextInputStyle.Short
                )
                .setRequired(true)
                .setValue(
                  poll.choixA
                );

            const choixBInput =
              new TextInputBuilder()
                .setCustomId(
                  "tp_choix_b"
                )
                .setLabel(
                  "Choix B"
                )
                .setStyle(
                  TextInputStyle.Short
                )
                .setRequired(true)
                .setValue(
                  poll.choixB
                );

            modal.addComponents(

              new ActionRowBuilder()
                .addComponents(
                  questionInput
                ),

              new ActionRowBuilder()
                .addComponents(
                  choixAInput
                ),

              new ActionRowBuilder()
                .addComponents(
                  choixBInput
                ),

            );

            await interaction.showModal(
              modal
            );

            return;
          }


          // TERMINER
          if (
            action === "end"
          ) {

            if (
              interaction.user.id !==
              poll.creatorId
            ) {

              await interaction.reply({
                content:
                  "❌ Seul le créateur peut terminer le vote.",
                ephemeral:
                  true,
              });

              return;
            }

            await interaction.update({

              content:
                `🔒 **VOTE TERMINÉ** 🔒\n\n` +

                afficherResultatTuPreferes(
                  poll
                ),

              components: [],
            });

            activeTuPreferes.delete(
              id
            );

            return;
          }
        }


        /* -----------------------------------------------
           TRIBUNAL
        ------------------------------------------------ */

        if (
          parts[0] === "tribunal"
        ) {

          const action =
            parts[1];

          const id =
            parts[2];

          const tribunal =
            activeTribunaux.get(id);

          if (!tribunal) {

            await interaction.reply({
              content:
                "❌ Ce tribunal est terminé.",
              ephemeral:
                true,
            });

            return;
          }


          // VOTE COUPABLE
          if (
            action === "coupable"
          ) {

            tribunal.votes[
              interaction.user.id
            ] = "coupable";

            await interaction.update({

              content:
                afficherTribunal(
                  tribunal
                ),

              components:
                boutonsTribunal(id),
            });

            return;
          }


          // VOTE INNOCENT
          if (
            action === "innocent"
          ) {

            tribunal.votes[
              interaction.user.id
            ] = "innocent";

            await interaction.update({

              content:
                afficherTribunal(
                  tribunal
                ),

              components:
                boutonsTribunal(id),
            });

            return;
          }


          // TERMINER TRIBUNAL
          if (
            action === "end"
          ) {

            const votes =
              Object.values(
                tribunal.votes
              );

            const coupable =
              votes.filter(
                vote =>
                  vote === "coupable"
              ).length;

            const innocent =
              votes.filter(
                vote =>
                  vote === "innocent"
              ).length;

            let verdict;

            if (
              coupable > innocent
            ) {

              verdict =
                "🔴 **COUPABLE !**";

            } else if (
              innocent > coupable
            ) {

              verdict =
                "🟢 **INNOCENT !**";

            } else {

              verdict =
                "🤝 **ÉGALITÉ ! Le tribunal ne sait pas quoi décider.**";
            }

            await interaction.update({

              content:
                `⚖️ **VERDICT DU VILLAGE** ⚖️\n\n` +

                `👤 ${tribunal.personne}\n\n` +

                `🚨 ${tribunal.accusation}\n\n` +

                `🔴 Coupable : **${coupable}**\n` +

                `🟢 Innocent : **${innocent}**\n\n` +

                `${verdict}`,

              components: [],
            });

            activeTribunaux.delete(
              id
            );

            return;
          }
        }
      }


      /* =================================================
         COMMANDES SLASH
      ================================================= */

      if (
        !interaction.isChatInputCommand()
      ) {
        return;
      }


      /* =================================================
         TU PRÉFÈRES
      ================================================= */

      if (
        interaction.commandName ===
        "tu-preferes"
      ) {

        const modal =
          new ModalBuilder()
            .setCustomId(
              "tp_creation"
            )
            .setTitle(
              "Créer un Tu préfères"
            );

        const questionInput =
          new TextInputBuilder()
            .setCustomId(
              "tp_question"
            )
            .setLabel(
              "Ta question"
            )
            .setPlaceholder(
              "Ex : Tu préfères..."
            )
            .setStyle(
              TextInputStyle.Paragraph
            )
            .setRequired(true)
            .setMaxLength(500);

        const choixAInput =
          new TextInputBuilder()
            .setCustomId(
              "tp_choix_a"
            )
            .setLabel(
              "Choix A"
            )
            .setPlaceholder(
              "Ex : vivre avec Poumba 🐗"
            )
            .setStyle(
              TextInputStyle.Short
            )
            .setRequired(true)
            .setMaxLength(100);

        const choixBInput =
          new TextInputBuilder()
            .setCustomId(
              "tp_choix_b"
            )
            .setLabel(
              "Choix B"
            )
            .setPlaceholder(
              "Ex : vivre avec le maire 👑"
            )
            .setStyle(
              TextInputStyle.Short
            )
            .setRequired(true)
            .setMaxLength(100);

        modal.addComponents(

          new ActionRowBuilder()
            .addComponents(
              questionInput
            ),

          new ActionRowBuilder()
            .addComponents(
              choixAInput
            ),

          new ActionRowBuilder()
            .addComponents(
              choixBInput
            ),

        );

        await interaction.showModal(
          modal
        );

        return;
      }


      /* =================================================
         CASINO
      ================================================= */

      if (
        interaction.commandName ===
        "casino"
      ) {

        const symboles = [
          "🍒",
          "🍋",
          "🍉",
          "⭐",
          "💎",
          "7️⃣",
        ];

        const a =
          symboles[
            Math.floor(
              Math.random() *
              symboles.length
            )
          ];

        const b =
          symboles[
            Math.floor(
              Math.random() *
              symboles.length
            )
          ];

        const c =
          symboles[
            Math.floor(
              Math.random() *
              symboles.length
            )
          ];

        let resultat;

        if (
          a === b &&
          b === c
        ) {

          resultat =
            "🎉 **JACKPOT !!!** 🎉";

        } else if (
          a === b ||
          b === c ||
          a === c
        ) {

          resultat =
            "🔥 **Deux symboles identiques !**";

        } else {

          resultat =
            "😭 **Perdu ! Retente ta chance.**";
        }

        await interaction.reply(

          `🎰 **CASINO DU VILLAGE** 🎰\n\n` +

          `┃ ${a} │ ${b} │ ${c} ┃\n\n` +

          `${resultat}`
        );

        return;
      }


      /* =================================================
         ROULETTE
      ================================================= */

      if (
        interaction.commandName ===
        "roulette"
      ) {

        const members =
          await interaction.guild.members.fetch();

        const villageois =
          members.filter(
            member =>
              !member.user.bot
          );

        const choix =
          villageois.random();

        if (!choix) {

          await interaction.reply(
            "❌ Aucun villageois trouvé."
          );

          return;
        }

        await interaction.reply(

          `🎯 **LA ROULETTE DU VILLAGE A PARLÉ !** 🎯\n\n` +

          `👉 Le village désigne **${choix.displayName}** ! 😈`
        );

        return;
      }


      /* =================================================
         POTIN
      ================================================= */

      if (
        interaction.commandName ===
        "potin"
      ) {

        const potins = [

          "🗣️ On raconte que quelqu'un mange les provisions en cachette...",

          "🗣️ Une personne du village serait secrètement fan de Poumba.",

          "🗣️ Quelqu'un aurait encore oublié de répondre dans le groupe.",

          "🗣️ Une soirée secrète serait en préparation... 👀",

          "🗣️ Quelqu'un aurait découvert un bar beaucoup trop intéressant.",

          "🗣️ Il paraît qu'une personne du village ne sait toujours pas skier.",

          "🗣️ Quelqu'un a encore promis de rentrer tôt.",

          "🗣️ Une personne aurait un dossier compromettant sur le reste du village.",
        ];

        const potin =
          potins[
            Math.floor(
              Math.random() *
              potins.length
            )
          ];

        await interaction.reply(
          potin
        );

        return;
      }


      /* =================================================
         ACCUSER
      ================================================= */

      if (
        interaction.commandName ===
        "accuser"
      ) {

        const personne =
          interaction.options.getUser(
            "personne"
          );

        const accusation =
          accusationAleatoire();

        await interaction.reply(

          `🚨 **ACCUSATION DU VILLAGE** 🚨\n\n` +

          `👤 **${personne.username}**\n\n` +

          `📂 **Thème : ${accusation.theme}**\n\n` +

          `⚖️ Est accusé(e) de **${accusation.phrase}** !\n\n` +

          `🚨 La justice du village est impitoyable.`
        );

        return;
      }


      /* =================================================
         TRIBUNAL
      ================================================= */

      if (
        interaction.commandName ===
        "tribunal"
      ) {

        const personne =
          interaction.options.getUser(
            "personne"
          );

        const accusation =
          accusationAleatoire();

        const id =
          Date.now().toString();

        const tribunal = {

          id,

          personne:
            `<@${personne.id}>`,

          accusation:
            `${accusation.theme} — ${accusation.phrase}`,

          votes: {},
        };

        activeTribunaux.set(
          id,
          tribunal
        );

        await interaction.reply({

          content:
            afficherTribunal(
              tribunal
            ),

          components:
            boutonsTribunal(id),
        });

        return;
      }


      /* =================================================
         POUMBA
      ================================================= */

      if (
        interaction.commandName ===
        "poumba"
      ) {

        await interaction.reply(

          `🚨🐗 **ALERTE POUMBA** 🐗🚨\n\n` +

          `**POUMBA EST DANS LE VILLAGE !**\n\n` +

          `🥔 Cachez les patates.\n` +

          `🍺 Fermez le bar.\n` +

          `🏃 **FUYEZ !**`
        );

        return;
      }


      /* =================================================
         HALL OF FAME
      ================================================= */

      if (
        interaction.commandName ===
        "halloffame"
      ) {

        const moment =
          interaction.options.getString(
            "moment"
          );

        await interaction.reply(

          `🏆 **NOUVEAU MOMENT DU VILLAGE** 🏆\n\n` +

          `📜 ${moment}\n\n` +

          `👤 Proposé par **${interaction.user.username}**\n\n` +

          `🔥 **MOMENT VALIDÉ PAR LE VILLAGE !**`
        );

        return;
      }


      /* =================================================
         PHOTO
      ================================================= */

      if (
        interaction.commandName ===
        "photo"
      ) {

        const description =
          interaction.options.getString(
            "description"
          );

        const row =
          new ActionRowBuilder()
            .addComponents(

              new ButtonBuilder()
                .setCustomId("photo_like")
                .setLabel("🔥 J'aime")
                .setStyle(
                  ButtonStyle.Primary
                ),

              new ButtonBuilder()
                .setCustomId("photo_lol")
                .setLabel("😂 Incroyable")
                .setStyle(
                  ButtonStyle.Success
                ),

              new ButtonBuilder()
                .setCustomId("photo_honte")
                .setLabel("💀 La honte")
                .setStyle(
                  ButtonStyle.Danger
                ),

            );

        await interaction.reply({

          content:
            `📸 **VOTE PHOTO DU VILLAGE** 📸\n\n` +

            `${description}\n\n` +

            `👉 Votez pour la photo !`,

          components:
            [row],
        });

        return;
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

          ephemeral:
            true,
        });
      }
    }
  }
);


/* =====================================================
   CONNEXION
===================================================== */

client.login(
  process.env.DISCORD_TOKEN
);
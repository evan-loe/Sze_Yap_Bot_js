const { SlashCommandBuilder } = require("@discordjs/builders");
const buttons = require("../components/buttons");
const { MessageActionRow } = require("discord.js");

const searchQuery = require("../search/searchQuery");
const { textToSlash, commandTypes } = require("../utils/textToSlash");

const interactionCollector = require("../embeds/interactionCollector");
const StateManager = require("../utils/StateManager");

module.exports = {
  //TODO: change description!
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Searches dictionary for word")
    .addStringOption((option) =>
      option.setName("phrase").setDescription("dasfsa").setRequired(true)
    )
    .setDefaultPermission(true),
  async execute({ type, args, message }) {
    const interaction = type == commandTypes.TEXT ? textToSlash(message) : message;
    const phrase = type == commandTypes.TEXT ? args[0] : interaction.options.getString("phrase");
    if (!phrase || !phrase.trim()) {
      interaction.reply({ content: "Please provide a phrase or word to search!", ephemeral: true });
      return;
    }
    if (!StateManager.userFavRomanCache.has(String(interaction.user.id))) {
      await StateManager.connection
        .query(`SELECT favRomanType FROM Users WHERE userId = '${interaction.user.id}'`)
        .then(async (result) => {
          if (!Array.isArray(result[0]) || !result[0].length) {
            console.log("User not found, creating entry in db...");
            await StateManager.connection.query(
              `INSERT INTO Users VALUES('${interaction.user.id}', NULL)`
            );
            StateManager.userFavRomanCache.set(interaction.user.id, null);
          } else {
            StateManager.userFavRomanCache.set(interaction.user.id, result[0][0].favRomanType);
          }
        });
      // connect to db, create new user, and update cache
    }

    const userFav = StateManager.userFavRomanCache.get(String(interaction.user.id));

    const q = new searchQuery(phrase);
    await q.searchStephenLi(userFav);

    let paginate = q.resultToEmbed("SL");
    paginate.slFound = q.foundResult;

    const sentMsg = await interaction.reply({
      embeds: [paginate.render()],
      components: [
        new MessageActionRow().addComponents([
          ...(paginate.slFound ? [buttons.prev, buttons.next, buttons.up, buttons.down] : []),
          buttons.mic,
        ]),
        new MessageActionRow().addComponents([buttons.switchDictionary(paginate.selDictType)]),
        new MessageActionRow().addComponents([buttons.relevanceDropdown]),
        new MessageActionRow().addComponents([
          // TODO: add the user fav type
          buttons.hsr(q.userFavType),
          buttons.sl(q.userFavType),
          buttons.gc(q.userFavType),
          buttons.dj(q.userFavType),
          buttons.jw(q.userFavType),
        ]),
        ...(userFav === null
          ? [new MessageActionRow().addComponents([buttons.favRomanDropdown])]
          : []),
      ],
      fetchReply: true,
    });

    interactionCollector.navigationButton({
      buttonIds: ["next", "prev", "up", "down"],
      paginate: paginate,
      sentMsg: sentMsg,
    });

    interactionCollector.selectRelevance({
      menuId: ["feedback"],
      sentMsg: sentMsg,
      paginate: paginate,
      searchQuery: q,
    });

    interactionCollector.switchDict({
      buttonIds: ["switchDict"],
      sentMsg: sentMsg,
      paginate: paginate,
      searchQuery: q,
    });

    interactionCollector.defaultRomanization({
      menuId: ["favRoman"],
      sentMsg: sentMsg,
    });

    interactionCollector.switchPenyim({
      buttonIds: ["HSR", "SL", "GC", "DJ", "JW"],
      sentMsg: sentMsg,
      paginate: paginate,
      searchQuery: q,
    });
  },
  parse(commandString) {
    return [commandString.trim()];
  },
};

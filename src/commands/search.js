const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");

const searchQuery = require("../search/searchQuery");
const { textToSlash, commandTypes } = require("../utils/textToSlash");

const interactionCollector = require("../embeds/interactionCollector");

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
    console.log(phrase);
    if (!phrase || !phrase.trim()) {
      interaction.reply({ content: "Please provide a phrase or word to search!", ephemeral: true });
      return;
    }
    const q = new searchQuery(phrase);
    await q.searchStephenLi();

    let row1 = [
      new MessageButton()
        .setCustomId("switchDict")
        .setLabel(`Switch to ${q.selDictType == "sl" ? "Gene Chin" : "Stephen Li"}'s dictionary`)
        .setStyle("PRIMARY"),
    ];
    if (q.foundResult) {
      row1.push(
        new MessageButton().setCustomId("prev").setLabel("Previous").setStyle("DANGER"),
        new MessageButton().setCustomId("next").setLabel("Next").setStyle("SUCCESS")
      );
    }

    let paginate = q.resultToEmbed();

    const row = [
      new MessageActionRow().addComponents(row1),
      new MessageActionRow().addComponents([
        new MessageSelectMenu()
          .setCustomId("feedback")
          .setPlaceholder("How relevant was this result?")
          .setMaxValues(1)
          .setOptions([
            { label: "not relevant at all", value: "1" },
            { label: "kind of relvant", value: "2" },
            { label: "relevant", value: "3" },
            { label: "really relevant", value: "4" },
            { label: "exactly what I was looking for", value: "5" },
          ]),
      ]),
    ];
    const sentMsg = await interaction.reply({
      embeds: [paginate.render()],
      components: row,
      fetchReply: true,
    });

    interactionCollector.buttonCollector({
      buttonIds: ["next", "prev"],
      paginate: paginate,
      sentMsg: sentMsg,
    });

    interactionCollector.menuCollector({
      menuId: ["feedback"],
      sentMsg: sentMsg,
    });

    interactionCollector.switchDict({
      buttonIds: ["switchDict"],
      sentMsg: sentMsg,
      paginate: paginate,
      searchQuery: q,
    });
  },
  parse(commandString) {
    return [commandString.trim()];
  },
};

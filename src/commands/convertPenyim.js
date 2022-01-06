const { SlashCommandBuilder } = require("@discordjs/builders");
const { textToSlash } = require("../utils/textToSlash");
const { codeRomanMap } = require("../config/config.json");
const PenyimArray = require("../penyim/PenyimArray");
const { MessageEmbed, MessageActionRow } = require("discord.js");
const buttons = require("../components/buttons");
const interactionCollector = require("../embeds/interactionCollector");
const { commandTypes } = require("../utils/textToSlash");

module.exports = {
  //TODO: change description!
  data: new SlashCommandBuilder()
    .setName("penyim")
    .setDescription("Searches dictionary for word")
    .addStringOption((option) =>
      option.setName("phrase").setDescription("dasfsa").setRequired(true)
    )
    .setDefaultPermission(true),
  async execute({ type, args, message }) {
    const interaction = type == commandTypes.TEXT ? textToSlash(message) : message;
    const phraseArray =
      type == commandTypes.TEXT ? args : interaction.options.getString("phrase").split(" ");
    if (phraseArray.length < 1) {
      interaction.reply({ content: "Please provide a phrase to convert!", ephemeral: true });
      return;
    }

    // check if they provided a type
    let penType = "HSR";
    if (
      Object.keys(codeRomanMap)
        .map((penType) => penType.toLowerCase())
        .includes(phraseArray[0].toLowerCase())
    ) {
      penType = phraseArray[0].toUpperCase();
      phraseArray.slice(1);
    }

    const penyimInput = new PenyimArray({
      penyimArray: phraseArray,
      userFavType: penType,
      delimiter: " ",
    });

    const result = penyimInput.combine();
    console.log(result);
    const sentMsg = await interaction.reply({
      embeds: [new MessageEmbed({ title: `Convert to ${penType}`, description: result })],
      components: [
        new MessageActionRow().addComponents([
          buttons.hsr(penType),
          buttons.sl(penType),
          buttons.gc(penType),
          buttons.dj(penType),
          buttons.jw(penType),
        ]),
      ],
      fetchReply: true,
    });

    interactionCollector.penyimConvertCommand({
      buttonIds: ["HSR", "SL", "GC", "DJ", "JW"],
      sentMsg: sentMsg,
      penyimArray: penyimInput,
    });
  },
  parse(commandString) {
    return commandString.trim().split(" ");
  },
};

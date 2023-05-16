const { SlashCommandBuilder } = require("@discordjs/builders");
const { textToSlash, commandTypes } = require("../utils/textToSlash");
const StateManager = require("../utils/StateManager");
const { codeRomanMap } = require("../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("change-romanization")
    .setDescription("Changes the default romanization")
    .addStringOption((option) => {
      return option
        .setName("romanization")
        .setDescription("Changes the romanization")
        .setRequired(true)
        .addChoice(`${codeRomanMap["HSR"]}`, "HSR")
        .addChoice(`${codeRomanMap["SL"]}`, "SL")
        .addChoice(`${codeRomanMap["GC"]}`, "GC")
        .addChoice(`${codeRomanMap["DJ"]}`, "DJ")
        .addChoice(`${codeRomanMap["JW"]}`, "JW");
    }),
  execute: async ({ type, args, message }) => {
    const interaction = type === commandTypes.TEXT ? textToSlash(message) : message;

    let favRomanType = "";
    if (type === commandTypes.TEXT) {
      if (args[0] && Object.keys(codeRomanMap).includes(args[0])) {
        favRomanType = args[0];
      } else {
        interaction.reply({
          content: "Please provide valid arguments. Use `/help` for details.",
          ephemeral: true,
        });
        return;
      }
    } else {
      favRomanType = interaction.options.getString("romanization");
    }
    StateManager.emit("romanizationUpdated", interaction.user.id, favRomanType);
    interaction.reply({
      content: `Successfully set default romanization system to ${codeRomanMap[favRomanType]}`,
      ephemeral: true,
    });
  },
  parse(commandString) {
    return commandString.trim().split(" ");
  },
};

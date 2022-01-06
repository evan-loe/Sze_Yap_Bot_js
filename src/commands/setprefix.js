const { SlashCommandBuilder } = require("@discordjs/builders");
const StateManager = require("../utils/StateManager");
const { textToSlash, commandTypes } = require("../utils/textToSlash");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setprefix")
    .setDescription("Change the prefix!")
    .addStringOption((option) => {
      return option.setName("prefix").setDescription("The safasd").setRequired(true);
    })
    .setDefaultPermission(true),
  async execute({ type, args, message }) {
    // redefine interaction if type is textcommand to support reply, etc
    const interaction = type === commandTypes.TEXT ? textToSlash(message) : message;
    let newPrefix = "";
    if (type === commandTypes.TEXT) {
      if (message.channel.type !== "GUILD_TEXT") {
        interaction.reply({
          content: "Sorry, this command is only available in a guild!",
        });
        return;
      }
      if (args[0]) {
        newPrefix = args[0];
      } else {
        interaction.reply("Please provide valid arguments. Use `/help` for details.");
        return;
      }
    } else {
      newPrefix = interaction.options.getString("prefix");
    }

    if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
      interaction.reply({
        content: "Sorry, you must be an admin to use this command!",
        ephemeral: true,
      });
      return;
    }
    if (newPrefix === "/") {
      interaction.reply("Sorry, please use another prefix!");
      return;
    }
    try {
      await StateManager.connection.query(
        `UPDATE Guilds SET cmdPrefix = '${newPrefix}' WHERE guildId = '${interaction.guildId}'`
      );
      interaction.reply(`Updated guild prefix to ${newPrefix}`);
      StateManager.emit("prefixUpdate", interaction.guildId, newPrefix);
    } catch (err) {
      console.log(err);
      interaction.reply(`Failed to update guild prefix to ${newPrefix}`);
    }
  },
  parse(commandString) {
    return commandString.trim().split(" ");
  },
};

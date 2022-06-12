const { SlashCommandBuilder } = require("@discordjs/builders");
const StateManager = require("../utils/StateManager");
const { textToSlash, commandTypes } = require("../utils/textToSlash");
const csvWriter = require("csv-writer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Get server statisticss!")
    .setDefaultPermission(false),
  async execute({ type, args, message }) {
    const interaction = type === commandTypes.TEXT ? textToSlash(message) : message;
    const data = require('../data/memberCount.json');

    if (!(message.guild.id in data)) {
      interaction.reply("Sorry, no data exists for this guild. Please come back later!");
      return;
    };

    const now = new Date(Date.now());

    const fileName = `${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_stats.csv`;
    const filePath = `./src/temp/memberCount/${message.guild.id}_${fileName}`;

    const csv = csvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        {id: "date", title: "Date"},
        {id: "count", title: "Member Count"},
        {id: "joined", title: "Joined"},
        {id: "left", title: "Left"},

      ]
    })
    await csv.writeRecords(data[message.guild.id].memberCount.map((entry) => {
      return {
        date: new Date(entry.datetime).toLocaleDateString("en-US"),
        count: entry.count,
        joined: entry.joined,
        left: entry.left
      };
    }))

    interaction.reply({
      files: [
        {
          name: `${message.guild.name}_${fileName}`,
          attachment: filePath
        }
      ]
    })
    
  },
  parse(commandString) {
    return commandString.trim().split(" ");
  },
};

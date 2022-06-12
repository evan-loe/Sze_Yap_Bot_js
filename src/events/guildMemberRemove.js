const { GuildMember } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "guildMemberRempve",
  /**
   *
   * @param {GuildMember} member
   */
  async execute(member) {
    const data = require("../data/memberCount.json");
    if (!(member.guild.id in data)) return;
    data[member.guild.id].leftSinceYesterday++;
    fs.writeFile(
      "./src/data/memberCount.json",
      JSON.stringify(data),
      (err) => {
        err && console.log(err);
      }
    );
  },
};

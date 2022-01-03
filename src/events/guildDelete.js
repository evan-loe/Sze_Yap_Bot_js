const StateManager = require("../utils/StateManager");

module.exports = {
  name: "guildDelete",
  async execute(guild) {
    try {
      console.log("Left the guild: ", guild.name);
      await StateManager.connection.query(`DELETE FROM Guilds WHERE guildId = ${guild.id}`);
      StateManager.emit("guildLeave", guild.id);
    } catch (err) {
      console.log(err);
    }
  },
};

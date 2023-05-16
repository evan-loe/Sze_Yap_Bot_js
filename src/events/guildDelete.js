const StateManager = require("../utils/StateManager");

module.exports = {
  name: "guildDelete",
  async execute(guild) {
    try {
      console.log("Left the guild: ", guild.name);
      await StateManager.db.run(`DELETE FROM Guilds WHERE guildId = $guildId`, {
        $guildId: guild.id
      });
      StateManager.emit("guildLeave", guild.id);
    } catch (err) {
      console.log(err);
    }
  },
};

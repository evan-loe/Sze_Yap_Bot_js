const StateManager = require("../utils/StateManager");

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    try {
      console.log("Joined the guild: ", guild.name);
      
      await StateManager.run(
        `INSERT INTO Guilds VALUES($guildId, $ownerId, '+', '0')`, {
          $guildId: guild.id,
          $ownerId: guild.ownerId
        }
      );
      StateManager.emit("guildJoin", guild.id, "+");
    } catch (err) {
      console.log(err);
    }
  },
};

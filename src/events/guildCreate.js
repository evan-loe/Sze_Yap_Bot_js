const StateManager = require("../utils/StateManager");

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    try {
      console.log("Joined the guild: ", guild.name);
      await StateManager.connection.query(
        `INSERT INTO Guilds VALUES('${guild.id}', '${guild.ownerId}', '+', '0')`
      );
      StateManager.emit("guildJoin", guild.id, "+");
    } catch (err) {
      console.log(err);
    }
  },
};

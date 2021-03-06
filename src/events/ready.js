const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("../config/config.json");
const StateManager = require("../utils/StateManager");
const fs = require("fs");

module.exports = {
  name: "ready",
  once: true,
  execute(client, commands) {
    console.log("Sze Yap bot is online");
    console.log(commands);

    const CLIENT_ID = client.user.id;

    const rest = new REST({
      version: "9",
    }).setToken(process.env.TOKEN);

    (async () => {
      try {
        if (process.env.DEV_STAGE === "production") {
          await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
          });
          console.log("Successfully registered commands globally.");
        } else {
          await rest.put(Routes.applicationGuildCommands(CLIENT_ID, String(config.guildId)), {
            body: commands,
          });
          console.log("Successfully registered commands locally.");
        }

        await StateManager.initialize();
        require("./addListeners");
        client.guilds.cache.forEach(async (guild) => {
          await StateManager.connection
            .query(`SELECT cmdPrefix FROM Guilds WHERE guildId = '${guild.id}'`)
            .then(async (result) => {
              if (!Array.isArray(result[0]) || !result[0].length) {
                console.log("Guild not found, creating entry in db...");
                await StateManager.connection.query(
                  `INSERT INTO Guilds VALUES('${guild.id}', '${guild.ownerId}', '+', '0')`
                );
                StateManager.guildPrefixCache.set(guild.id, "+");
              } else {
                StateManager.guildPrefixCache.set(guild.id, result[0][0].cmdPrefix);
              }
              console.log(StateManager.guildPrefixCache);
            });
        });
      } catch (error) {
        if (error) console.error(error);
      }
    })();

    // adding permissions
  },
};

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

        client.guilds.cache.forEach((guild) => {
          
        })

        client.guilds.cache.forEach(async (guild) => {
          StateManager.db.get(`SELECT cmdPrefix FROM Guilds WHERE guildId = $guildId`, {
            $guildId: guild.id
          },
          (err, row) => {
            if (err) {
              console.log(err);
            } else if (row == undefined) {
              console.log("Didn't find a guild record, creating one now...");
              StateManager.db.run(
                `INSERT INTO Guilds VALUES($guildId, $ownerId, '+', '0')`, {
                  $guildId: guild.id,
                  $ownerId: guild.ownerId,
                });
              StateManager.guildPrefixCache.set(guild.id, "+");
            } else {
              StateManager.guildPrefixCache.set(
                guild.id,
                row["cmdPrefix"]
              );
              console.log(StateManager.guildPrefixCache);
            }
          })
        });
      } catch (error) {
        if (error) console.error(error);
      }
    })();

    // adding permissions
  },
};

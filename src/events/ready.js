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
          const query = StateManager.db.guilds.select_n(1, {
            where: "id",
            condition: "equals",
            satisfies: guild.id
          })

          if (!query) {
            StateManager.db.guilds.insert(guild.id, {
              guild_owner_id: guild.ownerId,
            })
            StateManager.guildPrefixCache.set(guild.id, "+");
          } else {
            StateManager.guildPrefixCache.set(guild.id, query["cmd_prefix"])
          }

        });
      } catch (error) {
        if (error) console.error(error);
      }
    })();

    // adding permissions
  },
};

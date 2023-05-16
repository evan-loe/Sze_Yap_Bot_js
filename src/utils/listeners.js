const StateManager = require('./StateManager')

StateManager.on("prefixUpdate", (guildId, prefix) => {
  StateManager.guildPrefixCache.set(guildId, prefix)
  console.log("Updated cache", StateManager.guildPrefixCache);
})

StateManager.on("guildJoin", (guildId, prefix) => {
  StateManager.guildPrefixCache.set(guildId, prefix);
  console.log(`Added ${guildId} to cache`);
});

StateManager.on("guildLeave", (guildId) => {
  StateManager.guildPrefixCache.delete(guildId);
  console.log(`Removed ${guildId} from cache`);
});

StateManager.on("romanizationUpdated", async (userId, favRomanType) => {
  StateManager.db.users.insert(userId, favRomanType)
  StateManager.userFavRomanCache.set(userId, favRomanType);
  console.log("Updated Cache", StateManager.userFavRomanCache);
});

module.exports = {
  listeners: [
    prefix_update,
    guild_join,
    guild_leave,
    romanization_updated
  ]
}


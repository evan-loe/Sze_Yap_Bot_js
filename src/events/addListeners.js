const StateManager = require("../utils/StateManager");

StateManager.on("prefixUpdate", (guildId, prefix) => {
  StateManager.guildPrefixCache.set(guildId, prefix);
  console.log("Updated cache", StateManager.guildPrefixCache);
});

StateManager.on("guildJoin", (guildId, prefix) => {
  StateManager.guildPrefixCache.set(guildId, prefix);
  console.log(`Added ${guildId} to cache`);
});

StateManager.on("guildLeave", (guildId) => {
  StateManager.guildPrefixCache.delete(guildId);
  console.log(`Removed ${guildId} from cache`);
});

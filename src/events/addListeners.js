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

StateManager.on("romanizationUpdated", async (userId, favRomanType) => {
  await StateManager.connection.query(
    `INSERT INTO Users VALUES('${userId}', '${favRomanType}') ON DUPLICATE KEY UPDATE favRomanType = '${favRomanType}'`
  );
  StateManager.userFavRomanCache.set(userId, favRomanType);
  console.log("Updated Cache", StateManager.userFavRomanCache);
});

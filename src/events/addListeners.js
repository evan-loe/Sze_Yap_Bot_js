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
  await StateManager.db.run(
    `INSERT INTO USERS (userId, favRomanType) VALUES($userId, $favRomanType) ON CONFLICT(userId) DO UPDATE SET favRomanType=EXCLUDED.favRomanType;`, {
      $userId: userId,
      $favRomanType: favRomanType
    }
  );
  StateManager.userFavRomanCache.set(userId, favRomanType);
  console.log("Updated Cache", StateManager.userFavRomanCache);
});


function prefix_update(statemanager) {
  statemanager.on("prefixUpdate", (guildId, prefix) => {
    statemanager.guildPrefixCache.set(guildId, prefix)
    console.log("Updated cache", statemanager.guildPrefixCache);
  })
}
function guild_join(statemanager) {
  statemanager.on("guildJoin", (guildId, prefix) => {
    statemanager.guildPrefixCache.set(guildId, prefix);
    console.log(`Added ${guildId} to cache`);
  });
}

function guild_leave(statemanager) {
  statemanager.on("guildLeave", (guildId) => {
    statemanager.guildPrefixCache.delete(guildId);
    console.log(`Removed ${guildId} from cache`);
  });
}

function romanization_updated(statemanager) {
  statemanager.on("romanizationUpdated", async (userId, favRomanType) => {
    await statemanager.db.run(
      `INSERT INTO USERS (userId, favRomanType) VALUES($userId, $favRomanType) ON CONFLICT(userId) DO UPDATE SET favRomanType=EXCLUDED.favRomanType;`, {
        $userId: userId,
        $favRomanType: favRomanType
      }
    );
    statemanager.userFavRomanCache.set(userId, favRomanType);
    console.log("Updated Cache", statemanager.userFavRomanCache);
  });
}

module.exports = {
  listeners: [
    prefix_update,
    guild_join,
    guild_leave,
    romanization_updated
  ]
}


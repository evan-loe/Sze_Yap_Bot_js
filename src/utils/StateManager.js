const { EventEmitter } = require("events");

// const connection = require("../../database/db");
// const gc = require("../search/importDictionary");
const config = require("../config/config.json");
const { Collection } = require("discord.js");
const PenyimSpreadsheet = require("../penyim/PenyimSpreadsheet");
const { listeners } = require("./listeners");
const { DatabaseTable } = require("../../database/db");
// const gc = require("../search/importDictionary");

class StateManager extends EventEmitter {
  constructor(options) {
    super(options);
    this.sl = require(`../assets/${config.useFeedback ? config.sl_feedbackFile : config.sl_file}`);
    this.gc = null;
    this.commands = new Collection();
    this.guildPrefixCache = new Map();
    this.userFavRomanCache = new Map();
    this.penyimSheet = new PenyimSpreadsheet();
    this.db = {
      users: new DatabaseTable("users"),
      guilds: new DatabaseTable('guilds')
    }
  }

  register_events() {
    listeners.forEach((listener) => {
      listener()
    })
  }
}

// async function createStateManager() {
//   const state = new StateManager();
//   await state.initialize();
//   console.log(state);
//   return state;
// }

module.exports = {
  StateManager
}

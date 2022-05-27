const { EventEmitter } = require("events");

// const connection = require("../../database/db");
const sqlite3 = require('sqlite3').verbose();
const gc = require("../search/importDictionary");
const config = require("../config/config.json");
const { Collection } = require("discord.js");
const PenyimSpreadsheet = require("../penyim/PenyimSpreadsheet");
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
  }

  async initialize() {
    try {
      this.db = new sqlite3.Database('database/database.db');
      this.gc = await gc;
      await this.penyimSheet.initialize();
    } catch (error) {
      console.log(error);
    }
  }
}

// async function createStateManager() {
//   const state = new StateManager();
//   await state.initialize();
//   console.log(state);
//   return state;
// }

module.exports = new StateManager();

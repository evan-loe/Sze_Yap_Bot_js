const { EventEmitter } = require("events");

const connection = require("../../database/db");
const gc = require("../search/importDictionary");
const config = require("../config/config.json");
const { Collection } = require("discord.js");
const PenyimSpreadsheet = require("../penyim/PenyimSpreadsheet");
// const gc = require("../search/importDictionary");

class StateManager extends EventEmitter {
  constructor(options) {
    super(options);
    this.sl = require(`../assets/${
      config.useFeedback ? config.sl_feedbackFile : config.sl_feedbackFile
    }`);
    this.gc = null;
    this.commands = new Collection();
    this.guildPrefixCache = new Map();
    this.userPrefixCache = new Map();
    this.penyimSheet = new PenyimSpreadsheet();
  }

  async initialize() {
    try {
      this.connection = await connection;
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

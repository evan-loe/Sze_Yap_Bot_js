// TODO: import the database and add to state manager

const path = require("path");
const dfd = require("danfojs-node");
const config = require("../config/config.json");

module.exports = dfd.read_csv(
  path.join(__dirname, `../assets/${config.useFeedback ? config.gc_feedbackFile : config.gc_file}`)
);

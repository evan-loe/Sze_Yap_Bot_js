const StateManager = require("../utils/StateManager");
const connection = StateManager.connection;

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    try {
      console.log(member);
      sendWelcomeMessage();
    } catch (err) {
      console.log(err);
    }
  },
};

function sendWelcomeMessage() {}

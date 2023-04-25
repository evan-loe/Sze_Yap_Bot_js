const fs = require("fs");
const path = require("path");
const { Intents, Client } = require("discord.js");
const { StateManager } = require("./utils/StateManager");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
const { start_backend } = require('../dictionary/DictionaryBackend')

if (dotenv.error) {
  console.log(dotenv);
}

// init dictionary server backend
const dictionary = start_backend()
const statemanager = new StateManager()

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const commands = [];

// retrieve commands in command folder
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set key to name of command and value as exported module of file
  commands.push(command.data.toJSON());
  statemanager.commands.set(command.data.name, command);
}

const eventFiles = fs
  .readdirSync(path.join(__dirname, "events"))
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (!event.name) continue;
  console.log("Registering event: ", event.name);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, commands));
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands));
  }
}
client.login(process.env.TOKEN);

const countServerMembers = () => {
  let data = require("./data/memberCount.json");
  console.log("Counting members now");
  client.guilds.cache.map((guild) => {
    if (!(guild.id in data)) {
      data[guild.id] = {
        name: guild.name,
        memberCount: [],
        joinedSinceYesterday: 0,
        leftSinceYesterday: 0
      };
    }
    data[guild.id].memberCount.push({
      datetime: Date.now(),
      count: guild.memberCount,
      joined: data[guild.id].joinedSinceYesterday,
      left: data[guild.id].leftSinceYesterday,
    });
    data[guild.id].joinedSinceYesterday = 0;
    data[guild.id].leftSinceYesterday = 0;
  });
  fs.writeFile("./src/data/memberCount.json", JSON.stringify(data), (err) => {
    err && console.log(err);
  });
}

const cleanTempFiles = () => {
  try {
    for (directory in ['./src/temp/memberCount', '.src/temp/gen_welcome_images']) {
      fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
}

const cron = require("node-cron");
const { start } = require("repl");
// scheduled server count at 5 am every morning
cron.schedule("0 5 * * *", countServerMembers);
cron.schedule("0 4 * * *", cleanTempFiles);

process.on('uncaughtException', function(err) {
  console.log('Whoops exception: ' + err);
});

module.exports = statemanager;

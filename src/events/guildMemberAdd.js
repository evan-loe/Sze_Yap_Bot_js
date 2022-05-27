const StateManager = require("../utils/StateManager");
const { GuildMember } = require('discord.js');
const fs = require('fs');

const { createCanvas, loadImage } = require('canvas');

const canvasWidth = 1200;
const canvasHeight = 600;

/**
 * 
 * @param {string} imageBank 
 * @returns Promise
 */
function chooseRandomImage(imageBank) {
  const files = fs.readdirSync(`./src/assets/welcome_images/${imageBank}/`);
  return loadImage(files[Math.floor(Math.random*files.length)]);
}

/**
 * 
 * @param {GuildMember} member 
 */
function getUserAvatar(member) {
  return loadImage(`https://cdn.discordapp.com/guilds/${member.guild.id}/users/${member.user.id}/avatars/${member.avatar}.png`);
}

/**
 * 
 * @param {GuildMember} member 
 */
async function sendWelcomeMessage(member) {
  const guildInfo = require('../assets/welcome.json');
  console.log(guildInfo);
  
  
  if (guildInfo.hasOwnProperty(member.guild.id)) {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    const image = await chooseRandomImage(guildInfo[member.guild.id].hoisan_pics ? "hoisan" : "reg");
    ctx.drawImage(image);
    ctx.drawImage(getUserAvatar(member));

    ctx.font = 'bold 70pt Tahoma';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top'
    ctx.fillText(guildInfo.get(member.guild.id).en_title, image.width/2, image.height/4);
    ctx.fillText(guildInfo.get(member.guild.id).ch_title, image.width/2, image.height*3/4);

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(`../temp/gen_welcome_images/${member.user.id}_${Date.now()}_welcome.png`, buffer);
    console.log("lolll")
    guild.systemChannel.send(guildInfo.get(guild.id).message);
  } 
  else {
    console.log("No welcome message");
  }
}

module.exports = {
  name: "guildMemberAdd",
  /**
   * 
   * @param {GuildMember} member 
   */
  async execute(member) {
    console.log(member);
    try {
      console.log(member);
      sendWelcomeMessage(member);
    } catch (err) {
      console.log("ERROROOROR")
      console.log(err);
    }
  },
};




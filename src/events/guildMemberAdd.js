const StateManager = require("../utils/StateManager");
const { GuildMember } = require('discord.js');
const fs = require('fs');

const { createCanvas, loadImage } = require('canvas');

const canvasWidth = 1200;
const canvasHeight = 600;

/**
 * 
 * @param {string} imageBank 
 * @returns Image
 */
async function chooseRandomImage(imageBank) {
  const files = fs.readdirSync(`./src/assets/welcome_images/${imageBank}/`);
  console.log(
    String(
      `./src/assets/welcome_images/${imageBank}/${
        files[Math.floor(Math.random() * files.length)]
      }`
    )
  );
  return loadImage(
    String(`./src/assets/welcome_images/${imageBank}/${files[Math.floor(Math.random() * files.length)]}`)
  );
}

/**
 * 
 * @param {GuildMember} member 
 */
async function getUserAvatar(member) {
  return loadImage(member.displayAvatarURL({ format: 'png', size: 512 }));
}

async function cropPfp(radius, member) {
  const canvas = createCanvas(radius * 2, radius * 2);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(await getUserAvatar(member), 0, 0, 2*radius, 2*radius);

  // only draw image where mask is
  ctx.globalCompositeOperation = "destination-in";

  // draw our circle mask
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(
    radius,
    radius,
    radius, // radius
    0, // start angle
    2 * Math.PI // end angle
  );
  ctx.fill();

  // restore to default composite operation (is draw over current image)
  ctx.globalCompositeOperation = "source-over";

  // add border
  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";
  ctx.stroke();

  return canvas;
}

function outlineText({ctx, text, font, x, y, fill = "#fff8e3", outline = "#000", line = 2}) {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineWidth = line;

  ctx.fillText(text, x, y);
  ctx.fillStyle = outline;
  ctx.strokeText(text, x, y );
}

/**
 * 
 * @param {GuildMember} member 
 */
async function sendWelcomeMessage(member) {
  const guildInfo = require('../assets/welcome.json');
  
  if (guildInfo.hasOwnProperty(member.guild.id)) {
    const bgImage = await chooseRandomImage(guildInfo[member.guild.id].hoisan_pics ? "hoisan" : "reg");
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bgImage, 0, 0);
    const radius = bgImage.width / 8;
    ctx.drawImage(await cropPfp(radius, member, bgImage), bgImage.width / 2 - radius, bgImage.height / 2 - 1.5*radius);

    outlineText({
      ctx: ctx,
      text: guildInfo[member.guild.id].en_title,
      font: 'bold 40pt Tahoma',
      x: bgImage.width/2, 
      y: bgImage.height/20
    });
    
    outlineText({
      ctx: ctx,
      text: `You're member #${member.guild.memberCount}`,
      font: 'bold 40pt Tahoma',
      x: bgImage.width/2, 
      y: bgImage.height*10/12
    });
    
    outlineText({
      ctx: ctx,
      text: guildInfo[member.guild.id].ch_title,
      font: 'bold 40pt Tahoma',
      x: bgImage.width/2, 
      y: bgImage.height*11/16
    });

    const buffer = canvas.toBuffer('image/png')
    const imagePath = `./src/temp/gen_welcome_images/${member.user.id}_${Date.now()}_welcome.png`
    fs.writeFileSync(imagePath, buffer);
    member.guild.systemChannel.send({
      content: guildInfo[member.guild.id].message,
      embeds: [
        {
          image: {
            url: "attachment://file.png",
          },
        },
      ],
      files: [
        {
          attachment: imagePath,
          name: "file.png",
          description: `Welcome message for ${member.nickname}`,
        },
      ],
    });
  } 
  else {
    console.log(`${member.nickname} joined the guild ${member.guild.name} which doesn't have a welcome message`);
  }
}

module.exports = {
  name: "guildMemberAdd",
  /**
   * 
   * @param {GuildMember} member 
   */
  async execute(member) {
    try {
      sendWelcomeMessage(member);
      
    } catch (err) {
      console.log(err);
    }
    
    const data = require("../data/memberCount.json");
    if (!(member.guild.id in data)) return;
    data[member.guild.id].joinedSinceYesterday++;
    fs.writeFile(
      "./src/data/memberCount.json",
      JSON.stringify(data),
      (err) => {
        err && console.log(err);
      }
    );
  },
};




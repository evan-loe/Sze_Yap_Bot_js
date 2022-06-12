const buttons = require("../components/buttons");
const StateManager = require("../utils/StateManager");
const { codeRomanMap } = require("../config/config.json");
const { MessageActionRow, MessageEmbed } = require("discord.js");

module.exports.navigationButton = ({ buttonIds, paginate, sentMsg }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON", // Component type: button
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });
  collector.on("collect", (i) => {
    let page;
    switch (i.customId) {
      case "next":
        page = paginate.nextPage();
        break;
      case "prev":
        page = paginate.prevPage();
        break;
      case "up":
        page = paginate.selectUp();
        break;
      case "down":
        page = paginate.selectDown();
        break;
      default:
        page = paginate;
        break;
    }
    console.log(paginate);
    i.update({ embeds: [page] });
  });
  collector.on("end", (collected) => console.log(`Collected ${collected.size} items`));
};

module.exports.selectRelevance = ({ menuId, sentMsg, paginate, searchQuery }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    filter: (interaction) => {
      return menuId.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });
  collector.on("collect", (i) => {
    sentMsg.components[2].components[0]
      .setPlaceholder("Thanks for your feedback!")
      .setDisabled(true);

    i.update({
      components: sentMsg.components,
    });
    // TODO: update db with results
  });
};

module.exports.switchDict = async ({ buttonIds, sentMsg, paginate, searchQuery }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });

  collector.on("collect", async (i) => {
    if (paginate.selDictType == "SL") {
      if (!searchQuery.parsedResult.gc) {
        await searchQuery.searchGeneChin();
        searchQuery.changePenyim(searchQuery.parsedResult.gc, paginate.displayType);
      }
      paginate.selDictType = "GC";
    } else if (paginate.selDictType == "GC") {
      if (!searchQuery.parsedResult.sl) {
        await searchQuery.searchStephenLi();
        searchQuery.changePenyim(searchQuery.parsedResult.sl, paginate.displayType);
      }
      paginate.selDictType = "SL";
    } else {
      console.log("ERROR: Selected parsedResult is neither sl or gc");
    }
    // paginate.displayType = searchQuery.userFavType;

    const toSend = paginate.update(searchQuery);
    paginate.selDictType === "SL"
      ? (paginate.slFound = searchQuery.foundResult)
      : (paginate.gcFound = searchQuery.foundResult);

    sentMsg.components[1].components[0].setLabel(
      `Switch to ${paginate.selDictType == "SL" ? "Gene Chin" : "Stephen Li"}'s dictionary`
    );
    sentMsg.components[0].components =
      paginate.selDictType === "SL" && paginate.slFound
      ? [buttons.prev, buttons.next, buttons.up, buttons.down, buttons.mic]
      : [buttons.mic];

    sentMsg.components[3] = new MessageActionRow().addComponents([
      // TODO: add the user fav type
      buttons.hsr(paginate.displayType),
      buttons.sl(paginate.displayType),
      buttons.gc(paginate.displayType),
      buttons.dj(paginate.displayType),
      buttons.jw(paginate.displayType),
    ]);
    i.update({
      embeds: [toSend],
      components: sentMsg.components,
    });
  });
};

module.exports.defaultRomanization = ({ menuId, sentMsg }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    filter: (interaction) => {
      return menuId.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });
  collector.on("collect", (i) => {
    try {
      StateManager.emit("romanizationUpdated", i.user.id, i.values[0]);
      sentMsg.components.pop();
    } catch (err) {
      console.log(err);
    }

    sentMsg.edit({ components: sentMsg.components }).catch((err) => {
      console.log(err);
    });

    i.reply({
      content: `Your default is set to ${
        codeRomanMap[i.values[0]]
      }'s romanization.\nYou can change this using the command \`/change-romanization\``,
      ephemeral: true,
    });
  });
};

module.exports.switchPenyim = ({ buttonIds, sentMsg, paginate, searchQuery }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });

  collector.on("collect", (i) => {
    if (searchQuery.parsedResult.sl) {
      searchQuery.changePenyim(searchQuery.parsedResult.sl, i.customId);
    }
    if (searchQuery.parsedResult.gc) {
      searchQuery.changePenyim(searchQuery.parsedResult.gc, i.customId);
    }
    // because must keep same dictEmbed instance 'paginate' to allow changing pages
    const editedPenyim = searchQuery.resultToEmbed(paginate.selDictType);

    paginate.slEmbeds = editedPenyim.slEmbeds;
    paginate.gcEmbeds = editedPenyim.gcEmbeds;
    paginate.displayType = i.customId;
    paginate.currPage =
      paginate.selDictType === "SL"
        ? paginate.slEmbeds[paginate.current]
        : paginate.gcEmbeds[paginate.current];
    paginate.highlighted = 0;

    sentMsg.components[3] = new MessageActionRow().addComponents([
      // TODO: add the user fav type
      buttons.hsr(i.customId),
      buttons.sl(i.customId),
      buttons.gc(i.customId),
      buttons.dj(i.customId),
      buttons.jw(i.customId),
    ]);

    i.update({
      embeds: [paginate.update(searchQuery)],
      components: sentMsg.components,
    });
    console.log(paginate);
  });
};

module.exports.penyimConvertCommand = ({ buttonIds, sentMsg, penyimArray }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });

  collector.on("collect", (i) => {
    sentMsg.components[0] = new MessageActionRow().addComponents([
      // TODO: add the user fav type
      buttons.hsr(i.customId),
      buttons.sl(i.customId),
      buttons.gc(i.customId),
      buttons.dj(i.customId),
      buttons.jw(i.customId),
    ]);

    i.update({
      embeds: [
        new MessageEmbed({
          title: `Convert to ${i.customId}`,
          description: penyimArray.convertTypeTo(i.customId).combine(),
        }),
      ],
      components: sentMsg.components,
    });
  });
};


module.exports.switchPenyim = ({
  buttonIds,
  sentMsg,
}) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });

  collector.on("collect", (i) => {});
};
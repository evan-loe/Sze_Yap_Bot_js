const {
  createMessageComponentCollector,
  MessageButton,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const search = require("../commands/search");
const message = require("../events/message");

module.exports.buttonCollector = ({ buttonIds, paginate, sentMsg }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON", // Component type: button
    filter: (interaction) => {
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });
  collector.on("collect", (i) => {
    let page;
    if (i.customId == "next") {
      page = paginate.nextPage();
    } else if (i.customId == "prev") {
      page = paginate.prevPage();
    }
    i.update({ embeds: [page] });
  });
  collector.on("end", (collected) => console.log(`Collected ${collected.size} items`));
};

module.exports.menuCollector = ({ menuId, sentMsg }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    filter: (interaction) => {
      return menuId === String(interaction.customId);
    },
    time: 1800 * 1000,
  });
  collector.on("collect", (i) => {
    console.log(i);
    i.update({ components: [] });
    // TODO: update db with results
  });
};

module.exports.switchDict = async ({ buttonIds, sentMsg, paginate, searchQuery }) => {
  const collector = sentMsg.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (interaction) => {
      console.log("interaction was ", interaction.customId);
      return buttonIds.includes(String(interaction.customId));
    },
    time: 1800 * 1000,
  });
  collector.on("collect", async (i) => {
    console.log(i.customId);
    if (searchQuery.selDictType == "sl") {
      if (!searchQuery.parsedResult.gc) {
        await searchQuery.searchGeneChin();
      } else {
        searchQuery.selDictType = "gc";
      }
    } else if (searchQuery.selDictType == "gc") {
      if (!searchQuery.parsedResult.sl) {
        await searchQuery.searchStephenLi();
      } else {
        searchQuery.selDictType = "sl";
      }
    } else {
      console.log("ERROR: Selected parsedResult is neither sl or gc");
    }

    // const row = i.message.components.map((compRow) => {
    //   compRow.components.find((element, index) => {
    //     if (element.customId === "switchDict") {
    //       compRow.components[index].setLabel(
    //         `Switch to ${
    //           searchQuery.selDictType === "sl" ? "Gene Chin" : "Stephen Li"
    //         }'s dictionary`
    //       );
    //       return true;
    //     }
    //     return false;
    //   });
    //   return compRow;
    // });

    const toSend = paginate.update(searchQuery);

    let row1 = [
      new MessageButton()
        .setCustomId("switchDict")
        .setLabel(
          `Switch to ${searchQuery.selDictType == "sl" ? "Gene Chin" : "Stephen Li"}'s dictionary`
        )
        .setStyle("PRIMARY"),
    ];
    if (searchQuery.foundResult) {
      row1.push(
        new MessageButton().setCustomId("prev").setLabel("Previous").setStyle("DANGER"),
        new MessageButton().setCustomId("next").setLabel("Next").setStyle("SUCCESS")
      );
    }
    const row = [
      new MessageActionRow().addComponents(row1),
      new MessageActionRow().addComponents([
        new MessageSelectMenu()
          .setCustomId("feedback")
          .setPlaceholder("How relevant was this result?")
          .setMaxValues(1)
          .setOptions([
            { label: "not relevant at all", value: "1" },
            { label: "kind of relvant", value: "2" },
            { label: "relevant", value: "3" },
            { label: "really relevant", value: "4" },
            { label: "exactly what I was looking for", value: "5" },
          ]),
      ]),
    ];

    i.update({
      embeds: [toSend],
      components: row,
    });
    // TODO: update db with results
  });
};

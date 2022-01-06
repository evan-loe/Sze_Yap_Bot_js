const { MessageSelectMenu, MessageButton, Message } = require("discord.js");
const { codeRomanMap } = require("../config/config.json");

module.exports = {
  relevanceDropdown: new MessageSelectMenu()
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
  switchDictionary: (selDictType) =>
    new MessageButton()
      .setCustomId("switchDict")
      .setLabel(`Switch to ${selDictType == "SL" ? "Gene Chin" : "Stephen Li"}'s dictionary`)
      .setStyle("PRIMARY"),
  prev: new MessageButton().setCustomId("prev").setLabel("Previous").setStyle("DANGER"),
  next: new MessageButton().setCustomId("next").setLabel("Next").setStyle("SUCCESS"),
  up: new MessageButton().setCustomId("up").setLabel("Up").setStyle("PRIMARY"),
  down: new MessageButton().setCustomId("down").setLabel("Down").setStyle("PRIMARY"),
  mic: new MessageButton().setCustomId("mic").setLabel("Mic").setStyle("SECONDARY"),
  hsr: (currStyle) =>
    new MessageButton()
      .setCustomId("HSR")
      .setLabel("HSR")
      .setStyle(currStyle === "HSR" ? "PRIMARY" : "SECONDARY"),
  sl: (currStyle) =>
    new MessageButton()
      .setCustomId("SL")
      .setLabel("SL")
      .setStyle(currStyle === "SL" ? "PRIMARY" : "SECONDARY"),
  gc: (currStyle) =>
    new MessageButton()
      .setCustomId("GC")
      .setLabel("GC")
      .setStyle(currStyle === "GC" ? "PRIMARY" : "SECONDARY"),
  dj: (currStyle) =>
    new MessageButton()
      .setCustomId("DJ")
      .setLabel("DJ")
      .setStyle(currStyle === "DJ" ? "PRIMARY" : "SECONDARY"),
  jw: (currStyle) =>
    new MessageButton()
      .setCustomId("JW")
      .setLabel("JW")
      .setStyle(currStyle === "JW" ? "PRIMARY" : "SECONDARY"),
  favRomanDropdown: new MessageSelectMenu()
    .setCustomId("favRoman")
    .setPlaceholder("What Romanization system would you like your results to display as initially?")
    .setMaxValues(1)
    .setOptions([
      {
        label: `${codeRomanMap["HSR"]} (default)`,
        value: "HSR",
        description: "ex. heu55",
      },
      { label: `${codeRomanMap["SL"]}`, value: "SL", description: "ex. həu55" },
      { label: `${codeRomanMap["GC"]}`, value: "GC", description: "ex. hēo" },
      { label: `${codeRomanMap["DJ"]}`, value: "DJ", description: "ex. heu-" },
      { label: `${codeRomanMap["JW"]}`, value: "JW", description: "ex. heo2" },
    ]),
};

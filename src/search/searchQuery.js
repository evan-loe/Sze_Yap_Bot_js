const StateManager = require("../utils/StateManager");
const config = require("../config/config.json");
const DictEmbed = require("../embeds/DictEmbed");
const { MessageEmbed } = require("discord.js");
const PenyimArray = require("../penyim/PenyimArray");
const { replaceInArray } = require("../utils/misc");

const { slToGc } = config;

class searchQuery {
  searchPhrase;
  type;
  penyimType = null;
  found;
  parsedResult = {
    gc: null,
    sl: null,
  };
  foundResult = true;
  userFavType;

  constructor(searchPhrase) {
    this.searchPhrase = searchPhrase;
    this.determineType();
  }

  determineType() {
    let found = this.searchPhrase.match(/[A-Za-z]+[1-9]{2,3}\b/giu);
    if (found) {
      this.type = "PENYIM";
      this.found = found.map((word) => word.toLowerCase());
      return;
    }
    found = this.searchPhrase.match(/[\u4e00-\u9fff\u3400-\u4DBF\u4E00-\u9FCC]+(?=,|\s|$)/giu);
    if (found) {
      this.type = "CHINESE";
      this.found = found;
      return;
    }
    found = this.searchPhrase.match(/\w+/giu);
    if (found) {
      this.type = "ENGLISH";
      this.found = found.map((word) => word.toLowerCase());
      return;
    }
    this.type = "UNKNOWN";
    this.found = [];
    return;
  }

  notFound() {
    return new MessageEmbed({ title: "Not Found!", description: "sorry i looked everywhere" });
  }

  resultToEmbed(dictType = "SL") {
    console.log("re-rendering");
    if (!this.foundResult)
      return new DictEmbed(dictType, this.userFavType, [this.notFound()]).cacheResult();

    const pagination = new DictEmbed(dictType, this.userFavType, []);
    const result = dictType === "SL" ? this.parsedResult.sl : this.parsedResult.gc;
    for (let i = 0; i < result.length; i += 5) {
      const embed = new MessageEmbed();
      for (let j = 0; j < Math.min(5, result.length - i); j++) {
        embed
          .addFields({
            name:
              (j === 0 ? "🠶 " : "") +
              `${result[i + j].match
                .map((match) => {
                  return `${match.taishanese} ${match.taishaneseRomanization
                    .map((penyimArray) => penyimArray.combine())
                    .join(" or ")}`;
                })
                .join(" or\n")}`,
            value:
              "```" +
              (j === 0 ? "asciidoc\n= " : "") +
              `${result[i + j].english}` +
              (j === 0 ? " =" : "") +
              "```",
            inline: false,
          })
          .setTitle(`Words Matching "${this.searchPhrase}"`)
          .setColor(dictType == "SL" ? config.sl_color : config.gc_color);
      }
      pagination.addPages(embed);
    }
    pagination.addFooters();
    return pagination.cacheResult();
  }

  // searches Stephen Li and sets selected dictionary to 'sl'
  async searchStephenLi(userFavType) {
    this.userFavType = this.userFavType ?? userFavType ?? config.defaultRomanType;
    console.log(`Searching Stephen Li -> TYPE: ${this.type} FOUND: ${this.found}`);
    const dict = StateManager.sl;
    let result = [];
    this.parsedResult.sl = this.parsedResult.sl ?? []; // initialize to empty array

    switch (this.type) {
      case "CHINESE":
        if (this.found[0].length < 2) {
          result = dict.filter((entry, index) => {
            this.parsedResult.sl.push(index);
            return entry.cantonese.match(this.found[0]) || entry.mandarin.match(this.found[0]);
          });
        }
        break;
      case "ENGLISH":
        result = dict.filter((entry, index) => {
          if (entry.english.toLowerCase().match(this.found.join(" "))) {
            dict[index].index = index;
            return true;
          }
          return false;
        });
        break;
      case "PENYIM":
        result = dict.filter((entry, index, dict) => {
          if (entry.taishaneseRomanization.toLowerCase().match(this.found.join(" "))) {
            dict[index].index = index;
            return true;
          }
          return false;
        });
        break;
      default:
        break;
    }
    if (result.length < 1) {
      this.foundResult = false;
      return this;
    }

    function helperAltPenyin(penyimArray, resultArr) {
      let baseCase = true;
      penyimArray.forEach((word, index) => {
        if (baseCase && word.includes("/")) {
          word.split("/").forEach((splitWord) => {
            helperAltPenyin(replaceInArray(penyimArray, index, splitWord), resultArr);
            baseCase = false;
          }); // return false because not done
        }
      });
      if (baseCase) {
        resultArr.push(penyimArray);
      }
    }

    function alternatePenyin(penyimString, userFavType) {
      const result = [];
      helperAltPenyin(penyimString.replaceAll(/[\(\)\[\]]/giu, "").split(" "), result);
      return result.map(
        (penyimArray) =>
          new PenyimArray({
            penyimArray: penyimArray,
            type: "SL",
            userFavType: userFavType,
            delimiter: " ",
          })
      );
    }

    this.parsedResult.sl = result.map((entry) => {
      return {
        match: [
          {
            taishanese: entry.taishanese,
            taishaneseRomanization: alternatePenyin(entry.taishaneseRomanization, this.userFavType),
          },
        ],
        taishaneseAudio: entry.taishaneseAudio,
        index: entry.index,
        english: entry.english,
      };
    });
    this.foundResult = true;
    return this;
  }

  pushMulti(row) {
    if (row["繁"]) {
      this.pushSingle(row);
      return;
    }

    let output = {
      match: [],
      english: "",
    };
    let defn = row["英译与词句"].replaceAll(/[⁰¹²³⁴⁵⁶⁷⁸⁹]|<wr\.>\s|<又>\s|<台>/gi, "");
    const results = defn
      .trim()
      .matchAll(
        /(?:^|or )(?<taishanese>(?:[\u4e00-\u9fff\u3400-\u4DBF\u4E00-\u9FCC\[\],.]+(?:\sor\s|\s))+)(?<taishaneseRomanization>(?:(?:[a-zA-Z]{0,3}[\u00C0-\u024FẼẽ]|m̃|M̃|M̂|m̂|M̈|m̈|M̄|m̄|M̀|m̀|n̄|N̄|ñ|Ñ|ǹ|Ǹ|n̂|N̂|n̈|N̈)+[a-zA-Z]{0,3})(?:(?:\sor\s|-|,\s)(?:[a-zA-Z]{0,3}(?![ŋɔəɛs])[\u00C0-\u024FẼẽ]|m̃|M̃|M̂|m̂|M̈|m̈|M̄|m̄|M̀|m̀|n̄|N̄|ñ|Ñ|ǹ|Ǹ|n̂|N̂|n̈|N̈)+[a-zA-Z]{0,3})+)\s(?<mandarin>(?:(?:(?:[a-zA-Z]{0,3}(?![ŋɔəɛs])[\u00C0-\u024FẼẽ]|m̃|M̃|M̂|m̂|M̈|m̈|M̄|m̄|M̀|m̀|n̄|N̄|ñ|Ñ|ǹ|Ǹ|n̂|N̂|n̈|N̈)+[a-zA-Z]{0,3})+(?:\s|, |.)){0,3})/giu
      );
    for (let result of results) {
      defn = defn.replace(result[0], "");

      output.match.push({
        taishanese: result.groups.taishanese,
        taishaneseRomanization: result.groups.taishaneseRomanization
          .replace(", ", "-")
          .split(" or ")
          .map((phrase) => {
            return new PenyimArray({
              penyimArray: phrase.split("-"),
              type: "GC",
              userFavType: this.userFavType,
              delimiter: " ",
            });
          }),
        gcRomanizaton: result.groups.taishaneseRomanization,
      });
    }
    if (output.match.length < 1) {
      console.log(`Could not parse definition at ${row["number"]} -> ${row["英译与词句"]}`);
      return;
    }
    this.parsedResult.gc.push({
      match: output.match,
      english: defn.trim(),
      index: row["number"],
    });
  }

  pushSingle(row) {
    this.parsedResult.gc.push({
      match: [
        {
          taishaneseRomanization: [
            new PenyimArray({
              penyimArray: [row["台拼"]],
              type: "GC",
              userFavType: this.userFavType,
            }),
          ],
          taishanese: row["繁"],
          gcRomanizaton: row["台拼"],
        },
      ],
      english: row["英译与词句"],
      index: row["number"],
    });
  }

  // pushMulti(row) {
  //   if (row["繁"]) {
  //     this.pushSingle(row);
  //     return;
  //   }
  //   const defn = this.parseDefn();
  //   this.parsedResult.gc.push({
  //     taishanese: defn.taishanese,
  //     english: defn.english,
  //     taishaneseRomanization: defn.taishaneseRomanization,
  //     gcRomanizaton: defn.gcRomanizaton,
  //   });
  // }

  // searches Gene Chin and sets selected dictionary to 'gc'

  async searchGeneChin(userFavType) {
    this.userFavType = this.userFavType ?? userFavType ?? config.defaultRomanType;
    const dict = StateManager.gc;
    this.parsedResult.gc = this.parsedResult.gc ?? []; // change from null to empty array to signify tried searching

    function toGC(word) {
      let output = "";
      const results = word.matchAll(/(?<penyim>[A-Za-z]+)(?<tone>[1-9]{2,3})/giu);
      for (let result of results) {
        const { penyim, tone } = result.groups;
        output += penyim + (tone in slToGc ? slToGc[tone] : tone) + " ";
      }
      return output;
    }

    switch (this.type) {
      case "CHINESE":
        if (this.found[0].length < 2) {
          // simplified search, then traditional
          const simplified = dict.iloc({ rows: dict["繁"].str.includes(this.found[0]) });
          const traditional = dict.iloc({ rows: dict["简"].str.includes(this.found[0]) });
          // danfo
          //   .concat({ df_list: [simplified, traditional], axis: 0 })
          //   .to_json()
          //   .forEach((row) => {
          //     this.pushSingle(row);
          //   });
          return this;
        } else {
          dict
            .iloc({ rows: dict["英译与词句"].str.includes(this.found[0]) })
            .to_json()
            .forEach((row) => this.pushMulti(row));
        }
        break;
      case "ENGLISH":
        dict
          .iloc({ rows: dict["英译与词句"].str.includes(this.found[0]) })
          .to_json()
          .forEach((row) => {
            this.pushMulti(row);
          });
        break;
      case "PENYIM":
        dict
          .iloc({ rows: dict["p.y."].str.includes(toGC(this.found[0]).trim()) })
          .to_json()
          .forEach((row) => {
            this.pushSingle(row);
          });
        break;
      default:
        break;
    }
    this.foundResult = this.parsedResult.gc.length > 1;
    return this;
  }

  changePenyim(dictResult, type) {
    return dictResult.map((result) => {
      return result.match.map((match) => {
        match.taishaneseRomanization.map((romanization) => {
          return romanization.convertTypeTo(type);
        });
      });
    });
  }
}

module.exports = searchQuery;

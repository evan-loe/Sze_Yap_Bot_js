const tones = require("../assets/tones.json");

class Penyim {
  constructor(penyim = "", codeMap = new Map(), orig = null, invalid, type, index, code) {
    this.metaData = {
      orig: orig,
      codeMap: codeMap,
      origType: "",
      index: index,
    };
    this.penyim = penyim;
    this.prefix = "";
    this.suffix = "";
    this.code = code;
    this.type = type;
    this.invalid = invalid;
  }

  setPreSuf(prefix, suffix) {
    this.prefix = prefix;
    this.suffix = suffix;
  }

  convertCode(type = this.type) {
    const codeType =
      this.metaData.codeMap.get(this.metaData.origType) ??
      this.metaData.codeMap.get(this.metaData.codeMap.keys()[0]);
    return tones[type][codeType];
  }
}

module.exports = Penyim;

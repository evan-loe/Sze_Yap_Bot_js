const StateManager = require("../utils/StateManager");
const penyimSheet = StateManager.penyimSheet;
const Penyim = require("./Penyim");
// const tones = require("../assets/tones.json");

class PenyimArray extends Array {
  constructor({ penyimArray = [], type, userFavType, delimiter = " " }) {
    super(penyimArray.length);
    const penArray = [];
    penyimArray.forEach((element, index) => {
      const { penyim, codeMap } = penyimSheet.splitDeterminePossCodes(element);
      this[index] = new Penyim(penyim, codeMap, element);
      penArray.push(penyim);
    });
    if (type === undefined) {
      // detect type
      [this.type, this.confidence, this.count] = this._determineType(penArray);
    } else {
      this.type = type;
      this.confidence = 1;
      this.count = this._determineType(penArray)[2]; // third element of return value is the count with indices
    }
    this._normalize(); // converts to a single result if different systems and updates each Penyim object in array
    this.convertTypeTo(userFavType);
    this.delimiter = delimiter;
    // normalize
    console.log(this);
  }

  map(callback) {
    const returnVal = [];
    for (let i = 0; i < this.length; i++) {
      returnVal.push(callback(this[i]));
    }
    return returnVal;
  }

  _determineType(penyimArray) {
    if (penyimArray.length === 0) return [undefined, 0, undefined];
    const result = {};
    penyimArray.forEach((penyim, penNum) => {
      penyimSheet.determinePossTypes(penyim).forEach((possType) => {
        possType.name in result
          ? result[possType.name].push({ index: possType.index, strOrder: penNum })
          : (result[possType.name] = [{ index: possType.index, strOrder: penNum }]);
      });
    });
    const type = Object.keys(result).reduce((prev, current) =>
      result[prev].length >= result[current].length ? prev : current
    );
    // for every value, see if we visited that 'strOrder'
    const visited = [];
    const confidence =
      Object.values(result)
        .flat()
        .map((value) => {
          if (visited.includes(value.strOrder)) return 0;
          visited.push(value.strOrder);
          // if we visited, return
          // for every value that has the same 'strOrder'
          const ratio = [0, 0];
          Object.keys(result).forEach((key) => {
            ratio[1] += result[key].reduce((pre, cur) => {
              if (cur.strOrder == value.strOrder) {
                if (key == type) ratio[0] = ratio[0] + 1;
                return pre + 1;
              }
              return pre;
            }, 0);
          });
          // guard against div by 0
          if (ratio[1] === 0) {
            console.log("Error, no matching penyim found while calculating confidence");
            return 0;
          }
          return ratio[0] / ratio[1];
        })
        .reduce((partSum, curr) => partSum + curr, 0) / penyimArray.length;

    return [type, confidence, result];
  }

  // converts romanization to another type
  convertTypeTo(type) {
    this.forEach((penyim, index) => {
      this[index].code = penyim.convertCode(type);
      this[index].type = type;
      this[index].setPreSuf(
        penyimSheet.sheet[type].prefixes[penyim.metaData.index[0]],
        penyimSheet.sheet[type].suffixes[penyim.metaData.index[1]]
      );
    });
  }

  // multiple romanizations may have been found, so here we decide (based on data from the 'count'
  // property that we got from 'determine type' function) which romanization system to use
  // and then set the penyim table index to match that
  _normalize() {
    this.forEach((penyim, index) => {
      this[index].metaData.origType = this.type; // store origincal type as this.type
      this[index].type = this.type; // set current type to this.type
      for (const item of this.count[this.type]) {
        if (item.strOrder === index) {
          this[index].code = penyim.convertCode(this.type);
          this[index].metaData.index = item.index;
          this[index].setPreSuf(
            penyimSheet.sheet[this.type].prefixes[item.index[0]],
            penyimSheet.sheet[this.type].suffixes[item.index[1]]
          );
          break;
        }
      }
    });
    return this;
  }

  // splitPenyimCode(penyim) {
  //   const result = penyim.match(/(?<penyim>[^0-9]+)(?<code>[1-9]{2,3})/);
  //   return { penyim: result.groups.penyim, code: result.groups.code };
  //   // need to determine if any accents etc
  // }

  combine(delimiter = this.delimiter) {
    // TODO: check for gc
    return this.map((penyim) => {
      if (penyim.type === "GC") {
        // check if original was GC
        if (penyim.metaData.origType === "GC") {
          return penyim.metaData.orig;
        }
        // else do gene chin conversion with rules
      }
      return (penyim.prefix ?? "") + penyim.suffix + penyim.code;
    }).join(delimiter);
  }

  // GCToHSR(penyim) {
  //   const charIdx = penyim.search(/[\u00C0-\u024FẼẽ]|m̃|M̃|M̂|m̂|M̈|m̈|M̄|m̄|M̀|m̀|n̄|N̄|ñ|Ñ|ǹ|Ǹ|n̂|N̂|n̈|N̈/);
  //   let penyimCode = "";
  //   if (charIdx == -1) return;
  //   if (macron.list.includes(penyim[charIdx])) penyimCode = macron.toneNum;
  //   else if (diaeresis.list.includes(penyim[charIdx])) penyimCode = diaeresis.toneNum;
  //   else if (tilde.list.includes(penyim[charIdx])) penyimCode = tilde.toneNum;
  //   else if (grave_accent.list.includes(penyim[charIdx])) penyimCode = grave_accent.toneNum;
  //   else if (circumflex.list.includes(penyim[charIdx])) penyimCode = circumflex.toneNum;
  //   return {
  //     penyim: penyim.normalize("NFKD").replace(/[^\w]/g, ""),
  //     code: penyimCode,
  //   };
  // }
}

module.exports = PenyimArray;

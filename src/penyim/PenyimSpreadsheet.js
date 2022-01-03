const ExcelJS = require("exceljs");
const PenyimTable = require("./PenyimTable");
const tones = require("../assets/tones.json");
const config = require("../config/config.json");
const { macron, diaeresis, tilde, grave_accent, circumflex } = config.accents;

class PenyimSpreadsheet {
  constructor() {
    this.sheet = {};
  }

  async initialize() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(
      __dirname + "/../assets/Initial_and_Finals_chart_for_Penyim_Converter.xlsx"
    );
    workbook.eachSheet((worksheet, sheetId) => {
      worksheet.spliceColumns(21, 20); // remove tone info
      this.sheet[worksheet.name] = {
        prefixes: worksheet.getRow(1).values.slice(1),
        suffixes: worksheet.getColumn(1).values.slice(1),
        table: new PenyimTable(worksheet.name).import(worksheet, worksheet.getRow(1).values.length),
      };
    });
  }

  determinePossTypes(penyim) {
    const result = [];
    Object.values(this.sheet).forEach((sheet) => {
      // when no prefix
      sheet.suffixes.forEach((suffix, sufIdx) => {
        if (penyim === suffix) result.push({ name: sheet.table.name, index: [0, sufIdx] });
      });
      sheet.prefixes.slice(1).every((prefix, preIdx) => {
        if (penyim.startsWith(prefix)) {
          return sheet.suffixes.every((suffix, sufIdx) => {
            // remove prefix, check if equal to suffix
            if (penyim.replace(new RegExp(`^${prefix}`), "") === suffix) {
              result.push({ name: sheet.table.name, index: [preIdx + 1, sufIdx] });
              return false; // breaking 'every' loop
            }
            return true;
          });
        }
        return true; // true means keep going in 'every' loop
      });
    });
    return result;
  }

  splitDeterminePossCodes(penyim, type = undefined) {
    // search for Gene chin accents
    const normPenyim = penyim.normalize("NFD");
    console.log(penyim);
    if (penyim === "") {
      console.log("Error, penyim are undefined!");
    }

    let charIdx = normPenyim.search(/[a-z][\u0304\u0308\u0342\u0300\u0302\u0303]/iu);
    console.log(charIdx);

    // let charIdx = normPenyim.search(
    //   /(?![ŋɔəɛs])[\u00C0-\u024F]|m̃|M̃|M̂|m̂|M̈|m̈|M̄|m̄|M̀|m̀|n̄|N̄|ñ|Ñ|ǹ|Ǹ|n̂|N̂|n̈|N̈|ï|ĩ|ì|Ì/iu
    // );
    //Ẽẽè\u0304\u0308\u0342\u0300\u0302

    const possCodes = new Map();
    // only GC romanization has diacritic marks
    if (charIdx !== -1) {
      let penyimCode = "";
      if (macron.list.includes(penyim[charIdx])) penyimCode = "HIGH_FLAT";
      else if (diaeresis.list.includes(penyim[charIdx]))
        penyimCode = penyim.endsWith("/") ? "MID_RISE" : "MID_FLAT";
      else if (tilde.list.includes(penyim[charIdx]))
        penyimCode = penyim.endsWith("/") ? "LOW_RISE" : "LOW_FLAT";
      else if (grave_accent.list.includes(penyim[charIdx]))
        penyimCode = penyim.endsWith("/") ? "M_FALL_RISE" : "HIGH_FLAT";
      else if (circumflex.list.includes(penyim[charIdx]))
        penyimCode = penyim.endsWith("/") ? "L_FALL_RISE" : "LOW_FALL";
      return {
        penyim: penyim.normalize("NFKD").replace(/[^\w]/g, ""),
        codeMap: possCodes.set("GC", penyimCode),
      };
    } else {
      const code =
        (charIdx = penyim.search(/[-‘*`〉]+\b/)) !== -1
          ? penyim[charIdx]
          : penyim.match(/(?<penyim>[^0-9]+)(?<code>[1-9]{2,3})/).groups.code;

      Object.keys(tones).forEach((sheetKey) => {
        Object.keys(tones[sheetKey]).find((codeKey) => {
          if (tones[sheetKey][codeKey] === code) {
            possCodes.set(sheetKey, codeKey);
            return true;
          }
        });
      });
      if (possCodes.size < 1) {
        console.log("error in converting");
        return undefined;
      }
      return { penyim: penyim.replace(new RegExp(`${code}\\b`), ""), codeMap: possCodes };
    }
  }
}

module.exports = PenyimSpreadsheet;

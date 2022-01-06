const config = require("../config/config.json");

class PenyimTable {
  constructor(name) {
    this.data = [];
    this.name = name;
  }

  import(worksheet, colNum) {
    // worksheet is 1 indexed (not zero indexed)
    for (let c = 2; c < colNum; c++) {
      const col = [];
      worksheet.getColumn(c).eachCell({ includeEmpty: true }, (cell) => {
        col.push(cell.value);
      });
      this.data[c - 2] = col.slice(1);
    }
    return this;
  }

  get(row, col) {
    if (row === undefined || col === undefined) return undefined;
    // col-1 because suffix array has 46 elements where the first is ""
    return this.data[row][col];
  }
}

module.exports = PenyimTable;

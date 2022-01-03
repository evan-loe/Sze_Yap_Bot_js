const config = require("../config/config.json");

class PenyimTable {
  constructor(name) {
    this.data = [];
    this.name = name;
  }

  import(worksheet, colNum) {
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
    return this.data[row][col];
  }
}

module.exports = PenyimTable;

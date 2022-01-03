const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

const entries = [];
const start = performance.now();

fs.createReadStream(path.join(__dirname, "/../hed_dictionary.csv"))
  .pipe(csv())
  .on("data", (row) => {
    row.cachedSearch = "";
    row.totalFreq = 50;
    entries.push(row);
  })
  .on("end", () => {
    const result = parse(entries, { fields: Object.keys(entries[0]) });
    fs.writeFileSync(path.join(__dirname, "/../hed_dictionary_withUserFeedback.csv"), result);
    console.log(
      `Finished parsing...file saved. Operation took ${(performance.now() - start) / 1000} seconds`
    );
  });

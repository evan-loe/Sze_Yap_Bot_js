const fs = require("fs");
const csv = require("csv-parser");
const headers = "号,部,画,繁,简,台拼,汉拼,英译与词句,p.y.,ro#,qzw";
fs.createReadStream("hed_dictionary.csv")
  .pipe(csv())
  .on("data", (row) => {
    console.log(row);
  });

function removeFormat(string) {
  return string.replaceAll(/[⁰¹²³⁴⁵⁶⁷⁸⁹]|\<wr\.\>\s|<又>\s|<台>\s|<topo.>\s/giu);
}

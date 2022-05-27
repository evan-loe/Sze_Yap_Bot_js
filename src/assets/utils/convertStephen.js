const sl = require("../stephen-li.json");
const fs = require("fs");
const path = require("path");

sl.forEach((entry) => (entry.userRate = { cachedSearch: [], totalFreq: 50.0 }));
let data = JSON.stringify(sl);

fs.writeFileSync(path.join(__dirname, "/../stephen-li-withUserFeedback.json"), data);
console.log("done!");

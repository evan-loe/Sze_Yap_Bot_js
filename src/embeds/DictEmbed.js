const PaginationEmbed = require("./PaginationEmbed");
const { insertSubstring } = require("../utils/misc");

class DictEmbed extends PaginationEmbed {
  constructor(selDictType = "SL", displayType, ...args) {
    super(...args);
    this.slEmbeds = null;
    this.slCurr = 0;
    this.gcEmbeds = null;
    this.gcCurr = 0;
    this.slFound = undefined;
    this.gcFound = undefined;
    this.selDictType = selDictType;
    this.displayType = displayType;
    this.current = 0;
    this.highlighted = 0;
    this.currPage = null;
  }

  render(startIdx = 0) {
    // super.render(startIdx);
    this.currPage = structuredClone(this.embedList[startIdx]);
    return this.embedList[startIdx];
  }

  nextPage() {
    const page = super.nextPage();
    this.selDictType == "SL" ? (this.slCurr = this.current) : (this.gcCurr = this.current);
    this.highlighted = 0;
    this.currPage = structuredClone(page);
    return page;
  }
  prevPage() {
    const page = super.prevPage();
    this.selDictType == "SL" ? (this.slCurr = this.current) : (this.gcCurr = this.current);
    this.highlighted = 0;
    this.currPage = structuredClone(page);
    return page;
  }

  higlightField(page) {
    page.fields[this.highlighted].value = page.fields[this.highlighted].value.replace(
      /^```/,
      "```asciidoc\n= "
    );
    page.fields[this.highlighted].value = page.fields[this.highlighted].value.replace(
      /```$/,
      " =```"
    );
    page.fields[this.highlighted].name = "🠶 " + page.fields[this.highlighted].name;
    return page;
  }

  removeHighlightField(page) {
    page.fields[this.highlighted].value = page.fields[this.highlighted].value
      .replace("asciidoc\n= ", "")
      .replace(/ =```$/, "```");
    page.fields[this.highlighted].name = page.fields[this.highlighted].name.replace("🠶 ", "");
    return page;
  }

  selectUp() {
    const defnCount = this.currPage.fields.length;

    this.currPage = this.removeHighlightField(this.currPage);

    if (this.highlighted < 1) {
      this.highlighted = defnCount - 1;
    } else {
      this.highlighted -= 1;
    }

    this.currPage = this.higlightField(this.currPage);
    return this.currPage;
  }

  selectDown() {
    const defnCount = this.currPage.fields.length;

    this.currPage = this.removeHighlightField(this.currPage);

    if (this.highlighted >= defnCount - 1) {
      this.highlighted = 0;
    } else {
      this.highlighted += 1;
    }

    this.currPage = this.higlightField(this.currPage);
    return this.currPage;
  }

  update(searchQuery) {
    if (this.selDictType == "SL" && this.slEmbeds !== null) {
      this.embedList = this.slEmbeds;
      this.current = this.slCurr;
      return this.embedList[this.current];
    } else if (this.selDictType == "GC" && this.gcEmbeds !== null) {
      this.embedList = this.gcEmbeds;
      this.current = this.gcCurr;
      return this.embedList[this.current];
    }
    const page = super.update(searchQuery, this.selDictType);
    this.currPage = structuredClone(page);
    if (this.selDictType == "SL") {
      this.slEmbeds = this.embedList;
    } else if (this.selDictType == "GC") {
      this.gcEmbeds = this.embedList;
    }
    this.highlighted = 0;
    return page;
  }

  cacheResult() {
    if (this.selDictType === "SL") {
      this.slEmbeds = this.embedList;
    } else if (this.selDictType === "GC") {
      this.gcEmbeds = this.embedList;
    }
    return this;
  }
}

module.exports = DictEmbed;

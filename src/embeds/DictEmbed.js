const PaginationEmbed = require("./PaginationEmbed");

class DictEmbed extends PaginationEmbed {
  constructor(...args) {
    super(...args);
    this.slEmbeds = null;
    this.slCurr = 0;
    this.slLength = 0;
    this.gcEmbeds = null;
    this.gcCurr = 0;
    this.gcCurr = 0;
  }

  render() {
    console.log("rendrering in sub class");
    super.render();
    if (this.selDictType == "sl") {
      this.slEmbeds = this.embedList;
    } else if (this.selDictType == "gc") {
      this.gcEmbeds = this.embedList;
    }
    return this.embedList[0];
  }

  nextPage() {
    const page = super.nextPage();
    this.selDictType == "sl" ? (this.slCurr = this.current) : (this.gcCurr = this.current);
    console.log(this.current, this.slCurr, this.gcCurr);
    return page;
  }
  prevPage() {
    const page = super.prevPage();
    this.selDictType == "sl" ? (this.slCurr = this.current) : (this.gcCurr = this.current);
    console.log(this.current, this.slCurr, this.gcCurr);
    return page;
  }

  update(searchQuery) {
    if (searchQuery.selDictType == "sl" && this.slEmbeds !== null) {
      this.embedList = this.slEmbeds;
      this.current = this.slCurr;
      this.length = this.length;
      this.selDictType = "sl";
      console.log("in update, sending ", this.current);
      return this.embedList[this.current];
    } else if (searchQuery.selDictType == "gc" && this.gcEmbeds !== null) {
      this.embedList = this.gcEmbeds;
      this.current = this.gcCurr;
      this.length = this.length;
      this.selDictType = "gc";
      return this.embedList[this.current];
    }
    const page = super.update(searchQuery);
    if (this.selDictType == "sl") {
      this.slEmbeds = this.embedList;
    } else if (this.selDictType == "gc") {
      this.gcEmbeds = this.embedList;
    }
    return page;
  }
}

module.exports = DictEmbed;

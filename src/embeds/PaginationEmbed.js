class PaginationEmbed {
  embedList;
  length;
  current;

  constructor(embedList = [], dictType = "sl") {
    this.embedList = embedList;
    this.length = embedList.length;
    this.current = 0;
    this.selDictType = dictType;
  }

  addPages(embed) {
    if (Array.isArray(embed)) {
      this.embedList.forEach((page) => {
        this.embedList.push(page);
      });
      this.length += embed.length;
    } else {
      this.embedList.push(embed);
      this.length += 1;
    }
    return this;
  }

  nextPage() {
    if (this.current + 1 < this.length) {
      this.current += 1;
    } else {
      this.current = 0;
    }
    return this.embedList[this.current];
  }

  prevPage() {
    if (this.current - 1 > 0) {
      this.current -= 1;
    } else {
      this.current = this.length - 1;
    }
    return this.embedList[this.current];
  }

  render() {
    return this.embedList[0];
  }

  addFooters() {
    this.embedList.forEach((page, index) => {
      page.setFooter(`Page ${index + 1} of ${this.length}`);
    });
    return this;
  }

  update(searchQuery) {
    const paginate = searchQuery.resultToEmbed();
    this.embedList = paginate.embedList;
    this.current = paginate.current;
    this.length = paginate.length;
    this.selDictType = paginate.selDictType;
    return paginate.embedList[this.current];
  }
}

module.exports = PaginationEmbed;

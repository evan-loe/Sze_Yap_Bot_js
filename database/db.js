const fs = require('fs')
const db_folder_path = `${__dirname}/tables`
const { Conditions } = require('./conditions')

class DatabaseTable {

  constructor(filename, db_type='json') {
    this.filename = filename
    this.db_type = db_type
    this.defaults = {}
    this.columns = []
    this.data = {}
    this._load()
  }

  _load() {
    this.db_type == "json" ? this.load_json() : this.load_csv() 
  }

  load_csv() {
    // to implement
  }

  load_json() {
    const data = JSON.parse(fs.readFileSync(`${db_folder_path}/${this.filename}.json`, {encoding: 'utf-8'}))
    this.data = data["data"]
    this.columns = data["columns"]
    this.defaults = data["defaults"]
  }

  insert(key, values) {
    this.clean_values(values)
    this.fill_defaults(values)
    this.data[key] = this.columns.map((column) => values[column])
    this.commit()
  }

  batch_insert(keys_values) {
    keys_values.forEach(([key, values]) => {
      this.clean_values(values)
      this.fill_defaults(values)
      this.data[key] = this.columns.map((column) => values[column])
    })
    this.commit()
  }

  update(key, values) {
    this.clean_values(values)
    const updated = {
      ...this.data[key],
      ...values
    }
    this.insert(updated)
  }

  /**
   * 
   * @param {Object} key 
   * @param {String} condition 
   */
  select({where, condition, satisfies}) {
    return Object.entries(this.data).filter(([key, values]) => {
      const l_side = where == "id" ? key : values[this.columns.indexOf(where)]
      const r_sides = Array(satisfies)
      return r_sides.every((r_side) => Conditions.evaluate(l_side, r_side, condition))
    }).map(([key, values]) => {
      return {
        id: key,
        ...Object.fromEntries(this.columns.map((x, i) => [x, values[i]]))
      }
    })
  }

  select_n(n, { where, condition, satisfies }) {
    const records = this.select({where, condition, satisfies})
    if (records.length > 0) {
      if (n == 1)
        return records[0]
      records.splice(0, records.length < n ? records.length : n)
    }
    return records
  }

  clean_values(values) {
    Object
      .keys(values)
      .filter(key => !this.columns.includes(key))
      .forEach(Reflect.deleteProperty.bind(null, values))
  }

  fill_defaults(values) {
    Object.entries(this.defaults).forEach(([key, value]) => {
      if (key in values)
        return;
      values[key] = value
    })
  }

  commit() {
    fs.writeFileSync(`${db_folder_path}/${this.filename}.json`, JSON.stringify({
      defaults: this.defaults,
      columns: this.columns,
      data: this.data
    }))
  }
}


module.exports = {
  DatabaseTable
}
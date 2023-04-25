const fs = require('fs')
const db_folder_path = `${__dirname}/tables`

const default_table_format = {
  columns: [],
  data: []
}

class DatabaseTable {

  constructor(filename, db_type='json') {
    this.filename = filename
    this.db_type = db_type
    this.columns = []
    this.data = {}
  }

  load() {
    this.db_type == "json" ? this.load_json() : this.load_csv() 
  }

  load_csv() {
    // to implement
  }

  load_json() {
    const data = JSON.parse(fs.readFileSync(`${db_folder_path}/${this.filename}.json`, {encoding: 'utf-8'}))
    this.data = data["data"]
    this.columns = data["columns"]
  }

  insert(key, values) {
    this.clean_values(values)
    this.data[key] = this.columns.reduce((a, col) => ({...a, [col]: values[col]}), {})
    this.commit()
  }

  batch_insert(keys_values) {
    keys_values.forEach(([key, values]) => {
      this.clean_values(values)
      this.data[key] = this.columns.reduce((a, col) => ({...a, [col]: values[col]}), {})
    })
    this.commit()
  }

  update(key, values) {
    this.clean_values(values)
    this.data[key] = {
      ...this.data[key],
      ...values
    }
    this.commit()
  }

  clean_values(values) {
    Object
      .keys(values)
      .filter(key => !this.columns.includes(key))
      .forEach(Reflect.deleteProperty.bind(null, values))
  }

  commit() {
    fs.writeFileSync(`${db_folder_path}/${this.filename}.json`, JSON.stringify({
      columns: this.columns,
      data: this.data
    }))
  }
}


module.exports = {
  DatabaseTable
}
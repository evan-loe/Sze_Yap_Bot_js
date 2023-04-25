const spawn = require('child_process').spawn
const fetch = require('node-fetch')


function start_backend() {
  // console.log("Starting python server backend...")
  // const py = spawn(`${__dirname}/../pyenv/bin/python3`, [`${__dirname}/api.py`])
  // console.log(py)
  const py = "fake dafjsa"
  const dict_backend = new DictionaryBackend(py)
  return dict_backend
}

class DictionaryBackend {

  constructor(process, port=5001) {
    this.process = process
    this.port = port
  }

  async query() {

    const request_body = {
      query: "hallo there"
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001`, {
        method: 'POST',
        body: JSON.stringify(request_body),
        headers: {'Content-Type': 'application/json'},
      })
      const data = await response.json()
      console.log(data)
    } catch (err) {
      console.log(err)
    }
  }
}


module.exports = {
  start_backend
}
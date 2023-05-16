from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route("/")
def hello_world():
    return {"hi": 'dfjiadsj'}

@app.route("/", methods = ['POST'])
def query():
    return {"result": "here is it"}



if __name__ == "__main__":
    app.run(port=5001)

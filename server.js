// MODULES
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const fs = require('fs');

// DATABASE
const Database = require('better-sqlite3');
const db = new Database('./data/finaldb.db', {
  verbose: console.log
});

// LOAD FILES ON LAUNCH
let rawtokens = fs.readFileSync(__dirname + '/model/token_dictionary.json');
let word2index = JSON.parse(rawtokens);
let rawcategories = fs.readFileSync(__dirname + '/model/categories.json');
let categories = JSON.parse(rawcategories);
let loadedModel;

// CONFIGURATION
const app = express();
app.use(express.json());
app.use(express.static('client', {
  extensions: ['html']
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.listen(8080);

// ROUTES
app.get('/tagmodel', (req, res) => {
  loadedModel = "/tagmodel/";
  res.sendFile(__dirname + '/model/' + loadedModel + 'model.json');
})
app.get('/vecmodel', (req, res) => {
  loadedModel = "/vecmodel/";
  res.sendFile(__dirname + '/model/' + loadedModel + 'model.json');
})
app.get('/:filename.:ext', (req, res) => {

  res.sendFile(__dirname + '/model/' + loadedModel + req.params.filename + '.' + req.params.ext)
})

app.post('/tokenise', tokeniseText);
app.post('/categorise', getCategories);
app.post('/query', queryDatabase);

// FUNCTIONS
function getTokenisedWord(seedWord) {
  let _token;
  if (word2index[seedWord]) {
    _token = word2index[seedWord];
  } else {
    _token = 0;
  }
  return _token;
}

function tokeniseText(req, res) {
  let processedtext = req.body.inputtext;
  let tokenisedArray = [];
  if (processedtext.length >= 250) {
    for (var i = 0; i < 250; i++) {
      tokenisedArray.push(getTokenisedWord(processedtext[i]));
    }
  }
  if (processedtext.length < 250) {
    for (var i = 0; i < processedtext.length; i++) {
      tokenisedArray.push(getTokenisedWord(processedtext[i]));
    }
    for (var i = 0; i < 250 - processedtext.length; i++) {
      tokenisedArray.push(0);
    }
  }
  res.json(tokenisedArray);
}

function getCategory(index) {
  return categories[index];
}

function getCategories(req, res) {
  let array = req.body.prediction;
  console.log(categories.length);
  let cats = [];
  for (var i = 0; i < categories.length; i++) {
    if (array[i] > 0.5) {
      cats.push(getCategory(i));
    }
  }
  console.log(cats);
  res.json(cats);
}

function queryDatabase(req, res) {
  let cats = req.body.categories;
  let limit = req.body.limit;
  let clause = "";
  if (cats.length > 1) {
    for (var i = 0; i < cats.length - 1; i++) {
      clause += cats[i].replace("-", "_") + " AND ";
    }
  }
  clause += cats[cats.length - 1].replace("-", "_");
  console.log(clause);
  let sql = db.prepare(`SELECT papers.paperid, papers.title AS 'Title', papers.submitter AS 'Submitter', papers.update_date AS 'Date published', vectors.vector FROM papers INNER JOIN vectors on papers.paperid=vectors.paperid WHERE papers.paperid IN (SELECT paperid FROM 'paper-category-link' where ${clause}) LIMIT ${limit}`);
  res.json(sql.all())
}

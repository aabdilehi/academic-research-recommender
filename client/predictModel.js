'use strict';


let vecmodel;
let tagmodel;
let tokenisedQuery;
let result;
let keys;
let keywords = [];
let pageNo = 1;
let itemsPerPage = 10;

let tokenisedArray;
let predcategories;
let query;

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}


async function tokeniseText(text) {
  let processedtext = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .toLowerCase()
    .split(" ");
  console.log("done processing");
  let url = 'http://localhost:8080/tokenise';
  await postData(url, {
      inputtext: processedtext
    })
    .then(async function(data) {
      console.log(data);
      tokenisedArray = data;
      //  await predict(data);
    });
}

async function predict(data) {
  let tensor = tf.tensor(data).expandDims()
  const prediction = tagmodel.predict(tensor).dataSync();
  let url = 'http://localhost:8080/categorise';
  await postData(url, {
      prediction: prediction
    })
    .then(data => {
      console.log(data);
      //queryDatabase(data);
      predcategories = data;
    })
    .catch(err => {
      console.log(err)
    });
}

async function queryDatabase(array) {
  let sliderValue = document.querySelector("#results-limit").value;
  let url = 'http://localhost:8080/query'
  await postData(url, {
      categories: array,
      limit: sliderValue
    })
    .then(data => {
      console.log(data);
      result = data;
    })
    .catch(err => {
      console.log(err)
    });
  // Counts number of keys in JSON object and generates that many columns
  keys = Object.keys(result[0]);
  //generateTables(keys, result);
}

async function makePrediction() {
  document.querySelector('#category-error').style.display = "none";
  document.body.style.cursor = "wait";
  previousColumnSort = null;
  let form = document.querySelector('.form');
  let formData = new FormData(form);
  let text = formData.get('inputtext');
  await tokeniseText(text);
  await predict(tokenisedArray);
  if (predcategories.length > 0) {
    await queryDatabase(predcategories);
    generateTables(keys, result);
    document.body.style.cursor = "auto";
    document.querySelector('#page-select-buttons').style.display = "block";
  }
  else {
    document.querySelector('#resultstable').remove();
    document.querySelector('#category-error').style.display = "block";
    window.location.href = "#category-error";
  }
}

window.addEventListener("load", async function() {
  let url = 'http://localhost:8080/tagmodel';
  tagmodel = await tf.loadLayersModel(url);


  url = 'http://localhost:8080/vecmodel';
  vecmodel = await tf.loadLayersModel(url);

  document.querySelector('#processtext').addEventListener("click", makePrediction);
})

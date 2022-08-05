function generateTables(keys, result) {
  if (!previousColumnSort) {
    calculateSimilarity();
    result = result.sort(dynamicSort('similarity', -1));
    keys.pop();
    keys.push("similarity");
  }
  if (document.querySelector('#resultstable')) {
    document.querySelector('#resultstable').remove();
  }
  let table = document.createElement("table");
  table.id = "resultstable";
  let row = document.createElement("tr");
  table.appendChild(row);
  for (var i = 1; i < keys.length; i++) {
    let column = document.createElement("td");
    column.textContent = keys[i];
    column.classList.add("results-table-header");
    column.addEventListener("click", sortTableBy);
    row.appendChild(column);
  }
  console.log(keys);
  for (var i = (pageNo * itemsPerPage) - itemsPerPage; i < pageNo * itemsPerPage; i++) {
    if (!result[i]) {
      break;
    }
    let row = document.createElement("tr");
    table.appendChild(row);
    for (var j = 1; j < keys.length; j++) {
      let column = document.createElement("td");
      let link = document.createElement("a");
      switch (j) {
        case 1:
          link.href = "https://arxiv.org/abs/" + result[i][keys[0]];
          link.target = "_blank";
          link.textContent = result[i][keys[j]];
          column.appendChild(link);
          row.appendChild(column);
          break;
        case 2:
          let name = result[i][keys[j]].replace(/[\/#!$%\^&\*;:{}=\_`~()\\]/g, "");
          let nameURL = name.replace(/[,]/g, "%2")
            .replace(" ", "+");
          link.href = "https://arxiv.org/search/?searchtype=author&query=" + nameURL;
          link.target = "_blank";
          link.textContent = name;
          column.appendChild(link);
          row.appendChild(column);
          break;
        case 3:
          column.textContent = result[i][keys[j]];
          row.appendChild(column);
          break;
        case 4:
          column.textContent = (result[i][keys[j]] * 100).toFixed(1) + "%";
          row.appendChild(column);
          break;
      }
    }
  }
  document.querySelector('#results-table-section').insertBefore(table, document.querySelector('#page-select-buttons'));
  document.location.href = "#resultstable";
}

function sortTableBy(event) {
  let column = event.target.textContent;
  let direction = (column == previousColumnSort) ? currentDirection * -1 : 1;
  console.log(currentDirection);
  result = result.sort(dynamicSort(column, direction));
  generateTables(keys, result);
}

let previousColumnSort;
let currentDirection;

function dynamicSort(property, direction) {
  currentDirection = direction;
  previousColumnSort = property;
  return function(a, b) {
    let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * direction;
  }
}

window.addEventListener("load", function() {
var slider = document.getElementById("results-limit");
var output = document.getElementById("results-limit-value");

output.innerHTML = slider.value;

if(slider.value = 10000) {
output.innerHTML = "10000 (Default)"
}

slider.oninput = function() {
 output.innerHTML = this.value;
}
  document.querySelector('#lastPage').addEventListener("click", function() {
    if (result[(pageNo - 1) * itemsPerPage]) {
      pageNo -= 1;
      generateTables(keys, result);
    }
  })
  document.querySelector('#nextPage').addEventListener("click", function() {
    if (result[(pageNo + 1) * itemsPerPage]) {
      pageNo += 1;
      generateTables(keys, result);
    }
  })
})

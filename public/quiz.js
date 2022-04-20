// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.\

const db = firebase.firestore();

$( document ).ready(function() {
  var country_capital_pairs = pairs
});

var pairs = [];
var randomNumber;
var country;
var capital;

function csvToArray(str, delimiter = ",") {
  const headers = str.slice(0, str.indexOf("\n") - 1).split(delimiter);
  const rows = str.trim().slice(str.indexOf("\n") + 1).split("\r\n");

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });
  return arr;
}

fetch('https://development-korea-seoul.s3.ap-northeast-2.amazonaws.com/country_capital_pairs.csv')
    .then(response => response.text())
    .then(data => {
      window.pairs = csvToArray(data.trim());
      randomNumber = Math.floor(Math.random() * 171);
      country = document.getElementById("quiz-question").innerText = pairs[randomNumber].country;
      capital = pairs[randomNumber].capital;
    });

db.collection("quizzes").orderBy("time", "asc").get().then((quesrySnapshot) => {
  quesrySnapshot.forEach((doc) => {
    insert_data(doc.data(), doc.id);
  })
})

function insert_data(data, _id) {
  var row = document.getElementById("quiz-table").insertRow(4);
  var cell1 = row.insertCell(0),
      cell2 = row.insertCell(1),
      cell3 = row.insertCell(2);
  if (data.answer === data.capital) {
    row.className = "correctEntry";
    row.id = _id;
    cell1.innerText = data.country;
    cell2.innerText = data.answer;
    cell3.innerHTML = "<div><i class=\"fas fa-check\"></i><button class='delete' onclick='delete_row(this.parentNode.parentNode.parentNode)'>Delete</button</div>";
  } else {
    row.className = "incorrectEntry";
    row.id = _id;
    cell1.innerText = data.country;
    cell2.innerHTML = "<del>" + data.answer + "</del>";
    cell3.innerHTML = "<div>" + data.capital + "<button class='delete' onclick='delete_row(this.parentNode.parentNode.parentNode)'>Delete</button></div>";
  }
}

function handleClick_submit() {
  var answer = document.getElementById("quiz-answer").value;
  var _id;
  db.collection("quizzes").add({
    answer: answer,
    capital: capital,
    country: country,
    time: new Date()
  }).then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    _id = docRef.id;
  }).catch((error) => {
    console.error("Error adding document: ", error);
  });

  var row = document.getElementById("quiz-table").insertRow(4);
  var cell1 = row.insertCell(0),
      cell2 = row.insertCell(1),
      cell3 = row.insertCell(2);
  if (answer === capital) {
    row.className = "correctEntry";
    row.id = _id;
    cell1.innerText = country;
    cell2.innerText = answer;
    cell3.innerHTML = "<div><i class=\"fas fa-check\"></i><button class='delete' onclick='delete_row(this.parentNode.parentNode.parentNode)'>Delete</button</div>";
    if (document.getElementById("wrong-only").checked === true) {
      document.getElementById("all").checked = true;
      handleClick_type('all');
    }
  } else {
    row.className = "incorrectEntry";
    row.id = _id;
    cell1.innerText = country;
    cell2.innerHTML = "<del>" + answer + "</del>";
    cell3.innerHTML = "<div>" + capital + "<button class='delete' onclick='delete_row(this.parentNode.parentNode.parentNode)'>Delete</button></div>";
    if (document.getElementById("correct-only").checked === true) {
      document.getElementById("all").checked = true;
      handleClick_type('all');
    }
  }

  randomNumber = Math.floor(Math.random() * 171);
  country = document.getElementById("quiz-question").innerText = pairs[randomNumber].country;
  capital = pairs[randomNumber].capital;
  document.getElementById("quiz-answer").value = '';
  document.getElementById("quiz-answer").focus();
}

function handleClick_type(type) {
  var correct = document.getElementsByClassName('correctEntry');
  var incorrect = document.getElementsByClassName('incorrectEntry');
  if (type === 'all') {
    for (let i = 0; i < correct.length; i++) {
      correct[i].style.display = '';
    }
    for (let i = 0; i < incorrect.length; i++) {
      incorrect[i].style.display = '';
    }
  } else if (type === 'correct-only') {
    for (let i = 0; i < correct.length; i++) {
      correct[i].style.display = '';
    }
    for (let i = 0; i < incorrect.length; i++) {
      incorrect[i].style.display = 'none';
    }
  } else if (type === 'wrong-only') {
    for (let i = 0; i < correct.length; i++) {
      correct[i].style.display = 'none';
    }
    for (let i = 0; i < incorrect.length; i++) {
      incorrect[i].style.display = '';
    }
  }
}

function delete_row(row) {
  db.collection("quizzes").doc(row.id).delete().then(() => {
    console.log("Document successfully deleted!");
  }).catch((error) => {
    console.error("Error removing document: ", error);
  });
  document.getElementById("quiz-table").deleteRow(row.rowIndex);
}

function handleClick_clear() {
  db.collection("quizzes").orderBy("time", "asc").get().then((quesrySnapshot) => {
    quesrySnapshot.forEach((doc) => {
      db.collection("quizzes").doc(doc.id).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
    })
  })
  for (var i = document.getElementById("quiz-table").rows.length - 1; i >= 4; i--) {
    document.getElementById("quiz-table").deleteRow(i);
  }
}


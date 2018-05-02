var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
});

function afterConnection() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "user-function",
        message: "How can I help you today?",
        choices: [
          {
            name: "View Products Sales by Department",
            value: "view-products"
          },
          {
            name: "Add a Department",
            value: "view-low-inventory"
          },
          {
            name: "Exit",
            value: "exit"
          }
        ]
      }
    ])
    .then(answers => {
      if (answers["user-function"] === "view-products") {
        viewProducts();
      } else if (answers["user-function"] === "view-low-inventory") {
        viewLowInventory();
      } else if (answers["user-function"] === "exit") {
        process.exit();
      }
    });
}

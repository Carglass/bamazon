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
            name: "View Products for Sale",
            value: "view-products"
          },
          {
            name: "View Low Inventory",
            value: "view-low-inventory"
          },
          {
            name: "Add to Inventory",
            value: "restock-products"
          },
          {
            name: "Add New Product",
            value: "add-new-product"
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
      } else if (answers["user-function"] === "restock-products") {
        restockProducts();
      } else if (answers["user-function"] === "add-new-product") {
        addNewProduct();
      } else if (answers["user-function"] === "exit") {
        exit();
      }
    });
}

function viewProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for ({ item_id, product_name, price, stock_quantity } of res) {
      console.log(`item ${item_id}: ${product_name}`);
      console.log(`Price: $${price}`);
      console.log(`Stock: ${stock_quantity}`);
      console.log("-----------------------------------");
    }
  });
}

function viewLowInventory() {}

function restockProducts() {}

function addNewProduct() {}

function exit() {}

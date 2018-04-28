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
            value: "restock-product"
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
      } else if (answers["user-function"] === "restock-product") {
        restockProduct();
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
  afterConnection();
}

function viewLowInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("low stock items:");
    for ({ item_id, product_name, price, stock_quantity } of res) {
      if (stock_quantity <= 5) {
        console.log(`item ${item_id}: ${product_name}`);
        console.log(`Price: $${price}`);
        console.log(`Stock: ${stock_quantity}`);
        console.log("-----------------------------------");
      }
    }
    console.log("*******************************");
  });
  afterConnection();
}

function restockProduct() {
  connection.query(
    "SELECT item_id, product_name, stock_quantity FROM products",
    function(err, res) {
      if (err) throw err;
      let choicesPreparation = [];
      for ({ item_id, product_name, stock_quantity } of res) {
        choicesPreparation.push({
          name: `${product_name} (${stock_quantity} remaining)`,
          value: item_id
        });
      }
      let productChoiceQuestion = {
        type: "list",
        name: "item-to-restock",
        message: "Which product do you want to restock?",
        choices: choicesPreparation
      };
      let uiQuestions = [
        productChoiceQuestion,
        {
          name: "restock-quantity",
          message: "How many?"
        }
      ];
      inquirer.prompt(uiQuestions).then(answers => {
        connection.query(
          "SELECT stock_quantity FROM products WHERE ?",
          { item_id: answers["item-to-restock"] },
          function(err, res) {
            if (err) throw err;
            console.log(res);
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity:
                    parseInt(answers["restock-quantity"]) +
                    res[0]["stock_quantity"]
                },
                {
                  item_id: answers["item-to-restock"]
                }
              ],
              function() {
                console.log("done");
              }
            );
          }
        );
      });
    }
  );
}

function addNewProduct() {}

function exit() {}

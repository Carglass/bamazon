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
        process.exit();
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
              function() {}
            );
          }
        );
      });
    }
  );
}

function addNewProduct() {
  inquirer
    .prompt([
      {
        name: "product_name",
        message: "What is the new product?"
      },
      {
        name: "department_name",
        message: "In which department will it be available?"
        // TODO update with a list from the departments table in the end?
      },
      {
        name: "price",
        message: "What is the price of this product?"
      },
      {
        name: "stock_quantity",
        message: "How many are there in the first batch?"
      }
    ])
    .then(answers => {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answers.product_name,
          department_name: answers.department_name,
          price: parseFloat(answers.price),
          stock_quantity: parseInt(answers.stock_quantity)
        },
        function(err) {
          if (err) throw err;
          console.log("done");
        }
      );
      console.log(answers);
    });
}

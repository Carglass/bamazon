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
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for ({ item_id, product_name, price } of res) {
      console.log(`item ${item_id}: ${product_name}`);
      console.log(`Price: $${price}`);
    }
    getClientOrder();
  });
}

function getClientOrder() {
  inquirer
    .prompt([
      {
        name: "item",
        message: "Which item do you want to order? We need the id!"
      },
      { name: "quantity", message: "How many?" }
    ])
    .then(answers => {
      // Use user feedback for... whatever!!
      console.log(answers);
      connection.query(
        "SELECT item_id, stock_quantity FROM products WHERE item_id = " +
          answers.item,
        function(err, res) {
          if (err) throw err;
          for ({ item_id, stock_quantity } of res) {
            console.log(`item ${item_id}: ${stock_quantity}`);
          }
        }
      );
    });
}

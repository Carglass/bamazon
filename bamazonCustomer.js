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
        "SELECT item_id, stock_quantity, price, product_sales FROM products WHERE item_id = " +
          answers.item,
        function(err, res) {
          if (err) throw err;
          for ({ item_id, stock_quantity, price, product_sales } of res) {
            console.log(`item ${item_id}: ${stock_quantity}`);
            if (answers.quantity <= stock_quantity) {
              connection.query(
                `UPDATE products SET ? WHERE ?;`,
                [
                  {
                    stock_quantity: stock_quantity - answers.quantity,
                    product_sales: product_sales + answers.quantity * price
                  },
                  { item_id: item_id }
                ],
                function() {
                  console.log(`It cost you $${answers.quantity * price}`);
                }
              );
            } else {
              console.log("Unsufficient stock!");
            }
          }
        }
      );
    });
}

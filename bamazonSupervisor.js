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
            value: "view-products-sales-by-dpt"
          },
          {
            name: "Add a Department",
            value: "add-department"
          },
          {
            name: "Exit",
            value: "exit"
          }
        ]
      }
    ])
    .then(answers => {
      if (answers["user-function"] === "view-products-sales-by-dpt") {
        viewProductsSalesByDepartment();
      } else if (answers["user-function"] === "add-department") {
        createDepartment();
      } else if (answers["user-function"] === "exit") {
        process.exit();
      }
    });
}

function viewProductsSalesByDepartment() {
  connection.query(
    "SELECT departments.department_id, departments.department_name, SUM(products.product_sales) AS product_Sales, departments.over_head_costs FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_name ORDER BY department_id;",
    function(err, res) {
      if (err) throw err;
      console.log(res);
    }
  );
  afterConnection();
}

function createDepartment() {
  console.log("create a department");
  afterConnection();
}

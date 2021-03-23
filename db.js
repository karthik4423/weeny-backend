var mariadb = require("mariadb");

// create a new connection pool
console.log("gonna create conn pool");
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
});

// expose the ability to create new connections
module.exports = {
  getConnection: function () {
    return new Promise(function (resolve, reject) {
      pool
        .getConnection()
        .then(function (connection) {
          //console.log(connection);
          resolve(connection);
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  },
};

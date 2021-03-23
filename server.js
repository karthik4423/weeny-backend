const express = require("express");
const randomString = require("randomstring");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const pool = require("./db");

const app = express();
app.use(bodyParser.json());

var corsOptions = {
  origin: ["http://localhost:8000"],
};
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors(corsOptions));

app.listen(8000, () => {
  console.log("App is listening at port 8000");
});

// app.get("/", (req, res) => {
//   console.log("in hi");
//   res.send("hi");
// });

app.post("/addlink", async (req, res) => {
  var longURL = req.body.longURL;
  var slug = req.body.slug;
  if (slug.length == 0) {
    slug = randomString.generate(6);
  }

  try {
    // establish a connection to MariaDB
    conn = await pool.getConnection();

    // create a new query
    addQuery = `insert into links (longURL,slug,createdAt) values("${longURL}","${slug}",NOW())`;
    await conn.query(addQuery);

    retrieveQuery = `select * from links where slug="${slug}"`;
    result = await conn.query(retrieveQuery);
    console.log(result[0]);
    res.json(result[0]);
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) return conn.release();
  }
});

findLongURL = async (slug) => {
  try {
    conn = await pool.getConnection();
    result = await conn.query(
      `select longUrl from links where slug = "${slug}"`
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
  if (result.length == 1) {
    return result[0].longUrl;
  } else {
    return 0;
  }
};

app.get("/:slug", async (req, res) => {
  redirectURL = await findLongURL(req.params.slug);

  if (!redirectURL) {
    return res.sendStatus(404);
  }
  return res.redirect(redirectURL);
});

isRepeatSlug = async (slug) => {
  try {
    conn = await pool.getConnection();
    result = await conn.query(
      `select longUrl from links where slug = "${slug}"`
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
  if (result.length == 0) {
    return 0;
  } else {
    return 1;
  }
};

app.get("/slug/:slug", async (req, res) => {
  slugExists = await isRepeatSlug(req.params.slug);
  res.json({ slug: slugExists });
});

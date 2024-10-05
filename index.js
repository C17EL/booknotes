import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { configDotenv } from "dotenv";
import pg from "pg";

const app = express();



const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booknotes",
    password: "E.lov2938",
    port: 5432,
  });
  db.connect();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
const result = await db.query("SELECT * FROM books");
res.render("index", { listItems: result.rows });
});

app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", async (req, res) => {
    const { title, author, isbn, notes } = req.body;

    const cleanIsbn = isbn.replace(/[^0-9X]/gi, ''); // Remove dashes, spaces, etc.
const coverUrl = `http://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;


    await db.query("INSERT INTO books (title, author, isbn, cover_url, notes) VALUES ($1, $2, $3, $4, $5)", [title, author, isbn, coverUrl, notes]);
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
    const id = req.body.deleteItemId;
    try {
      await db.query("DELETE FROM books WHERE id = $1", [id]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });


app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
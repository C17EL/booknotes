import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { configDotenv } from "dotenv";
import pg from "pg";

const app = express();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: PG_PORT,
  });
db.connect();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", async (req, res) => {
  try {
    
      const booksResult = await db.query("SELECT * FROM books");
      const booksToReadResult = await db.query("SELECT * FROM books_to_read");

     

      
      res.render("index", {
          listItems: booksResult.rows,
          booksToRead: booksToReadResult.rows 
      });
  } catch (err) {
      console.error("Error fetching books:", err);
      res.status(500).send("Internal Server Error");
  }
});


app.get("/add", (req, res) => {
   
    res.render("add");
});

app.get("/add-book", (req, res) => {

    res.render("add-book");
});

app.post("/add", async (req, res) => {
    const { title, author, isbn, notes } = req.body;
    const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`; // Construct cover URL


 
    await db.query("INSERT INTO books (title, author, cover_url, notes) VALUES ($1, $2, $3, $4)", [title, author, cover_url, notes]);

    res.redirect("/"); 
});

app.post("/add-book", async (req, res) => {
  const { title, author, isbn, notes } = req.body;
  const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`; // Construct cover URL


 
  await db.query("INSERT INTO books_to_read (title, author, cover_url, notes) VALUES ($1, $2, $3, $4)", [title, author, cover_url, notes]);

  res.redirect("/"); 
});


app.post("/delete", async (req, res) => {
    const id = req.body.deleteItemId;

    try {
        await db.query("DELETE FROM books WHERE id = $1", [id]);
        res.redirect("/"); 
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/delete-book-to-read", async (req, res) => {
    const id = req.body.deleteItemId;

   
    if (!id) {
        console.error("No id provided in the request.");
        return res.status(400).send("Bad Request: No id provided");
    }

    try {
        const result = await db.query("DELETE FROM books_to_read WHERE id = $1", [id]);

       
        console.log("Delete query result:", result);

        if (result.rowCount === 0) {
            console.error("No book found with the provided id.");
            return res.status(404).send("Not Found: No book with this id");
        }

        res.redirect("/"); 
    } catch (err) {
        console.error("Error deleting book from books_to_read:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

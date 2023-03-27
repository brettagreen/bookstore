process.env.NODE_ENV = 'test';

const request = require("supertest");

const app = require("./app");
const db = require("./db");
const Book = require("./models/book");

let b1;
let b2;

beforeAll(async function () {
    await db.query("DELETE FROM books");

    b1 = await Book.create({
        isbn: "987654321",
        amazon_url: "http://a.co/bigbook",
        author: "Jackson Apollo",
        language: "english",
        pages: 146,
        publisher: "Random House",
        title: "How to fight and win",
        year: 2023
      });

    b2 = await Book.create({
        isbn: "123456789",
        amazon_url: "http://a.co/xyz",
        author: "David Hume",
        language: "english",
        pages: 350,
        publisher: "None",
        title: "A Treatise on Human Nature",
        year: 1748
      });
});

describe("POST /books", function () {
    test("create new book, return result", async function () {
      const response = await request(app)
        .post("/books").send({
          isbn: "999999999",
          amazon_url: "http://a.co/myNewBook",
          author: "Brett Green",
          language: "english",
          pages: 99,
          publisher: "Independent",
          title: "Brett's first big book",
          year: 2022
        });
    
      expect(response.body).toEqual({
        book: 
        {
            isbn: "999999999",
            amazon_url: "http://a.co/myNewBook",
            author: "Brett Green",
            language: "english",
            pages: 99,
            publisher: "Independent",
            title: "Brett's first big book",
            year: 2022
          }
      });
    });

    test('create new book, but received data does not conform to json schema', async function() {
        const response = await request(app)
            .post('/books').send({
                isbn: 9,
                title: "my first book",
                genre: "pornography"
            });
        expect(response.statusCode).toEqual(400);

        //full error message will respond with list of every property that was left out of the new book request
        expect(response.body.message[0]).toEqual(expect.stringContaining("instance requires property"));
    });
});

describe('GET /books', function() {
    test('retrieve all books in database', async function() {
        const response = await request(app).get('/books');
        console.log(response.body);
        expect(response.body).toEqual({
            books: [
              {
                isbn: '123456789',
                amazon_url: 'http://a.co/xyz',
                author: 'David Hume',
                language: 'english',
                pages: 350,
                publisher: 'None',
                title: 'A Treatise on Human Nature',
                year: 1748
              },
              {
                isbn: '999999999',
                amazon_url: 'http://a.co/myNewBook',
                author: 'Brett Green',
                language: 'english',
                pages: 99,
                publisher: 'Independent',
                title: "Brett's first big book",
                year: 2022
              },
              {
                isbn: '987654321',
                amazon_url: 'http://a.co/bigbook',
                author: 'Jackson Apollo',
                language: 'english',
                pages: 146,
                publisher: 'Random House',
                title: 'How to fight and win',
                year: 2023
              }
            ]
          });
    });
});

describe('DELETE /books/:isbn', function() {
    test('delete a book and return the result', async function() {
        let response = await request(app).delete(`/books/${b1.isbn}`);
        expect(response.body).toEqual({
            "message": "Book deleted"
        });

    });
});

describe('GET /books/:isbn', function() {
    test('get specific book details from its isbn', async function() {
        const response = await request(app).get(`/books/${b2.isbn}`);
        expect(response.body).toEqual({
            book: {
                isbn: "123456789",
                amazon_url: "http://a.co/xyz",
                author: "David Hume",
                language: "english",
                pages: 350,
                publisher: "None",
                title: "A Treatise on Human Nature",
                year: 1748
              }
        });
    });
});

describe('PUT /books/:isbn', function() {
    test('update an existing book in the database with new info', async function() {
        const response = await request(app).put(`/books/${b2.isbn}`).send({
            isbn: "123456789",
            year: 1739
        });
        expect(response.body).toEqual({
            book: {
                isbn: "123456789",
                amazon_url: "http://a.co/xyz",
                author: "David Hume",
                language: "english",
                pages: 350,
                publisher: "None",
                title: "A Treatise on Human Nature",
                year: 1739
              }
        });
    });
});

afterAll(async function () {
    await db.end();
});

    
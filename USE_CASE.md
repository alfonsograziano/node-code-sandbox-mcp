# 📆 Use Cases Appendix

This document contains practical use cases to unlock the full power of the Node.js Sandbox MCP server. You can dynamically install any npm packages during execution, save files, and run completely isolated experiments in fresh Docker containers.

All the listed use cases have been tested.
If you find a use case you'd like to support but that doesn't currently work, please open an issue.
Or, if you want to add your own cool use case, feel free to open a Pull Request!

---

### Generate a QR Code

Create and run a JS script that generates a QR code for the URL `https://nodejs.org/en`, and save it as `qrcode.png`.

**Tip:** Use the `qrcode` package.

---

### Test Regular Expressions

Create and run a JavaScript script that defines a complex regular expression to match valid mathematical expressions containing nested parentheses (e.g., ((2+3)_(4-5))), allowing numbers, +, -, _, / operators, and properly nested parentheses.

Requirements:

- The regular expression must handle deep nesting (e.g., up - to 3-4 levels).
- Write at least 10 unit tests covering correct and - incorrect cases.
- Use assert or manually throw errors if the validation fails.
- Add a short comment explaining the structure of the regex.

---

### Create CSV files with random data

Create and execute a js script which generates 200 items in a csv. The CSV has full name, random number and random (but valid) email. Write it in a file called "fake_data.csv"

---

### Scrape a Webpage Title

Create and run a JS script that fetches `https://example.com`, saves the html file in "example.html", extracts the `<title>` tag, and shows it in the console.

**Tip:** Use `cheerio`.

---

### Create a PDF Report

Create a JavaScript script with Node.js that generates a PDF file containing a fun "Getting Started with JavaScript" tutorial for a 10-year-old kid.

The tutorial should be simple, playful, and colorful, explaining basic concepts like console.log(), variables, and how to write your first small program.
Save the PDF as getting-started-javascript.pdf with fs

Tip: Use `pdf-lib` or `pdfkit` for creating the PDF.

---

### Fetch an API and Save to JSON

Create and run a JS script that fetches data from the GitHub Node.js repo (`https://api.github.com/repos/nodejs/node`) and saves part of the response to `nodejs_info.json`.

---

### Markdown to HTML Converter

Write a JavaScript script that takes a Markdown string, converts it into HTML, and saves the result into a file named content_converted.html.

Use the following example Markdown string:

```markdown
# Welcome to My Page

This is a simple page created from **Markdown**!

- Learn JavaScript
- Learn Markdown
- Build Cool Stuff 🚀
```

Tip: Use a library like `marked` to perform the conversion.

---

### Generate Random Data

Create a JS script that generates a list of 100 fake users with names, emails, and addresses, then saves them to a JSON file called "fake_users.json".

**Tip:** Use `@faker-js/faker`.

---

### Evaluate a complex math expression

Create a JS script that evaluates this expression `((5 + 8) * (15 / 3) - (9 - (4 * 6)) + (10 / (2 + 6))) ^ 2 + sqrt(64) - factorial(6) + (24 / (5 + 7 * (3 ^ 2))) + log(1000) * sin(30 * pi / 180) - cos(60 * pi / 180) + tan(45 * pi / 180) + (4 ^ 3 - 2 ^ (5 - 2)) * (sqrt(81) / 9)`. Tip: use math.js

---

### Take a Screenshot with Playwright

Create and run a JS script that launches a Chromium browser, navigates to `https://example.com`, and takes a screenshot saved as `screenshot_test.png`.

**Tip:** Use the official Playwright Docker image (mcr.microsoft.com/playwright) and install the playwright npm package dynamically.

---

### Generate a chart

Write a JavaScript script that generates a bar chart using chartjs-node-canvas.
The chart should show Monthly Revenue Growth for the first 6 months of the year.
Use the following data:

-January: $12,000
-February: $15,500
-March: $14,200
-April: $18,300
-May: $21,000
-June: $24,500

Add the following details:

-Title: "Monthly Revenue Growth (2025)"
-X-axis label: "Month"
-Y-axis label: "Revenue (USD)"
-Save the resulting chart as chart.png.

---

### Summarize a Long Article

Fetch the content of https://en.wikipedia.org/wiki/Node.js, strip HTML tags, and send the plain text to the AI. Ask it to return a bullet-point summary of the most important sections in less than 300 words.

---

### Refactor and Optimize a JS Function

Here's an unoptimized JavaScript function:

```javascript
function getUniqueValues(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let exists = false;
    for (let j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      result.push(arr[i]);
    }
  }
  return result;
}
```

Please refactor and optimize this function for performance and readability.
Then, write and run basic tests with the Node.js test runner to make sure it works (covering common and edge cases).
As soon as all tests pass, return only the refactored function.

---

Here’s a complete and clear prompt that includes the schema and instructions for the AI:

---

### Create a Mock Book API from a JSON Schema

Here is a JSON Schema describing a `Book` entity:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Book",
  "type": "object",
  "required": ["title", "author", "isbn"],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "author": {
      "type": "string",
      "minLength": 1
    },
    "isbn": {
      "type": "string",
      "pattern": "^(97(8|9))?\\d{9}(\\d|X)$"
    },
    "publishedYear": {
      "type": "integer",
      "minimum": 0,
      "maximum": 2100
    },
    "genres": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "available": {
      "type": "boolean",
      "default": true
    }
  },
  "additionalProperties": false
}
```

Using this schema:

1. Generate **mock data** for at least 5 different books.
2. Create a simple **Node.js REST API** (you can use Express or Fastify) that:
   - Serves a `GET /books` endpoint on **port 5007**, which returns all mock books.
   - Serves a `GET /books/:isbn` endpoint that returns a single book matching the provided ISBN (or a 404 if not found).
3. Run the server and print a message like:  
   `"Mock Book API is running on http://localhost:5007"`

---

### Files manipulation on the fly

**Prerequisites**: Create in your mounted folder a file called "books.json" with this content:

```json
[
  { "id": 1, "title": "The Silent Code", "author": "Jane Doe" },
  { "id": 2, "title": "Refactoring Legacy", "author": "John Smith" },
  { "id": 3, "title": "Async in Action", "author": "Jane Doe" },
  { "id": 4, "title": "The Pragmatic Stack", "author": "Emily Ray" },
  { "id": 5, "title": "Systems Unboxed", "author": "Mark Lee" }
]
```

Then run this prompt:

Run a JS script to read the file "books.json", filter all the books of the author "Jane Doe" and save the result in "books_filtered.json"

To read and write from files, you always need to use the "files" directory which is exposed on the host machine.

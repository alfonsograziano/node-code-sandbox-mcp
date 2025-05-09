export const categories = {
  FILE_GENERATION: '📄 File Generation',
  IMAGES: '🖼️ Images',
  DEVELOPMENT: '💻 Development',
  TESTING: '🧪 Testing',
  DATA: '📊 Data',
  WEB: '🌐 Web',
  SCRAPING: '🕷️ Scraping',
  EDUCATION: '🎓 Education',
  API: '🔌 API',
  CONVERSION: '🔄 Conversion',
  DATA_VISUALIZATION: '📈 Data Visualization',
  AI: '🤖 AI',
  MATH: '➗ Math',
  FILE_PROCESSING: '📄 File Processing',
} as const;

export type CategoryKey = keyof typeof categories;
export interface UseCase {
  id: number;
  title: string;
  description: string;
  category: string[];
  prompt: string;
  result: string;
  prerequisites?: string;
}

export const useCases: UseCase[] = [
  {
    id: 1,
    title: 'Generate a QR Code',
    description: 'Create a QR code from a URL and save it as an image file.',
    category: [categories.FILE_GENERATION, categories.IMAGES],
    prompt: `Create a Node.js script that installs the 'qrcode' package, generates a QR code for the URL "https://nodejs.org/en", and saves it to a file named "qrcode.png".`,
    result:
      'An image file "qrcode.png" will be generated in the output folder, containing the QR code.',
  },
  {
    id: 2,
    title: 'Test Regular Expressions',
    description:
      'Create and test a complex regular expression with unit tests.',
    category: [categories.DEVELOPMENT, categories.TESTING],
    prompt: `Create a Node.js script that defines a complex regular expression to match valid mathematical expressions with nested parentheses (e.g. ((2+3)_(4-5))). The regex should support +, -, _, /, numbers, and nesting up to 4 levels. Write at least 10 unit tests, throwing errors if validation fails. Comment the regex logic.`,
    result:
      'Console output confirming all regex test cases passed and regex logic validated.',
  },
  {
    id: 3,
    title: 'Create CSV with Random Data',
    description: 'Generate a CSV file with random names, numbers, and emails.',
    category: [categories.FILE_GENERATION, categories.DATA],
    prompt:
      'Create and execute a js script which generates 200 items in a csv. The CSV has full name, random number and random (but valid) email. Write it in a file called "fake_data.csv"',
    result:
      'A CSV file "fake_data.csv" with 200 rows of randomized data will appear in the output.',
  },
  {
    id: 4,
    title: 'Scrape a Webpage Title',
    description: 'Fetch a webpage, save HTML, and extract the title.',
    category: [categories.WEB, categories.SCRAPING],
    prompt: `Use Node.js with the "cheerio" package to fetch https://example.com, save the HTML to "example.html", and extract the content of the <title> tag. Log it to the console.`,
    result:
      'A file "example.html" will be saved and the page title will be printed to the console.',
  },
  {
    id: 5,
    title: 'Create a PDF Report',
    description: 'Generate a playful JavaScript tutorial for kids as a PDF.',
    category: [categories.FILE_GENERATION, categories.EDUCATION],
    prompt:
      'Create a JavaScript script with Node.js that generates a PDF file containing a fun "Getting Started with JavaScript" tutorial for a 10-year-old kid.\n\nThe tutorial should be simple, playful, and colorful, explaining basic concepts like console.log(), variables, and how to write your first small program.\nSave the PDF as getting-started-javascript.pdf with fs\n\nTip: Use `pdf-lib` or `pdfkit` for creating the PDF.',
    result:
      'A child-friendly PDF tutorial named "getting-started-javascript.pdf" will be created.',
  },
  {
    id: 6,
    title: 'Fetch an API and Save to JSON',
    description: 'Fetch GitHub API data and save it locally.',
    category: [categories.WEB, categories.API, categories.FILE_GENERATION],
    prompt: `Create a Node.js script that fetches repository data from https://api.github.com/repos/nodejs/node and saves the name, description, and star count to a file called "nodejs_info.json".`,
    result:
      'A JSON file "nodejs_info.json" will be saved with details from the Node.js GitHub repository.',
  },
  {
    id: 7,
    title: 'Markdown to HTML Converter',
    description: 'Convert Markdown content to HTML using a library.',
    category: [categories.FILE_GENERATION, categories.CONVERSION],
    prompt: `Use Node.js and the "marked" package to convert the following Markdown to HTML and save it to "content_converted.html":\n\n# Welcome to My Page\n\nThis is a simple page created from **Markdown**!\n\n- Learn JavaScript\n- Learn Markdown\n- Build Cool Stuff 🚀`,
    result:
      'The HTML version of the Markdown content will be saved in "content_converted.html".',
  },
  {
    id: 8,
    title: 'Generate Random Data',
    description: 'Generate fake user data and save to JSON.',
    category: [categories.FILE_GENERATION, categories.DATA],
    prompt: `Use Node.js with the "@faker-js/faker" package to create a list of 100 fake users (name, email, address) and save to "fake_users.json".`,
    result:
      'A JSON file "fake_users.json" containing 100 fake users will be saved.',
  },
  {
    id: 9,
    title: 'Evaluate Complex Math Expression',
    description: 'Use math.js to evaluate a very complex expression.',
    category: [categories.DEVELOPMENT, categories.MATH],
    prompt: `Use Node.js and the "mathjs" package to evaluate the following expression accurately: ((5 + 8) * (15 / 3) - (9 - (4 * 6)) + (10 / (2 + 6))) ^ 2 + sqrt(64) - factorial(6) + (24 / (5 + 7 * (3 ^ 2))) + log(1000) * sin(30 * pi / 180) - cos(60 * pi / 180) + tan(45 * pi / 180) + (4 ^ 3 - 2 ^ (5 - 2)) * (sqrt(81) / 9).`,
    result: 'The result of the full expression will be logged to the console.',
  },
  {
    id: 10,
    title: 'Take a Screenshot with Playwright',
    description: 'Launch Chromium and save a screenshot.',
    category: [categories.WEB, categories.IMAGES],
    prompt: `Use Node.js with the "playwright" package and use the optimized Docker image to launch a Chromium browser, visit https://example.com, and save a screenshot to "screenshot_test.png".`,
    result:
      'A PNG screenshot named "screenshot_test.png" will be saved to the output.',
  },
  {
    id: 11,
    title: 'Generate a Chart',
    description: 'Create a revenue chart using Chart.js.',
    category: [categories.DATA_VISUALIZATION, categories.IMAGES],
    prompt:
      'Write a JavaScript script that generates a bar chart using chartjs-node-canvas.\nThe chart should show Monthly Revenue Growth for the first 6 months of the year.\nUse the following data:\n\n-January: $12,000\n-February: $15,500\n-March: $14,200\n-April: $18,300\n-May: $21,000\n-June: $24,500\n\nAdd the following details:\n\n-Title: "Monthly Revenue Growth (2025)"\n-X-axis label: "Month"\n-Y-axis label: "Revenue (USD)"\n-Save the resulting chart as chart.png.',
    result:
      'An image file "chart.png" with the rendered revenue chart will be generated.',
  },
  {
    id: 12,
    title: 'Summarize a Long Article',
    description: 'Extract Wikipedia article text and summarize it.',
    category: [categories.WEB, categories.AI, categories.SCRAPING],
    prompt: `Fetch and extract plain text from https://en.wikipedia.org/wiki/Node.js. Strip HTML tags and send the text to an AI to summarize in bullet points (max 300 words).`,
    result:
      'A bullet-point summary of the Node.js Wikipedia page will be returned via AI.',
  },
  {
    id: 13,
    title: 'Refactor and Optimize JS Code',
    description: 'Refactor a loop-based function using modern JS.',
    category: [categories.DEVELOPMENT, categories.TESTING],
    prompt:
      "Here's an unoptimized JavaScript function:\n```javascript\nfunction getUniqueValues(arr) {\n  let result = [];\n  for (let i = 0; i < arr.length; i++) {\n    let exists = false;\n    for (let j = 0; j < result.length; j++) {\n      if (arr[i] === result[j]) {\n        exists = true;\n        break;\n      }\n    }\n    if (!exists) {\n      result.push(arr[i]);\n    }\n  }\n  return result;\n}\n```\n\nPlease refactor and optimize this function for performance and readability. Then, write and run basic tests with the Node.js test runner to make sure it works (covering common and edge cases). As soon as all tests pass, return only the refactored function.",
    result:
      'A clean, optimized function using modern JS and tests will be logged.',
  },
  {
    id: 14,
    title: 'Create a Mock Book API',
    description: 'Build an API from a schema with mock data.',
    category: [categories.WEB, categories.API, categories.DEVELOPMENT],
    prompt: `
Here is a JSON Schema describing a "Book" entity:

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

Using this schema:

1. Generate **mock data** for at least 5 different books.
2. Create a simple **Node.js REST API** (you can use Express or Fastify) that:
   - Serves a GET /books endpoint on **port 5007**, which returns all mock books.
   - Serves a GET /books/:isbn endpoint that returns a single book matching the provided ISBN (or a 404 if not found).
3. Run the server and print a message like:  
   "Mock Book API is running on http://localhost:5007"`,
    result:
      'A local API will be running with endpoints to fetch all or individual mock books.',
  },
  {
    id: 15,
    title: 'File Manipulation',
    description: 'Read, filter, and write a JSON file.',
    category: [categories.FILE_PROCESSING, categories.DATA],
    prerequisites:
      ' Create in your mounted folder a file called "books.json" with this content:\n\n```json\n[\n  { "id": 1, "title": "The Silent Code", "author": "Jane Doe" },\n  { "id": 2, "title": "Refactoring Legacy", "author": "John Smith" },\n  { "id": 3, "title": "Async in Action", "author": "Jane Doe" },\n  { "id": 4, "title": "The Pragmatic Stack", "author": "Emily Ray" },\n  { "id": 5, "title": "Systems Unboxed", "author": "Mark Lee" }\n]\n```',
    prompt: `Create a Node.js script to read "books.json", filter books by author "Jane Doe", and save them to "books_filtered.json".`,
    result:
      'A new file "books_filtered.json" will contain only books written by Jane Doe.',
  },
];

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
    description: 'Create a QR code from a URL and save it as an image file',
    category: [categories.FILE_GENERATION, categories.IMAGES],
    prompt:
      'Create and run a JS script that generates a QR code for the URL `https://nodejs.org/en`, and save it as `qrcode.png`.\n\n**Tip:** Use the `qrcode` package.',
    result: 'Generated QR code saved as qrcode.png',
  },
  {
    id: 2,
    title: 'Test Regular Expressions',
    description: 'Create and test complex regex for mathematical expressions',
    category: [categories.DEVELOPMENT, categories.TESTING],
    prompt:
      'Create and run a JavaScript script that defines a complex regular expression to match valid mathematical expressions containing nested parentheses (e.g., ((2+3)_(4-5))), allowing numbers, +, -, _, / operators, and properly nested parentheses.\n\nRequirements:\n* The regular expression must handle deep nesting (e.g., up to 3-4 levels).\n* Write at least 10 unit tests covering correct and incorrect cases.\n* Use assert or manually throw errors if the validation fails.\n* Add a short comment explaining the structure of the regex.',
    result:
      'Regular expression tested with all valid and invalid cases passing',
  },
  {
    id: 3,
    title: 'Create CSV with Random Data',
    description: 'Generate a CSV file with random user data',
    category: [categories.FILE_GENERATION, categories.DATA],
    prompt:
      'Create and execute a js script which generates 200 items in a csv. The CSV has full name, random number and random (but valid) email. Write it in a file called "fake_data.csv"',
    result: 'Generated fake_data.csv with 200 random entries',
  },
  {
    id: 4,
    title: 'Scrape a Webpage Title',
    description: 'Fetch a webpage and extract its title',
    category: [categories.WEB, categories.SCRAPING],
    prompt:
      'Create and run a JS script that fetches `https://example.com`, saves the html file in "example.html", extracts the `<title>` tag, and shows it in the console.\n\n**Tip:** Use `cheerio`.',
    result: 'HTML file saved and title extracted: "Example Domain"',
  },
  {
    id: 5,
    title: 'Create a PDF Report',
    description: 'Generate a PDF tutorial for teaching JavaScript to kids',
    category: [categories.FILE_GENERATION, categories.EDUCATION],
    prompt:
      'Create a JavaScript script with Node.js that generates a PDF file containing a fun "Getting Started with JavaScript" tutorial for a 10-year-old kid.\n\nThe tutorial should be simple, playful, and colorful, explaining basic concepts like console.log(), variables, and how to write your first small program.\nSave the PDF as getting-started-javascript.pdf with fs\n\nTip: Use `pdf-lib` or `pdfkit` for creating the PDF.',
    result:
      'Generated PDF tutorial for kids saved as getting-started-javascript.pdf',
  },
  {
    id: 6,
    title: 'Fetch an API and Save to JSON',
    description: 'Get data from GitHub API and save it to a JSON file',
    category: [categories.WEB, categories.API, categories.FILE_GENERATION],
    prompt:
      'Create and run a JS script that fetches data from the GitHub Node.js repo (`https://api.github.com/repos/nodejs/node`) and saves part of the response to `nodejs_info.json`.',
    result: 'API data fetched and saved to nodejs_info.json',
  },
  {
    id: 7,
    title: 'Markdown to HTML Converter',
    description: 'Convert markdown content to HTML and save the result',
    category: [categories.FILE_GENERATION, categories.CONVERSION],
    prompt:
      'Write a JavaScript script that takes a Markdown string, converts it into HTML, and saves the result into a file named content_converted.html.\n\nUse the following example Markdown string:\n```markdown\n# Welcome to My Page\n\nThis is a simple page created from **Markdown**!\n\n- Learn JavaScript\n- Learn Markdown\n- Build Cool Stuff 🚀\n```\n\nTip: Use a library like `marked` to perform the conversion.',
    result: 'Markdown converted to HTML and saved as content_converted.html',
  },
  {
    id: 8,
    title: 'Generate Random Data',
    description: 'Create a JSON file with fake user data',
    category: [categories.FILE_GENERATION, categories.DATA],
    prompt:
      'Create a JS script that generates a list of 100 fake users with names, emails, and addresses, then saves them to a JSON file called "fake_users.json".\n\n**Tip:** Use `@faker-js/faker`.',
    result: 'Generated fake_users.json with 100 random users',
  },
  {
    id: 9,
    title: 'Evaluate Complex Math Expression',
    description: 'Calculate the result of a complex mathematical formula',
    category: [categories.DEVELOPMENT, categories.MATH],
    prompt:
      'Create a JS script that evaluates this expression `((5 + 8) * (15 / 3) - (9 - (4 * 6)) + (10 / (2 + 6))) ^ 2 + sqrt(64) - factorial(6) + (24 / (5 + 7 * (3 ^ 2))) + log(1000) * sin(30 * pi / 180) - cos(60 * pi / 180) + tan(45 * pi / 180) + (4 ^ 3 - 2 ^ (5 - 2)) * (sqrt(81) / 9)`. Tip: use math.js',
    result: 'Mathematical expression evaluated with precise result',
  },
  {
    id: 10,
    title: 'Take a Screenshot with Playwright',
    description: 'Capture a screenshot of a website using Playwright',
    category: [categories.WEB, categories.IMAGES],
    prompt:
      'Create and run a JS script that launches a Chromium browser, navigates to `https://example.com`, and takes a screenshot saved as `screenshot_test.png`.\n\n**Tip:** Use the official Playwright Docker image (mcr.microsoft.com/playwright) and install the playwright npm package dynamically.',
    result: 'Screenshot of example.com saved as screenshot_test.png',
  },
  {
    id: 11,
    title: 'Generate a Chart',
    description: 'Create a bar chart showing monthly revenue growth',
    category: [categories.DATA_VISUALIZATION, categories.IMAGES],
    prompt:
      'Write a JavaScript script that generates a bar chart using chartjs-node-canvas.\nThe chart should show Monthly Revenue Growth for the first 6 months of the year.\nUse the following data:\n\n-January: $12,000\n-February: $15,500\n-March: $14,200\n-April: $18,300\n-May: $21,000\n-June: $24,500\n\nAdd the following details:\n\n-Title: "Monthly Revenue Growth (2025)"\n-X-axis label: "Month"\n-Y-axis label: "Revenue (USD)"\n-Save the resulting chart as chart.png.',
    result: 'Revenue growth chart saved as chart.png',
  },
  {
    id: 12,
    title: 'Summarize a Long Article',
    description: 'Extract and summarize text from a Wikipedia article',
    category: [categories.WEB, categories.AI, categories.SCRAPING],
    prompt:
      'Fetch the content of [https://en.wikipedia.org/wiki/Node.js](https://en.wikipedia.org/wiki/Node.js), strip HTML tags, and send the plain text to the AI. Ask it to return a bullet-point summary of the most important sections in less than 300 words.',
    result: 'Extracted text and generated a concise summary of Node.js',
  },
  {
    id: 13,
    title: 'Refactor and Optimize JS Code',
    description: 'Improve an inefficient JavaScript function',
    category: [categories.DEVELOPMENT, categories.TESTING],
    prompt:
      "Here's an unoptimized JavaScript function:\n```javascript\nfunction getUniqueValues(arr) {\n  let result = [];\n  for (let i = 0; i < arr.length; i++) {\n    let exists = false;\n    for (let j = 0; j < result.length; j++) {\n      if (arr[i] === result[j]) {\n        exists = true;\n        break;\n      }\n    }\n    if (!exists) {\n      result.push(arr[i]);\n    }\n  }\n  return result;\n}\n```\n\nPlease refactor and optimize this function for performance and readability. Then, write and run basic tests with the Node.js test runner to make sure it works (covering common and edge cases). As soon as all tests pass, return only the refactored function.",
    result:
      'Optimized function using Set for better performance with all tests passing',
  },
  {
    id: 14,
    title: 'Create a Mock Book API',
    description: 'Build a REST API from a JSON schema with mock data',
    category: [categories.WEB, categories.API, categories.DEVELOPMENT],
    prompt:
      'Here is a JSON Schema describing a `Book` entity... [truncated for brevity]',
    result:
      'Mock Book API running on port 5007 with endpoints for all books and single book by ISBN',
  },
  {
    id: 15,
    title: 'File Manipulation',
    description: 'Read, filter, and write JSON data to a file',
    category: [categories.FILE_PROCESSING, categories.DATA],
    prerequisites:
      '**Prerequisites**: Create in your mounted folder a file called "books.json" with this content:\n\n```json\n[\n  { "id": 1, "title": "The Silent Code", "author": "Jane Doe" },\n  { "id": 2, "title": "Refactoring Legacy", "author": "John Smith" },\n  { "id": 3, "title": "Async in Action", "author": "Jane Doe" },\n  { "id": 4, "title": "The Pragmatic Stack", "author": "Emily Ray" },\n  { "id": 5, "title": "Systems Unboxed", "author": "Mark Lee" }\n]\n```',
    prompt:
      'Run a JS script to read the file "books.json", filter all the books of the author "Jane Doe" and save the result in "books_filtered.json"',
    result: 'Filtered books by Jane Doe saved to books_filtered.json',
  },
];

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tmp from 'tmp';

import runJs from '../src/tools/runJs.ts';
import initializeSandbox from '../src/tools/initialize.ts';
import stopSandbox from '../src/tools/stop.ts';

let tmpDir: tmp.DirResult;

describe('runJs with listenOnPort using Node.js http module', () => {
  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    process.env.FILES_DIR = tmpDir.name;
  });

  afterEach(() => {
    tmpDir.removeCallback();
    delete process.env.FILES_DIR;
  });

  it('should start a basic HTTP server in the container and expose it on the given port', async () => {
    const port = 20000 + Math.floor(Math.random() * 10000);
    const start = await initializeSandbox({ port });
    const content = start.content[0];
    if (content.type !== 'text') throw new Error('Unexpected content type');
    const containerId = content.text;

    try {
      // RunJS returns a promise that resolves when the server is started and listening
      // on the specified port. The server will run in the background.
      const result = await runJs({
        container_id: containerId,
        code: `
          import http from 'http';

          const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
          });

          server.listen(${port}, '0.0.0.0', () => {
            console.log('Server started');
          });
        `,
        dependencies: [],
        listenOnPort: port,
      });

      expect(result).toBeDefined();
      expect(result.content[0].type).toBe('text');

      if (result.content[0].type === 'text') {
        expect(result.content[0].text).toContain(
          'Server started in background'
        );
      }

      const res = await fetch(`http://localhost:${port}`);
      const body = await res.text();
      expect(body).toBe('ok');
    } finally {
      await stopSandbox({ container_id: containerId });
    }
  }, 10_000);

  it('should start an Express server and return book data from endpoints', async () => {
    const port = 20000 + Math.floor(Math.random() * 10000);
    const start = await initializeSandbox({ port });
    const content = start.content[0];
    if (content.type !== 'text') throw new Error('Unexpected content type');
    const containerId = content.text;

    try {
      const result = await runJs({
        container_id: containerId,
        code: `
          import express from 'express';
          const app = express();
          const port = ${port};

          const books = [
              {
                  title: 'The Great Gatsby',
                  author: 'F. Scott Fitzgerald',
                  isbn: '9780743273565',
                  publishedYear: 1925,
                  genres: ['Fiction', 'Classic'],
                  available: true
              },
              {
                  title: '1984',
                  author: 'George Orwell',
                  isbn: '9780451524935',
                  publishedYear: 1949,
                  genres: ['Fiction', 'Dystopian'],
                  available: true
              },
              {
                  title: 'To Kill a Mockingbird',
                  author: 'Harper Lee',
                  isbn: '9780061120084',
                  publishedYear: 1960,
                  genres: ['Fiction', 'Classic'],
                  available: false
              },
              {
                  title: 'The Catcher in the Rye',
                  author: 'J.D. Salinger',
                  isbn: '9780316769488',
                  publishedYear: 1951,
                  genres: ['Fiction', 'Classic'],
                  available: true
              },
              {
                  title: 'The Hobbit',
                  author: 'J.R.R. Tolkien',
                  isbn: '9780547928227',
                  publishedYear: 1937,
                  genres: ['Fantasy', 'Adventure'],
                  available: true
              }
          ];

          app.get('/books', (req, res) => {
              res.json(books);
          });

          app.get('/books/:isbn', (req, res) => {
              const book = books.find(b => b.isbn === req.params.isbn);
              if (book) {
                  res.json(book);
              } else {
                  res.sendStatus(404);
              }
          });

          app.listen(port, '0.0.0.0', () => {
              console.log('Server started');
          });
        `,
        dependencies: [
          {
            name: 'express',
            version: '4.18.2',
          },
        ],
        listenOnPort: port,
      });

      expect(result).toBeDefined();
      expect(result.content[0].type).toBe('text');
      // expect(result.content[0].text).toContain("Server started in background");

      const resAll = await fetch(`http://localhost:${port}/books`);
      expect(resAll.status).toBe(200);
      const books = await resAll.json();
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBeGreaterThanOrEqual(5);

      const resSingle = await fetch(
        `http://localhost:${port}/books/9780451524935`
      );
      expect(resSingle.status).toBe(200);
      const book = await resSingle.json();
      expect(book.title).toBe('1984');

      const resNotFound = await fetch(
        `http://localhost:${port}/books/nonexistent`
      );
      expect(resNotFound.status).toBe(404);
    } finally {
      await stopSandbox({ container_id: containerId });
    }
  }, 30_000);
});

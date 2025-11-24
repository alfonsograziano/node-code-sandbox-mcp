#!/usr/bin/env node

/**
 * Script to download article HTML and extract/download all images
 * 
 * Usage: node download-article.js <url> <image-prefix>
 * Example: node download-article.js https://example.com/article myprefix
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const zlib = require('zlib');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node download-article.js <url> <image-prefix>');
  process.exit(1);
}

const articleUrl = args[0];
const imagePrefix = args[1];

// Directories
const resourcesDir = path.join(__dirname, '..', 'resources');
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'pillars');

// Ensure directories exist
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Fetch HTML content from URL with redirect support
 */
function fetchHtml(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };
    
    const req = client.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        req.destroy();
        const redirectUrl = new URL(res.headers.location, url).href;
        return fetchHtml(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      // Handle compressed responses
      let stream = res;
      const encoding = res.headers['content-encoding'];
      
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }
      
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        resolve(data);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

/**
 * Decode HTML entities in URL
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Clean and normalize image URL
 */
function cleanImageUrl(url) {
  // Remove surrounding quotes
  url = url.trim().replace(/^["']|["']$/g, '');
  // Decode HTML entities
  url = decodeHtmlEntities(url);
  // Remove any trailing quotes or spaces
  url = url.trim();
  return url;
}

/**
 * Normalize image URL to absolute URL
 */
function normalizeImageUrl(imageUrl, baseUrl) {
  // Clean the URL first
  imageUrl = cleanImageUrl(imageUrl);
  
  // Skip data URLs (base64 encoded images)
  if (imageUrl.startsWith('data:')) {
    return null;
  }
  
  // Skip if empty or invalid
  if (!imageUrl || imageUrl.length === 0) {
    return null;
  }
  
  const baseUrlObj = new URL(baseUrl);
  
  // Convert relative URLs to absolute
  if (imageUrl.startsWith('//')) {
    imageUrl = baseUrlObj.protocol + imageUrl;
  } else if (imageUrl.startsWith('/')) {
    imageUrl = baseUrlObj.origin + imageUrl;
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    try {
      imageUrl = new URL(imageUrl, baseUrl).href;
    } catch (e) {
      return null; // Invalid URL
    }
  }
  
  // Validate the final URL
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch (e) {
    return null;
  }
}

/**
 * Extract image URLs from HTML using regex
 */
function extractImageUrls(html, baseUrl) {
  const imageUrls = [];
  const baseUrlObj = new URL(baseUrl);
  
  // Regex patterns to find images in various formats
  const patterns = [
    // img src attribute (with various quote styles)
    /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+src\s*=\s*([^\s>]+)[^>]*>/gi,
    // data-src (lazy loading)
    /<img[^>]+data-src\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+data-src\s*=\s*([^\s>]+)[^>]*>/gi,
    // srcset attribute (can contain multiple URLs)
    /<img[^>]+srcset\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+srcset\s*=\s*([^\s>]+)[^>]*>/gi,
    // picture source srcset
    /<source[^>]+srcset\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<source[^>]+srcset\s*=\s*([^\s>]+)[^>]*>/gi,
    // source src
    /<source[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /<source[^>]+src\s*=\s*([^\s>]+)[^>]*>/gi,
    // background-image in style
    /style\s*=\s*["'][^"']*background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi,
    // background-image in CSS
    /background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi,
    // data-image or data-url
    /data-image\s*=\s*["']([^"']+)["']/gi,
    /data-url\s*=\s*["']([^"']+)["']/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let imageUrl = match[1];
      
      // Handle srcset (can contain multiple URLs with descriptors like "url 2x" or "url 800w")
      if (imageUrl.includes(',')) {
        const urls = imageUrl.split(',').map(url => {
          // Remove descriptors (like "2x", "800w", etc.)
          return url.trim().split(/\s+/)[0];
        });
        urls.forEach(url => {
          const normalized = normalizeImageUrl(url, baseUrl);
          if (normalized) imageUrls.push(normalized);
        });
      } else {
        const normalized = normalizeImageUrl(imageUrl, baseUrl);
        if (normalized) imageUrls.push(normalized);
      }
    }
  }
  
  // Remove duplicates and filter out non-image URLs
  const uniqueUrls = [...new Set(imageUrls)].filter(url => {
    // Filter out non-image file types
    const lowerUrl = url.toLowerCase();
    return lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)(\?|$|#)/i) || 
           lowerUrl.includes('image') || 
           !lowerUrl.match(/\.(html|css|js|json|xml|pdf)(\?|$|#)/i);
  });
  
  return uniqueUrls;
}

/**
 * Get file extension from Content-Type header
 */
function getExtensionFromContentType(contentType) {
  const mimeTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff'
  };
  
  if (contentType) {
    const mimeType = contentType.split(';')[0].trim().toLowerCase();
    return mimeTypes[mimeType] || '.jpg';
  }
  
  return '.jpg';
}

/**
 * Download an image from URL with redirect support and proper headers
 */
function downloadImage(url, filepath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects === 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': urlObj.origin + '/'
      }
    };
    
    const file = fs.createWriteStream(filepath);
    
    const req = client.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        const redirectUrl = new URL(res.headers.location, url).href;
        return downloadImage(redirectUrl, filepath, maxRedirects - 1).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(new Error(`Failed to download image: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      // Handle compressed responses
      let stream = res;
      const encoding = res.headers['content-encoding'];
      
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }
      
      stream.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      stream.on('error', (err) => {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });
    });
    
    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
    
    req.end();
  });
}

/**
 * Get file extension from URL
 */
function getExtensionFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname).toLowerCase();
    
    // Common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'];
    
    if (ext && validExtensions.includes(ext)) {
      return ext;
    }
    
    // Try to infer from URL path
    const lowerPath = pathname.toLowerCase();
    if (lowerPath.includes('.png')) return '.png';
    if (lowerPath.includes('.jpg') || lowerPath.includes('.jpeg')) return '.jpg';
    if (lowerPath.includes('.gif')) return '.gif';
    if (lowerPath.includes('.webp')) return '.webp';
    if (lowerPath.includes('.svg')) return '.svg';
    
    // Default to jpg
    return '.jpg';
  } catch (e) {
    return '.jpg';
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Fetching article from: ${articleUrl}`);
    
    // Fetch HTML
    const html = await fetchHtml(articleUrl);
    console.log(`✓ Fetched HTML (${html.length} bytes)`);
    
    // Generate filename from URL
    const urlObj = new URL(articleUrl);
    let filename = urlObj.pathname.split('/').filter(Boolean).pop() || 'index';
    if (!filename.endsWith('.html')) {
      filename += '.html';
    }
    // Clean filename (remove query params, etc.)
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!filename.endsWith('.html')) {
      filename += '.html';
    }
    
    const htmlPath = path.join(resourcesDir, filename);
    
    // Save HTML
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✓ Saved HTML to: ${htmlPath}`);
    
    // Extract image URLs
    const imageUrls = extractImageUrls(html, articleUrl);
    console.log(`✓ Found ${imageUrls.length} images`);
    
    // Download images
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const ext = getExtensionFromUrl(imageUrl);
      const newFilename = `${imagePrefix}_${i + 1}${ext}`;
      const imagePath = path.join(imagesDir, newFilename);
      
      try {
        console.log(`Downloading image ${i + 1}/${imageUrls.length}: ${imageUrl}`);
        await downloadImage(imageUrl, imagePath);
        console.log(`✓ Saved: ${newFilename}`);
      } catch (err) {
        console.error(`✗ Failed to download ${imageUrl}: ${err.message}`);
      }
    }
    
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();


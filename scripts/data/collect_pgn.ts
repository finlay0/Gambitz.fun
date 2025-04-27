#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Ensure target directory exists
const OUTPUT_DIR = path.resolve(__dirname, '../../data/raw');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'blitz_2024_03.pgn.zst');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Source URL for the PGN database
const LICHESS_DB_URL = 'https://database.lichess.org/standard/lichess_db_standard_rated_2024-03.pgn.zst';
// Log progress every 100MB
const LOG_INTERVAL_MB = 100;
const LOG_INTERVAL_BYTES = LOG_INTERVAL_MB * 1024 * 1024;
// Request timeout in milliseconds
const REQUEST_TIMEOUT = 180000; // 3 minutes

/**
 * Download a file from a URL and save it to disk without any processing
 * The file will be saved exactly as received (binary mode)
 */
async function downloadFile(url: string = LICHESS_DB_URL): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Starting download from: ${url}`);
    console.log(`Saving to: ${OUTPUT_FILE}`);
    
    let downloadedBytes = 0;
    let lastLoggedMB = 0;
    
    // Create write stream for binary data with no encoding transformation
    const fileStream = fs.createWriteStream(OUTPUT_FILE, { 
      flags: 'w'
    });
    
    const urlObj = new URL(url);
    
    // Options for the HTTP request
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        // Ensure we don't receive any server-side compression
        'Accept-Encoding': 'identity',
        'User-Agent': 'Node.js ChessBets Download Client'
      },
      timeout: REQUEST_TIMEOUT
    };
    
    // Create the request (use https or http based on URL)
    const requestFn = urlObj.protocol === 'https:' ? https.request : http.request;
    
    const req = requestFn(options, (response) => {
      // Handle redirects (301, 302, 307, 308)
      if (response.statusCode && [301, 302, 307, 308].includes(response.statusCode) && response.headers.location) {
        console.log(`Following redirect to: ${response.headers.location}`);
        fileStream.close();
        
        // Construct a new URL resolving against the original
        const redirectUrl = new URL(response.headers.location, url);
        
        // Retry the download with the new URL
        downloadFile(redirectUrl.toString()).then(resolve).catch(reject);
        return;
      }
      
      // Check if response is successful
      if (!response.statusCode || response.statusCode !== 200) {
        fileStream.close();
        return reject(new Error(`HTTP Error: ${response.statusCode || 'Unknown'} - ${response.statusMessage || 'Unknown Error'}`));
      }
      
      // Get total size if available - note: this might be the uncompressed size for some servers
      const totalSizeBytes = parseInt(response.headers['content-length'] || '0', 10);
      const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024) * 10) / 10;
      
      if (totalSizeBytes) {
        console.log(`Reported file size: ${totalSizeMB} MB (this may be the uncompressed size)`);
        console.log(`Expected compressed file size: ~2.6 GB`);
      } else {
        console.log(`File size unknown, starting download...`);
      }
      
      // Handle incoming data chunks
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        
        // Log progress every LOG_INTERVAL_MB
        const currentMB = Math.floor(downloadedBytes / (1024 * 1024));
        if (currentMB >= lastLoggedMB + LOG_INTERVAL_MB) {
          console.log(`Downloaded ${currentMB} MB`);
          lastLoggedMB = currentMB;
        }
      });
      
      // Pipe the response directly to the file without modifying the content
      response.pipe(fileStream);
      
      // Handle completion
      fileStream.on('finish', () => {
        fileStream.close();
        
        // Get final file size
        const stats = fs.statSync(OUTPUT_FILE);
        const finalSizeMB = Math.round(stats.size / (1024 * 1024) * 10) / 10;
        const finalSizeGB = Math.round((stats.size / (1024 * 1024 * 1024)) * 100) / 100;
        
        console.log(`\n✅ Download complete!`);
        console.log(`File saved to: ${OUTPUT_FILE}`);
        console.log(`Final file size: ${finalSizeGB} GB (${finalSizeMB} MB)`);
        
        // Verify this is the compressed file
        if (finalSizeGB < 2.0 || finalSizeGB > 3.5) {
          console.warn(`Warning: File size (${finalSizeGB} GB) is outside the expected range of 2.0-3.5 GB`);
          console.warn(`This might indicate an issue with the download or server response.`);
        } else {
          console.log(`File size looks correct (expected ~2.6 GB compressed).`);
        }
        
        resolve();
      });
      
      // Handle response errors
      response.on('error', (err) => {
        console.error(`Response error: ${err.message}`);
        fileStream.close();
        fs.unlink(OUTPUT_FILE, () => {}); // Try to remove partial file
        reject(err);
      });
    });
    
    // Handle request errors
    req.on('error', (err) => {
      console.error(`Request error: ${err.message}`);
      fileStream.close();
      fs.unlink(OUTPUT_FILE, () => {}); // Try to remove partial file
      reject(err);
    });
    
    // Handle file stream errors
    fileStream.on('error', (err) => {
      console.error(`File write error: ${err.message}`);
      fileStream.close();
      fs.unlink(OUTPUT_FILE, () => {}); // Try to remove partial file
      reject(err);
  });
    
    // Set additional timeout
    req.setTimeout(REQUEST_TIMEOUT, () => {
      console.error(`Request timed out after ${REQUEST_TIMEOUT/1000} seconds`);
      req.destroy();
      fileStream.close();
      fs.unlink(OUTPUT_FILE, () => {});
      reject(new Error('Request timeout'));
    });
    
    // End the request (important for POST/PUT)
    req.end();
  });
}

// Run the main function
downloadFile()
  .then(() => {
    console.log('Download successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }); 
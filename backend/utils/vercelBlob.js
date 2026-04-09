// Utility for uploading files to Vercel Blob CDN
// Requires: npm install @vercel/blob

const { put } = require('@vercel/blob');
const fs = require('fs');

/**
 * Upload a file to Vercel Blob and return the public CDN URL
 * @param {string} filePath - Local file path
 * @param {string} blobPath - Path in Vercel Blob storage (e.g. 'videos/filename.mp4')
 * @returns {Promise<string>} - Public CDN URL
 */
async function uploadToVercelBlob(filePath, blobPath) {
  const fileStream = fs.createReadStream(filePath);
  const { url } = await put(blobPath, fileStream, {
    access: 'public',
  });
  return url;
}

module.exports = { uploadToVercelBlob };
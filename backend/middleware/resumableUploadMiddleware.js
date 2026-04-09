const fs = require('fs');
const path = require('path');

// Directory to store upload chunks
defaultChunkDir = path.join(__dirname, '..', 'uploads', 'chunks');
fs.mkdirSync(defaultChunkDir, { recursive: true });

/**
 * Middleware for handling resumable (chunked) uploads.
 * Expects headers:
 *   - 'upload-id': unique upload session id
 *   - 'chunk-index': current chunk number (0-based)
 *   - 'total-chunks': total number of chunks
 *   - 'file-name': original file name
 *
 * POST body: raw chunk data (binary)
 */
function resumableUploadMiddleware(req, res, next) {
  const uploadId = req.headers['upload-id'];
  const chunkIndex = parseInt(req.headers['chunk-index'], 10);
  const totalChunks = parseInt(req.headers['total-chunks'], 10);
  const fileName = req.headers['file-name'];
  if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
    return res.status(400).json({ message: 'Missing upload headers' });
  }
  const uploadDir = path.join(defaultChunkDir, uploadId);
  fs.mkdirSync(uploadDir, { recursive: true });
  const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`);
  const writeStream = fs.createWriteStream(chunkPath);
  req.pipe(writeStream);
  writeStream.on('finish', () => {
    // If last chunk, assemble file
    if (chunkIndex === totalChunks - 1) {
      const finalPath = path.join(__dirname, '..', 'uploads', 'reels', fileName);
      const outStream = fs.createWriteStream(finalPath);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = fs.readFileSync(path.join(uploadDir, `chunk_${i}`));
        outStream.write(chunk);
      }
      outStream.end();
      outStream.on('finish', () => {
        // Cleanup
        fs.rmSync(uploadDir, { recursive: true, force: true });
        req.resumableUpload = { filePath: finalPath, fileName };
        next();
      });
    } else {
      res.status(200).json({ message: 'Chunk uploaded' });
    }
  });
  writeStream.on('error', (err) => {
    res.status(500).json({ message: 'Chunk write error', error: err.message });
  });
}

module.exports = resumableUploadMiddleware;

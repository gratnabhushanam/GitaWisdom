import axios from 'axios';

// Resumable/chunked upload utility for large files
// Usage: await resumableUpload({ file, url, headers, chunkSize, onProgress })
export async function resumableUpload({ file, url, headers = {}, chunkSize = 500 * 1024 * 1024, onProgress }) {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const safeName = encodeURIComponent(file.name);
  const uploadId = `${file.size}-${file.lastModified}-${safeName.substring(0, 50)}`;
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const chunkHeaders = {
      ...headers,
      'upload-id': uploadId,
      'chunk-index': chunkIndex,
      'total-chunks': totalChunks,
      'file-name': safeName,
      'Content-Type': 'application/octet-stream',
    };
    try {
      const res = await axios.post(url, chunk, {
        headers: chunkHeaders,
      });
      if (onProgress) onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
      // On last chunk, return server response
      if (chunkIndex === totalChunks - 1) {
        return res.data;
      }
    } catch (error) {
      throw new Error(`Chunk ${chunkIndex} failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

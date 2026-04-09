// Resumable/chunked upload utility for large files
// Usage: await resumableUpload({ file, url, headers, chunkSize, onProgress })
export async function resumableUpload({ file, url, headers = {}, chunkSize = 5 * 1024 * 1024, onProgress }) {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = `${file.name}-${file.size}-${file.lastModified}`;
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const chunkHeaders = {
      ...headers,
      'upload-id': uploadId,
      'chunk-index': chunkIndex,
      'total-chunks': totalChunks,
      'file-name': file.name,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: chunkHeaders,
      body: chunk,
    });
    if (!res.ok) throw new Error(`Chunk ${chunkIndex} failed: ${await res.text()}`);
    if (onProgress) onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    // On last chunk, return server response
    if (chunkIndex === totalChunks - 1) {
      return await res.json();
    }
  }
}

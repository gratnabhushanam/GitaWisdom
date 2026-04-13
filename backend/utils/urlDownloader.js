const youtubedl = require('youtube-dl-exec');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

async function downloadFromUrl(url, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileName = `url_dl_${crypto.randomBytes(8).toString('hex')}.mp4`;
  const filePath = path.join(destDir, fileName);

  try {
    await youtubedl(url, {
      output: filePath,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      mergeOutputFormat: 'mp4',
      maxFilesize: '4000m',
      noCheckCertificates: true,
      noWarnings: true
    });

    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File download failed or format unavailable');
    }

    return { filePath, fileName };
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Failed to download from URL: ${err.message}`);
  }
}

module.exports = { downloadFromUrl };

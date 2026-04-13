const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

const platform = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const binaryUrl = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${platform}`;
const binaryPath = path.join(__dirname, platform);

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadBinary(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest, { mode: 0o755 });
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          // Ensure executable permissions on Linux/macOS
          if (process.platform !== 'win32') {
            fs.chmodSync(dest, 0o755);
          }
          resolve();
        });
      } else {
        reject(new Error(`Failed to download binary: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function ensureYtdlp() {
  if (fs.existsSync(binaryPath)) return;
  console.log(`Downloading yt-dlp binary from ${binaryUrl}...`);
  await downloadBinary(binaryUrl, binaryPath);
  console.log('Downloaded yt-dlp successfully.');
}

async function downloadFromUrl(url, destDir) {
  await ensureYtdlp();
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileName = `url_dl_${crypto.randomBytes(8).toString('hex')}.mp4`;
  const filePath = path.join(destDir, fileName);

  return new Promise((resolve, reject) => {
    const args = [
      url,
      '-o', filePath,
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '--max-filesize', '4000m',
      '--no-check-certificates',
      '--no-warnings'
    ];

    const child = spawn(binaryPath, args, { stdio: 'ignore' });

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(filePath)) {
        resolve({ filePath, fileName });
      } else {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(new Error(`Download failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });
  });
}

module.exports = { downloadFromUrl };

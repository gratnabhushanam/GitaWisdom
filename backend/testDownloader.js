const youtubedl = require('youtube-dl-exec');
const path = require('path');
const crypto = require('crypto');

async function testDownload() {
  const url = 'https://www.youtube.com/shorts/5c3-x32J-wM'; // Public standard short length testing
  const fileName = `test_url_download_${crypto.randomBytes(4).toString('hex')}.mp4`;
  const destPath = path.join(__dirname, fileName);
  try {
    console.log('Downloading...');
    await youtubedl(url, {
      output: destPath,
      format: 'mp4',
    });
    console.log('Downloaded successfully to', destPath);
  } catch (err) {
    console.error('Error downloading:', err.message);
  }
}
testDownload();

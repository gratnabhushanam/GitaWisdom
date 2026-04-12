const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Transcode a video file to HLS (m3u8 + ts segments) using FFmpeg.
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputDir - Directory to store HLS output
 * @param {string} baseName - Base name for output files
 * @param {function} cb - Callback (err, playlistPath)
 */

// Multi-resolution HLS transcoding (1080p, 720p, 480p)
function transcodeToHLS(inputPath, outputDir, baseName, cb) {
  fs.mkdirSync(outputDir, { recursive: true });
  const masterPlaylist = path.join(outputDir, `${baseName}_master.m3u8`);
  // Output variant playlists
  const renditions = [
    {
      name: '1080p',
      width: 1920,
      height: 1080,
      bitrate: 5000,
      maxrate: 5350,
      bufsize: 7500,
      bandwidth: 5400000,
      audioRate: 192,
    },
    {
      name: '720p',
      width: 1280,
      height: 720,
      bitrate: 2800,
      maxrate: 2996,
      bufsize: 4200,
      bandwidth: 3000000,
      audioRate: 128,
    },
    {
      name: '480p',
      width: 854,
      height: 480,
      bitrate: 1400,
      maxrate: 1498,
      bufsize: 2100,
      bandwidth: 1500000,
      audioRate: 96,
    },
  ];

  // Build FFmpeg command for all renditions
  let filter = renditions.map((r, i) => `[0:v]scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease[v${i}];`).join(' ');
  filter = filter.trim();
  let map = renditions.map((r, i) => `-map [v${i}] -c:v:${i} libx264 -b:v:${i} ${r.bitrate}k -maxrate:v:${i} ${r.maxrate}k -bufsize:v:${i} ${r.bufsize}k -preset veryfast -g 48 -sc_threshold 0`).join(' ');
  let audio = renditions.map((r, i) => `-map 0:a:0? -c:a:${i} aac -b:a:${i} ${r.audioRate}k`).join(' ');
  let hls = renditions.map((r, i) => `-hls_time 6 -hls_playlist_type vod -hls_segment_filename '${outputDir}/${baseName}_${r.name}_%03d.ts' -hls_flags independent_segments -hls_segment_type mpegts`).join(' ');
  let playlistArgs = renditions.map((r, i) => `-f hls '${outputDir}/${baseName}_${r.name}.m3u8'`).join(' ');

  // Obtain standalone binary path
  const ffmpegStaticPath = require('ffmpeg-static');

  // Build the full command using the explicit ffmpeg binary
  const cmd = `"${ffmpegStaticPath}" -y -i "${inputPath}" -filter_complex "${filter}" ${map} ${audio} ${hls} ${playlistArgs}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return cb(err, null);
    }
    // Write master playlist
    let masterContent = '#EXTM3U\n';
    renditions.forEach((r) => {
      masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${r.bandwidth},RESOLUTION=${r.width}x${r.height}\n${baseName}_${r.name}.m3u8\n`;
    });
    fs.writeFileSync(masterPlaylist, masterContent);
    cb(null, masterPlaylist);
  });
}

module.exports = { transcodeToHLS };

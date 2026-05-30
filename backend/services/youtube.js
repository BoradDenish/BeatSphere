const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class YouTubeService {
  constructor() {
    this.ytDlpPath = path.join(__dirname, '../yt-dlp');
    this.cookiesPath = path.join(__dirname, '../youtube_cookies.json');
    this.verifyBinary();
  }

  /**
   * Verify if yt-dlp binary exists and is executable
   */
  verifyBinary() {
    if (!fs.existsSync(this.ytDlpPath)) {
      console.error('yt-dlp binary not found at:', this.ytDlpPath);
      // We'll attempt to use the global one if local fails
      this.ytDlpPath = 'yt-dlp';
    }
  }

  /**
   * Get metadata for a YouTube video
   */
  async getInfo(url) {
    return new Promise((resolve, reject) => {
      const args = ['-j', '--no-playlist', url];
      
      // Add cookies if available
      if (fs.existsSync(this.cookiesPath)) {
        // args.push('--cookies', this.cookiesPath);
        // Note: yt-dlp might expect Netscape format, but we'll try it
      }

      const process = spawn(this.ytDlpPath, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => stdout += data);
      process.stderr.on('data', (data) => stderr += data);

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('yt-dlp getInfo error:', stderr);
          return reject(new Error('YouTube is blocking the request. Please try adding cookies to youtube_cookies.json or try another video.'));
        }

        try {
          const info = JSON.parse(stdout);
          resolve({
            title: info.title,
            description: info.description,
            thumbnailUrl: info.thumbnail,
            duration: info.duration,
            author: info.uploader,
          });
        } catch (e) {
          reject(new Error('Failed to parse YouTube metadata'));
        }
      });
    });
  }

  /**
   * Download and save YouTube content
   */
  async downloadMedia(url, type = 'audio') {
    const filename = `${uuidv4()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    const absolutePath = path.join(__dirname, '../uploads', type === 'audio' ? 'music' : 'videos', filename);
    const relativePath = `/uploads/${type === 'audio' ? 'music' : 'videos'}/${filename}`;

    return new Promise((resolve, reject) => {
      // Use "bestaudio" for audio and "best[ext=mp4]" for video to avoid needing ffmpeg for merging
      const format = type === 'audio' 
        ? 'bestaudio/best' 
        : 'best[ext=mp4]/best';

      const args = [
        '-f', format,
        '--no-playlist',
        '--no-part', // Avoid .part files
        '-o', absolutePath,
        url
      ];

      const process = spawn(this.ytDlpPath, args);
      let stderr = '';

      process.stderr.on('data', (data) => stderr += data);

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('yt-dlp download error:', stderr);
          return reject(new Error('Failed to download YouTube content: ' + stderr.split('\n')[0]));
        }

        if (!fs.existsSync(absolutePath)) {
          return reject(new Error('Download failed: output file not created'));
        }

        resolve({
          filename,
          url: relativePath,
          size: fs.statSync(absolutePath).size,
          mimeType: type === 'audio' ? 'audio/mpeg' : 'video/mp4'
        });
      });
    });
  }

  /**
   * Download and save YouTube thumbnail
   */
  async downloadThumbnail(url) {
    try {
      if (!url) return null;
      
      const filename = `${uuidv4()}.jpg`;
      const relativePath = `/uploads/thumbnails/${filename}`;
      const absolutePath = path.join(__dirname, '../uploads/thumbnails', filename);

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(absolutePath);
        response.data.pipe(fileStream);

        fileStream.on('finish', () => {
          resolve({
            filename,
            url: relativePath
          });
        });

        fileStream.on('error', reject);
      });
    } catch (error) {
      console.error('YouTube thumbnail download error:', error);
      return null;
    }
  }
}

module.exports = new YouTubeService();

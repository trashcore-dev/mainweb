const yts = require('yt-search');
const axios = require('axios');

global.trending = global.trending || [];

module.exports = async (req, res) => {
  const query = req.query.query;
  if (!query || query.length > 100) {
    return res.status(400).json({ error: "Invalid or missing query" });
  }

  try {
    const results = await yts(`${query} official`);
    const video = results.videos?.[0];
    if (!video || !video.url) throw new Error("No video found");

    // Log trending query
    global.trending.unshift(query);
    global.trending = [...new Set(global.trending)].slice(0, 10);

    // Proxy call to Render
    const proxyUrl = `https://proxy-e4ap.onrender.com/api/proxy?url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(proxyUrl);
    const apiData = response.data;

    if (!apiData.status || !apiData.result?.downloadUrl) {
      throw new Error("Proxy failed to return a valid MP3 link");
    }

    res.status(200).json({
      title: apiData.result.title || video.title,
      downloadUrl: apiData.result.downloadUrl,
      thumbnail: apiData.result.thumbnail
    });

  } catch (err) {
    console.error("❌ Download error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

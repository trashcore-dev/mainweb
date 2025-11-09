import yts from 'yt-search';
import axios from 'axios';

export default async function handler(req, res) {
  const query = req.query.query;
  if (!query || query.length > 100) {
    return res.status(400).json({ error: "Invalid or missing query" });
  }

  try {
    const results = await yts(`${query} official`);
    const video = results.videos?.[0];
    if (!video || !video.url) throw new Error("No video found");

    const proxyUrl = `https://proxy-e4ap.onrender.com/api/proxy?url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(proxyUrl);
    const apiData = response.data;

    if (!apiData.status || !apiData.result?.downloadUrl) {
      throw new Error("Proxy failed to return a valid MP3 link");
    }

    return res.status(200).json({
      title: apiData.result.title || video.title,
      downloadUrl: apiData.result.downloadUrl
    });

  } catch (err) {
    console.error("Download error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

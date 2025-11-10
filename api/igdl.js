const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing Instagram URL" });

  try {
    const response = await axios.get(`https://api.nekolabs.web.id/downloader/instagram`, {
      params: { url },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const result = response.data.result;
    if (!result || !result.url) {
      return res.status(404).json({ error: "No media found" });
    }

    return res.status(200).json({
      platform: "instagram",
      type: result.url.endsWith(".mp4") ? "video" : "image",
      media: result.url,
      thumb: result.thumbnail || null,
      metadata: {
        title: result.title || "Untitled",
        author: result.author || "Unknown",
        source: url
      }
    });
  } catch (err) {
    console.error("Instagram fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch Instagram media" });
  }
};

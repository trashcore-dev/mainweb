const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing Pinterest URL" });

  try {
    const response = await axios.get(`https://api.nekolabs.web.id/downloader/pinterest`, {
      params: { url },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const result = response.data.result;
    const mediaUrl = result.url;

    if (!mediaUrl) {
      return res.status(404).json({ error: "No media found" });
    }

    return res.status(200).json({
      platform: "pinterest",
      type: mediaUrl.endsWith(".mp4") ? "video" : "image",
      media: mediaUrl,
      thumb: result.thumbnail || null,
      metadata: {
        title: result.title || "Untitled",
        source: url
      }
    });
  } catch (err) {
    console.error("Pinterest fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch Pinterest media" });
  }
};

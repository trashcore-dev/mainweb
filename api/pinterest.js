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
    const medias = result.medias;

    if (!Array.isArray(medias) || medias.length === 0) {
      return res.status(404).json({ error: "No media found" });
    }

    const primary = medias[medias.length - 1];

    return res.status(200).json({
      platform: "pinterest",
      type: "image",
      media: primary.url,
      thumb: result.thumbnail,
      metadata: {
        title: result.title,
        source: result.url,
        quality: primary.quality,
        size: primary.formattedSize,
        extension: primary.extension
      }
    });
  } catch (err) {
    console.error("Pinterest fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch Pinterest media" });
  }
};

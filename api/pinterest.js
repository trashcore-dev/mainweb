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

    // Pick highest quality image (last one usually)
    const primary = medias[medias.length - 1];

    return res.status(200).json({
      platform: "pinterest",
      type: primary.extension === "mp4" ? "video" : "image",
      media: primary.url,
      thumb: result.thumbnail || null,
      metadata: {
        title: result.title || "Untitled",
        source: result.url,
        quality: primary.quality,
        size: primary.formattedSize,
        videoAvailable: primary.videoAvailable,
        audioAvailable: primary.audioAvailable
      }
    });
  } catch (err) {
    console.error("Pinterest fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch Pinterest media" });
  }
};

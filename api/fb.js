const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing Facebook URL" });

  try {
    const response = await axios.get(`https://api.nekolabs.web.id/downloader/facebook`, {
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

    // Pick the highest quality video (first video type)
    const primary = medias.find(m => m.type === "video") || medias[0];

    return res.status(200).json({
      platform: "facebook",
      type: primary.type,
      media: primary.url,
      thumb: null,
      metadata: {
        title: result.title || "Untitled",
        source: url,
        formats: medias.map(m => ({
          type: m.type,
          extension: m.extension,
          url: m.url
        }))
      }
    });
  } catch (err) {
    console.error("Facebook fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch Facebook media" });
  }
};

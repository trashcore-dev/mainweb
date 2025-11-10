const { igdl } = require("btch-downloader");

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing Facebook URL" });

  try {
    const result = await igdl(url);
    if (!result || !result.data || result.data.length === 0) {
      return res.status(404).json({ error: "No media found" });
    }

    const media = result.data[0];
    return res.json({
      platform: "facebook",
      type: media.type,
      media: media.url,
      thumb: media.thumbnail || null,
      metadata: {
        title: media.title || "Untitled",
        source: url
      }
    });
  } catch (err) {
    console.error("Facebook error:", err);
    return res.status(500).json({ error: "Failed to fetch Facebook media" });
  }
};

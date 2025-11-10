const fg = require('api-dylux');
const { igdl } = require('btch-downloader');

module.exports = async (req, res) => {
  const { url, platform } = req.query;
  if (!url || !platform) return res.status(400).json({ error: "Missing url or platform" });

  try {
    if (platform === "tiktok") {
      const data = await fg.tiktok(url);
      const json = data.result;
      return res.json({
        platform: "tiktok",
        type: "video",
        media: json.play,
        thumb: json.cover,
        audio: json.music,
        metadata: {
          id: json.id,
          title: json.title,
          author: json.author.nickname,
          likes: json.digg_count,
          comments: json.comment_count,
          shares: json.share_count,
          plays: json.play_count,
          created: json.create_time,
          duration: json.duration,
          size: json.size
        }
      });
    }

    if (platform === "instagram" || platform === "facebook") {
      const result = await igdl(url);
      if (!result || !result.data || result.data.length === 0) {
        return res.status(404).json({ error: "No media found" });
      }

      const media = result.data[0];
      return res.json({
        platform,
        type: media.type,
        media: media.url,
        thumb: media.thumbnail || null,
        metadata: {
          title: media.title || "Untitled",
          source: url
        }
      });
    }

    return res.status(400).json({ error: "Unsupported platform" });
  } catch (err) {
    console.error("Media fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
};

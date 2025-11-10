const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing TikTok URL" });

  try {
    const response = await axios.get(`https://api.nekolabs.web.id/downloader/tiktok`, {
      params: { url }
    });

    const result = response.data.result;
    if (!result || !result.videoUrl) {
      return res.status(404).json({ error: "No media found" });
    }

    return res.status(200).json({
      platform: "tiktok",
      type: "video",
      media: result.videoUrl,
      thumb: result.cover,
      audio: result.musicUrl,
      metadata: {
        title: result.title,
        created: result.create_at,
        author: result.author?.name,
        username: result.author?.username,
        avatar: result.author?.avatar,
        music: result.music_info?.title,
        music_author: result.music_info?.author,
        likes: result.stats?.like,
        comments: result.stats?.comment,
        shares: result.stats?.share,
        plays: result.stats?.play
      }
    });
  } catch (err) {
    console.error("Nekolabs TikTok error:", err.message);
    return res.status(500).json({ error: "Failed to fetch TikTok media" });
  }
};

const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing TikTok URL" });

  try {
    const response = await axios.get(`https://api.tikwm.com/video/info?url=${encodeURIComponent(url)}`);
    const json = response.data.data;

    if (!json || !json.play) {
      return res.status(404).json({ error: "No media found" });
    }

    return res.status(200).json({
      platform: "tiktok",
      type: "video",
      media: json.play,
      thumb: json.cover,
      audio: json.music,
      metadata: {
        title: json.title,
        author: json.author,
        likes: json.like_count,
        comments: json.comment_count,
        shares: json.share_count,
        plays: json.play_count,
        created: json.create_time,
        duration: json.duration
      }
    });
  } catch (err) {
    console.error("TikTok fetch error:", err.message);
    return res.status(500).json({ error: "Failed to fetch TikTok media" });
  }
};

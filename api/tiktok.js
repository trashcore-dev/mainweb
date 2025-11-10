const fg = require('api-dylux');
const axios = require('axios');

async function fallbackTikTok(url) {
  const res = await axios.get(`https://api.tikwm.com/video/info?url=${encodeURIComponent(url)}`);
  return res.data.data;
}

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing TikTok URL" });

  try {
    let json;
    try {
      const data = await fg.tiktok(url);
      json = data.result;
    } catch {
      json = await fallbackTikTok(url);
    }

    return res.json({
      platform: "tiktok",
      type: "video",
      media: json.play,
      thumb: json.cover,
      audio: json.music,
      metadata: {
        id: json.id,
        title: json.title,
        author: json.author?.nickname || json.author,
        likes: json.digg_count || json.like_count,
        comments: json.comment_count,
        shares: json.share_count,
        plays: json.play_count,
        created: json.create_time,
        duration: json.duration,
        size: json.size
      }
    });
  } catch (err) {
    console.error("TikTok error:", err);
    return res.status(500).json({ error: "Failed to fetch TikTok media" });
  }
};

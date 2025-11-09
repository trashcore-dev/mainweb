import yts from 'yt-search';
import axios from 'axios';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query || query.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid or missing query" }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await yts(`${query} official`);
    const video = results.videos?.[0];
    if (!video || !video.url) throw new Error("No video found");

    const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(apiUrl);
    const apiData = response.data;

    if (!apiData.status || !apiData.result?.downloadUrl) {
      console.error("API response:", apiData);
      throw new Error("API failed to return a valid MP3 link");
    }

    return new Response(JSON.stringify({
      title: apiData.result.title || video.title,
      downloadUrl: apiData.result.downloadUrl
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("Download error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

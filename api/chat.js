// Vercel Serverless Function for Drexter AI
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported.' });
  }

  try {
    // Parse request body
    const { text, model } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Valid text input is required' });
    }
    
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'Valid model selection is required' });
    }

    // Clean the text input
    const cleanedText = text.trim().substring(0, 2000); // Limit to 2000 characters

    // Map model to API endpoint
    let apiUrl, isZenzxzApi = false;
    switch (model) {
      case 'copilot':
        apiUrl = `https://api.nekolabs.my.id/ai/copilot?text=${encodeURIComponent(cleanedText)}`;
        break;
      case 'qwen':
        apiUrl = `https://api.zenzxz.my.id/api/ai/chatai?query=${encodeURIComponent(cleanedText)}&model=qwen3-coder-480b-a35b-instruct}`;
        isZenzxzApi = true; // Flag for special response handling
        break;
      case 'llama':
        apiUrl = `https://api.nekolabs.web.id/ai/cf/llama-3.3-70b?text=${encodeURIComponent(cleanedText)}`;
        break;
      case 'gpt':
        apiUrl = `https://api.nekolabs.web.id/ai/cf/gpt-oss-120b?text=${encodeURIComponent(cleanedText)}`;
        break;
      default:
        apiUrl = `https://api.nekolabs.my.id/ai/copilot?text=${encodeURIComponent(cleanedText)}`;
    }

    // Make request to the AI API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'User-Agent': 'Drexter-AI/1.0 (Vercel)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if response is ok
    if (!apiResponse.ok) {
      console.error(`AI API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      return res.status(502).json({ 
        error: `AI service returned error: ${apiResponse.status}` 
      });
    }

    const data = await apiResponse.json();
    
    // Extract reply text with fallbacks
    let replyText = '';
    if (isZenzxzApi) {
      // Special handling for Zenzxz API response structure
      if (data?.result?.response) {
        replyText = data.result.response;
      } else if (typeof data?.result === 'string') {
        replyText = data.result;
      } else if (typeof data?.response === 'string') {
        replyText = data.response;
      } else {
        replyText = "❌ Sorry, I couldn't generate a response from the Qwen API. Please try again.";
      }
    } else {
      // Standard response handling for other APIs
      if (data?.result?.text) {
        replyText = data.result.text;
      } else if (typeof data?.result === 'string') {
        replyText = data.result;
      } else if (typeof data?.answer === 'string') {
        replyText = data.answer;
      } else if (typeof data === 'string') {
        replyText = data;
      } else {
        replyText = "❌ Sorry, I couldn't generate a response. Please try again.";
      }
    }

    // Ensure reply text is not too long
    const finalReply = replyText.substring(0, 5000);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return success response
    res.status(200).json({ reply: finalReply });
    
  } catch (error) {
    console.error('Server Error:', error);
    
    // Handle fetch timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout. The AI service took too long to respond.' });
    }
    
    // Handle network errors
    if (error.message && error.message.includes('fetch failed')) {
      return res.status(502).json({ error: 'Failed to connect to the AI service. Please try again later.' });
    }
    
    // General error
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'URL parameter is required' });
  }

  try {
    // Validate that the URL is from our allowed backend
    const allowedHosts = [
      'fixia-platform-production.up.railway.app',
      'localhost:5000'
    ];
    
    const urlObj = new URL(url);
    if (!allowedHosts.includes(urlObj.host)) {
      return res.status(403).json({ message: 'Host not allowed' });
    }

    // Fetch the image from the backend
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fixia-Frontend-Proxy/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        message: `Failed to fetch image: ${response.statusText}` 
      });
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Validate it's an image
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ message: 'URL does not point to an image' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the image data
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ message: 'Failed to proxy image' });
  }
}
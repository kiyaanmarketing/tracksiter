export default function handler(req, res) {
  try {
    const id = req.query.id || 'unknown';
    console.log(`[Fallback Pixel Triggered] ID: ${id}`);

    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAtUB9oVm0hkAAAAASUVORK5CYII=',
      'base64'
    );

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).end(pixel);
  } catch (err) {
    console.error('Fallback Pixel Error:', err);
    res.status(500).send('Fallback pixel error');
  }
}

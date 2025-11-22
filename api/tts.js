// api/tts.js
// Simple Text-to-Speech proxy using StreamElements
// ?text=Hello+World&key=SPLEXXO

const YOUR_API_KEYS = ["SPLEXXO"]; // tumhara private key
const TTS_ENDPOINT = "https://api.streamelements.com/kappa/v2/speech"; // TTS backend
const DEFAULT_VOICE = "Brian"; // voice name (StreamElements voice)

export default async function handler(req, res) {
  // Sirf GET allow
  if (req.method !== "GET") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(405).json({ error: "method not allowed" });
  }

  const { text: rawText, key: rawKey, voice: rawVoice } = req.query || {};

  // Param check
  if (!rawText || !rawKey) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res
      .status(400)
      .json({ error: "missing parameters: text or key" });
  }

  const text = String(rawText).trim();
  const key = String(rawKey).trim();
  const voice = rawVoice ? String(rawVoice).trim() : DEFAULT_VOICE;

  // API key check
  if (!YOUR_API_KEYS.includes(key)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(403).json({ error: "invalid key" });
  }

  // Agar text bohot chhota hai
  if (!text || text.length < 1) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(400).json({ error: "empty text" });
  }

  // Backend URL build
  const url =
    TTS_ENDPOINT +
    `?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(502).json({
        error: "upstream TTS failed",
        details: `HTTP ${upstream.status}`,
      });
    }

    const audioBuffer = Buffer.from(await upstream.arrayBuffer());

    // Audio response
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-TTS-Developer", "splexxo");
    res.setHeader("X-TTS-Credit-By", "splexx");

    return res.status(200).send(audioBuffer);
  } catch (err) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(502).json({
      error: "tts request error",
      details: err.message || "unknown error",
    });
  }
}

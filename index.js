const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/instagram", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ error: "Invalid Instagram URL" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const script = $('script[type="application/ld+json"]').html();

    if (!script) return res.status(404).json({ error: "Video data not found" });

    const jsonData = JSON.parse(script);
    const videoUrl = jsonData?.video?.contentUrl;

    if (videoUrl) {
      res.json({ videoUrl });
    } else {
      res.status(404).json({ error: "Unable to extract video URL" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

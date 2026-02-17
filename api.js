module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.BLS_API_KEY;
  const { seriesid, startyear, endyear } = req.body;

  // Basic validation
  if (!seriesid || !Array.isArray(seriesid) || seriesid.length === 0) {
    return res.status(400).json({ error: "seriesid must be a non-empty array" });
  }
  if (!startyear || !endyear) {
    return res.status(400).json({ error: "startyear and endyear are required" });
  }

  // Build the request to BLS
  const body = {
    seriesid: seriesid.slice(0, 50),  // BLS max is 50 per request
    startyear: String(startyear),
    endyear: String(endyear),
  };
  if (apiKey) {
    body.registrationkey = apiKey;
  }

  const version = apiKey ? "v2" : "v1";
  const url = `https://api.bls.gov/publicAPI/${version}/timeseries/data/`;

  try {
    const blsResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await blsResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Failed to reach BLS API", detail: err.message });
  }

}

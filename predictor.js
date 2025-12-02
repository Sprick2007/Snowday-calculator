const XWEATHER_API_KEY = "YOUR_XWEATHER_API_KEY"; // replace with your real key

async function predictSnowDay() {
  const zip = document.getElementById("zip").value.trim();
  const school = document.getElementById("school").value.trim();
  if (!zip || !school) {
    document.getElementById("result").innerText = "Please enter both ZIP Code and School Name.";
    return;
  }

  // For now, hardcode lat/lon for Holland, MI (49423).
  // Later you can add geocoding if needed.
  const lat = 42.79, lon = -86.11;

  try {
    // 1) Weather API (Open-Meteo)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=snowfall,temperature_2m,wind_speed&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // Aggregate snowfall for tomorrow
    const times = weatherData.hourly.time;
    const snowfall = weatherData.hourly.snowfall;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    let totalSnowfall = 0;
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]);
      if (
        t.getDate() === tomorrow.getDate() &&
        t.getMonth() === tomorrow.getMonth() &&
        t.getFullYear() === tomorrow.getFullYear()
      ) {
        totalSnowfall += snowfall[i];
      }
    }

    const avgTemp = weatherData.hourly.temperature_2m[0];
    const avgWind = weatherData.hourly.wind_speed[0];

    // 2) Road API (Xweather)
    let surface = "unknown", safety = "unknown";
    try {
      const roadRes = await fetch(
        `https://data.api.xweather.com/roadweather/conditions/?lat=${lat}&lon=${lon}`,
        { headers: { Authorization: `Bearer ${XWEATHER_API_KEY}` } }
      );
      const roadData = await roadRes.json();
      surface = roadData.surface_condition || "unknown";
      safety = roadData.safety_index || "unknown";
    } catch (err) {
      console.warn("Road API error:", err);
    }

    // 3) Weather.gov API
    let nwsForecast = "";
    try {
      const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
      const pointsData = await pointsRes.json();
      const forecastUrl = pointsData.properties.forecast;
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
      nwsForecast = forecastData.properties.periods[1].detailedForecast;
    } catch (err) {
      console.warn("Weather.gov API error:", err);
    }

    // 4) Score calculation
    let score = 0;
    score += totalSnowfall * 5;
    if (avgTemp <= 0) score += 5;
    else if (avgTemp <= 10) score += 4;
    else if (avgTemp <= 20) score += 3;
    else if (avgTemp <= 32) score += 2;
    else score += 1;

    if (surface === "ice") score += 15;
    else if (surface === "snow") score += 10;

    if (safety === "red") score += 10;
    else if (safety === "yellow") score += 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let label = "Low";
    if (score >= 80) label = "Very High";
    else if (score >= 60) label = "High";
    else if (score >= 40) label = "Moderate";

    // 5) Display result
    document.getElementById("result").innerText =
      `Snow Day Likelihood for ${school}: ${label} (${score}%)`;

    // 6) Display reasoning
    const reasoningDiv = document.getElementById("reasoning");
    const content = document.getElementById("reasoningContent");
    reasoningDiv.hidden = false;
    content.innerHTML = `
      <p><strong>Total snowfall tomorrow:</strong> ${totalSnowfall.toFixed(1)} in</p>
      <p><strong>Avg temperature:</strong> ${avgTemp} °F</p>
      <p><strong>Avg wind speed:</strong> ${avgWind} mph</p>
      <p><strong>Road surface:</strong> ${surface}</p>
      <p><strong>Safety index:</strong> ${safety}</p>
      <p><strong>Weather.gov forecast:</strong> ${nwsForecast}</p>
    `;
  } catch (err) {
    document.getElementById("result").innerText = "Error fetching data.";
    console.error(err);
  }
}

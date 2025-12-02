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
    // 1. Get weather.gov POINT metadata for this location
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const pointsData = await pointsRes.json();

    // 2. Get gridpoints for hourly data (snowfall, temperature, wind)
    const gridId = pointsData.properties.gridId;
    const gridX = pointsData.properties.gridX;
    const gridY = pointsData.properties.gridY;
    // Fetch the grid data (6-hourly precipitation, hourly temp/wind, etc)
    const gridRes = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}`);
    const gridData = await gridRes.json();

    // 3. Aggregate tomorrow's predicted snowfall/precipitation
    // Use "quantitativePrecipitation" (liquid precipitation in mm) and "snowfallAmount" if available
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    // Find gridpoints periods for tomorrow
    let totalSnowfall = 0;
    if (gridData.properties.snowfallAmount) {
      for (const period of gridData.properties.snowfallAmount.values) {
        const t = new Date(period.validTime.split("/")[0]);
        if (
          t.getDate() === tomorrow.getDate() &&
          t.getMonth() === tomorrow.getMonth() &&
          t.getFullYear() === tomorrow.getFullYear()
        ) {
          totalSnowfall += period.value || 0;
        }
      }
    }

    // Get average temperature and wind speed for tomorrow (from temp/windSpeed hourly)
    let tempCount = 0, windCount = 0, tempSum = 0, windSum = 0;
    if (gridData.properties.temperature) {
      for (const period of gridData.properties.temperature.values) {
        const t = new Date(period.validTime.split("/")[0]);
        if (
          t.getDate() === tomorrow.getDate() &&
          t.getMonth() === tomorrow.getMonth() &&
          t.getFullYear() === tomorrow.getFullYear()
        ) {
          if (typeof period.value === "number") {
            tempSum += period.value;
            tempCount++;
          }
        }
      }
    }
    if (gridData.properties.windSpeed) {
      for (const period of gridData.properties.windSpeed.values) {
        const t = new Date(period.validTime.split("/")[0]);
        if (
          t.getDate() === tomorrow.getDate() &&
          t.getMonth() === tomorrow.getMonth() &&
          t.getFullYear() === tomorrow.getFullYear()
        ) {
          if (typeof period.value === "number") {
            windSum += period.value;
            windCount++;
          }
        }
      }
    }
    const avgTemp = tempCount ? (tempSum/tempCount) : "unknown";
    const avgWind = windCount ? (windSum/windCount) : "unknown";

    // 4. Get detailed forecast text for tomorrow
    let nwsForecast = "";
    try {
      const forecastUrl = pointsData.properties.forecast;
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
      // Try to find the correct "period"
      const tomorrowString = tomorrow.toLocaleDateString('en-US', {
        weekday: 'long'
      });
      const period = forecastData.properties.periods.find(
        p => p.name === "Tomorrow" || p.name.includes(tomorrowString)
      );
      nwsForecast = period ? period.detailedForecast : forecastData.properties.periods[1].detailedForecast;
    } catch (err) {
      console.warn("Weather.gov forecast text error:", err);
    }

    // 5. Score calculation (simple)
    let score = 0;
    score += totalSnowfall * 5;
    if (typeof avgTemp === "number") {
      if (avgTemp <= 0) score += 5;
      else if (avgTemp <= 10) score += 4;
      else if (avgTemp <= 20) score += 3;
      else if (avgTemp <= 32) score += 2;
      else score += 1;
    }
    // No road/safety index available

    score = Math.max(0, Math.min(100, Math.round(score)));

    let label = "Low";
    if (score >= 80) label = "Very High";
    else if (score >= 60) label = "High";
    else if (score >= 40) label = "Moderate";

    // 6. Display result
    document.getElementById("result").innerText =
      `Snow Day Likelihood for ${school}: ${label} (${score}%)`;

    // 7. Display reasoning
    const reasoningDiv = document.getElementById("reasoning");
    const content = document.getElementById("reasoningContent");
    reasoningDiv.hidden = false;
    content.innerHTML = `
      <p><strong>Total snowfall tomorrow:</strong> ${totalSnowfall.toFixed(1)} in</p>
      <p><strong>Avg temperature:</strong> ${avgTemp} °F</p>
      <p><strong>Avg wind speed:</strong> ${avgWind} mph</p>
      <p><strong>Road surface:</strong> unknown (weather.gov only)</p>
      <p><strong>Safety index:</strong> unknown (weather.gov only)</p>
      <p><strong>Weather.gov forecast:</strong> ${nwsForecast}</p>
    `;
  } catch (err) {
    document.getElementById("result").innerText = "Error fetching data.";
    console.error(err);
  }
}

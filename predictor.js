<script>
const OPENCAGE_API_KEY = "d22ed8ff258545c899280d4fa473b87b"; // replace with your key

async function getSnowDayData(zip) {
  try {
    // 1) Geocode ZIP → lat/lon
    const geoRes = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${OPENCAGE_API_KEY}&limit=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.results.length) throw new Error("ZIP not found");
    const { lat, lng } = geoData.results[0].geometry;

    // 2) Fetch next-day weather from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=snowfall,temperature_2m,wind_speed&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // 3) Aggregate snowfall for tomorrow
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

    // 4) Return structured data
    return {
      zip,
      lat,
      lon: lng,
      totalSnowfall,
      avgTemp: weatherData.hourly.temperature_2m[0],
      avgWind: weatherData.hourly.wind_speed[0]
    };
  } catch (err) {
    console.error(err);
    return { error: "Unable to fetch data" };
  }
}

// Example usage:
async function predictSnowDay() {
  const zip = document.getElementById("zip").value.trim();
  const school = document.getElementById("school").value.trim();
  const data = await getSnowDayData(zip);

  if (data.error) {
    document.getElementById("result").innerText = data.error;
    return;
  }

  document.getElementById("result").innerText =
    `Location: ${school} (${zip})\n` +
    `Lat/Lon: ${data.lat}, ${data.lon}\n` +
    `Total Snowfall Tomorrow: ${data.totalSnowfall.toFixed(1)} in\n` +
    `Avg Temp: ${data.avgTemp} °F\n` +
    `Avg Wind: ${data.avgWind} mph`;
}
</script>

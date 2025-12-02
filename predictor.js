const zip = document.getElementById('zip').value.trim();
const school = document.getElementById('school').value.trim();
predictSnowDay(zip, school);

function predictSnowDay(zip, schoolName) {
  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${OPENCAGE_API_KEY}&limit=1`)
    .then(res => res.json())
    .then(geo => {
      const { lat, lng } = geo.results[0].geometry;

      // Fetch weather data
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,snowfall,wind_speed`)
        .then(res => res.json())
        .then(weather => {
          const temp = weather.hourly.temperature_2m[0];
          const snow = weather.hourly.snowfall[0];
          const wind = weather.hourly.wind_speed[0];

          // Fetch road condition data
          fetch(`https://data.api.xweather.com/roadweather/conditions/?lat=${lat}&lon=${lng}`, {
            headers: { "Authorization": `Bearer ${XWEATHER_API_KEY}` }
          })
            .then(res => res.json())
            .then(road => {
              const surface = road.surface_condition || "unknown";
              const safety = road.safety_index || "unknown";

              // Calculate wind chill factor
              let windChill = 0;
              if (temp <= 0) windChill = 5;
              else if (temp <= 10) windChill = 4;
              else if (temp <= 20) windChill = 3;
              else if (temp <= 32) windChill = 2;
              else windChill = 1;

              // Road preparedness (mocked for now)
              const roadPreparedness = 0;

              // Score calculation
              let score = 0;
              score += (snow * 5);
              score += windChill;
              if (surface === "ice") score += 15;
              else if (surface === "snow") score += 10;
              if (safety === "red") score += 10;
              else if (safety === "yellow") score += 5;
              score -= (roadPreparedness * 10);

              // Bound and label
              score = Math.max(0, Math.min(100, Math.round(score)));
              let label = "Low";
              if (score >= 80) label = "Very High";
              else if (score >= 60) label = "High";
              else if (score >= 40) label = "Moderate";

              // Display result
              document.getElementById('result').innerText =
                `Snow Day Likelihood for ${schoolName}: ${label} (${score}%)`;
            });
        });
    });
}

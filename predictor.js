const lat = 42.79, lon = -86.11; // Holland, MI
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,snowfall,wind_speed`)
  .then(res => res.json())
  .then(data => {
    const temp = data.hourly.temperature_2m[0];
    const snow = data.hourly.snowfall[0];
    const wind = data.hourly.wind_speed[0];
    // Use in prediction formula
  });
fetch("https://data.api.xweather.com/roadweather/conditions/?lat=42.79&lon=-86.11", {
  headers: { "Authorization": "Bearer YOUR_API_KEY" }
})
  .then(res => res.json())
  .then(data => {
    const surface = data.surface_condition; // e.g., "snow"
    const safety = data.safety_index;       // e.g., "yellow"
    // Adjust prediction based on these
  });
let score = 0;
score += (snowfall * 5);
score += windChill;
if (surface === "ice") score += 15;
else if (surface === "snow") score += 10;
if (safety === "red") score += 10;
else if (safety === "yellow") score += 5;
score -= (roadPreparedness * 10);

// Basic sample - please adapt to your forecast logic/API
function predictSnowDay() {
  const zip = document.getElementById('zip').value.trim();
  const school = document.getElementById('school').value.trim();
  const resultDiv = document.getElementById('result');
  const reasoningDiv = document.getElementById('reasoning');
  const reasoningContent = document.getElementById('reasoningContent');

  if (!zip || !school) {
    resultDiv.textContent = 'Please enter both ZIP code and school name.';
    reasoningDiv.hidden = true;
    return;
  }

  // Simulate prediction logic -- replace with real API or logic!
  let chance = Math.floor(Math.random() * 100); // fake percent for demo
  let message;
  if (chance > 70) {
    message = '❄️ High chance of a Snow Day!';
  } else if (chance > 40) {
    message = '☁️ Moderate chance of a Snow Day.';
  } else {
    message = '🌧️ Low chance of a Snow Day.';
  }

  resultDiv.textContent = message + ' (' + chance + '%)';
  reasoningDiv.hidden = false;
  reasoningContent.textContent = `Prediction based on your input for ${school} (${zip}). This is a simulated demo, update logic to use forecast data for real predictions.`;
}

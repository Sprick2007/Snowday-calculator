// Ensure everything waits for DOM loaded
window.onload = function () {
  document.getElementById('snowdayForm').onsubmit = function (e) {
    e.preventDefault();
    predictSnowDay();
  };
  document.getElementById('zipBtn').onclick = predictSnowDay;
};

function predictSnowDay() {
  const zip = document.getElementById('zip').value.trim();
  const school = document.getElementById('school').value.trim();
  const resultDiv = document.getElementById('result');

  if (!zip || !school) {
    resultDiv.textContent = 'Please enter both ZIP code and school name.';
    return;
  }

  // Simulate the forecast
  const chance = Math.floor(Math.random() * 101); // random percentage
  let msg = `Chance of a snow day at ${school} (${zip}) tomorrow: ${chance}%`;
  if (chance > 80) {
    msg += " ❄️";
  } else if (chance > 50) {
    msg += " ☁️";
  } else {
    msg += " 🌧️";
  }
  resultDiv.textContent = msg;
}

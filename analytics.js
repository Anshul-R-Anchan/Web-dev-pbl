import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Use your same Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB6s8qXtXMUmNuB6V6PaV2rbDXoBec6Lo8",
  databaseURL: "https://fitness-tracker-56a6e-default-rtdb.firebaseio.com/",
  // ... include the rest of your config
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function generateSuggestions() {
  try {
    const snapshot = await get(ref(db, 'latest_workout'));
    if (snapshot.exists && snapshot.exists()) {
      // support both RTDB (.val) and potential snapshot.data()
      const data = (typeof snapshot.val === 'function') ? snapshot.val() : (snapshot.data ? snapshot.data() : null);
      const calories = data?.calories ?? 0;
      let suggestion = "";

      // Comparison Logic
      if (calories < 200) {
        suggestion = "Your last burn was low. Try a 15-minute HIIT session to boost metabolism!";
      } else if (calories >= 200 && calories < 500) {
        suggestion = "Great steady work! Tomorrow, try increasing your distance by 1km.";
      } else {
        suggestion = "Elite performance! Focus on recovery and protein intake today.";
      }

      // Display on the page
      const suggestionBox = document.getElementById('suggestionBox');
      const lastBurn = document.getElementById('lastBurn');
      const calorieMetric = document.getElementById('calorieMetric');
      if (suggestionBox) suggestionBox.innerText = suggestion;
      if (lastBurn) lastBurn.innerText = calories + ' kcal';
      if (calorieMetric) calorieMetric.innerText = 'Burn ' + calories;
    } else {
      const suggestionBox = document.getElementById('suggestionBox');
      if (suggestionBox) suggestionBox.innerText = 'No recent workout found.';
    }
  } catch (err) {
    console.error(err);
    const suggestionBox = document.getElementById('suggestionBox');
    if (suggestionBox) suggestionBox.innerText = 'Unable to load analytics.';
  }
}

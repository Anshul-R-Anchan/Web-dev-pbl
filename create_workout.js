import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6s8qXtXMUmNuB6V6PaV2rbDXoBec6Lo8",
  authDomain: "fitness-tracker-56a6e.firebaseapp.com",
  projectId: "fitness-tracker-56a6e",
  storageBucket: "fitness-tracker-56a6e.appspot.com",
  messagingSenderId: "777614210636",
  appId: "1:777614210636:web:6540c497476579f168b422",
  // This line is required for Realtime Database
  databaseURL: "https://fitness-tracker-56a6e-default-rtdb.firebaseio.com/" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const workoutForm = document.getElementById('workoutForm');
const resultDiv = document.getElementById('result');

workoutForm.addEventListener('submit', (e) => {
  e.preventDefault(); 

  const workoutData = {
    title: document.getElementById('title').value,
    date: document.getElementById('date').value,
    duration: Number(document.getElementById('duration').value),
    distance: Number(document.getElementById('distance').value),
    calories: Number(document.getElementById('calories').value),
    notes: document.getElementById('notes').value
  };

  // 'latest_workout' is the location in your database
  // .set() replaces the old data with this new data
  set(ref(db, 'latest_workout'), workoutData)
    .then(() => {
      resultDiv.innerHTML = "<p style='color:green'>✅ Data Saved & Replaced!</p>";
    })
    .catch((error) => {
      resultDiv.innerHTML = "<p style='color:red'>❌ Error: " + error.message + "</p>";
    });
});
// Helper to populate form fields from data object
function populateFields(data) {
  if (!data) return;
  if (data.title !== undefined) document.getElementById('title').value = data.title;
  if (data.date !== undefined) document.getElementById('date').value = data.date;
  if (data.duration !== undefined) document.getElementById('duration').value = Number(data.duration) || '';
  if (data.distance !== undefined) document.getElementById('distance').value = Number(data.distance) || '';
  if (data.calories !== undefined) document.getElementById('calories').value = Number(data.calories) || '';
  if (data.notes !== undefined) document.getElementById('notes').value = data.notes;
  const dateHint = document.getElementById('dateHint');
  if (dateHint) dateHint.textContent = 'Loaded values from database (latest workout)';
}

// Reference to latest workout
const latestRef = ref(db, 'latest_workout');

console.log('Firebase initialized, database URL:', firebaseConfig.databaseURL);

// One-time read to help diagnose permissions/network issues
console.log('Attempting one-time fetch of latest_workout...');
get(latestRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('One-time fetch succeeded:', data);
      populateFields(data);
    } else {
      console.log('One-time fetch: no data at latest_workout');
    }
  })
  .catch((err) => {
    console.error('One-time fetch error:', err);
    resultDiv.innerHTML = "<p style='color:red'>❌ Read error: " + err.message + "</p>";
  });

// Live listener for updates
onValue(latestRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    console.log('onValue update received:', data);
    populateFields(data);
  }
}, (error) => {
  console.error('onValue listener error:', error);
  resultDiv.innerHTML = "<p style='color:red'>❌ Listener error: " + error.message + "</p>";
});
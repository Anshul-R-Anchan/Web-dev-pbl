// Firebase config and DB initialization (reused from create_workout.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6s8qXtXMUmNuB6V6PaV2rbDXoBec6Lo8",
  authDomain: "fitness-tracker-56a6e.firebaseapp.com",
  projectId: "fitness-tracker-56a6e",
  storageBucket: "fitness-tracker-56a6e.appspot.com",
  messagingSenderId: "777614210636",
  appId: "1:777614210636:web:6540c497476579f168b422",
  databaseURL: "https://fitness-tracker-56a6e-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Calendar rendering and add-button link setup
(() => {
  const calendarEl = document.getElementById('calendar');
  const monthYearEl = document.getElementById('monthYear');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  const CREATE_BASE = 'create_workout.html';

  let now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();

  function pad(n){ return n < 10 ? '0' + n : n; }

  function renderCalendar(year, month){
    calendarEl.innerHTML = '';

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.forEach(d => {
      const dEl = document.createElement('div');
      dEl.className = 'day';
      dEl.textContent = d;
      calendarEl.appendChild(dEl);
    });

    monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // leading empty cells
    for(let i=0;i<firstDayIndex;i++){
      const empty = document.createElement('div');
      empty.className = 'cell';
      calendarEl.appendChild(empty);
    }

    // date cells
    for(let d=1; d<=daysInMonth; d++){
      const cell = document.createElement('div');
      cell.className = 'cell';

      const dateNum = document.createElement('div');
      dateNum.className = 'date';
      dateNum.textContent = d;
      cell.appendChild(dateNum);

      const yyyy = year;
      const mm = pad(month + 1);
      const dd = pad(d);
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const a = document.createElement('a');
      a.className = 'add-btn';
      a.href = `${CREATE_BASE}?date=${dateStr}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = '+';
      a.setAttribute('aria-label', 'Create workout');

      cell.appendChild(a);
      calendarEl.appendChild(cell);
    }
  }

  prevBtn.addEventListener('click', function(){
    currentMonth--;
    if(currentMonth < 0){ currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
  });

  nextBtn.addEventListener('click', function(){
    currentMonth++;
    if(currentMonth > 11){ currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth);
  });

  // initial render
  renderCalendar(currentYear, currentMonth);
})();
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let date = new Date();
let month = date.getMonth();
let year = date.getFullYear();

const CREATE_BASE = 'create_workout.html';

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function pad(n){ return n < 10 ? '0' + n : n; }

function renderCalendar() {
  calendar.innerHTML = "";
  monthYear.textContent = `${months[month]} ${year}`;

  // Week days
  ["MON","TUE","WED","THU","FRI","SAT","SUN"].forEach(d => {
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = d;
    calendar.appendChild(day);
  });

  // Days count
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    const yyyy = year;
    const mm = pad(month + 1);
    const dd = pad(i);
    const dateStr = `${yyyy}-${mm}-${dd}`;

    cell.innerHTML = `
      <span class="date">${i}</span>
      <a class="add-btn" href="${CREATE_BASE}?date=${dateStr}" target="_blank" rel="noopener">+</a>
    `;
    calendar.appendChild(cell);
  }
}

document.getElementById("prev").onclick = () => {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  renderCalendar();
};

renderCalendar();

// -- Stats population: read latest_workout from Realtime Database and fill stat elements
const distanceEl = document.getElementById('distanceValue');
const durationEl = document.getElementById('durationValue');
const caloriesEl = document.getElementById('caloriesValue');
const workoutsEl = document.getElementById('workoutsValue');

function formatDuration(mins){
  const m = Number(mins) || 0;
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  return hrs > 0 ? `${hrs}:${String(rem).padStart(2,'0')}` : `0:${String(rem).padStart(2,'0')}`;
}

const latestRef = ref(db, 'latest_workout');

// one-time read
get(latestRef)
  .then(snapshot => {
    if (snapshot.exists()){
      const data = snapshot.val();
      if (distanceEl && data.distance !== undefined) distanceEl.textContent = Number(data.distance).toFixed(2);
      if (durationEl && data.duration !== undefined) durationEl.textContent = formatDuration(data.duration);
      if (caloriesEl && data.calories !== undefined) caloriesEl.textContent = String(data.calories);
      console.log('Fitness page: one-time fetch succeeded', data);
    } else {
      console.log('Fitness page: no latest_workout found');
    }
  })
  .catch(err => {
    console.error('Fitness page: read error', err);
  });

// live updates
onValue(latestRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;
  if (distanceEl && data.distance !== undefined) distanceEl.textContent = Number(data.distance).toFixed(2);
  if (durationEl && data.duration !== undefined) durationEl.textContent = formatDuration(data.duration);
  if (caloriesEl && data.calories !== undefined) caloriesEl.textContent = String(data.calories);
  console.log('Fitness page: onValue update', data);
});

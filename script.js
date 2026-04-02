/* =============================================
   FitFuel — script.js
   All functionality for the website
   ============================================= */

/* ── Cart State ── */
const cart = JSON.parse(localStorage.getItem('fitfuel_cart') || '[]');

function saveCart() {
  localStorage.setItem('fitfuel_cart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const countEls = document.querySelectorAll('.cart-count');
  const count = getCartCount();
  countEls.forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`✓ ${name} added to cart!`);
}

/* ── Toast ── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Navbar Toggle ── */
function initNavbar() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  updateCartUI();

  // Mark active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ============================================================
   CALCULATOR PAGE
   ============================================================ */
function initCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) return;

  // Gender toggle
  document.querySelectorAll('.toggle-btn[data-gender]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn[data-gender]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const gender = document.querySelector('.toggle-btn[data-gender].active')?.dataset.gender || 'male';
    const age    = parseFloat(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const actMul = parseFloat(document.getElementById('activity').value);

    if (!age || !weight || !height) return showToast('Please fill in all fields.');

    // Mifflin-St Jeor
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const maintenance = Math.round(bmr * actMul);
    const loss        = maintenance - 500;
    const gain        = maintenance + 500;

    // BMI
    const heightM = height / 100;
    const bmi     = (weight / (heightM * heightM)).toFixed(1);
    let bmiLabel  = 'Normal';
    if      (bmi < 18.5) bmiLabel = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiLabel = 'Overweight';
    else if (bmi >= 30)  bmiLabel = 'Obese';

    document.getElementById('res-bmr').textContent         = Math.round(bmr);
    document.getElementById('res-maintenance').textContent = maintenance;
    document.getElementById('res-loss').textContent        = loss;
    document.getElementById('res-gain').textContent        = gain;
    document.getElementById('res-bmi').textContent         = bmi;
    document.getElementById('res-bmi-label').textContent   = bmiLabel;

    const results = document.getElementById('calc-results');
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ============================================================
   DIET PLANNER PAGE
   ============================================================ */
const DIET_PLANS = {
  loss: {
    veg: [
      { meal: 'Breakfast', time: '7:30 AM', emoji: '☕', kcal: 340, p: 28, c: 42, f: 6,
        items: ['1 cup oatmeal with skimmed milk', '1 scoop whey protein', '1 banana', 'Black coffee or green tea'] },
      { meal: 'Mid-Morning Snack', time: '10:30 AM', emoji: '🍎', kcal: 180, p: 8, c: 22, f: 6,
        items: ['1 apple', '10 almonds', '1 cup low-fat yogurt'] },
      { meal: 'Lunch', time: '1:00 PM', emoji: '🍽', kcal: 430, p: 30, c: 50, f: 12,
        items: ['1 cup brown rice or 2 rotis', 'Palak paneer (100g paneer)', 'Mixed green salad', 'Dal (lentils)'] },
      { meal: 'Evening Snack', time: '4:30 PM', emoji: '🌤', kcal: 150, p: 12, c: 18, f: 3,
        items: ['Sprouts bhel (1 cup)', '1 cup buttermilk (chaas)', 'Cucumber slices'] },
      { meal: 'Dinner', time: '7:30 PM', emoji: '🌙', kcal: 310, p: 24, c: 35, f: 8,
        items: ['2 multigrain rotis', 'Tofu bhurji or mixed veg sabzi', '1 cup dal', 'Cucumber raita'] },
    ],
    nonveg: [
      { meal: 'Breakfast', time: '7:30 AM', emoji: '☕', kcal: 310, p: 30, c: 28, f: 8,
        items: ['3 egg whites + 1 whole egg scrambled', '2 slices whole wheat toast', '1 cup green tea'] },
      { meal: 'Mid-Morning Snack', time: '10:30 AM', emoji: '🍎', kcal: 200, p: 25, c: 20, f: 2,
        items: ['1 scoop whey protein in water', '1 medium apple'] },
      { meal: 'Lunch', time: '1:00 PM', emoji: '🍽', kcal: 400, p: 45, c: 40, f: 5,
        items: ['Grilled chicken breast 150g', '1 cup brown rice', 'Steamed broccoli & carrots', 'Large green salad'] },
      { meal: 'Evening Snack', time: '4:30 PM', emoji: '🌤', kcal: 140, p: 14, c: 16, f: 2,
        items: ['Boiled eggs (2 whites)', 'Black coffee', '1 orange'] },
      { meal: 'Dinner', time: '7:30 PM', emoji: '🌙', kcal: 340, p: 38, c: 30, f: 7,
        items: ['Baked fish (150g) or chicken curry', '2 rotis or ½ cup rice', 'Sautéed spinach', 'Cucumber salad'] },
    ],
  },
  maintenance: {
    veg: [
      { meal: 'Breakfast', time: '8:00 AM', emoji: '☕', kcal: 400, p: 22, c: 55, f: 10,
        items: ['Vegetable poha or upma (1.5 cups)', 'Paneer cubes 75g', '1 glass full-fat milk', 'Seasonal fruit'] },
      { meal: 'Mid-Morning Snack', time: '11:00 AM', emoji: '🍎', kcal: 270, p: 10, c: 30, f: 12,
        items: ['Mixed nuts & seeds (30g)', '1 banana or 2 dates', '1 cup low-fat yogurt with honey'] },
      { meal: 'Lunch', time: '1:30 PM', emoji: '🍽', kcal: 520, p: 28, c: 70, f: 14,
        items: ['1.5 cups basmati rice or 3 rotis', 'Rajma or chana masala', 'Mixed veg sabzi', 'Curd (dahi) 1 cup'] },
      { meal: 'Evening Snack', time: '5:00 PM', emoji: '🌤', kcal: 260, p: 12, c: 30, f: 10,
        items: ['Peanut butter toast (1 slice)', 'Fruit smoothie (1 cup)', 'Roasted makhana (fox nuts)'] },
      { meal: 'Dinner', time: '8:00 PM', emoji: '🌙', kcal: 450, p: 28, c: 45, f: 16,
        items: ['3 rotis or 1 cup rice', 'Paneer butter masala (150g)', 'Dal tadka', 'Salad'] },
    ],
    nonveg: [
      { meal: 'Breakfast', time: '8:00 AM', emoji: '☕', kcal: 400, p: 26, c: 40, f: 14,
        items: ['3-egg omelette with vegetables', '2 whole wheat toast', '1 glass orange juice'] },
      { meal: 'Mid-Morning Snack', time: '11:00 AM', emoji: '🍎', kcal: 230, p: 20, c: 22, f: 5,
        items: ['Chicken tikka (75g)', 'Cucumber-tomato salad', '1 banana'] },
      { meal: 'Lunch', time: '1:30 PM', emoji: '🍽', kcal: 540, p: 50, c: 55, f: 12,
        items: ['Chicken biryani or grilled fish (200g)', '1 cup brown rice', 'Dal', 'Raita'] },
      { meal: 'Evening Snack', time: '5:00 PM', emoji: '🌤', kcal: 300, p: 28, c: 28, f: 8,
        items: ['Whey protein shake', '1 apple or banana', 'Handful of nuts'] },
      { meal: 'Dinner', time: '8:00 PM', emoji: '🌙', kcal: 430, p: 42, c: 40, f: 10,
        items: ['Grilled chicken or fish (150g)', '2 rotis or ¾ cup rice', 'Palak soup or salad', 'Stir-fried vegetables'] },
    ],
  },
  gain: {
    veg: [
      { meal: 'Breakfast', time: '8:00 AM', emoji: '☕', kcal: 640, p: 30, c: 80, f: 22,
        items: ['3 parathas with ghee', '100g paneer bhurji', '1 glass full-fat milk', '2 bananas'] },
      { meal: 'Mid-Morning Snack', time: '11:00 AM', emoji: '🍎', kcal: 520, p: 28, c: 60, f: 18,
        items: ['Mass gainer shake (1 scoop)', '2 slices peanut butter toast', 'Handful of mixed nuts'] },
      { meal: 'Lunch', time: '1:30 PM', emoji: '🍽', kcal: 770, p: 45, c: 90, f: 25,
        items: ['2 cups rice or 4 rotis', 'Paneer makhani (200g paneer)', 'Rajma or dal makhani', 'Full-fat curd'] },
      { meal: 'Evening Snack', time: '5:00 PM', emoji: '🌤', kcal: 500, p: 35, c: 45, f: 20,
        items: ['Banana protein smoothie (2 scoops)', '2 boiled eggs or tofu cubes', 'Peanut butter (2 tbsp)'] },
      { meal: 'Dinner', time: '8:30 PM', emoji: '🌙', kcal: 610, p: 40, c: 70, f: 18,
        items: ['4 rotis with ghee', 'Soya chunks curry (150g)', 'Mixed veg sabzi', 'Dal', 'Sweet potato (100g)'] },
    ],
    nonveg: [
      { meal: 'Breakfast', time: '8:00 AM', emoji: '☕', kcal: 740, p: 45, c: 75, f: 28,
        items: ['5 whole eggs (scrambled)', '3 slices whole wheat toast with butter', '1 glass full-fat milk', '2 bananas'] },
      { meal: 'Mid-Morning Snack', time: '11:00 AM', emoji: '🍎', kcal: 590, p: 50, c: 65, f: 15,
        items: ['Mass gainer shake (1.5 scoops)', 'Chicken tikka sandwich', '1 glass whole milk'] },
      { meal: 'Lunch', time: '1:30 PM', emoji: '🍽', kcal: 750, p: 65, c: 85, f: 14,
        items: ['Chicken breast 250g (grilled)', '2 cups rice or 4 rotis', 'Dal & vegetables', 'Curd + salad'] },
      { meal: 'Evening Snack', time: '5:00 PM', emoji: '🌤', kcal: 580, p: 45, c: 50, f: 22,
        items: ['Whey protein shake (2 scoops)', 'Peanut butter banana smoothie', '6 almonds + 6 cashews'] },
      { meal: 'Dinner', time: '8:30 PM', emoji: '🌙', kcal: 700, p: 55, c: 75, f: 20,
        items: ['Fish curry or mutton (200g)', '4 rotis with ghee or 1.5 cups rice', 'Sautéed vegetables', 'Dal', 'Sweet potato (100g)'] },
    ],
  },
};

function initDiet() {
  const form = document.getElementById('diet-form');
  if (!form) return;

  let currentGoal = 'maintenance';
  let currentDiet = 'veg';

  // Goal radio cards
  document.querySelectorAll('.radio-card[data-goal]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.radio-card[data-goal]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentGoal = card.dataset.goal;
    });
  });

  // Diet type toggle
  document.querySelectorAll('.toggle-btn[data-diet]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn[data-diet]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiet = btn.dataset.diet;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetKcal = parseInt(document.getElementById('target-kcal').value) || 2000;
    const meals = DIET_PLANS[currentGoal][currentDiet];
    const baseTotal = meals.reduce((s, m) => s + m.kcal, 0);
    const scale = targetKcal / baseTotal;

    const totalP = Math.round(meals.reduce((s, m) => s + m.p, 0) * scale);
    const totalC = Math.round(meals.reduce((s, m) => s + m.c, 0) * scale);
    const totalF = Math.round(meals.reduce((s, m) => s + m.f, 0) * scale);

    const goalLabel = { loss: 'Weight Loss', maintenance: 'Maintenance', gain: 'Muscle Gain' };
    const dietLabel = currentDiet === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';

    const resultsEl = document.getElementById('diet-results');
    resultsEl.innerHTML = `
      <div class="diet-summary-bar">
        <div>
          <p class="diet-plan-tag">${goalLabel[currentGoal]} · ${dietLabel}</p>
          <p class="diet-kcal-big">${targetKcal.toLocaleString()} kcal / day</p>
        </div>
        <div class="diet-macro-row">
          <div class="diet-macro-item"><span>Protein</span><strong>${totalP}g</strong></div>
          <div class="diet-macro-item"><span>Carbs</span><strong>${totalC}g</strong></div>
          <div class="diet-macro-item"><span>Fats</span><strong>${totalF}g</strong></div>
        </div>
      </div>
      ${meals.map(meal => {
        const scaledKcal = Math.round(meal.kcal * scale);
        const scaledP = Math.round(meal.p * scale);
        const scaledC = Math.round(meal.c * scale);
        const scaledF = Math.round(meal.f * scale);
        return `
          <div class="meal-card">
            <div class="meal-header" onclick="this.parentElement.classList.toggle('open')">
              <div class="meal-left">
                <div class="meal-emoji">${meal.emoji}</div>
                <div>
                  <div class="meal-name-row">
                    <span class="meal-name">${meal.meal}</span>
                    <span class="meal-time">${meal.time}</span>
                  </div>
                  <p class="meal-preview">${meal.items[0]}${meal.items.length > 1 ? ` + ${meal.items.length - 1} more` : ''}</p>
                </div>
              </div>
              <div class="meal-right">
                <span class="meal-kcal">${scaledKcal} kcal</span>
                <span class="meal-chevron">▼</span>
              </div>
            </div>
            <div class="meal-body">
              <ul class="meal-items">
                ${meal.items.map(item => `<li><span class="meal-dot"></span>${item}</li>`).join('')}
              </ul>
              <div class="meal-macros">
                <span class="macro-pill macro-kcal">${scaledKcal} kcal</span>
                <span class="macro-pill macro-p">P: ${scaledP}g</span>
                <span class="macro-pill macro-c">C: ${scaledC}g</span>
                <span class="macro-pill macro-f">F: ${scaledF}g</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
      <div class="diet-tip">
        <span>💡</span>
        <p><strong>Pro tip:</strong> Drink at least 3–4 litres of water daily. Adjust portions by ±10% based on your weekly weight trend. Consistency over perfection!</p>
      </div>
    `;
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ============================================================
   WORKOUT PAGE
   ============================================================ */
const WORKOUT_DATA = {
  beginner: {
    title: 'Full Body Foundation', subtitle: '3-Day Full Body Split',
    frequency: '3 days / week', duration: '45–60 min',
    goal: 'Build movement patterns & base strength',
    overview: 'Train Monday, Wednesday, Friday with rest days in between. Every session hits all major muscle groups to maximise motor learning and recovery.',
    days: [
      { day: 'Day A', label: 'Monday', focus: 'Full Body — Push Focus', color: '#f97316',
        exercises: [
          { name: 'Barbell / Goblet Squat', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'Quads / Glutes', type: 'compound', tips: 'Chest tall, knees track over toes, break parallel.' },
          { name: 'Push-ups', sets: 3, reps: '10–15', rest: '60 sec', muscle: 'Chest / Triceps', type: 'compound', tips: 'Elbows at 45°, straight body from head to heel.' },
          { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '12', rest: '90 sec', muscle: 'Hamstrings / Glutes', type: 'compound', tips: 'Hinge at hips, soft knees, feel hamstring stretch.' },
          { name: 'Dumbbell Overhead Press', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Shoulders', type: 'compound', tips: 'Brace core, don\'t flare ribs.' },
          { name: 'Plank', sets: 3, reps: '30–45 sec', rest: '45 sec', muscle: 'Core', type: 'isolation', tips: 'Neutral spine, squeeze glutes, breathe normally.' },
        ]},
      { day: 'Day B', label: 'Wednesday', focus: 'Full Body — Pull Focus', color: '#3b82f6',
        exercises: [
          { name: 'Dumbbell Lunges', sets: 3, reps: '10/leg', rest: '90 sec', muscle: 'Quads / Glutes', type: 'compound', tips: 'Step long enough so back knee nearly touches floor.' },
          { name: 'Assisted Pull-ups / Lat Pulldown', sets: 3, reps: '8–10', rest: '90 sec', muscle: 'Back / Lats', type: 'compound', tips: 'Lead with elbows, squeeze lats at bottom.' },
          { name: 'Dumbbell Bench Press', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'Chest', type: 'compound', tips: 'Arch slightly, retract shoulder blades.' },
          { name: 'Dumbbell Bent-Over Row', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Back / Biceps', type: 'compound', tips: 'Hinge to 45°, pull elbow past torso.' },
          { name: 'Dumbbell Bicep Curl', sets: 3, reps: '12', rest: '45 sec', muscle: 'Biceps', type: 'isolation', tips: 'No swinging, full extension at the bottom.' },
        ]},
      { day: 'Day C', label: 'Friday', focus: 'Full Body — Legs Focus', color: '#22c55e',
        exercises: [
          { name: 'Leg Press', sets: 3, reps: '12–15', rest: '90 sec', muscle: 'Quads / Hamstrings', type: 'compound', tips: 'Feet shoulder-width, lower until 90°, never lock knees.' },
          { name: 'Incline Push-ups', sets: 3, reps: '12–15', rest: '60 sec', muscle: 'Upper Chest', type: 'compound', tips: 'Keep core engaged, full range of motion.' },
          { name: 'Dumbbell Lateral Raises', sets: 3, reps: '12–15', rest: '45 sec', muscle: 'Side Delts', type: 'isolation', tips: 'Slight bend in elbows, raise to shoulder height only.' },
          { name: 'Tricep Dips (Bench)', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Triceps', type: 'isolation', tips: 'Elbows point back, not flared out.' },
          { name: 'Glute Bridge', sets: 3, reps: '15', rest: '45 sec', muscle: 'Glutes / Core', type: 'isolation', tips: 'Drive through heels, squeeze glutes at top.' },
        ]},
    ]
  },
  intermediate: {
    title: 'Push / Pull / Legs', subtitle: '6-Day PPL Split',
    frequency: '6 days / week', duration: '60–75 min',
    goal: 'Hypertrophy & strength progression',
    overview: 'Classic PPL run twice per week: Push (Mon/Thu), Pull (Tue/Fri), Legs (Wed/Sat). Each muscle group trained twice per week for optimal growth.',
    days: [
      { day: 'Push', label: 'Mon / Thu', focus: 'Chest · Shoulders · Triceps', color: '#f97316',
        exercises: [
          { name: 'Flat Barbell Bench Press', sets: 4, reps: '6–8', rest: '2–3 min', muscle: 'Chest', type: 'compound', tips: 'Arch back, feet flat, bar to lower chest.' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '8–10', rest: '90 sec', muscle: 'Upper Chest', type: 'compound', tips: '30–45° incline.' },
          { name: 'Seated Overhead Press', sets: 3, reps: '8–10', rest: '2 min', muscle: 'Shoulders', type: 'compound', tips: 'Full lockout overhead.' },
          { name: 'Cable Lateral Raises', sets: 4, reps: '12–15', rest: '60 sec', muscle: 'Side Delts', type: 'isolation', tips: 'Thumb pointing slightly down.' },
          { name: 'Overhead Tricep Extension', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Triceps Long Head', type: 'isolation', tips: 'Keep elbows in, don\'t flare.' },
          { name: 'Tricep Pushdown', sets: 3, reps: '12–15', rest: '45 sec', muscle: 'Triceps', type: 'isolation', tips: 'Elbows glued to sides, full extension.' },
        ]},
      { day: 'Pull', label: 'Tue / Fri', focus: 'Back · Biceps · Rear Delts', color: '#3b82f6',
        exercises: [
          { name: 'Weighted Pull-ups', sets: 4, reps: '6–8', rest: '2–3 min', muscle: 'Lats / Biceps', type: 'compound', tips: 'Full dead-hang, chin clears bar.' },
          { name: 'Barbell Bent-Over Row', sets: 4, reps: '6–8', rest: '2 min', muscle: 'Back', type: 'compound', tips: '45° hinge, bar to belly button.' },
          { name: 'Seated Cable Row', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'Mid-Back', type: 'compound', tips: 'Pull with elbows, don\'t round back.' },
          { name: 'Face Pulls', sets: 4, reps: '15–20', rest: '60 sec', muscle: 'Rear Delts / Rotator Cuff', type: 'isolation', tips: 'Pull to eye level, externally rotate.' },
          { name: 'Incline Dumbbell Curl', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Biceps Long Head', type: 'isolation', tips: 'Full stretch at bottom, supinate at top.' },
          { name: 'Hammer Curl', sets: 3, reps: '10–12', rest: '45 sec', muscle: 'Brachialis / Forearms', type: 'isolation', tips: 'Neutral grip, no swinging.' },
        ]},
      { day: 'Legs', label: 'Wed / Sat', focus: 'Quads · Hamstrings · Calves · Glutes', color: '#a855f7',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6–8', rest: '2–3 min', muscle: 'Quads / Glutes', type: 'compound', tips: 'Bar on traps, brace hard, knees out.' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8–10', rest: '2 min', muscle: 'Hamstrings / Glutes', type: 'compound', tips: 'Push hips back, bar stays close to shins.' },
          { name: 'Leg Press', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'Quads', type: 'compound', tips: 'High foot placement for glute involvement.' },
          { name: 'Leg Curl (Machine)', sets: 3, reps: '12–15', rest: '60 sec', muscle: 'Hamstrings', type: 'isolation', tips: 'Full stretch, curl all the way.' },
          { name: 'Calf Raises (Standing)', sets: 4, reps: '15–20', rest: '45 sec', muscle: 'Calves', type: 'isolation', tips: 'Full range, pause at top and bottom.' },
        ]},
    ]
  },
  advanced: {
    title: '5-Day Hypertrophy Split', subtitle: 'Chest · Back · Shoulders · Legs · Arms',
    frequency: '5 days / week', duration: '75–90 min',
    goal: 'Maximum hypertrophy & peak strength',
    overview: 'Each muscle group gets a dedicated session with high volume. Recovery is paramount — sleep 8 hours and eat in a surplus.',
    days: [
      { day: 'Day 1', label: 'Monday', focus: 'Chest — Volume & Strength', color: '#ef4444',
        exercises: [
          { name: 'Flat Barbell Bench Press', sets: 5, reps: '5 (heavy)', rest: '3–4 min', muscle: 'Chest', type: 'compound', tips: 'Work up to 85–90% 1RM. Touch chest, full lockout.' },
          { name: 'Incline Barbell Press', sets: 4, reps: '8–10', rest: '2–3 min', muscle: 'Upper Chest', type: 'compound', tips: '30° incline, slow 3-sec eccentric.' },
          { name: 'Weighted Dips', sets: 3, reps: '8–10', rest: '2 min', muscle: 'Lower Chest / Triceps', type: 'compound', tips: 'Lean forward 15°, deep stretch at bottom.' },
          { name: 'Cable Crossover', sets: 3, reps: '12–15', rest: '60 sec', muscle: 'Lower Chest', type: 'isolation', tips: 'Cross hands, full squeeze at peak.' },
          { name: 'Machine Chest Press (Drop Set)', sets: 3, reps: '10+10+10', rest: '90 sec', muscle: 'Chest Pump', type: 'isolation', tips: '3 drops with 20% weight reduction.' },
        ]},
      { day: 'Day 2', label: 'Tuesday', focus: 'Back — Width & Thickness', color: '#3b82f6',
        exercises: [
          { name: 'Conventional Deadlift', sets: 4, reps: '4–5 (heavy)', rest: '4 min', muscle: 'Full Back / Posterior Chain', type: 'compound', tips: 'Slack out of bar, big breath, leg drive.' },
          { name: 'Weighted Pull-ups', sets: 4, reps: '6–8', rest: '2–3 min', muscle: 'Lats / Biceps', type: 'compound', tips: 'Full dead-hang start. Pull elbows to hips.' },
          { name: 'T-Bar / Landmine Row', sets: 4, reps: '8–10', rest: '2 min', muscle: 'Mid-Back', type: 'compound', tips: 'Chest on pad, neutral lower back.' },
          { name: 'Wide-Grip Lat Pulldown', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'Lats Width', type: 'compound', tips: 'Lean back slightly, elbows down and back.' },
          { name: 'Face Pulls (Rest-Pause)', sets: 3, reps: '20+10+10', rest: '60 sec', muscle: 'Rear Delts', type: 'isolation', tips: 'Rest-pause: 20 reps, 15s rest, 10 reps, 15s rest, 10 reps.' },
        ]},
      { day: 'Day 3', label: 'Wednesday', focus: 'Shoulders — Width & Caps', color: '#eab308',
        exercises: [
          { name: 'Standing Barbell Military Press', sets: 4, reps: '5–6 (heavy)', rest: '3 min', muscle: 'Front / Side Delts', type: 'compound', tips: 'Full lockout, keep ribs down.' },
          { name: 'Seated DB Shoulder Press', sets: 4, reps: '8–10', rest: '2 min', muscle: 'All Delt Heads', type: 'compound', tips: 'Lower to ear level, full extension up.' },
          { name: 'Cable Lateral Raises (Unilateral)', sets: 5, reps: '15', rest: '60 sec', muscle: 'Side Delts', type: 'isolation', tips: '5 sets with constant cable tension.' },
          { name: 'Rear Delt Machine Fly', sets: 4, reps: '15–20', rest: '60 sec', muscle: 'Rear Delts', type: 'isolation', tips: 'Don\'t use traps, focus on rear delts.' },
          { name: 'Arnold Press', sets: 3, reps: '10–12', rest: '90 sec', muscle: 'All 3 Delt Heads', type: 'compound', tips: 'Rotate palms facing you to forward at top.' },
        ]},
      { day: 'Day 4', label: 'Thursday', focus: 'Legs — Quads, Hamstrings & Glutes', color: '#22c55e',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: '5 (heavy)', rest: '3–4 min', muscle: 'Quads / Glutes', type: 'compound', tips: 'ATG if mobility allows.' },
          { name: 'Hack Squat (Machine)', sets: 4, reps: '10–12', rest: '2 min', muscle: 'Quads Sweep', type: 'compound', tips: 'Feet low on platform, quad-dominant.' },
          { name: 'Romanian Deadlift (Heavy)', sets: 4, reps: '8', rest: '2 min', muscle: 'Hamstrings / Glutes', type: 'compound', tips: 'Push hips back as far as possible.' },
          { name: 'Seated Leg Curl', sets: 4, reps: '12–15', rest: '60 sec', muscle: 'Hamstrings', type: 'isolation', tips: 'Full stretch, curl, hold 1 sec at peak.' },
          { name: 'Standing Calf Raises', sets: 5, reps: '15–20', rest: '45 sec', muscle: 'Gastrocnemius', type: 'isolation', tips: 'Full heel drop for full ROM.' },
        ]},
      { day: 'Day 5', label: 'Friday', focus: 'Arms — Biceps & Triceps', color: '#a855f7',
        exercises: [
          { name: 'EZ-Bar Curl', sets: 4, reps: '8–10', rest: '90 sec', muscle: 'Biceps', type: 'compound', tips: 'Full supination at top.' },
          { name: 'Close-Grip Bench Press', sets: 4, reps: '8–10', rest: '2 min', muscle: 'Triceps All Heads', type: 'compound', tips: 'Hands shoulder-width, elbows forward.' },
          { name: 'Incline Dumbbell Curl', sets: 3, reps: '10–12', rest: '60 sec', muscle: 'Biceps Long Head', type: 'isolation', tips: 'Arms hang fully — massive stretch.' },
          { name: 'Overhead Cable Tricep Extension', sets: 3, reps: '12–15', rest: '60 sec', muscle: 'Triceps Long Head', type: 'isolation', tips: 'Elbows high, full overhead extension.' },
          { name: 'Hammer Curl (Cross-body)', sets: 3, reps: '12/arm', rest: '45 sec', muscle: 'Brachialis / Forearms', type: 'isolation', tips: 'Curl across body, neutral grip.' },
        ]},
    ]
  }
};

function initWorkout() {
  const container = document.getElementById('workout-container');
  if (!container) return;

  let currentLevel = 'beginner';

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.dataset.level;
      renderWorkout(currentLevel);
    });
  });

  renderWorkout(currentLevel);

  function renderWorkout(level) {
    const prog = WORKOUT_DATA[level];
    const openDay = prog.days[0].day;

    container.innerHTML = `
      <div class="prog-banner">
        <div>
          <p class="prog-subtitle">${prog.subtitle}</p>
          <h2 class="prog-title">${prog.title}</h2>
          <p class="prog-overview">${prog.overview}</p>
        </div>
        <div class="prog-meta">
          <div class="prog-meta-item">
            <span class="prog-meta-icon">📅</span>
            <div><small>Frequency</small><strong>${prog.frequency}</strong></div>
          </div>
          <div class="prog-meta-item">
            <span class="prog-meta-icon">⏱</span>
            <div><small>Duration</small><strong>${prog.duration}</strong></div>
          </div>
          <div class="prog-meta-item">
            <span class="prog-meta-icon">🎯</span>
            <div><small>Goal</small><strong>${prog.goal}</strong></div>
          </div>
        </div>
      </div>
      <div class="workout-days">
        ${prog.days.map(day => `
          <div class="day-card ${day.day === openDay ? 'open' : ''}">
            <div class="day-header" onclick="toggleDay(this)">
              <div class="day-left">
                <div class="day-icon" style="background:${day.color}20">🏋️</div>
                <div>
                  <div class="day-name-row">
                    <strong>${day.day}</strong>
                    <span class="day-lbl-badge">${day.label}</span>
                  </div>
                  <p class="day-focus">${day.focus}</p>
                </div>
              </div>
              <div class="day-right">
                <span class="day-ex-count">${day.exercises.length} exercises</span>
                <span class="chevron">▼</span>
              </div>
            </div>
            <div class="day-body">
              <div class="ex-table-head">
                <span style="flex:2">Exercise</span>
                <span>Sets</span>
                <span>Reps</span>
                <span>Rest</span>
                <span>Muscle</span>
                <span>Type</span>
              </div>
              ${day.exercises.map(ex => `
                <div class="ex-row">
                  <div class="ex-name-cell">
                    <strong>${ex.name}</strong>
                    <p class="ex-tip">ℹ️ ${ex.tips}</p>
                  </div>
                  <div class="ex-cell"><strong>${ex.sets}</strong></div>
                  <div class="ex-cell">${ex.reps}</div>
                  <div class="ex-cell ex-muted">${ex.rest}</div>
                  <div class="ex-cell ex-muted" style="font-size:.8rem">${ex.muscle}</div>
                  <div class="ex-cell"><span class="badge badge-${ex.type}">${ex.type}</span></div>
                </div>
                <div class="ex-row-mob">
                  <div class="ex-mob-top">
                    <strong>${ex.name}</strong>
                    <span class="badge badge-${ex.type}">${ex.type}</span>
                  </div>
                  <div class="ex-mob-stats">
                    ${ex.sets} sets × ${ex.reps} &nbsp;·&nbsp; ${ex.rest} rest &nbsp;·&nbsp; ${ex.muscle}
                  </div>
                  <p class="ex-tip">ℹ️ ${ex.tips}</p>
                </div>
              `).join('')}
              <div class="warmup-bar">⚡ <strong>Warm-up:</strong> 5–10 min light cardio + 2 warm-up sets at 50% weight before first compound lift.</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function toggleDay(header) {
  const card = header.parentElement;
  card.classList.toggle('open');
}

/* ============================================================
   STORE PAGE
   ============================================================ */
const PRODUCTS = [
  { id: 1, name: 'Gold Standard 100% Whey', brand: 'Optimum Nutrition', price: 3499, category: 'Protein', rating: 4.8, img: 'images/protein-on-whey.png' },
  { id: 2, name: 'Biozyme Performance Whey', brand: 'MuscleBlaze', price: 2899, category: 'Protein', rating: 4.6, img: 'images/protein-mb-whey.png' },
  { id: 3, name: 'ISO100 Hydrolyzed', brand: 'Dymatize', price: 4299, category: 'Protein', rating: 4.9, img: 'images/protein-dymatize.png' },
  { id: 4, name: 'Pure Whey Protein', brand: 'Nutrabay', price: 2199, category: 'Protein', rating: 4.3, img: 'images/protein-nutrabay.png' },

  { id: 5, name: 'Micronized Creatine Monohydrate', brand: 'Optimum Nutrition', price: 999, category: 'Creatine', rating: 4.7, img: 'images/creatine-on.png' },
  { id: 6, name: 'CreAMP Creatine', brand: 'MuscleBlaze', price: 849, category: 'Creatine', rating: 4.5, img: 'images/creatine-mb.png' },
  { id: 7, name: 'Platinum 100% Creatine', brand: 'MuscleTech', price: 1299, category: 'Creatine', rating: 4.6, img: 'images/creatine-muscletech.png' },

  { id: 8, name: 'C4 Original Pre-Workout', brand: 'Cellucor', price: 2499, category: 'Pre-workout', rating: 4.4, img: 'images/preworkout-c4.png' },
  { id: 9, name: 'WrathX Pre-Workout', brand: 'MuscleBlaze', price: 1599, category: 'Pre-workout', rating: 4.5, img: 'images/preworkout-mb.png' },
  { id: 10, name: 'Essential AmiN.O. Energy', brand: 'Optimum Nutrition', price: 1899, category: 'Pre-workout', rating: 4.7, img: 'images/preworkout-on.png' },

  { id: 11, name: 'Classic Peanut Butter Crunchy', brand: 'Alpino', price: 549, category: 'Peanut Butter', rating: 4.3, img: 'images/pb-alpino.png' },
  { id: 12, name: 'All Natural Peanut Butter', brand: 'Pintola', price: 649, category: 'Peanut Butter', rating: 4.5, img: 'images/pb-pintola.png' },
];

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function stars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function initStore() {
  const grid    = document.getElementById('store-grid');
  const filters = document.querySelectorAll('.filter-btn');
  if (!grid) return;

  let activeCategory = 'All';

  function renderProducts() {
    const filtered = activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
    grid.innerHTML = filtered.map(p => `
      <div class="product-card">
        <div class="prod-img-wrap">
          <div class="prod-brand-badge">${p.brand.toUpperCase()}</div>
          <img src="${p.img}" alt="${p.name}" loading="lazy">
        </div>
        <div class="prod-info">
          <div class="prod-rating">
            <span class="stars">${stars(p.rating)}</span>
            <span class="rating-num">${p.rating}</span>
          </div>
          <h3 class="prod-name">${p.name}</h3>
          <p class="prod-cat">${p.category}</p>
          <div class="prod-footer">
            <span class="prod-price">${formatINR(p.price)}</span>
            <button class="btn-add" onclick="addToCart(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.price})" title="Add to cart">🛒</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderProducts();
    });
  });

  renderProducts();
}

/* ── Init on load ── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCalculator();
  initDiet();
  initWorkout();
  initStore();
});

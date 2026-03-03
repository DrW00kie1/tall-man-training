/* app.js — Tall Man Training Application */
(function () {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  let currentView = 'today';
  let currentWeek = 1;
  let viewingDayOverride = null; // If set, Today view shows this day instead of actual today
  let timerRunning = false;
  let timerSeconds = 0;
  let timerInterval = null;
  const workoutLog = {}; // { exerciseId: { weight, sets, reps, notes } }

  // ============================================
  // WORKOUT DATA
  // ============================================
  const abExercises = [
    { name: 'Ab Wheel', reps: '10-20 reps' },
    { name: 'Bicycle Crunches', reps: '15-30 reps per side' },
    { name: 'Lying Leg Raises', reps: '8-20 reps' },
    { name: 'Hanging Leg Raises', reps: '5-10 reps' },
    { name: 'Side Planks', reps: '20-45 seconds' },
    { name: 'RKC Weighted Planks', reps: '5-10 seconds' },
    { name: 'Incline Situps', reps: '8-15 reps' },
    { name: 'Pallof Presses', reps: '6-12 reps' },
    { name: 'Stability Ball Pikes', reps: '6-12 reps' }
  ];

  const days = [
    {
      id: 1,
      schedule: 'Monday',
      name: 'Day 1',
      title: 'Shoulders + Secondary Chest',
      sets: 19,
      exercises: [
        {
          id: 'd1e1', num: '1', name: 'Cable Rope Facepulls', sets: 5, reps: '10',
          superset: null,
          tempo: '2s concentric / 1s pause / 2s eccentric',
          form: 'Focus on using mid-back and posterior delts, not yanking with hands. Externally rotate arms on each rep (think front double biceps pose). Rope attachment allows external rotation.',
          pointer: 'This is one of the best upper back and shoulder movements when done properly.'
        },
        {
          id: 'd1e2a', num: '2A', name: 'Cable Leaning Lateral Raise', sets: 5, reps: '12',
          superset: '2',
          tempo: 'Slow eccentric (3s down), controlled concentric',
          form: 'Use light weight and control the ROM. Slow eccentric. You can make 7lbs feel heavy with proper control.',
          pointer: 'Pump and innervation focused \u2014 this is isolation work.'
        },
        {
          id: 'd1e2b', num: '2B', name: 'Cable Front Delt Raise, Unilateral', sets: 5, reps: '10',
          superset: '2',
          tempo: 'Fast up / 3s controlled negative',
          form: 'One arm at a time. Can be done slightly faster than laterals. Fast concentric, slow negative.',
          pointer: 'Training shoulders is all about pump and innervation for isolation movements.'
        },
        {
          id: 'd1e3', num: '3', name: 'Seated High Incline DB Shoulder Press', sets: 5, reps: '6-8',
          superset: null,
          tempo: 'Explosive concentric / controlled eccentric',
          form: 'High incline = not fully upright. This is a more natural pressing angle. Use heavy weight but keep reps explosive, no grinder reps. Maintain solid grip and explode up every rep.',
          pointer: 'Go heavy but no grinding. If you can\'t press it explosively, it\'s too heavy.'
        },
        {
          id: 'd1e4', num: '4', name: 'Wide Grip Pullup (Use Straps)', sets: 5, reps: '5-12',
          superset: null,
          tempo: 'Fast piston-like cadence',
          form: 'Straps allow more natural joint action. Do NOT dead hang / hyperextend shoulders. Focus on getting CHEST to bar, not chin. Fast, piston-like cadence.',
          pointer: 'Chest to bar, not chin to bar. Use straps on a straight bar.'
        },
        {
          id: 'd1e5a', num: '5A', name: 'Rear Delt Cable Lateral Raises', sets: 2, reps: '20',
          superset: '5',
          tempo: 'Controlled throughout, squeeze past torso',
          form: 'Keep arm fixated, try to get arm PAST the torso. Must be done with control and total mental drive on rear delt, not momentum.',
          pointer: 'Mental drive on the rear delt moving the arm, not momentum.'
        },
        {
          id: 'd1e5b', num: '5B', name: 'Dips', sets: 2, reps: '20-30',
          superset: '5',
          tempo: 'Controlled, focus on pec engagement',
          form: 'Chin tucked, lean forward into the movement. Focus on pectorals and front delts. Ideally use dip bars with a slight angle.',
          pointer: 'Lean forward for chest emphasis. Chin tucked.'
        }
      ]
    },
    {
      id: 2,
      schedule: 'Tuesday',
      name: 'Day 2',
      title: 'Arms',
      sets: 19,
      exercises: [
        {
          id: 'd2e1a', num: '1A', name: 'Cable Forearm Curl', sets: 2, reps: '25',
          superset: '1',
          tempo: 'Continuous, same speed up and down',
          form: 'Done for a pump. Reps can be continuous \u2014 same speed on negative and positive, no stopping.',
          pointer: 'Pump work, no need to pause between reps.'
        },
        {
          id: 'd2e1b', num: '1B', name: 'Reverse Grip Pushdowns', sets: 2, reps: '25',
          superset: '1',
          tempo: 'Fast tempo',
          form: 'Warms up triceps and works forearm muscles isometrically. Use wavy/EZ handle bar for natural grip.',
          pointer: 'Warm-up for triceps. Use an EZ-bar attachment.'
        },
        {
          id: 'd2e2a', num: '2A', name: 'Hammer Curl to the Shoulder (Seated)', sets: 3, reps: '12',
          superset: '2',
          tempo: 'Controlled with hard squeeze at top',
          form: 'SQUEEZE the biceps and forearms on every rep. You won\'t need heavy weights done properly.',
          pointer: 'Mind-muscle connection over weight. Squeeze hard.'
        },
        {
          id: 'd2e2b', num: '2B', name: 'Pronated DB Kickback', sets: 3, reps: '12',
          superset: '2',
          tempo: 'Full extension, hard squeeze at peak',
          form: 'Extend arm past the torso as much as possible and squeeze hard on every rep. Excellent for developing the horseshoe.',
          pointer: 'Get arm past torso, squeeze the tricep horseshoe.'
        },
        {
          id: 'd2e2c', num: '2C', name: 'Straight Bar Pushdown', sets: 3, reps: '20',
          superset: '2',
          tempo: 'Pause at bottom / controlled eccentric',
          form: 'Turn palms in so arms are slightly internally rotated. Pause on extension, keep eccentric controlled.',
          pointer: 'Internal rotation of palms. Pause at peak contraction.'
        },
        {
          id: 'd2e3a', num: '3A', name: 'DB French Press (Back Supported)', sets: 3, reps: '10',
          superset: '3',
          tempo: 'Full stretch / controlled throughout',
          form: 'Properly position hands. Get a full stretch of the long head of tricep on every rep. ROM above all else initially, don\'t go too heavy.',
          pointer: 'Prioritize range of motion over weight. Full long-head stretch.'
        },
        {
          id: 'd2e3b', num: '3B', name: 'Elevated Tricep Pushups', sets: 3, reps: '30/25/20',
          superset: '3',
          tempo: 'Fast and explosive',
          form: 'Perform on a bench. Do them fast and furious to drive final blood volume into the muscle.',
          pointer: 'Final pump finisher. Speed and volume.'
        }
      ]
    },
    {
      id: 3,
      schedule: 'Wednesday',
      name: 'Day 3',
      title: 'Lower Body \u2014 Quads / Glutes / Hamstrings',
      sets: 22,
      exercises: [
        {
          id: 'd3e1', num: '1', name: 'Seated Leg Curls', sets: 4, reps: '10-15',
          superset: null,
          tempo: 'Fast concentric / moderate eccentric (maintain tension)',
          form: 'Weight should produce burn around 12-15 reps. Speed is fast, not slow. Fast concentric, moderately slowed eccentric. Creates prolonged hamstring pump and flushes knee joint with blood.',
          pointer: 'Concentric momentum, slow eccentric enough to maintain tension.'
        },
        {
          id: 'd3e2', num: '2', name: 'DB Goblet Squat', sets: 5, reps: '10',
          superset: null,
          tempo: 'Controlled descent / slight pause at bottom / drive up',
          form: 'Narrow stance, knees just outside elbows. Stop 1 inch below parallel (or slightly above if very tall). Slightly pause at bottom. Knee break first, then hips follow \u2014 should resemble a front squat.',
          pointer: 'Knees first then hips. Do NOT sink ass to grass \u2014 it removes tension.'
        },
        {
          id: 'd3e2a', num: '2A', name: 'Bodyweight Bulgarian Split Squats', sets: 3, reps: '20',
          superset: '2s',
          tempo: 'Pulsing reps, emphasis on bottom range',
          form: 'Rear foot on leg curl roller pad, front foot elevated on aerobic step or plate. Full ROM \u2014 all the way down, up to 80%, back down. Pulse reps emphasizing bottom half. Put one hand on VMO, one on outside of hip for manual cueing.',
          pointer: 'Full ROM with pulsing. Manual cueing increases recruitment.'
        },
        {
          id: 'd3e2b', num: '2B', name: 'DB Romanian Deadlifts', sets: 3, reps: '15',
          superset: '2s',
          tempo: 'CONTROL the descent / contract HARD at top',
          form: 'Do these against a bench with back of calves braced to keep lower leg vertical and inhibit knee flexion. Pronated grip, lower DBs down midline of leg. Find the stretch point for max hamstring stretch with glute recruitment. Think of it as a weighted toe touch.',
          pointer: 'Calves against bench. This is a weighted hamstring stretch with glute engagement.'
        },
        {
          id: 'd3e3a', num: '3A', name: 'Leg Press', sets: 3, reps: '20',
          superset: '3',
          tempo: 'Controlled, each set to failure',
          form: 'Feet up high on platform. Lower weight enough to hit quads \u2014 not super deep. Use enough weight to challenge yourself, take each set to failure. Don\'t cut ROM short though.',
          pointer: 'Feet high. Not a deep squat but not 2 inches either. To failure.'
        },
        {
          id: 'd3e3b', num: '3B', name: 'Leg Extension', sets: 3, reps: '12',
          superset: '3',
          tempo: 'Reps short of lockout / slow eccentric',
          form: 'Vince Gironda/Frank Zane style \u2014 seat as far back as possible (almost reclining), roller pad far down so quads get stretched every rep. Bang out reps just short of lockout, slow the eccentric each time. Do NOT need heavy weight.',
          pointer: 'Recline the seat, roller pad low for quad stretch. Light weight, slow negatives.'
        },
        {
          id: 'd3e4', num: '4', name: 'Nilsson Seated Calf Raise', sets: 1, reps: '5 (special)',
          superset: null,
          tempo: '3 reps / 10s stretch / 3 reps / 10s stretch / repeat',
          form: '4 sets of 20-25 reps with special tempo: 3 contracted reps, stretch 10 seconds, 3 more reps, stretch 10 seconds, repeat. Gets painful around 2 minutes but the pump is incredible.',
          pointer: 'This is brutal but effective. The stretch-pause protocol creates an insane calf pump.'
        }
      ]
    },
    {
      id: 4,
      schedule: 'Thursday',
      name: 'Day 4',
      title: 'Back + Biceps',
      sets: 25,
      exercises: [
        {
          id: 'd4e1a', num: '1A', name: 'Face Pull (Overhand Grip)', sets: 2, reps: '20',
          superset: '1',
          tempo: 'Controlled, squeeze at contraction',
          form: 'This is for mid-back and inferior scapula edge, NOT traps. Don\'t pull with traps \u2014 pull with lower rhomboids and internalize the shoulder blade pulling in.',
          pointer: 'Lower rhomboids, not traps. Shoulder blade squeeze.'
        },
        {
          id: 'd4e1b', num: '1B', name: 'Meadow DB Shrug', sets: 2, reps: '15',
          superset: '1',
          tempo: '3s pause at top of each rep',
          form: 'This IS for traps. 3 second pause at top of each rep. Adjust arm hang to position that lets you pull clavicles as high as possible.',
          pointer: '3 second hold at peak. Clavicles as high as possible.'
        },
        {
          id: 'd4e2', num: '2', name: 'Seated Cable Row', sets: 5, reps: '20/15/10/8/6',
          superset: null,
          tempo: 'Controlled, elbows back on every rep',
          form: 'Ideally use two independent handles. Start conservative \u2014 reps start high so pick weight that doesn\'t get challenging until ~20 reps. Increase weight each set. Start leaning forward, pull to perfectly upright. Drive elbows back, visualize all back muscles contracting.',
          pointer: 'Pyramid sets. Lean forward at start, pull to vertical. Increase weight each set.'
        },
        {
          id: 'd4e3a', num: '3A', name: 'DB Chest Supported Row', sets: 4, reps: '12',
          superset: '3',
          tempo: 'Explosive pull / squeeze at peak',
          form: 'Incline bench at ~45 degrees, chest braced against top, feet fully extended. Use weight that forces you to be explosive. Initiate each pull with mid-back, use momentum. Squeeze at peak.',
          pointer: 'Be explosive. Initiate with mid-back. Squeeze at top.'
        },
        {
          id: 'd4e3b', num: '3B', name: 'Straight Arm Pulldown', sets: 4, reps: '15',
          superset: '3',
          tempo: '2s concentric / 1s pause / 2s eccentric',
          form: 'Wide grip outside shoulders, step back so arms at head height. Contract through upper lat and rear delts, pull down to waist. This targets upper lat (the rows hit lower lat).',
          pointer: 'Upper lat focus. Complements the rows for full lat pump.'
        },
        {
          id: 'd4e4', num: '4', name: 'Rack Pull', sets: 5, reps: '5',
          superset: null,
          tempo: 'Controlled setup / explosive pull',
          form: 'Safety rails at knee height or slightly lower. Overhand grip (straps OK). Treat like a conventional deadlift \u2014 feel glutes initiate, then lower and upper back. Will pump lumbar erectors hard. Go heavy, consider a belt.',
          pointer: 'Glutes first, then back follows. Can go heavy. Belt recommended.'
        },
        {
          id: 'd4e5', num: '5', name: '45\u00b0 Back Extension (Hands Behind Head)', sets: 2, reps: '25',
          superset: null,
          tempo: 'Controlled, no hyperextension at top',
          form: 'Fire glutes first, then lower back and upper back follow. Pumps entire posterior chain. DO NOT hyper-extend \u2014 body should align perfectly vertical at top.',
          pointer: 'Glutes fire first. Body to vertical only, no hyperextension.'
        },
        {
          id: 'd4e6', num: '6', name: 'DB Hammer Curl', sets: 5, reps: '6',
          superset: null,
          tempo: 'Controlled with squeeze',
          form: 'Slide DB so bottom of hand is flush with the weight \u2014 holding handle at the \"bottom\" like a literal hammer motion.',
          pointer: 'Grip at the bottom of the handle, like an actual hammer.'
        }
      ]
    },
    {
      id: 5,
      schedule: 'Friday',
      name: 'Day 5',
      title: 'Chest / Shoulders / Triceps',
      sets: 24,
      exercises: [
        {
          id: 'd5e1a', num: '1A', name: 'Decline Cable Fly', sets: 3, reps: '10',
          superset: '1',
          tempo: 'Controlled eccentric / full stretch / peak squeeze',
          form: 'Should resemble a dip motion. REALLY maximize pec stretch and peak contraction. Focus on upper arm, not hands. Visualize muscle extending out and contracting on a triangular curve. Control the eccentric to prolong stretch. ALWAYS have a \"big chest\" \u2014 puff chest up before any pec exercise.',
          pointer: 'Big chest posture. Maximize stretch AND contraction.'
        },
        {
          id: 'd5e1b', num: '1B', name: 'Horizontal Cable Fly', sets: 3, reps: '10',
          superset: '1',
          tempo: 'Controlled throughout, pec focus',
          form: 'Hands end up centered around sternum. May need to adjust cables to lower position, about neck height. Pec stretch and contraction focus.',
          pointer: 'Hands to sternum. Cables at neck height.'
        },
        {
          id: 'd5e1c', num: '1C', name: 'Incline Cable Fly', sets: 3, reps: '10',
          superset: '1',
          tempo: 'Controlled, find the right groove',
          form: 'Staggered lunge stance is effective. Set hands at pec height or lower, bring hands to throat/neck height. Play around with hand position.',
          pointer: 'Stagger your stance. Hands from low to throat height.'
        },
        {
          id: 'd5e2', num: '2', name: 'Incline Bench Press', sets: 4, reps: '6-8',
          superset: null,
          tempo: 'Controlled descent / explosive press',
          form: 'Classic movement. Don\'t lower bar below 90 degrees arm/elbow angle. Bar should touch high on chest/just below clavicle. Go heavy. Feet planted, big air in chest. Drive weight up above nose.',
          pointer: 'Don\'t go below 90 degrees at elbow. High on chest. Go heavy.'
        },
        {
          id: 'd5e3a', num: '3A', name: 'Low Incline DB Press', sets: 5, reps: '5',
          superset: '3',
          tempo: 'Explosive press / controlled descent',
          form: 'Adjustable bench one notch above flat (10-15 degrees) \u2014 far more natural pressing angle. Go heavy but keep reps explosive. Tuck elbows a bit and keep DBs closer to body.',
          pointer: 'One notch above flat. Elbows slightly tucked. Explosive.'
        },
        {
          id: 'd5e3b', num: '3B', name: 'Seated Strict DB Lateral Raise', sets: 2, reps: '12',
          superset: '3',
          tempo: 'Swift raise / pause at top / controlled descent',
          form: 'Bent arms, similar to crucifix position. Lead with pinky or elbow, keep wrist cocked, palm pronated towards floor. Raise swiftly, slight pause at top, controlled descent. Squeeze DBs at peak for increased delt recruitment.',
          pointer: 'Crucifix position. Lead with pinky/elbow. Squeeze at top.'
        },
        {
          id: 'd5e4', num: '4', name: 'V-Bar Tricep Pushdown', sets: 4, reps: '10',
          superset: null,
          tempo: 'Continuous pump reps',
          form: 'Pick a good handle you like. Perform pump reps. Nothing fancy. Use a false grip (thumbs on same side as fingers).',
          pointer: 'False grip. Pump and squeeze.'
        }
      ]
    }
  ];

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  function getTodayDayIndex() {
    const now = new Date();
    const jsDay = now.getDay(); // 0=Sun,1=Mon,...6=Sat
    // Map: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    if (jsDay === 0) return 6; // Sunday
    return jsDay - 1;
  }

  function getTodayWorkout() {
    const idx = getTodayDayIndex();
    if (idx >= 5) return null; // Sat or Sun = rest
    return days[idx];
  }

  function formatDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  function getRandomAbExercise() {
    const idx = Math.floor(Math.random() * abExercises.length);
    return abExercises[idx];
  }

  function getLoggedCount(day) {
    if (!day) return { logged: 0, total: 0 };
    let logged = 0;
    const total = day.exercises.length;
    day.exercises.forEach(ex => {
      if (workoutLog[ex.id]) logged++;
    });
    return { logged, total };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  function renderTodayView() {
    const main = document.getElementById('appMain');
    const day = viewingDayOverride !== null ? days[viewingDayOverride] : getTodayWorkout();

    if (!day) {
      main.innerHTML = renderRestDay();
      document.getElementById('headerProgress').style.display = 'none';
      return;
    }

    const { logged, total } = getLoggedCount(day);
    updateProgress(logged, total);

    const isOverride = viewingDayOverride !== null;
    const ab = getRandomAbExercise();

    let html = `
      <div class="view-enter">
        ${isOverride ? '<button class="back-to-week-btn" id="backToWeek"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to Week</button>' : ''}
        <div class="day-header">
          <div class="day-number">${day.name} \u00b7 ${day.schedule}${isOverride ? '' : ' \u00b7 Today'}</div>
          <h2 class="day-title">${escapeHtml(day.title)}</h2>
          <div class="day-meta">
            <span class="day-meta-item"><strong>${day.sets}</strong>&nbsp;working sets</span>
            <span class="day-meta-item"><strong>${day.exercises.length}</strong>&nbsp;exercises</span>
          </div>
        </div>
    `;

    html += renderExerciseList(day.exercises);

    // Ab section
    html += `
      <div class="ab-section">
        <div class="ab-section-title">Abdominals</div>
        <div class="ab-subtitle">Do 2-4\u00d7 per week \u00b7 Pick one, 4 sets</div>
        <div class="exercise-card">
          <div class="exercise-card-header">
            <div class="exercise-card-info">
              <div class="exercise-name">${escapeHtml(ab.name)}</div>
              <div class="exercise-prescription">${escapeHtml(ab.reps)} \u00b7 4 sets</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    `;

    main.innerHTML = html;
    attachExerciseListeners();
  }

  function renderExerciseList(exercises) {
    let html = '';
    let currentSuperset = null;
    let supersetOpen = false;

    exercises.forEach((ex, i) => {
      // Check if we need to start/end a superset group
      if (ex.superset && ex.superset !== currentSuperset) {
        if (supersetOpen) html += '</div>'; // close previous superset
        html += `<div class="superset-group"><div class="superset-label">Superset ${ex.superset}</div>`;
        currentSuperset = ex.superset;
        supersetOpen = true;
      } else if (!ex.superset && supersetOpen) {
        html += '</div>';
        supersetOpen = false;
        currentSuperset = null;
      }

      const isLogged = !!workoutLog[ex.id];
      const logData = workoutLog[ex.id] || {};

      html += `
        <div class="exercise-card${isLogged ? ' logged' : ''}${ex.superset ? ' superset' : ''}" data-exercise-id="${ex.id}">
          <div class="exercise-card-header" data-toggle="${ex.id}">
            <div class="exercise-card-info">
              <div class="exercise-name">
                ${isLogged ? '<svg class="logged-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                ${escapeHtml(ex.num)}. ${escapeHtml(ex.name)}
                ${ex.superset ? '<span class="badge badge-superset">SS</span>' : ''}
              </div>
              <div class="exercise-prescription">${ex.sets} sets \u00d7 ${escapeHtml(ex.reps)} reps \u00b7 ${escapeHtml(ex.tempo)}</div>
            </div>
            <svg class="exercise-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="exercise-details">
            <div class="detail-section">
              <div class="detail-label">Form</div>
              <div class="detail-text">${escapeHtml(ex.form)}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Key Pointer</div>
              <div class="detail-text key-pointer">${escapeHtml(ex.pointer)}</div>
            </div>
            <div class="log-form">
              <div class="log-form-row">
                <div class="form-group">
                  <label>Weight</label>
                  <input type="number" inputmode="decimal" placeholder="lbs" data-log-field="${ex.id}-weight" value="${logData.weight || ''}">
                </div>
                <div class="form-group">
                  <label>Sets</label>
                  <input type="number" inputmode="numeric" placeholder="${ex.sets}" data-log-field="${ex.id}-sets" value="${logData.sets || ''}">
                </div>
                <div class="form-group">
                  <label>Reps</label>
                  <input type="text" inputmode="text" placeholder="${ex.reps}" data-log-field="${ex.id}-reps" value="${logData.reps || ''}">
                </div>
              </div>
              <div class="log-form-row full">
                <div class="form-group">
                  <label>Notes</label>
                  <input type="text" placeholder="Form cues, feelings\u2026" data-log-field="${ex.id}-notes" value="${escapeHtml(logData.notes || '')}">
                </div>
              </div>
              <button class="log-btn${isLogged ? ' logged' : ''}" data-log-btn="${ex.id}">
                ${isLogged ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> LOGGED' : 'LOG EXERCISE'}
              </button>
            </div>
          </div>
        </div>
      `;
    });

    if (supersetOpen) html += '</div>';
    return html;
  }

  function renderRestDay() {
    return `
      <div class="view-enter">
        <div class="rest-day">
          <svg class="rest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <h2 class="rest-title">Rest Day</h2>
          <p class="rest-message">Recovery is when you grow. Consider 30-60 min of slow steady-state cardio or mobility work.</p>
        </div>
      </div>
    `;
  }

  function renderWeekView() {
    const main = document.getElementById('appMain');
    document.getElementById('headerProgress').style.display = 'none';
    const todayIdx = getTodayDayIndex();

    let html = '<div class="view-enter"><div class="week-grid">';

    // 5 training days
    days.forEach((day, i) => {
      const isToday = i === todayIdx;
      html += `
        <div class="week-day-card${isToday ? ' today-card' : ''}" data-week-day="${i}">
          <div class="week-day-header">
            <div>
              <div class="week-day-name">${day.schedule}${isToday ? ' \u00b7 Today' : ''}</div>
              <div class="week-day-muscles">${escapeHtml(day.title)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-2);">
              <span class="week-day-sets">${day.sets} sets</span>
              <svg class="week-day-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div class="week-day-exercises">
            ${day.exercises.map(ex => `
              <div class="week-exercise-item">
                <span class="week-exercise-name">${escapeHtml(ex.num)}. ${escapeHtml(ex.name)}</span>
                <span class="week-exercise-rx">${ex.sets}\u00d7${escapeHtml(ex.reps)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    // Rest days
    html += `
      <div class="week-day-card rest-card">
        <div class="week-day-header">
          <div>
            <div class="week-day-name">Saturday${todayIdx === 5 ? ' \u00b7 Today' : ''}</div>
            <div class="week-day-muscles">Rest Day</div>
          </div>
        </div>
      </div>
      <div class="week-day-card rest-card">
        <div class="week-day-header">
          <div>
            <div class="week-day-name">Sunday${todayIdx === 6 ? ' \u00b7 Today' : ''}</div>
            <div class="week-day-muscles">Rest Day</div>
          </div>
        </div>
      </div>
    `;

    html += '</div></div>';
    main.innerHTML = html;

    // Attach week day listeners \u2014 tap to navigate to that day's workout
    document.querySelectorAll('.week-day-card:not(.rest-card)').forEach(card => {
      card.querySelector('.week-day-header').addEventListener('click', () => {
        const dayIdx = parseInt(card.getAttribute('data-week-day'));
        viewingDayOverride = dayIdx;
        switchView('today');
      });
    });
  }

  function renderLogView() {
    const main = document.getElementById('appMain');
    document.getElementById('headerProgress').style.display = 'none';
    const day = getTodayWorkout();
    const logEntries = [];

    if (day) {
      day.exercises.forEach(ex => {
        if (workoutLog[ex.id]) {
          logEntries.push({ ...ex, log: workoutLog[ex.id] });
        }
      });
    }

    let html = '<div class="view-enter">';
    html += `
      <div class="log-view-header">
        <div class="log-view-title">Workout Log</div>
        <div class="log-view-subtitle">${formatDate()}${day ? ' \u00b7 ' + day.title : ' \u00b7 Rest Day'}</div>
      </div>
    `;

    if (logEntries.length === 0) {
      html += `
        <div class="empty-log">
          <svg class="empty-log-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p class="empty-log-text">No exercises logged yet. Go to Today's workout and log your sets.</p>
        </div>
      `;
    } else {
      logEntries.forEach(entry => {
        html += `
          <div class="log-entry">
            <div class="log-entry-name">${escapeHtml(entry.num)}. ${escapeHtml(entry.name)}</div>
            <div class="log-entry-data">
              <div class="log-datum">
                <div class="log-datum-value">${entry.log.weight || '\u2014'}</div>
                <div class="log-datum-label">lbs</div>
              </div>
              <div class="log-datum">
                <div class="log-datum-value">${entry.log.sets || '\u2014'}</div>
                <div class="log-datum-label">sets</div>
              </div>
              <div class="log-datum">
                <div class="log-datum-value">${entry.log.reps || '\u2014'}</div>
                <div class="log-datum-label">reps</div>
              </div>
            </div>
            ${entry.log.notes ? `<div class="log-entry-notes">${escapeHtml(entry.log.notes)}</div>` : ''}
          </div>
        `;
      });

      html += `
        <button class="generate-report-btn" id="generateReport">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          DOWNLOAD REPORT
        </button>
      `;
    }

    html += '</div>';
    main.innerHTML = html;

    // Attach report generation
    const reportBtn = document.getElementById('generateReport');
    if (reportBtn) {
      reportBtn.addEventListener('click', generateReport);
    }
  }

  // ============================================
  // PROGRESS BAR
  // ============================================
  function updateProgress(logged, total) {
    const bar = document.getElementById('headerProgress');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (total > 0) {
      bar.style.display = 'flex';
      fill.style.width = (logged / total * 100) + '%';
      text.textContent = logged + '/' + total + ' logged';
    } else {
      bar.style.display = 'none';
    }
  }

  // ============================================
  // LOG EXERCISE
  // ============================================
  function logExercise(exerciseId) {
    const weightField = document.querySelector(`[data-log-field="${exerciseId}-weight"]`);
    const setsField = document.querySelector(`[data-log-field="${exerciseId}-sets"]`);
    const repsField = document.querySelector(`[data-log-field="${exerciseId}-reps"]`);
    const notesField = document.querySelector(`[data-log-field="${exerciseId}-notes"]`);

    workoutLog[exerciseId] = {
      weight: weightField ? weightField.value : '',
      sets: setsField ? setsField.value : '',
      reps: repsField ? repsField.value : '',
      notes: notesField ? notesField.value : '',
      timestamp: new Date().toISOString()
    };

    // Update UI
    const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    if (card) {
      card.classList.add('logged');
      const btn = card.querySelector(`[data-log-btn="${exerciseId}"]`);
      if (btn) {
        btn.classList.add('logged');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> LOGGED';
      }
      // Add check icon to name
      const nameEl = card.querySelector('.exercise-name');
      if (nameEl && !nameEl.querySelector('.logged-check')) {
        nameEl.insertAdjacentHTML('afterbegin', '<svg class="logged-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>');
      }
    }

    // Update progress
    const day = getTodayWorkout();
    if (day) {
      const { logged, total } = getLoggedCount(day);
      updateProgress(logged, total);
    }
  }

  // ============================================
  // GENERATE REPORT
  // ============================================
  function generateReport() {
    const day = viewingDayOverride !== null ? days[viewingDayOverride] : getTodayWorkout();
    if (!day) return;

    let report = '=== TALL MAN TRAINING \u2014 WORKOUT REPORT ===\n\n';
    report += 'Date: ' + formatDate() + '\n';
    report += 'Week: ' + currentWeek + ' of 12\n';
    report += 'Workout: ' + day.name + ' \u2014 ' + day.title + '\n';
    report += '\u2500'.repeat(45) + '\n\n';

    let hasLogs = false;
    day.exercises.forEach(ex => {
      if (workoutLog[ex.id]) {
        hasLogs = true;
        const log = workoutLog[ex.id];
        report += ex.num + '. ' + ex.name + '\n';
        report += '   Weight: ' + (log.weight || 'N/A') + ' lbs\n';
        report += '   Sets: ' + (log.sets || 'N/A') + '\n';
        report += '   Reps: ' + (log.reps || 'N/A') + '\n';
        if (log.notes) report += '   Notes: ' + log.notes + '\n';
        report += '\n';
      }
    });

    if (!hasLogs) {
      report += 'No exercises logged this session.\n';
    }

    report += '\u2500'.repeat(45) + '\n';
    report += 'Generated by Tall Man Training App\n';

    // Download as blob
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = 'tmt-workout-' + dateStr + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function attachExerciseListeners() {
    // Back to week button
    const backBtn = document.getElementById('backToWeek');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        viewingDayOverride = null;
        switchView('week');
      });
    }

    // Toggle exercise card expand/collapse
    document.querySelectorAll('[data-toggle]').forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.exercise-card');
        card.classList.toggle('expanded');
      });
    });

    // Log buttons
    document.querySelectorAll('[data-log-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const exerciseId = btn.getAttribute('data-log-btn');
        logExercise(exerciseId);
      });
    });

    // Prevent form clicks from collapsing card
    document.querySelectorAll('.log-form').forEach(form => {
      form.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  }

  // Navigation
  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === view);
    });

    if (view === 'today') renderTodayView();
    else if (view === 'week') { viewingDayOverride = null; renderWeekView(); }
    else if (view === 'log') renderLogView();
  }

  // ============================================
  // TIMER
  // ============================================
  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function toggleTimer() {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timerToggle').classList.remove('running');
    } else {
      timerRunning = true;
      document.getElementById('timerToggle').classList.add('running');
      document.getElementById('timerReset').style.display = 'flex';
      timerInterval = setInterval(() => {
        timerSeconds++;
        document.getElementById('timerDisplay').textContent = formatTimer(timerSeconds);
      }, 1000);
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = 0;
    document.getElementById('timerDisplay').textContent = '0:00';
    document.getElementById('timerToggle').classList.remove('running');
    document.getElementById('timerReset').style.display = 'none';
  }

  // ============================================
  // THEME TOGGLE
  // ============================================
  function initTheme() {
    const root = document.documentElement;
    let theme = 'dark'; // Default to dark for gym app
    root.setAttribute('data-theme', theme);

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        toggle.innerHTML = theme === 'dark'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      });
    }
  }

  // ============================================
  // WEEK SELECTOR
  // ============================================
  function initWeekSelector() {
    const label = document.getElementById('weekLabel');
    const down = document.getElementById('weekDown');
    const up = document.getElementById('weekUp');

    function updateLabel() {
      label.textContent = 'WK ' + currentWeek;
    }

    down.addEventListener('click', () => {
      if (currentWeek > 1) { currentWeek--; updateLabel(); }
    });
    up.addEventListener('click', () => {
      if (currentWeek < 12) { currentWeek++; updateLabel(); }
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    document.getElementById('headerDate').textContent = formatDate();
    initTheme();
    initWeekSelector();

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view === 'today') viewingDayOverride = null;
        switchView(view);
      });
    });

    // Timer
    document.getElementById('timerToggle').addEventListener('click', toggleTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);

    // Initial view
    switchView('today');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

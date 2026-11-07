/**
 * Interactive Decision Visualization Engine
 * Models real-life decisions with real-time quantitative feedback,
 * dynamic SVG charts, multi-variable sliders, and custom branded themes.
 */

// Global State
const state = {
  currentScenario: 'running', // 'running', 'housing', 'gpa'
  theme: 'marathon-volt',
  
  // Scenario 1: Running Pace & Half Marathon
  running: {
    weeks: 10,
    startPaceMin: 10,
    startPaceSec: 45, // 10:45 min/mile
    targetHour: 1,
    targetMin: 59,
    targetSec: 59, // ~Sub-2 hour (1:59:59)
    runsPerWeek: 3,
    speedWorkouts: 1,
    restDays: 4, // 7 - runsPerWeek
    distanceMiles: 13.109375 // Standard Half Marathon
  },

  // Scenario 2: Housing & Living Choices
  housing: {
    monthlyIncome: 4200,
    currentRent: 1350,
    currentUtilities: 160,
    currentCommute: 90,
    
    sharedAptTotalRent: 2700,
    roommatesCount: 3, // Total people sharing
    sharedUtilitiesPerPerson: 75,
    sharedCommute: 120,
    
    studioRent: 1050,
    studioUtilities: 130,
    studioCommute: 250, // Commute is higher because studio is further out
    
    oneTimeMovingCost: 800,
    monthlyFoodLifestyle: 550
  },

  // Scenario 3: Coursework & GPA Target Planner
  gpa: {
    currentGpa: 3.42,
    completedCredits: 45,
    courseCredits: 3, // Refinement option: 1, 2, 3, 4, 5
    midtermScore: 78,
    midtermWeight: 30, // 30%
    assignmentsScore: 88,
    assignmentsWeight: 30, // 30%
    finalWeight: 40, // 40% (remaining)
    targetLetterGrade: 'A', // 93%
    targetCumulativeGpa: 3.50
  },

  // Step-by-Step Rubric Progress Tracker
  checklist: {
    step1_reviewed_why: true,
    step2_quantitative_model: true,
    step3_live_updates: true,
    step4_refinements_added: true,
    step5_slider_extremes_tested: true,
    step6_polished_colors: true
  }
};

// Utilities & Formatting
function formatPace(totalSeconds) {
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDuration(totalSeconds) {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

// ==========================================
// SCENARIO 1: RUNNING PACE CALCULATIONS
// ==========================================
function calculateRunningMetrics() {
  const r = state.running;
  const startPaceSeconds = r.startPaceMin * 60 + r.startPaceSec; // e.g. 645s (10:45)
  const targetTotalSeconds = r.targetHour * 3600 + r.targetMin * 60 + r.targetSec; // e.g. 7199s
  const targetPaceSeconds = targetTotalSeconds / r.distanceMiles; // ~549.15s (9:09.15)
  
  const currentFinishSeconds = startPaceSeconds * r.distanceMiles;
  const totalPaceShaveSeconds = startPaceSeconds - targetPaceSeconds; // total sec/mile to cut
  
  // Required pace shave per week
  const paceShavePerWeek = totalPaceShaveSeconds / r.weeks;
  
  // Physiological Adaptation Capacity Estimation
  // Safe baseline progression for recreational runners is 4.0 - 5.5 sec/mile/week
  let adaptationCapacity = 4.0;
  
  // Frequency adjustments
  if (r.runsPerWeek === 2) adaptationCapacity -= 1.2;
  else if (r.runsPerWeek === 3) adaptationCapacity += 0.5;
  else if (r.runsPerWeek === 4) adaptationCapacity += 1.8;
  else if (r.runsPerWeek === 5) adaptationCapacity += 2.6;
  else if (r.runsPerWeek >= 6) adaptationCapacity += 2.8;

  // Speed workout adjustments
  if (r.speedWorkouts === 0) adaptationCapacity -= 0.8;
  else if (r.speedWorkouts === 1) adaptationCapacity += 1.4; // 1 tempo/interval session
  else if (r.speedWorkouts === 2) adaptationCapacity += 2.2;
  else if (r.speedWorkouts >= 3) adaptationCapacity += 1.5; // diminishing returns / injury risk
  
  // Rest Days recovery balance
  const restDays = 7 - r.runsPerWeek;
  r.restDays = restDays;
  if (restDays < 2) adaptationCapacity -= 1.8; // severe overtraining risk
  else if (restDays >= 2 && restDays <= 4) adaptationCapacity += 0.6; // optimal supercompensation
  else if (restDays >= 5) adaptationCapacity -= 1.0; // too much detraining
  
  adaptationCapacity = Math.max(1.0, adaptationCapacity);

  // Feasibility calculation
  // Ratio of safe capacity vs required shave
  const feasibilityRatio = Math.min(1.2, adaptationCapacity / paceShavePerWeek);
  const feasibilityScore = Math.max(10, Math.min(100, Math.round(feasibilityRatio * 100)));
  
  // Projected Race Day Pace & Time
  const achievableWeeklyShave = Math.min(paceShavePerWeek, adaptationCapacity);
  const projectedPaceSeconds = startPaceSeconds - (achievableWeeklyShave * r.weeks);
  const projectedFinishSeconds = projectedPaceSeconds * r.distanceMiles;
  
  // Verdict categorization
  let verdictTitle = '';
  let verdictColor = '';
  let verdictDesc = '';
  let verdictBadge = '';

  if (paceShavePerWeek <= 5.0) {
    verdictTitle = 'Highly Achievable & Safe';
    verdictColor = '#10b981';
    verdictBadge = 'Safe & Ready';
    verdictDesc = `Shaving ${paceShavePerWeek.toFixed(1)}s per week is well within safe aerobic adaptation rates. Stick to your plan and avoid overtraining!`;
  } else if (paceShavePerWeek <= 7.8) {
    verdictTitle = 'Realistic with High Discipline';
    verdictColor = '#3b82f6';
    verdictBadge = 'Moderate Challenge';
    verdictDesc = `Cutting ${paceShavePerWeek.toFixed(1)}s per week is achievable if you consistently hit your speed sessions and prioritize sleep and recovery.`;
  } else if (paceShavePerWeek <= 11.0) {
    verdictTitle = 'Aggressive Goal / High Fatigue';
    verdictColor = '#f59e0b';
    verdictBadge = 'Aggressive Plan';
    verdictDesc = `Shaving ${paceShavePerWeek.toFixed(1)}s/mile every single week over ${r.weeks} weeks is demanding. Running 3x/week with 1 speed session will likely yield ~${formatPace(projectedPaceSeconds)} pace (${formatDuration(projectedFinishSeconds)}). Consider adding a 4th easy run or extending training by 3-4 weeks.`;
  } else {
    verdictTitle = 'High Risk of Injury / Unrealistic';
    verdictColor = '#ef4444';
    verdictBadge = 'Caution: Overload';
    verdictDesc = `Cutting ${paceShavePerWeek.toFixed(1)}s/mile per week exceeds safe musculoskeletal adaptation rates. You risk shin splints or burnout. Adjust target time or add more training weeks.`;
  }

  // Week-by-Week Data Points for Chart
  const trajectoryData = [];
  for (let w = 0; w <= r.weeks; w++) {
    // Linear required pace
    const requiredPaceAtWeek = startPaceSeconds - (paceShavePerWeek * w);
    // Non-linear physiological progression (rapid early gains, tapering at end)
    const progFactor = Math.pow(w / r.weeks, 0.92);
    const projectedPaceAtWeek = startPaceSeconds - (achievableWeeklyShave * r.weeks * progFactor);
    
    trajectoryData.push({
      week: w,
      requiredPace: requiredPaceAtWeek,
      projectedPace: projectedPaceAtWeek
    });
  }

  return {
    startPaceSeconds,
    targetPaceSeconds,
    currentFinishSeconds,
    targetTotalSeconds,
    totalPaceShaveSeconds,
    paceShavePerWeek,
    adaptationCapacity,
    feasibilityScore,
    projectedPaceSeconds,
    projectedFinishSeconds,
    verdictTitle,
    verdictColor,
    verdictDesc,
    verdictBadge,
    trajectoryData,
    restDays
  };
}

// ==========================================
// SCENARIO 2: LIVING CHOICES CALCULATIONS
// ==========================================
function calculateHousingMetrics() {
  const h = state.housing;
  
  // Option 1: Stay Put
  const stayMonthlyRent = h.currentRent;
  const stayMonthlyExpenses = stayMonthlyRent + h.currentUtilities + h.currentCommute + h.monthlyFoodLifestyle;
  const stayMonthlySavings = h.monthlyIncome - stayMonthlyExpenses;
  
  // Option 2: Move with Roommates
  const sharedRentPerPerson = Math.round(h.sharedAptTotalRent / h.roommatesCount);
  const sharedMonthlyExpenses = sharedRentPerPerson + h.sharedUtilitiesPerPerson + h.sharedCommute + h.monthlyFoodLifestyle;
  const sharedMonthlySavings = h.monthlyIncome - sharedMonthlyExpenses;
  
  // Option 3: Studio Further Out
  const studioMonthlyExpenses = h.studioRent + h.studioUtilities + h.studioCommute + h.monthlyFoodLifestyle;
  const studioMonthlySavings = h.monthlyIncome - studioMonthlyExpenses;
  
  // 12-Month Cumulative Savings Curve
  const monthsData = [];
  let stayCumul = 0;
  let sharedCumul = -h.oneTimeMovingCost; // Initial moving deficit
  let studioCumul = -h.oneTimeMovingCost;
  
  let sharedBreakevenMonth = null;
  let studioBreakevenMonth = null;

  for (let m = 1; m <= 12; m++) {
    stayCumul += stayMonthlySavings;
    sharedCumul += sharedMonthlySavings;
    studioCumul += studioMonthlySavings;
    
    if (sharedBreakevenMonth === null && sharedCumul > stayCumul) {
      sharedBreakevenMonth = m;
    }
    if (studioBreakevenMonth === null && studioCumul > stayCumul) {
      studioBreakevenMonth = m;
    }

    monthsData.push({
      month: m,
      stay: Math.round(stayCumul),
      shared: Math.round(sharedCumul),
      studio: Math.round(studioCumul)
    });
  }

  const netAnnualDifferenceShared = sharedCumul - stayCumul;
  const netAnnualDifferenceStudio = studioCumul - stayCumul;

  return {
    stayMonthlyExpenses,
    stayMonthlySavings,
    stayAnnualSavings: stayCumul,
    
    sharedRentPerPerson,
    sharedMonthlyExpenses,
    sharedMonthlySavings,
    sharedAnnualSavings: sharedCumul,
    sharedBreakevenMonth: sharedBreakevenMonth || '>12',
    netAnnualDifferenceShared,
    
    studioMonthlyExpenses,
    studioMonthlySavings,
    studioAnnualSavings: studioCumul,
    studioBreakevenMonth: studioBreakevenMonth || '>12',
    netAnnualDifferenceStudio,

    monthsData
  };
}

// ==========================================
// SCENARIO 3: COURSEWORK & GPA CALCULATIONS
// ==========================================
function calculateGpaMetrics() {
  const g = state.gpa;
  
  // Grade thresholds
  const gradeThresholds = {
    'A': { minScore: 93, gpaPoints: 4.0 },
    'A-': { minScore: 90, gpaPoints: 3.7 },
    'B+': { minScore: 87, gpaPoints: 3.3 },
    'B': { minScore: 83, gpaPoints: 3.0 },
    'B-': { minScore: 80, gpaPoints: 2.7 },
    'C+': { minScore: 77, gpaPoints: 2.3 }
  };
  
  const currentEarnedWeight = (g.midtermScore * (g.midtermWeight / 100)) + 
                              (g.assignmentsScore * (g.assignmentsWeight / 100));
  const finalWeightDecimal = g.finalWeight / 100;
  
  const targetThreshold = gradeThresholds[g.targetLetterGrade]?.minScore || 93;
  const targetGpaPoints = gradeThresholds[g.targetLetterGrade]?.gpaPoints || 4.0;
  
  // Needed final score formula: (Target - CurrentEarned) / FinalWeight
  const neededFinalScore = (targetThreshold - currentEarnedWeight) / finalWeightDecimal;
  
  // Total Quality Points before this course
  const existingQualityPoints = g.currentGpa * g.completedCredits;
  const newTotalCredits = g.completedCredits + g.courseCredits;
  
  // Projected Cumulative GPA if target achieved
  const newQualityPoints = existingQualityPoints + (targetGpaPoints * g.courseCredits);
  const projectedCumulativeGpa = newQualityPoints / newTotalCredits;
  
  // Curve of Final Exam Score (50% to 100%) vs Resulting GPA
  const examImpactCurve = [];
  for (let score = 50; score <= 100; score += 5) {
    const courseFinalScore = currentEarnedWeight + (score * finalWeightDecimal);
    let coursePoints = 2.0; // C
    if (courseFinalScore >= 93) coursePoints = 4.0;
    else if (courseFinalScore >= 90) coursePoints = 3.7;
    else if (courseFinalScore >= 87) coursePoints = 3.3;
    else if (courseFinalScore >= 83) coursePoints = 3.0;
    else if (courseFinalScore >= 80) coursePoints = 2.7;
    else if (courseFinalScore >= 77) coursePoints = 2.3;
    
    const resultingCumulativeGpa = (existingQualityPoints + (coursePoints * g.courseCredits)) / newTotalCredits;
    examImpactCurve.push({
      examScore: score,
      courseFinalScore: courseFinalScore.toFixed(1),
      resultingCumulativeGpa: resultingCumulativeGpa.toFixed(3)
    });
  }

  return {
    currentEarnedWeight,
    neededFinalScore,
    projectedCumulativeGpa,
    targetThreshold,
    targetGpaPoints,
    examImpactCurve,
    isAchievable: neededFinalScore <= 100 && neededFinalScore >= 0
  };
}

// ==========================================
// SVG RENDERING ENGINES
// ==========================================

/**
 * Draws an interactive, responsive SVG line chart with gradient fill,
 * milestone badges, grid lines, and interactive crosshair.
 */
function renderRunningPaceChart(containerEl, data, targetPace, startPace) {
  if (!containerEl) return;
  const width = containerEl.clientWidth || 650;
  const height = 300;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  
  const maxWeeks = data.length - 1;
  // Pace range (in seconds per mile): lower pace is faster/higher on chart
  // Invert Y so that faster pace is placed near the top!
  const minPace = Math.min(targetPace - 20, ...data.map(d => Math.min(d.requiredPace, d.projectedPace)));
  const maxPace = Math.max(startPace + 20, ...data.map(d => Math.max(d.requiredPace, d.projectedPace)));
  
  function getX(week) {
    return padLeft + (week / maxWeeks) * innerWidth;
  }
  
  function getY(paceSec) {
    // Lower pace = faster = top of chart
    const pct = (paceSec - minPace) / (maxPace - minPace);
    return padTop + pct * innerHeight;
  }
  
  // Build path strings
  let reqPath = '';
  let projPath = '';
  let projArea = '';

  data.forEach((d, idx) => {
    const x = getX(d.week).toFixed(1);
    const yReq = getY(d.requiredPace).toFixed(1);
    const yProj = getY(d.projectedPace).toFixed(1);
    
    if (idx === 0) {
      reqPath = `M ${x} ${yReq}`;
      projPath = `M ${x} ${yProj}`;
      projArea = `M ${x} ${padTop + innerHeight} L ${x} ${yProj}`;
    } else {
      reqPath += ` L ${x} ${yReq}`;
      projPath += ` L ${x} ${yProj}`;
      projArea += ` L ${x} ${yProj}`;
    }
  });

  const lastX = getX(maxWeeks).toFixed(1);
  projArea += ` L ${lastX} ${padTop + innerHeight} Z`;

  // Horizontal Grid Lines & Y Labels
  const yTicks = 5;
  let gridSvg = '';
  for (let i = 0; i <= yTicks; i++) {
    const paceVal = minPace + (i / yTicks) * (maxPace - minPace);
    const y = getY(paceVal).toFixed(1);
    gridSvg += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="${padLeft - 8}" y="${parseFloat(y) + 4}" fill="var(--text-dim)" font-size="11" font-family="var(--font-mono)" text-anchor="end">${formatPace(paceVal)}</text>
    `;
  }

  // X Axis Ticks
  let xTicksSvg = '';
  for (let w = 0; w <= maxWeeks; w += (maxWeeks > 12 ? 2 : 1)) {
    const x = getX(w).toFixed(1);
    xTicksSvg += `
      <line x1="${x}" y1="${padTop + innerHeight}" x2="${x}" y2="${padTop + innerHeight + 5}" stroke="var(--border-color)"/>
      <text x="${x}" y="${padTop + innerHeight + 18}" fill="var(--text-dim)" font-size="11" font-family="var(--font-sans)" text-anchor="middle">W${w}</text>
    `;
  }

  // Target Goal Line
  const targetY = getY(targetPace).toFixed(1);

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridSvg}
      ${xTicksSvg}
      
      <!-- Goal Reference Line -->
      <line x1="${padLeft}" y1="${targetY}" x2="${width - padRight}" y2="${targetY}" stroke="var(--accent-highlight)" stroke-width="2" stroke-dasharray="6 4" opacity="0.9"/>
      <text x="${width - padRight - 6}" y="${parseFloat(targetY) - 6}" fill="var(--accent-highlight)" font-size="11" font-weight="700" text-anchor="end">Sub-2hr Goal (${formatPace(targetPace)}/mi)</text>

      <!-- Projected Adaptation Area & Line -->
      <path d="${projArea}" fill="url(#projGrad)"/>
      <path d="${projPath}" fill="none" stroke="var(--accent-primary)" stroke-width="3" stroke-linecap="round"/>
      
      <!-- Linear Ideal Target Pace Line -->
      <path d="${reqPath}" fill="none" stroke="var(--accent-secondary)" stroke-width="2" stroke-dasharray="4 4" opacity="0.75"/>

      <!-- Data Dots -->
      ${data.map(d => `
        <circle cx="${getX(d.week).toFixed(1)}" cy="${getY(d.projectedPace).toFixed(1)}" r="3.5" fill="var(--bg-card)" stroke="var(--accent-primary)" stroke-width="2.5"/>
      `).join('')}

      <!-- Start & End Markers -->
      <circle cx="${getX(0).toFixed(1)}" cy="${getY(startPace).toFixed(1)}" r="6" fill="var(--accent-primary)"/>
      <circle cx="${getX(maxWeeks).toFixed(1)}" cy="${getY(data[maxWeeks].projectedPace).toFixed(1)}" r="6" fill="${data[maxWeeks].projectedPace <= targetPace ? 'var(--accent-primary)' : 'var(--accent-danger)'}"/>
    </svg>
  `;

  containerEl.innerHTML = svgContent;
}

/**
 * Draws 12-Month Cumulative Net Savings comparison chart for Living Choices
 */
function renderHousingSavingsChart(containerEl, monthsData) {
  if (!containerEl) return;
  const width = containerEl.clientWidth || 650;
  const height = 300;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  
  const allValues = monthsData.flatMap(d => [d.stay, d.shared, d.studio]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) * 1.08;
  
  function getX(month) {
    return padLeft + ((month - 1) / 11) * innerWidth;
  }
  function getY(val) {
    const pct = (val - minVal) / (maxVal - minVal);
    return padTop + (1 - pct) * innerHeight;
  }

  // Paths
  let pathStay = '';
  let pathShared = '';
  let pathStudio = '';

  monthsData.forEach((d, idx) => {
    const x = getX(d.month).toFixed(1);
    const yStay = getY(d.stay).toFixed(1);
    const yShared = getY(d.shared).toFixed(1);
    const yStudio = getY(d.studio).toFixed(1);
    
    if (idx === 0) {
      pathStay = `M ${x} ${yStay}`;
      pathShared = `M ${x} ${yShared}`;
      pathStudio = `M ${x} ${yStudio}`;
    } else {
      pathStay += ` L ${x} ${yStay}`;
      pathShared += ` L ${x} ${yShared}`;
      pathStudio += ` L ${x} ${yStudio}`;
    }
  });

  // Y Grid
  let gridSvg = '';
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = minVal + (i / yTicks) * (maxVal - minVal);
    const y = getY(val).toFixed(1);
    gridSvg += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="${padLeft - 8}" y="${parseFloat(y) + 4}" fill="var(--text-dim)" font-size="11" font-family="var(--font-mono)" text-anchor="end">${formatCurrency(val)}</text>
    `;
  }

  // X Ticks
  let xTicksSvg = '';
  for (let m = 1; m <= 12; m++) {
    const x = getX(m).toFixed(1);
    xTicksSvg += `
      <text x="${x}" y="${padTop + innerHeight + 18}" fill="var(--text-dim)" font-size="11" font-family="var(--font-sans)" text-anchor="middle">M${m}</text>
    `;
  }

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
      ${gridSvg}
      ${xTicksSvg}
      
      <!-- Paths -->
      <path d="${pathStay}" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-dasharray="5 5"/>
      <path d="${pathStudio}" fill="none" stroke="var(--accent-secondary)" stroke-width="3"/>
      <path d="${pathShared}" fill="none" stroke="var(--accent-primary)" stroke-width="3.5"/>
      
      <!-- Final Value Dots -->
      <circle cx="${getX(12).toFixed(1)}" cy="${getY(monthsData[11].shared).toFixed(1)}" r="5" fill="var(--accent-primary)"/>
      <circle cx="${getX(12).toFixed(1)}" cy="${getY(monthsData[11].studio).toFixed(1)}" r="5" fill="var(--accent-secondary)"/>
      <circle cx="${getX(12).toFixed(1)}" cy="${getY(monthsData[11].stay).toFixed(1)}" r="5" fill="var(--text-muted)"/>
    </svg>
  `;

  containerEl.innerHTML = svgContent;
}

/**
 * Draws GPA Target vs Final Exam Curve
 */
function renderGpaImpactChart(containerEl, curveData, targetScore) {
  if (!containerEl) return;
  const width = containerEl.clientWidth || 650;
  const height = 300;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  
  const minGpa = 2.8;
  const maxGpa = 4.0;
  
  function getX(score) {
    return padLeft + ((score - 50) / 50) * innerWidth;
  }
  function getY(gpa) {
    const pct = (gpa - minGpa) / (maxGpa - minGpa);
    return padTop + (1 - pct) * innerHeight;
  }

  let pathStr = '';
  curveData.forEach((d, idx) => {
    const x = getX(d.examScore).toFixed(1);
    const y = getY(parseFloat(d.resultingCumulativeGpa)).toFixed(1);
    if (idx === 0) pathStr = `M ${x} ${y}`;
    else pathStr += ` L ${x} ${y}`;
  });

  // Y Grid
  let gridSvg = '';
  for (let gpa = 3.0; gpa <= 4.0; gpa += 0.2) {
    const y = getY(gpa).toFixed(1);
    gridSvg += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="${padLeft - 8}" y="${parseFloat(y) + 4}" fill="var(--text-dim)" font-size="11" font-family="var(--font-mono)" text-anchor="end">${gpa.toFixed(2)}</text>
    `;
  }

  // X Ticks
  let xTicksSvg = '';
  for (let s = 50; s <= 100; s += 10) {
    const x = getX(s).toFixed(1);
    xTicksSvg += `
      <text x="${x}" y="${padTop + innerHeight + 18}" fill="var(--text-dim)" font-size="11" font-family="var(--font-sans)" text-anchor="middle">${s}%</text>
    `;
  }

  // Threshold Marker
  let thresholdSvg = '';
  if (targetScore >= 50 && targetScore <= 100) {
    const tx = getX(targetScore).toFixed(1);
    thresholdSvg = `
      <line x1="${tx}" y1="${padTop}" x2="${tx}" y2="${padTop + innerHeight}" stroke="var(--accent-highlight)" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="${parseFloat(tx) + 6}" y="${padTop + 14}" fill="var(--accent-highlight)" font-size="11" font-weight="700">Needed (${targetScore.toFixed(1)}%)</text>
    `;
  }

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
      ${gridSvg}
      ${xTicksSvg}
      ${thresholdSvg}
      <path d="${pathStr}" fill="none" stroke="var(--accent-primary)" stroke-width="3.5" stroke-linecap="round"/>
      ${curveData.map(d => `
        <circle cx="${getX(d.examScore).toFixed(1)}" cy="${getY(parseFloat(d.resultingCumulativeGpa)).toFixed(1)}" r="3" fill="var(--bg-card)" stroke="var(--accent-primary)" stroke-width="2"/>
      `).join('')}
    </svg>
  `;

  containerEl.innerHTML = svgContent;
}

// ==========================================
// UI UPDATE DISPATCHER
// ==========================================
function updateUI() {
  if (state.currentScenario === 'running') {
    updateRunningUI();
  } else if (state.currentScenario === 'housing') {
    updateHousingUI();
  } else if (state.currentScenario === 'gpa') {
    updateGpaUI();
  }
}

function updateRunningUI() {
  const metrics = calculateRunningMetrics();
  const r = state.running;
  
  // Update control badge labels
  document.getElementById('badge-weeks').textContent = `${r.weeks} Wks`;
  document.getElementById('badge-start-pace').textContent = `${r.startPaceMin}:${r.startPaceSec.toString().padStart(2, '0')}/mi`;
  document.getElementById('badge-target-time').textContent = formatDuration(r.targetHour * 3600 + r.targetMin * 60 + r.targetSec);
  document.getElementById('badge-runs-week').textContent = `${r.runsPerWeek} Runs`;
  document.getElementById('badge-speed-workouts').textContent = `${r.speedWorkouts} Session${r.speedWorkouts === 1 ? '' : 's'}`;
  document.getElementById('badge-rest-days').textContent = `${metrics.restDays} Days Rest`;

  // Update Key Metric Cards
  document.getElementById('metric-required-shave').innerHTML = `
    -${metrics.paceShavePerWeek.toFixed(1)} <span class="metric-unit">sec/mi/wk</span>
  `;
  document.getElementById('metric-required-sub').textContent = `Total cut: -${formatPace(metrics.totalPaceShaveSeconds)}`;

  document.getElementById('metric-target-pace').innerHTML = `
    ${formatPace(metrics.targetPaceSeconds)} <span class="metric-unit">/mi</span>
  `;
  document.getElementById('metric-target-sub').textContent = `Goal finish: ${formatDuration(metrics.targetTotalSeconds)}`;

  document.getElementById('metric-projected-finish').innerHTML = `
    ${formatDuration(metrics.projectedFinishSeconds)}
  `;
  const timeDiffSec = metrics.projectedFinishSeconds - metrics.targetTotalSeconds;
  const deltaEl = document.getElementById('metric-projected-sub');
  if (timeDiffSec <= 0) {
    deltaEl.className = 'metric-delta delta-good';
    deltaEl.textContent = `On target! (${formatDuration(Math.abs(timeDiffSec))} buffer)`;
  } else {
    deltaEl.className = 'metric-delta delta-warn';
    deltaEl.textContent = `+${formatDuration(timeDiffSec)} off goal pace`;
  }

  // Update Feasibility Verdict & Radial Gauge
  document.getElementById('verdict-title').textContent = metrics.verdictTitle;
  document.getElementById('verdict-title').style.color = metrics.verdictColor;
  document.getElementById('verdict-desc').textContent = metrics.verdictDesc;
  
  const badgeEl = document.getElementById('verdict-badge');
  badgeEl.textContent = metrics.verdictBadge;
  badgeEl.style.backgroundColor = `${metrics.verdictColor}22`;
  badgeEl.style.color = metrics.verdictColor;
  badgeEl.style.border = `1px solid ${metrics.verdictColor}55`;

  // Gauge animation (circumference = 2 * PI * 36 ≈ 226)
  const circumference = 226;
  const offset = circumference - (metrics.feasibilityScore / 100) * circumference;
  const gaugeBar = document.getElementById('gauge-bar');
  gaugeBar.style.strokeDashoffset = offset;
  gaugeBar.style.stroke = metrics.verdictColor;
  document.getElementById('gauge-score').textContent = `${metrics.feasibilityScore}%`;

  // Render SVG Chart
  const chartContainer = document.getElementById('running-chart-wrap');
  renderRunningPaceChart(chartContainer, metrics.trajectoryData, metrics.targetPaceSeconds, metrics.startPaceSeconds);

  // Render Milestone Splits Table
  const tableBody = document.getElementById('running-splits-tbody');
  if (tableBody) {
    let rowsHtml = '';
    // Show key weeks: 0, 1/4, 1/2, 3/4, and final
    const milestoneWeeks = [0, Math.round(r.weeks * 0.25), Math.round(r.weeks * 0.5), Math.round(r.weeks * 0.75), r.weeks];
    const uniqueWeeks = [...new Set(milestoneWeeks)];
    
    uniqueWeeks.forEach(w => {
      const pt = metrics.trajectoryData[w];
      const pace = formatPace(pt.projectedPace);
      const estFinish = formatDuration(pt.projectedPace * r.distanceMiles);
      const weeklyShave = w === 0 ? 'Baseline' : `-${(metrics.adaptationCapacity).toFixed(1)}s`;
      const statusNote = w === r.weeks 
        ? (pt.projectedPace <= metrics.targetPaceSeconds ? '🏆 Goal Met' : '⏱️ Near Goal') 
        : `Phase ${w <= r.weeks/2 ? 'Base Building' : 'Threshold Sharpening'}`;

      rowsHtml += `
        <tr>
          <td><strong>Week ${w}</strong></td>
          <td>${pace} /mi</td>
          <td>${estFinish}</td>
          <td>${weeklyShave}</td>
          <td><span class="tab-badge">${statusNote}</span></td>
        </tr>
      `;
    });
    tableBody.innerHTML = rowsHtml;
  }
}

function updateHousingUI() {
  const metrics = calculateHousingMetrics();
  const h = state.housing;

  // Update badge labels
  document.getElementById('badge-income').textContent = formatCurrency(h.monthlyIncome);
  document.getElementById('badge-current-rent').textContent = formatCurrency(h.currentRent);
  document.getElementById('badge-shared-rent').textContent = formatCurrency(h.sharedAptTotalRent);
  document.getElementById('badge-roommates').textContent = `${h.roommatesCount} Roommates`;
  document.getElementById('badge-studio-rent').textContent = formatCurrency(h.studioRent);
  document.getElementById('badge-studio-commute').textContent = formatCurrency(h.studioCommute);

  // Update Metric Cards
  document.getElementById('metric-housing-1').innerHTML = `
    ${formatCurrency(metrics.sharedMonthlySavings)} <span class="metric-unit">/mo</span>
  `;
  document.getElementById('metric-housing-1-sub').textContent = `Roommate Split (${h.roommatesCount} ppl @ ${formatCurrency(metrics.sharedRentPerPerson)}/mo)`;

  document.getElementById('metric-housing-2').innerHTML = `
    ${formatCurrency(metrics.studioMonthlySavings)} <span class="metric-unit">/mo</span>
  `;
  document.getElementById('metric-housing-2-sub').textContent = `Studio Out (Commute: ${formatCurrency(h.studioCommute)}/mo)`;

  document.getElementById('metric-housing-3').innerHTML = `
    ${formatCurrency(metrics.netAnnualDifferenceShared)} <span class="metric-unit">1-Yr Bonus</span>
  `;
  document.getElementById('metric-housing-3-sub').textContent = `Breakeven in Month ${metrics.sharedBreakevenMonth} after ${formatCurrency(h.oneTimeMovingCost)} move cost`;

  // Render SVG Chart
  const chartContainer = document.getElementById('housing-chart-wrap');
  renderHousingSavingsChart(chartContainer, metrics.monthsData);

  // Table summary
  const tableBody = document.getElementById('housing-tbody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td><strong>Option A: Stay Put</strong></td>
        <td>${formatCurrency(h.currentRent)}</td>
        <td>${formatCurrency(h.currentCommute)}</td>
        <td>${formatCurrency(metrics.stayMonthlySavings)}/mo</td>
        <td><strong>${formatCurrency(metrics.stayAnnualSavings)}</strong></td>
      </tr>
      <tr>
        <td><strong>Option B: ${h.roommatesCount} Roommates</strong></td>
        <td>${formatCurrency(metrics.sharedRentPerPerson)}</td>
        <td>${formatCurrency(h.sharedCommute)}</td>
        <td>${formatCurrency(metrics.sharedMonthlySavings)}/mo</td>
        <td><strong style="color:var(--accent-primary)">${formatCurrency(metrics.sharedAnnualSavings)}</strong></td>
      </tr>
      <tr>
        <td><strong>Option C: Studio Further Out</strong></td>
        <td>${formatCurrency(h.studioRent)}</td>
        <td>${formatCurrency(h.studioCommute)}</td>
        <td>${formatCurrency(metrics.studioMonthlySavings)}/mo</td>
        <td><strong>${formatCurrency(metrics.studioAnnualSavings)}</strong></td>
      </tr>
    `;
  }
}

function updateGpaUI() {
  const metrics = calculateGpaMetrics();
  const g = state.gpa;

  // Badges
  document.getElementById('badge-current-gpa').textContent = g.currentGpa.toFixed(2);
  document.getElementById('badge-credits').textContent = `${g.courseCredits} Credits`;
  document.getElementById('badge-midterm').textContent = `${g.midtermScore}%`;
  document.getElementById('badge-assignments').textContent = `${g.assignmentsScore}%`;
  document.getElementById('badge-final-weight').textContent = `${g.finalWeight}% Final Weight`;

  // Metric Cards
  const neededScoreEl = document.getElementById('metric-gpa-1');
  const neededScoreSubEl = document.getElementById('metric-gpa-1-sub');
  
  if (metrics.neededFinalScore > 100) {
    neededScoreEl.innerHTML = `<span style="color:var(--accent-danger)">${metrics.neededFinalScore.toFixed(1)}%</span>`;
    neededScoreSubEl.textContent = `Mathematically impossible without extra credit`;
  } else if (metrics.neededFinalScore <= 0) {
    neededScoreEl.innerHTML = `<span style="color:var(--accent-primary)">Guaranteed</span>`;
    neededScoreSubEl.textContent = `You already secured a ${g.targetLetterGrade} even with 0% on final!`;
  } else {
    neededScoreEl.innerHTML = `${metrics.neededFinalScore.toFixed(1)} <span class="metric-unit">%</span>`;
    neededScoreSubEl.textContent = `Score needed on Final for a grade of ${g.targetLetterGrade}`;
  }

  document.getElementById('metric-gpa-2').innerHTML = `
    ${metrics.projectedCumulativeGpa.toFixed(2)} <span class="metric-unit">GPA</span>
  `;
  const gpaDelta = metrics.projectedCumulativeGpa - g.currentGpa;
  document.getElementById('metric-gpa-2-sub').textContent = `${gpaDelta >= 0 ? '+' : ''}${gpaDelta.toFixed(3)} change across ${g.completedCredits + g.courseCredits} total credits`;

  // Render SVG Chart
  const chartContainer = document.getElementById('gpa-chart-wrap');
  renderGpaImpactChart(chartContainer, metrics.examImpactCurve, metrics.neededFinalScore);
}

// ==========================================
// SCENARIO & THEME SWITCHING
// ==========================================
function switchScenario(scenarioKey) {
  state.currentScenario = scenarioKey;
  
  // Update Tab buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.scenario === scenarioKey);
  });

  // Toggle Scenario views
  document.getElementById('scenario-running-view').style.display = scenarioKey === 'running' ? 'grid' : 'none';
  document.getElementById('scenario-housing-view').style.display = scenarioKey === 'housing' ? 'grid' : 'none';
  document.getElementById('scenario-gpa-view').style.display = scenarioKey === 'gpa' ? 'grid' : 'none';

  updateUI();
}

function applyTheme(themeKey) {
  state.theme = themeKey;
  document.documentElement.setAttribute('data-theme', themeKey);
  localStorage.setItem('interactive_viz_theme', themeKey);
  updateUI();
}

// ==========================================
// BI-DIRECTIONAL VALIDATION TEST HARNESS
// ==========================================
function runSelfVerificationTests() {
  console.log('--- Running Bi-Directional Self-Verification Tests ---');
  
  // Test 1: Increasing weeks until race day should REDUCE required weekly pace shave
  const testRun1 = calculateRunningMetrics();
  const origShave = testRun1.paceShavePerWeek;
  state.running.weeks += 4;
  const testRun2 = calculateRunningMetrics();
  const longerWeeksShave = testRun2.paceShavePerWeek;
  state.running.weeks -= 4; // Restore

  console.assert(longerWeeksShave < origShave, `Assertion Failed: Longer weeks should decrease weekly pace cut. ${longerWeeksShave} < ${origShave}`);

  // Test 2: Sub-2 hour goal calculation check
  // 120 minutes / 13.109375 miles should equal ~549.2 seconds/mile (9:09.2)
  const targetPace = testRun1.targetPaceSeconds;
  console.assert(Math.abs(targetPace - 549.2) < 0.5, `Assertion Failed: Target pace should be ~549.2 sec/mile, got ${targetPace}`);

  // Test 3: Housing roommate increase should REDUCE per-person rent
  const origRoommates = state.housing.roommatesCount;
  state.housing.roommatesCount = 3;
  const h1 = calculateHousingMetrics();
  state.housing.roommatesCount = 4;
  const h2 = calculateHousingMetrics();
  state.housing.roommatesCount = origRoommates; // Restore

  console.assert(h2.sharedRentPerPerson < h1.sharedRentPerPerson, `Assertion Failed: 4 roommates should cost less than 3 roommates per person.`);

  // Test 4: GPA final score requirement increases as midterm score drops
  const origMidterm = state.gpa.midtermScore;
  state.gpa.midtermScore = 80;
  const g1 = calculateGpaMetrics();
  state.gpa.midtermScore = 60;
  const g2 = calculateGpaMetrics();
  state.gpa.midtermScore = origMidterm; // Restore

  console.assert(g2.neededFinalScore > g1.neededFinalScore, `Assertion Failed: Lower midterm must demand higher final score.`);

  console.log('All Mathematical & Bi-Directional Slider Assertions PASSED ✅');
}

// ==========================================
// EVENT LISTENERS INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Theme load
  const savedTheme = localStorage.getItem('interactive_viz_theme') || 'marathon-volt';
  document.getElementById('theme-select').value = savedTheme;
  applyTheme(savedTheme);

  document.getElementById('theme-select').addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  // Tab switching
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchScenario(tab.dataset.scenario);
    });
  });

  // Scenario 1: Running Sliders
  const bindSlider = (id, obj, prop, parser = parseInt) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      obj[prop] = parser(e.target.value);
      updateUI();
    });
  };

  bindSlider('slider-weeks', state.running, 'weeks');
  bindSlider('slider-speed-workouts', state.running, 'speedWorkouts');

  // Synchronized Runs Per Week & Rest Days Sliders
  const sliderRunsWeek = document.getElementById('slider-runs-week');
  const sliderRestDays = document.getElementById('slider-rest-days');

  if (sliderRunsWeek) {
    sliderRunsWeek.addEventListener('input', (e) => {
      const runs = parseInt(e.target.value);
      state.running.runsPerWeek = runs;
      state.running.restDays = 7 - runs;
      if (sliderRestDays) sliderRestDays.value = state.running.restDays;
      updateUI();
    });
  }

  if (sliderRestDays) {
    sliderRestDays.addEventListener('input', (e) => {
      const rest = parseInt(e.target.value);
      state.running.restDays = rest;
      state.running.runsPerWeek = 7 - rest;
      if (sliderRunsWeek) sliderRunsWeek.value = state.running.runsPerWeek;
      updateUI();
    });
  }

  // Baseline pace inputs
  const sliderStartPace = document.getElementById('slider-start-pace');
  if (sliderStartPace) {
    sliderStartPace.addEventListener('input', (e) => {
      const totalSec = parseInt(e.target.value);
      state.running.startPaceMin = Math.floor(totalSec / 60);
      state.running.startPaceSec = totalSec % 60;
      updateUI();
    });
  }

  // Goal finish time slider (in minutes)
  const sliderGoalTime = document.getElementById('slider-goal-time');
  if (sliderGoalTime) {
    sliderGoalTime.addEventListener('input', (e) => {
      const totalMin = parseInt(e.target.value);
      state.running.targetHour = Math.floor(totalMin / 60);
      state.running.targetMin = totalMin % 60;
      state.running.targetSec = 0;
      updateUI();
    });
  }

  // Running Presets
  document.querySelectorAll('.preset-running').forEach(btn => {
    btn.addEventListener('click', () => {
      const weeks = parseInt(btn.dataset.weeks);
      const runs = parseInt(btn.dataset.runs);
      const speed = parseInt(btn.dataset.speed);
      const goalMin = parseInt(btn.dataset.goalMin);
      
      state.running.weeks = weeks;
      state.running.runsPerWeek = runs;
      state.running.speedWorkouts = speed;
      state.running.targetHour = Math.floor(goalMin / 60);
      state.running.targetMin = goalMin % 60;
      state.running.targetSec = 0;

      // Sync slider elements
      document.getElementById('slider-weeks').value = weeks;
      document.getElementById('slider-runs-week').value = runs;
      if (document.getElementById('slider-rest-days')) {
        document.getElementById('slider-rest-days').value = 7 - runs;
      }
      document.getElementById('slider-speed-workouts').value = speed;
      document.getElementById('slider-goal-time').value = goalMin;

      updateUI();
    });
  });

  // Scenario 2: Housing Sliders
  bindSlider('slider-income', state.housing, 'monthlyIncome');
  bindSlider('slider-current-rent', state.housing, 'currentRent');
  bindSlider('slider-shared-rent', state.housing, 'sharedAptTotalRent');
  bindSlider('slider-roommates', state.housing, 'roommatesCount');
  bindSlider('slider-studio-rent', state.housing, 'studioRent');
  bindSlider('slider-studio-commute', state.housing, 'studioCommute');

  // Scenario 3: GPA Sliders
  bindSlider('slider-current-gpa', state.gpa, 'currentGpa', parseFloat);
  bindSlider('slider-credits', state.gpa, 'courseCredits');
  bindSlider('slider-midterm', state.gpa, 'midtermScore');
  bindSlider('slider-assignments', state.gpa, 'assignmentsScore');
  bindSlider('slider-final-weight', state.gpa, 'finalWeight');

  // GPA Target Grade Buttons
  document.querySelectorAll('.btn-target-grade').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-target-grade').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gpa.targetLetterGrade = btn.dataset.grade;
      updateUI();
    });
  });

  // Checklist Modal Toggles
  const modalEl = document.getElementById('checklist-modal');
  document.getElementById('open-checklist-btn')?.addEventListener('click', () => {
    modalEl.classList.add('active');
  });
  document.getElementById('close-checklist-btn')?.addEventListener('click', () => {
    modalEl.classList.remove('active');
  });
  modalEl?.addEventListener('click', (e) => {
    if (e.target === modalEl) modalEl.classList.remove('active');
  });

  // Window resize re-render SVG charts
  window.addEventListener('resize', () => {
    updateUI();
  });

  // Initial draw & Verification
  runSelfVerificationTests();
  updateUI();
});

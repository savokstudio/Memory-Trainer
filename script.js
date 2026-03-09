// --------------------------------------------------
// ELEMENT REFERENCES (MATCH YOUR HTML)
// --------------------------------------------------
const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const userInput = document.getElementById("user-input");
const codeDisplay = document.getElementById("code-display");
const message = document.getElementById("message");
const difficultySelect = document.getElementById("difficultySelect");
difficultySelect.addEventListener("change", () => {
  const digits = parseInt(difficultySelect.value, 10);
  userInput.maxLength = digits;
});


const upgradeBtn = document.getElementById("upgrade-btn");
const themeSwitch = document.getElementById("theme-switch");

const streakContainer = document.getElementById("streakContainer");
const streakValue = document.getElementById("streakValue");

const trialsLeftEl = document.getElementById("trials-left");
const watchAdBtn = document.getElementById("watch-ad-btn");

const upgradeModal = document.getElementById("upgrade-modal");
const adModal = document.getElementById("ad-modal");
const premiumModal = document.getElementById("premiumModal");

const closeUpgradeModalBtn = document.getElementById("close-modal");
const closeAdBtn = document.getElementById("close-ad-btn");
const closePremiumBtn = document.getElementById("closePremium");

const purchaseBtn = document.getElementById("purchase-btn");
const monthlyBtn = document.getElementById("monthlyBtn");
const lifetimeBtn = document.getElementById("lifetimeBtn");

const adCountdown = document.getElementById("ad-countdown");

// --------------------------------------------------
// PREMIUM / TRIAL STATE
// --------------------------------------------------
let hasPremium = false;
const trialLimit = 3;
let trialPlays = { 8: 0, 10: 0 };
let adRewardPendingFor = null; // which length gets 1 extra play after ad

// --------------------------------------------------
// GAME STATE
// --------------------------------------------------
let currentCode = "";
let showingCode = false;

// --------------------------------------------------
// STREAK SYSTEM (CORRECT ANSWERS ONLY)
// --------------------------------------------------
function loadStreak() {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  updateStreakUI(streak);
}

function incrementStreak() {
  let streak = parseInt(localStorage.getItem("streak") || "0");
  streak += 1;
  localStorage.setItem("streak", streak);
  updateStreakUI(streak, true);
}

function resetStreak() {
  localStorage.setItem("streak", 0);
  updateStreakUI(0, true);
}

function updateStreakUI(streak, animate = false) {
  if (!streakValue || !streakContainer) return;

  streakValue.textContent = streak;
  streakContainer.classList.add("active");

  if (animate) {
    streakContainer.classList.add("streak-pulse");
    setTimeout(() => streakContainer.classList.remove("streak-pulse"), 1200);
  }
}

// --------------------------------------------------
// CODE GENERATION
// --------------------------------------------------
function generateCode(length) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

// --------------------------------------------------
// TRIAL / PREMIUM GATE
// --------------------------------------------------
function updateTrialsLeftDisplay(length) {
  if (!trialsLeftEl) return;

  if (hasPremium || length !== 8 && length !== 10) {
    trialsLeftEl.textContent = "";
    watchAdBtn === null || watchAdBtn === void 0 ? void 0 : watchAdBtn.classList.add("hidden");
    return;
  }

  const used = trialPlays[length] || 0;
  const left = Math.max(trialLimit - used, 0);
  trialsLeftEl.textContent = `${left} trial${left === 1 ? "" : "s"} left`;

  if (left === 0) {
    watchAdBtn === null || watchAdBtn === void 0 ? void 0 : watchAdBtn.classList.remove("hidden");
  } else {
    watchAdBtn === null || watchAdBtn === void 0 ? void 0 : watchAdBtn.classList.add("hidden");
  }
}

function canPlayMode(length) {
  if (hasPremium) {
    updateTrialsLeftDisplay(length);
    return true;
  }

  if (length === 8 || length === 10) {
    const used = trialPlays[length] || 0;

    if (used >= trialLimit) {
      updateTrialsLeftDisplay(length);
      return false;
    }

    trialPlays[length] = used + 1;
    updateTrialsLeftDisplay(length);
  } else {
    updateTrialsLeftDisplay(length);
  }

  return true;
}

// --------------------------------------------------
// MODALS
// --------------------------------------------------
function openUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.remove("hidden");
}

function closeUpgradeModal() {
  if (!upgradeModal) return;
  upgradeModal.classList.add("hidden");
}

function openPremiumModal() {
  if (!premiumModal) return;
  premiumModal.classList.remove("hidden");
}

function closePremiumModal() {
  if (!premiumModal) return;
  premiumModal.classList.add("hidden");
}

function openAdModal() {
  if (!adModal) return;
  adModal.classList.remove("hidden");
}

function closeAdModal() {
  if (!adModal) return;
  adModal.classList.add("hidden");
}

// --------------------------------------------------
// AD LOGIC (SIMULATED REWARD)
// --------------------------------------------------
function startAdForLength(length) {
  if (!adCountdown || !closeAdBtn) return;

  adRewardPendingFor = length;
  openAdModal();
  closeAdBtn.classList.add("hidden");
  adCountdown.textContent = "Your ad is loading...";

  let remaining = 5;
  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      adCountdown.textContent = `Watching ad... ${remaining}s`;
    } else {
      clearInterval(interval);
      adCountdown.textContent = "Ad finished. You earned 1 extra play.";
      closeAdBtn.classList.remove("hidden");

      if (!hasPremium && (length === 8 || length === 10)) {
        trialPlays[length] = Math.max(trialPlays[length] - 1, 0);
        updateTrialsLeftDisplay(length);
      }
    }
  }, 1000);
}

// --------------------------------------------------
// DARK MODE TOGGLE
// --------------------------------------------------
function initThemeToggle() {
  if (!themeSwitch) return;

  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });
}

// --------------------------------------------------
// START GAME
// --------------------------------------------------
function startGame() {
  message.textContent = "";
  message.className = "message";
  userInput.value = "";
  userInput.disabled = true;
  submitBtn.disabled = true;
  startBtn.disabled = true;
  startBtn.classList.remove("start-ready");

  const length = parseInt(difficultySelect.value);

  if (!canPlayMode(length)) {
    codeDisplay.textContent =
    `You’ve tried advanced mode ${trialLimit} times — nice work! Upgrade to keep going.`;
    codeDisplay.classList.remove("fade-out");
    codeDisplay.classList.add("fade-in");

    startBtn.disabled = false;
    startBtn.classList.add("start-ready");
    return;
  }

  currentCode = generateCode(length);
  showingCode = true;

  codeDisplay.textContent = currentCode;
  codeDisplay.classList.remove("fade-out");
  codeDisplay.classList.add("fade-in");

  setTimeout(() => {
    codeDisplay.classList.remove("fade-in");
    codeDisplay.classList.add("fade-out");

    setTimeout(() => {
      codeDisplay.textContent = "Now enter the code.";
      codeDisplay.classList.remove("fade-out");
      codeDisplay.classList.add("fade-in");

      showingCode = false;
      userInput.disabled = false;
      userInput.focus();
      submitBtn.disabled = false;
    }, 250);
  }, 2000);
}

// --------------------------------------------------
// CHECK ANSWER
// --------------------------------------------------
function checkAnswer() {
  if (submitBtn.disabled) return; // prevents Enter spam
  if (showingCode) return;

  const guess = userInput.value.trim();

  if (guess.length === 0) {
    message.textContent = "Try entering what you remember.";
    message.className = "message";
    return;
  }

  if (guess === currentCode) {
    message.textContent = "Nice. You nailed it.";
    message.className = "message success success-anim";
    incrementStreak();
  } else {
    message.textContent = `Close. The code was ${currentCode}.`;
    message.className = "message error error-anim";
    resetStreak();
  }

  submitBtn.disabled = true;
  startBtn.disabled = false;
  startBtn.classList.add("start-ready");
}

// --------------------------------------------------
// BUTTON HANDLERS
// --------------------------------------------------
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const difficulty = parseInt(difficultySelect.value);

    if (!hasPremium && (difficulty === 8 || difficulty === 10)) {
      const used = trialPlays[difficulty] || 0;
      const left = trialLimit - used;

      if (left <= 0) {
        openPremiumModal();
        return;
      }
    }

    startGame();
  });
}

if (submitBtn) {
  submitBtn.addEventListener("click", checkAnswer);
}

// Enter key submits when allowed
if (userInput) {
  userInput.addEventListener("keyup", e => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });
}

// Upgrade button → open upgrade or premium flow
if (upgradeBtn) {
  upgradeBtn.addEventListener("click", () => {
    openPremiumModal();
  });
}

// Watch ad button
if (watchAdBtn) {
  watchAdBtn.addEventListener("click", () => {
    const length = parseInt(difficultySelect.value);
    startAdForLength(length);
  });
}

// Close modals
if (closeUpgradeModalBtn) {
  closeUpgradeModalBtn.addEventListener("click", closeUpgradeModal);
}
if (closeAdBtn) {
  closeAdBtn.addEventListener("click", closeAdModal);
}
if (closePremiumBtn) {
  closePremiumBtn.addEventListener("click", closePremiumModal);
}

// --------------------------------------------------
// STRIPE CHECKOUT LINKS
// --------------------------------------------------
if (monthlyBtn) {
  monthlyBtn.addEventListener("click", () => {
    window.location.href = "https://buy.stripe.com/28E14o8JF64v88H5aFa7C00";
  });
}

if (lifetimeBtn) {
  lifetimeBtn.addEventListener("click", () => {
    window.location.href = "https://buy.stripe.com/14A3cwgc7fF588H5aFa7C01";
  });
}

// Optional: purchase button in upgrade modal can open premium modal
if (purchaseBtn) {
  purchaseBtn.addEventListener("click", () => {
    closeUpgradeModal();
    openPremiumModal();
  });
}

// --------------------------------------------------
// INIT
// --------------------------------------------------
loadStreak();
initThemeToggle();
updateTrialsLeftDisplay(parseInt(difficultySelect.value || "6"));
/* ==========================================================================
   Sunseed — Vanilla JavaScript
   Features: Navigation, Task Planner (+5 seeds once), Virtual Garden,
             Daily Habits Tracker, Journal, Petal Confetti, and LocalStorage
   ========================================================================== */

(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // 1. Constants & Game Configuration
  // --------------------------------------------------------------------------
  const STORAGE_KEY = "sunseedData_v1";
  const LEGACY_STORAGE_KEY = "bloomAndBeyondData_v1";
  const TASK_REWARD_SEEDS = 5;
  const WATER_COST_SEEDS = 2;
  const TOTAL_POTS = 9;

  const FLOWER_CATALOG = [
    { id: "daisy", name: "Cream Daisy", cost: 5, petalColor: "#fff8d6", centerColor: "#f2b84b" },
    { id: "tulip", name: "Pink Tulip", cost: 8, petalColor: "#f28cb1", shadeColor: "#d4638c" },
    { id: "lavender", name: "Lavender Sprig", cost: 8, petalColor: "#b89ee6", shadeColor: "#8f71c7" },
    { id: "fern", name: "Sage Fern", cost: 6, petalColor: "#7bb384", shadeColor: "#508759" },
    { id: "sunflower", name: "Sunflower", cost: 9, petalColor: "#f7cd54", centerColor: "#7d5138" },
    { id: "lily", name: "Pastel Lilies", cost: 7, petalColor: "#fce3ee", shadeColor: "#e88fb3" },
    { id: "sakura", name: "Cherry Blossom", cost: 10, petalColor: "#f7b5cf", centerColor: "#e6739f" }
  ];

  const PASTEL_COLORS = [
    { id: "cream", label: "Cream", hex: "#faf2e3" },
    { id: "pink", label: "Pink", hex: "#f7cbe0" },
    { id: "sage", label: "Sage", hex: "#c7e0c2" },
    { id: "lavender", label: "Lavender", hex: "#dcd0f5" },
    { id: "butter", label: "Butter", hex: "#f9e7a7" },
    { id: "sky", label: "Sky", hex: "#c8e4f7" }
  ];

  const POT_COLORS = [
    { id: "terracotta", label: "Terracotta", main: "#d99173", light: "#e8a589", dark: "#bf775a" },
    { id: "pink", label: "Pink", main: "#eaa9c4", light: "#f5c4d8", dark: "#d48aa9" },
    { id: "sage", label: "Sage", main: "#9fc49a", light: "#bad9b6", dark: "#81a87c" },
    { id: "lavender", label: "Lavender", main: "#bfb0e3", light: "#d5cbf0", dark: "#9f8ec9" },
    { id: "cream", label: "Cream", main: "#e8dec8", light: "#f5eedc", dark: "#cfc1a7" },
    { id: "sky", label: "Sky", main: "#a4cbe6", light: "#c2dff2", dark: "#84afc9" }
  ];

  const PAGE_THEMES = [
    { id: "cream", label: "Warm Cream", hex: "#fdf8ee" },
    { id: "pink", label: "Blossom Pink", hex: "#fceaf2" },
    { id: "sage", label: "Sage Meadow", hex: "#eaf4e7" },
    { id: "lavender", label: "Soft Lavender", hex: "#f1ecfb" }
  ];

  const WEATHER_CONDITION_LABELS = {
    sunny: "Sunny",
    "partly-cloudy": "Partly Cloudy",
    cloudy: "Cloudy",
    rainy: "Rainy",
    breezy: "Breezy",
    snowy: "Snowy"
  };

  // --------------------------------------------------------------------------
  // 2. Date Helpers & Initial Sample Data
  // --------------------------------------------------------------------------
  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateObj) {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatShortDate(isoDate) {
    if (!isoDate) return "No due date";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function createDefaultState() {
    const today = getTodayString();
    return {
      seeds: 10,
      pageTheme: "cream",
      selectedFlowerId: "daisy",
      selectedTaskColor: "pink",
      selectedHabitColor: "lavender",
      selectedJournalColor: "butter",
      selectedReminderColor: "pink",
      calendarColor: "cream",
      weather: {
        condition: "sunny",
        tempC: null,
        unit: "C",
        location: "Detecting location...",
        lastUpdated: 0
      },
      taskFilter: "all",
      lastHabitDate: today,
      tasks: [
        {
          id: "task-1",
          title: "Review lecture slides for Web Tech",
          category: "Study",
          dueDate: today,
          color: "lavender",
          customEmoji: "",
          completed: true,
          rewarded: true
        },
        {
          id: "task-2",
          title: "Complete HTML & CSS assignment draft",
          category: "Study",
          dueDate: today,
          color: "pink",
          customEmoji: "",
          completed: false,
          rewarded: false
        },
        {
          id: "task-3",
          title: "Tidy up study desk and water desk plant",
          category: "Chores",
          dueDate: today,
          color: "sage",
          customEmoji: "",
          completed: false,
          rewarded: false
        }
      ],
      gardenPots: [
        { potIndex: 0, flowerId: "tulip", stage: 2, potColor: "terracotta" },
        { potIndex: 1, flowerId: null, stage: 0, potColor: "pink" },
        { potIndex: 2, flowerId: null, stage: 0, potColor: "sage" },
        { potIndex: 3, flowerId: null, stage: 0, potColor: "lavender" },
        { potIndex: 4, flowerId: null, stage: 0, potColor: "cream" },
        { potIndex: 5, flowerId: null, stage: 0, potColor: "sky" },
        { potIndex: 6, flowerId: null, stage: 0, potColor: "pink" },
        { potIndex: 7, flowerId: null, stage: 0, potColor: "sage" },
        { potIndex: 8, flowerId: null, stage: 0, potColor: "lavender" }
      ],
      habits: [
        { id: "habit-study", name: "Studying", icon: "study", customEmoji: "", color: "lavender", doneToday: false, totalDays: 2 },
        { id: "habit-water", name: "Drinking Water", icon: "water", customEmoji: "", color: "sky", doneToday: true, totalDays: 4 },
        { id: "habit-read", name: "Reading", icon: "read", customEmoji: "", color: "pink", doneToday: false, totalDays: 1 },
        { id: "habit-exercise", name: "Exercising", icon: "exercise", customEmoji: "", color: "sage", doneToday: false, totalDays: 2 }
      ],
      journalEntries: [
        {
          id: "journal-1",
          title: "Fresh start in Sunseed",
          date: today,
          mood: "☀️ Sunny",
          color: "butter",
          body: "Planted a pink tulip sprout in my garden and organized today's study tasks. Taking things one step at a time!"
        }
      ],
      reminders: [
        {
          id: "rem-1",
          title: "Web Tech Assignment Check-In",
          date: today,
          category: "Deadline",
          emoji: "📌",
          color: "pink",
          isSpecial: false
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // 3. LocalStorage State Management
  // --------------------------------------------------------------------------
  let appState = loadState();
  let activeSection = "home";
  let editingTaskId = null;
  let editingHabitId = null;
  let editingJournalId = null;
  let editingReminderId = null;
  let weatherLoading = false;
  let reminderViewMode = "selected";
  let selectedCalendarDate = getTodayString();
  let calendarViewYear = new Date().getFullYear();
  let calendarViewMonth = new Date().getMonth();
  let toastTimer = null;
  let resetConfirmArmed = false;
  let resetConfirmTimer = null;

  function loadState() {
    const fallback = createDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      const today = getTodayString();

      const tasks = Array.isArray(parsed.tasks)
        ? parsed.tasks.map(function (t) {
            return Object.assign({ color: "cream", customEmoji: "" }, t);
          })
        : fallback.tasks;

      let gardenPots = fallback.gardenPots;
      if (Array.isArray(parsed.gardenPots) && parsed.gardenPots.length > 0) {
        gardenPots = fallback.gardenPots.map(function (defaultPot, index) {
          const savedPot = parsed.gardenPots[index];
          return savedPot
            ? Object.assign({ potColor: defaultPot.potColor }, savedPot, { potIndex: index })
            : defaultPot;
        });
      }

      let habits = Array.isArray(parsed.habits)
        ? parsed.habits.map(function (h) {
            return Object.assign({ color: "cream", icon: "star", customEmoji: "" }, h);
          })
        : fallback.habits;

      const journalEntries = Array.isArray(parsed.journalEntries)
        ? parsed.journalEntries.map(function (entry) {
            return Object.assign({ title: "", mood: "☀️ Sunny", color: "cream" }, entry);
          })
        : fallback.journalEntries;

      const reminders = Array.isArray(parsed.reminders)
        ? parsed.reminders.map(function (r) {
            return Object.assign(
              { category: "Reminder", emoji: "📌", color: "pink", isSpecial: false },
              r,
              { isSpecial: Boolean(r.isSpecial) }
            );
          })
        : fallback.reminders;

      const savedWeather =
        parsed.weather && typeof parsed.weather === "object" ? parsed.weather : {};
      const weather = {
        condition: savedWeather.condition || "sunny",
        tempC: typeof savedWeather.tempC === "number" ? savedWeather.tempC : null,
        unit: savedWeather.unit === "F" ? "F" : "C",
        location: savedWeather.location || "Detecting location...",
        lastUpdated: typeof savedWeather.lastUpdated === "number" ? savedWeather.lastUpdated : 0
      };

      // Reset daily habit checkmarks automatically when a new day begins
      let lastHabitDate = parsed.lastHabitDate || today;
      if (lastHabitDate !== today) {
        habits = habits.map(function (habit) {
          return Object.assign({}, habit, { doneToday: false });
        });
        lastHabitDate = today;
      }

      return {
        seeds: typeof parsed.seeds === "number" && parsed.seeds >= 0 ? parsed.seeds : fallback.seeds,
        pageTheme: parsed.pageTheme || "cream",
        selectedFlowerId: parsed.selectedFlowerId || "daisy",
        selectedTaskColor: parsed.selectedTaskColor || "pink",
        selectedHabitColor: parsed.selectedHabitColor || "lavender",
        selectedJournalColor: parsed.selectedJournalColor || "butter",
        selectedReminderColor: parsed.selectedReminderColor || "pink",
        calendarColor: parsed.calendarColor || "cream",
        weather: weather,
        taskFilter: parsed.taskFilter || "all",
        lastHabitDate: lastHabitDate,
        tasks: tasks,
        gardenPots: gardenPots,
        habits: habits,
        journalEntries: journalEntries,
        reminders: reminders
      };
    } catch (error) {
      return fallback;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      // Ignore storage quota errors in restricted browsing modes
    }
  }

  // --------------------------------------------------------------------------
  // 4. Pixel-Art SVG Generators (Crisp 16x16 Grid Illustrations)
  // --------------------------------------------------------------------------
  function makePixelSvg(rects, sizePx) {
    const size = sizePx || 64;
    return (
      '<svg width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">' +
      rects +
      "</svg>"
    );
  }

  function px(x, y, w, h, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
  }

  function getSeedIconSvg(size) {
    const rects =
      px(7, 3, 2, 1, "#9c7248") +
      px(6, 4, 4, 2, "#b88958") +
      px(5, 6, 6, 4, "#c99a68") +
      px(6, 7, 1, 2, "#f0d4ae") +
      px(6, 10, 4, 2, "#9c7248") +
      px(7, 12, 2, 1, "#7d5935");
    return makePixelSvg(rects, size);
  }

  function getSunflowerLogoSvg(size) {
    const rects =
      px(5, 1, 6, 2, "#f7cd54") +
      px(3, 3, 2, 2, "#eab638") +
      px(11, 3, 2, 2, "#eab638") +
      px(1, 5, 2, 6, "#f7cd54") +
      px(13, 5, 2, 6, "#f7cd54") +
      px(3, 11, 2, 2, "#eab638") +
      px(11, 11, 2, 2, "#eab638") +
      px(5, 13, 6, 2, "#f7cd54") +
      px(3, 5, 10, 6, "#f7cd54") +
      px(5, 3, 6, 10, "#f7cd54") +
      px(5, 5, 6, 6, "#7d5138") +
      px(6, 6, 1, 1, "#9c6b4e") +
      px(9, 7, 1, 1, "#9c6b4e") +
      px(7, 9, 1, 1, "#9c6b4e");
    return makePixelSvg(rects, size);
  }

  function getPotBasePixels(potColorId) {
    const palette =
      POT_COLORS.find(function (c) {
        return c.id === potColorId;
      }) || POT_COLORS[0];

    return (
      px(4, 11, 8, 1, palette.main) +
      px(3, 10, 10, 1, palette.light) +
      px(4, 10, 8, 1, "#6b4c3b") + // soil line
      px(5, 12, 6, 3, palette.main) +
      px(5, 12, 1, 3, palette.light) +
      px(10, 12, 1, 3, palette.dark)
    );
  }

  function getPlantGrowthPixels(flowerId, stage) {
    if (stage === 0 || !flowerId) {
      return px(6, 10, 4, 1, "#6b4c3b");
    }

    if (stage === 1) {
      return (
        px(7, 8, 2, 3, "#6ea375") +
        px(5, 7, 2, 2, "#8cc493") +
        px(9, 7, 2, 2, "#8cc493")
      );
    }

    const flower = FLOWER_CATALOG.find(function (f) {
      return f.id === flowerId;
    }) || FLOWER_CATALOG[0];

    if (stage === 2) {
      return (
        px(7, 5, 2, 6, "#5c9164") +
        px(5, 7, 2, 1, "#8cc493") +
        px(9, 6, 2, 1, "#8cc493") +
        px(6, 3, 4, 2, flower.petalColor) +
        px(7, 2, 2, 1, flower.petalColor)
      );
    }

    const stem =
      px(7, 6, 2, 5, "#5c9164") +
      px(5, 8, 2, 1, "#8cc493") +
      px(9, 7, 2, 1, "#8cc493");

    if (flowerId === "daisy") {
      return (
        stem +
        px(6, 1, 4, 2, "#ffffff") +
        px(4, 3, 2, 3, "#ffffff") +
        px(10, 3, 2, 3, "#ffffff") +
        px(6, 5, 4, 2, "#ffffff") +
        px(6, 3, 4, 2, flower.centerColor)
      );
    }
    if (flowerId === "tulip") {
      return (
        stem +
        px(5, 3, 6, 4, flower.petalColor) +
        px(5, 2, 2, 1, flower.petalColor) +
        px(9, 2, 2, 1, flower.petalColor) +
        px(7, 3, 2, 2, flower.shadeColor)
      );
    }
    if (flowerId === "lavender") {
      return (
        px(7, 3, 2, 8, "#5c9164") +
        px(5, 8, 2, 1, "#8cc493") +
        px(9, 8, 2, 1, "#8cc493") +
        px(7, 1, 2, 2, flower.petalColor) +
        px(6, 3, 4, 2, flower.shadeColor) +
        px(6, 5, 4, 2, flower.petalColor)
      );
    }
    if (flowerId === "fern") {
      return (
        px(7, 3, 2, 8, "#4d7c59") +
        px(4, 7, 3, 1, "#7bb384") +
        px(9, 7, 3, 1, "#7bb384") +
        px(3, 5, 4, 1, "#8cc493") +
        px(9, 5, 4, 1, "#8cc493") +
        px(5, 3, 6, 1, "#a3d4aa") +
        px(6, 2, 4, 1, "#7bb384")
      );
    }
    if (flowerId === "sunflower") {
      return (
        px(7, 7, 2, 4, "#5c9164") +
        px(4, 8, 3, 2, "#7bb384") +
        px(9, 8, 3, 2, "#8cc493") +
        px(5, 1, 6, 1, flower.petalColor) +
        px(4, 2, 8, 5, flower.petalColor) +
        px(3, 3, 1, 3, "#eab638") +
        px(12, 3, 1, 3, "#eab638") +
        px(5, 7, 6, 1, "#eab638") +
        px(6, 3, 4, 3, flower.centerColor) +
        px(7, 4, 1, 1, "#9c6b4e")
      );
    }
    if (flowerId === "lily") {
      return (
        px(7, 5, 2, 6, "#5c9164") +
        px(5, 8, 2, 1, "#8cc493") +
        px(9, 7, 2, 1, "#8cc493") +
        // Left & right lily bell blossoms
        px(3, 3, 4, 3, flower.petalColor) +
        px(4, 2, 2, 1, flower.shadeColor) +
        px(4, 4, 1, 1, "#f2b84b") +
        px(9, 3, 4, 3, flower.petalColor) +
        px(10, 2, 2, 1, flower.shadeColor) +
        px(11, 4, 1, 1, "#f2b84b") +
        // Top center lily bloom
        px(6, 1, 4, 3, "#ffffff") +
        px(7, 2, 2, 2, flower.shadeColor) +
        px(7, 1, 2, 1, "#f2b84b")
      );
    }

    // Cherry Blossom (sakura)
    return (
      px(7, 6, 2, 5, "#8c6550") +
      px(5, 5, 2, 1, "#8c6550") +
      px(9, 5, 2, 1, "#8c6550") +
      px(4, 2, 3, 3, flower.petalColor) +
      px(9, 2, 3, 3, flower.petalColor) +
      px(6, 1, 4, 3, flower.petalColor) +
      px(7, 2, 2, 1, flower.centerColor) +
      px(5, 3, 1, 1, flower.centerColor) +
      px(10, 3, 1, 1, flower.centerColor)
    );
  }

  function getPlantStageSvg(flowerId, stage, size, potColorId) {
    const pot = getPotBasePixels(potColorId || "terracotta");
    const plant = getPlantGrowthPixels(flowerId, stage);
    return makePixelSvg(pot + plant, size);
  }

  function getHabitIconSvg(iconType, size) {
    if (iconType === "study") {
      // Pixel open book
      return makePixelSvg(
        px(2, 4, 5, 8, "#8f71c7") +
          px(9, 4, 5, 8, "#8f71c7") +
          px(3, 5, 4, 6, "#ffffff") +
          px(9, 5, 4, 6, "#ffffff") +
          px(7, 5, 2, 7, "#6c52a3") +
          px(4, 7, 2, 1, "#d9cdc2") +
          px(10, 7, 2, 1, "#d9cdc2"),
        size
      );
    }
    if (iconType === "water") {
      // Pixel water droplet
      return makePixelSvg(
        px(7, 2, 2, 2, "#7ab8e8") +
          px(6, 4, 4, 2, "#7ab8e8") +
          px(5, 6, 6, 4, "#5fa4db") +
          px(6, 10, 4, 2, "#5fa4db") +
          px(6, 7, 1, 2, "#d8f0ff"),
        size
      );
    }
    if (iconType === "read") {
      // Pixel stacked books
      return makePixelSvg(
        px(3, 4, 10, 3, "#f28cb1") +
          px(4, 5, 8, 1, "#ffffff") +
          px(3, 8, 10, 3, "#7bb384") +
          px(4, 9, 8, 1, "#ffffff"),
        size
      );
    }
    if (iconType === "exercise") {
      // Pixel heart / energy
      return makePixelSvg(
        px(3, 4, 3, 2, "#e8769b") +
          px(10, 4, 3, 2, "#e8769b") +
          px(2, 5, 12, 3, "#e8769b") +
          px(4, 8, 8, 2, "#e8769b") +
          px(6, 10, 4, 2, "#e8769b") +
          px(7, 12, 2, 1, "#e8769b") +
          px(4, 5, 2, 1, "#ffd4e3"),
        size
      );
    }
    if (iconType === "flower") {
      // Pixel flower icon
      return makePixelSvg(
        px(7, 8, 2, 5, "#5c9164") +
          px(6, 2, 4, 2, "#f28cb1") +
          px(4, 4, 2, 3, "#f28cb1") +
          px(10, 4, 2, 3, "#f28cb1") +
          px(6, 6, 4, 2, "#f28cb1") +
          px(6, 4, 4, 2, "#f7cd54"),
        size
      );
    }
    if (iconType === "journal") {
      // Pixel pastel notebook & ribbon
      return makePixelSvg(
        px(3, 2, 10, 12, "#e88fb3") +
          px(4, 3, 8, 10, "#fff8ec") +
          px(3, 2, 2, 12, "#c95b87") +
          px(6, 5, 5, 1, "#b89ee6") +
          px(6, 7, 5, 1, "#d9cdc2") +
          px(6, 9, 4, 1, "#d9cdc2") +
          px(9, 11, 2, 3, "#f2b84b"),
        size
      );
    }
    // Custom habit pixel sparkle/star
    return makePixelSvg(
      px(7, 2, 2, 12, "#f2b84b") +
        px(2, 7, 12, 2, "#f2b84b") +
        px(5, 5, 6, 6, "#f7cf77"),
      size
    );
  }

  function getWeatherSvg(condition, size) {
    if (condition === "partly-cloudy") {
      return makePixelSvg(
        px(3, 2, 4, 4, "#f7cd54") +
          px(2, 3, 1, 2, "#eab638") +
          px(4, 1, 2, 1, "#eab638") +
          px(6, 7, 7, 5, "#ffffff") +
          px(5, 8, 9, 4, "#e8eff5") +
          px(6, 6, 5, 2, "#ffffff") +
          px(5, 11, 9, 1, "#c8d7e3"),
        size
      );
    }
    if (condition === "cloudy") {
      return makePixelSvg(
        px(5, 5, 6, 2, "#ffffff") +
          px(3, 7, 10, 4, "#ffffff") +
          px(2, 8, 12, 3, "#e8eff5") +
          px(3, 11, 10, 1, "#c8d7e3"),
        size
      );
    }
    if (condition === "rainy") {
      return makePixelSvg(
        px(5, 3, 6, 2, "#d8e4ee") +
          px(3, 5, 10, 4, "#c5d6e6") +
          px(4, 9, 8, 1, "#a7bfd4") +
          px(4, 11, 1, 2, "#6faee0") +
          px(7, 12, 1, 2, "#6faee0") +
          px(10, 11, 1, 2, "#6faee0") +
          px(12, 12, 1, 2, "#6faee0"),
        size
      );
    }
    if (condition === "breezy") {
      return makePixelSvg(
        px(2, 5, 8, 1, "#8cc493") +
          px(10, 4, 2, 2, "#8cc493") +
          px(3, 8, 10, 1, "#7ab8e8") +
          px(12, 7, 2, 2, "#7ab8e8") +
          px(2, 11, 7, 1, "#a3d4aa"),
        size
      );
    }
    if (condition === "snowy") {
      return makePixelSvg(
        px(5, 3, 6, 2, "#ffffff") +
          px(3, 5, 10, 4, "#e8eff5") +
          px(4, 11, 2, 2, "#ffffff") +
          px(8, 12, 2, 2, "#b8d7eb") +
          px(11, 10, 2, 2, "#ffffff"),
        size
      );
    }
    // Sunny
    return makePixelSvg(
      px(7, 1, 2, 2, "#eab638") +
        px(7, 13, 2, 2, "#eab638") +
        px(1, 7, 2, 2, "#eab638") +
        px(13, 7, 2, 2, "#eab638") +
        px(3, 3, 2, 2, "#eab638") +
        px(11, 3, 2, 2, "#eab638") +
        px(3, 11, 2, 2, "#eab638") +
        px(11, 11, 2, 2, "#eab638") +
        px(5, 4, 6, 8, "#f7cd54") +
        px(4, 5, 8, 6, "#f7cd54") +
        px(6, 6, 2, 2, "#fff3b8"),
      size
    );
  }

  function applyPageTheme() {
    document.body.classList.remove("theme-cream", "theme-pink", "theme-sage", "theme-lavender");
    document.body.classList.add("theme-" + (appState.pageTheme || "cream"));
  }

  function renderSwatchButtons(container, options, activeId, isSmall, onSelect) {
    if (!container) return;
    container.innerHTML = "";

    options.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "swatch-btn" +
        (isSmall ? " swatch-btn-sm" : "") +
        (opt.id === activeId ? " is-active" : "");
      btn.style.backgroundColor = opt.hex || opt.main;
      btn.title = opt.label;
      btn.setAttribute("aria-label", opt.label);
      btn.setAttribute("aria-pressed", opt.id === activeId ? "true" : "false");
      btn.addEventListener("click", function () {
        onSelect(opt.id);
      });
      container.appendChild(btn);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Status Banner Helper
  // --------------------------------------------------------------------------
  function showMessage(text, isWarning) {
    const banner = document.getElementById("status-banner");
    if (!banner) return;

    banner.textContent = text;
    banner.hidden = false;
    banner.classList.toggle("status-warn", Boolean(isWarning));

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      banner.hidden = true;
    }, 3600);
  }

  function triggerPetalConfetti(count) {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const layer = document.getElementById("petal-confetti-layer");
    if (!layer) return;

    const petalColors = [
      "#f7cd54", // sunflower gold
      "#f7b5cf", // blossom pink
      "#dcd0f5", // soft lavender
      "#9fd1a6", // sage leaf
      "#fff3b8", // butter cream
      "#ffffff"  // daisy white
    ];

    const total = count || 26;
    for (let i = 0; i < total; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal-confetti";
      const leftPct = Math.random() * 98;
      const delayMs = Math.round(Math.random() * 340);
      const durationSec = (1.8 + Math.random() * 1.1).toFixed(2);
      const driftPx = Math.round((Math.random() - 0.5) * 140);
      const spinDeg = Math.round((Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 260));
      const sizeW = 9 + Math.floor(Math.random() * 6);
      const sizeH = 8 + Math.floor(Math.random() * 5);

      petal.style.left = leftPct + "vw";
      petal.style.width = sizeW + "px";
      petal.style.height = sizeH + "px";
      petal.style.backgroundColor = petalColors[i % petalColors.length];
      petal.style.animationDelay = delayMs + "ms";
      petal.style.setProperty("--petal-duration", durationSec + "s");
      petal.style.setProperty("--petal-drift", driftPx + "px");
      petal.style.setProperty("--petal-spin", spinDeg + "deg");

      layer.appendChild(petal);

      setTimeout(function () {
        if (petal.parentNode) petal.parentNode.removeChild(petal);
      }, (parseFloat(durationSec) * 1000) + delayMs + 120);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Navigation
  // --------------------------------------------------------------------------
  function switchSection(sectionName) {
    const validSections = ["home", "planner", "garden", "habits", "journal"];
    if (validSections.indexOf(sectionName) === -1) return;

    activeSection = sectionName;

    const sections = document.querySelectorAll(".page-section");
    sections.forEach(function (sec) {
      const isMatch = sec.id === "section-" + sectionName;
      sec.hidden = !isMatch;
      sec.classList.toggle("active", isMatch);
    });

    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach(function (btn) {
      const isMatch = btn.getAttribute("data-section") === sectionName;
      btn.classList.toggle("active", isMatch);
      if (isMatch) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    });

    renderAll();
  }

  // --------------------------------------------------------------------------
  // 7. Render Functions for Each Section
  // --------------------------------------------------------------------------
  function renderHeader() {
    const seedCountEl = document.getElementById("header-seed-count");
    if (seedCountEl) {
      seedCountEl.textContent = String(appState.seeds);
    }
  }

  function renderHomeSection() {
    applyPageTheme();

    const themePicker = document.getElementById("page-theme-picker");
    renderSwatchButtons(themePicker, PAGE_THEMES, appState.pageTheme, false, function (themeId) {
      appState.pageTheme = themeId;
      saveState();
      applyPageTheme();
      renderHomeSection();
    });

    const dateEl = document.getElementById("home-date");
    if (dateEl) {
      dateEl.textContent = formatDisplayDate(new Date());
    }

    const homeSeedsEl = document.getElementById("home-seeds");
    if (homeSeedsEl) {
      homeSeedsEl.textContent = appState.seeds + (appState.seeds === 1 ? " Seed" : " Seeds");
    }

    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(function (t) {
      return t.completed;
    }).length;
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const ratioEl = document.getElementById("home-task-ratio");
    const trackEl = document.getElementById("home-progress-track");
    const fillEl = document.getElementById("home-progress-fill");
    const textEl = document.getElementById("home-progress-text");

    if (ratioEl) ratioEl.textContent = completedTasks + " / " + totalTasks + " Done";
    if (trackEl) trackEl.setAttribute("aria-valuenow", String(percent));
    if (fillEl) fillEl.style.width = percent + "%";
    if (textEl) textEl.textContent = percent + "% completed";

    const totalHabits = appState.habits.length;
    const doneHabits = appState.habits.filter(function (h) {
      return h.doneToday;
    }).length;
    const habitPercent = totalHabits === 0 ? 0 : Math.round((doneHabits / totalHabits) * 100);
    const habitRatioEl = document.getElementById("home-habit-ratio");
    const habitTrackEl = document.getElementById("home-habit-progress-track");
    const habitFillEl = document.getElementById("home-habit-progress-fill");
    const habitTextEl = document.getElementById("home-habit-progress-text");

    if (habitRatioEl) {
      habitRatioEl.textContent = doneHabits + " / " + totalHabits + " Done";
    }
    if (habitTrackEl) habitTrackEl.setAttribute("aria-valuenow", String(habitPercent));
    if (habitFillEl) habitFillEl.style.width = habitPercent + "%";
    if (habitTextEl) habitTextEl.textContent = habitPercent + "% completed today";

    const bloomedCount = appState.gardenPots.filter(function (p) {
      return p.stage === 3;
    }).length;
    const growingCount = appState.gardenPots.filter(function (p) {
      return p.flowerId !== null && p.stage > 0 && p.stage < 3;
    }).length;
    const gardenPercent = Math.round((bloomedCount / TOTAL_POTS) * 100);
    const gardenTrackEl = document.getElementById("home-garden-progress-track");
    const gardenFillEl = document.getElementById("home-garden-progress-fill");
    const gardenSummaryEl = document.getElementById("home-garden-summary");

    if (gardenTrackEl) gardenTrackEl.setAttribute("aria-valuenow", String(gardenPercent));
    if (gardenFillEl) gardenFillEl.style.width = gardenPercent + "%";
    if (gardenSummaryEl) {
      gardenSummaryEl.textContent =
        bloomedCount + " / " + TOTAL_POTS + " blooming · " + growingCount + " growing";
    }

    const entries = Array.isArray(appState.journalEntries) ? appState.journalEntries : [];
    const journalCountEl = document.getElementById("home-journal-count");
    const journalLatestEl = document.getElementById("home-journal-latest");
    if (journalCountEl) {
      journalCountEl.textContent = entries.length + (entries.length === 1 ? " Entry" : " Entries");
    }
    if (journalLatestEl) {
      if (entries.length === 0) {
        journalLatestEl.textContent = "No reflections written yet";
      } else {
        const sortedEntries = entries.slice().sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        });
        const latest = sortedEntries[0];
        journalLatestEl.textContent =
          (latest.mood ? latest.mood + " · " : "") + formatShortDate(latest.date);
      }
    }

    // Interactive Up Next Today preview (up to 4 tasks, pending first, preserving colors & emojis)
    const previewList = document.getElementById("home-task-preview");
    if (previewList) {
      previewList.innerHTML = "";

      if (appState.tasks.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "empty-state";
        emptyLi.textContent = "No tasks yet! Open the Planner to add your first task.";
        previewList.appendChild(emptyLi);
      } else {
        const sortedTasks = appState.tasks.slice().sort(function (a, b) {
          return Number(a.completed) - Number(b.completed);
        });

        sortedTasks.slice(0, 4).forEach(function (task) {
          const li = document.createElement("li");
          const colorClass = " pastel-" + (task.color || "cream");
          li.className = "overview-task-item" + colorClass + (task.completed ? " is-done" : "");

          const left = document.createElement("div");
          left.className = "overview-task-left";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "task-checkbox";
          checkbox.checked = task.completed;
          checkbox.setAttribute("aria-label", "Mark " + task.title + " as completed");
          checkbox.addEventListener("change", function () {
            toggleTaskComplete(task.id);
          });

          const textWrap = document.createElement("div");
          const title = document.createElement("p");
          title.className = "overview-task-title";
          if (task.customEmoji) {
            const emojiSpan = document.createElement("span");
            emojiSpan.className = "task-emoji-badge";
            emojiSpan.setAttribute("aria-hidden", "true");
            emojiSpan.textContent = task.customEmoji;
            title.appendChild(emojiSpan);
          }
          title.appendChild(document.createTextNode(task.title));

          const meta = document.createElement("p");
          meta.className = "muted-text";
          meta.textContent = task.category + " · Due " + formatShortDate(task.dueDate);

          textWrap.appendChild(title);
          textWrap.appendChild(meta);

          left.appendChild(checkbox);
          left.appendChild(textWrap);

          const status = document.createElement("span");
          status.className = "muted-text";
          status.textContent = task.completed ? "Completed" : "+5 Seeds";

          li.appendChild(left);
          li.appendChild(status);
          previewList.appendChild(li);
        });
      }
    }

    renderWeatherWidget();
    renderCalendarWidget();
  }

  function mapWmoToWeatherCondition(code, windSpeedKmh) {
    if (code === 0) {
      return windSpeedKmh >= 28 ? "breezy" : "sunny";
    }
    if (code === 1 || code === 2) {
      return windSpeedKmh >= 30 ? "breezy" : "partly-cloudy";
    }
    if (code === 3 || code === 45 || code === 48) {
      return windSpeedKmh >= 30 ? "breezy" : "cloudy";
    }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return "snowy";
    }
    if (
      (code >= 51 && code <= 67) ||
      (code >= 80 && code <= 82) ||
      (code >= 95 && code <= 99)
    ) {
      return "rainy";
    }
    return windSpeedKmh >= 28 ? "breezy" : "partly-cloudy";
  }

  function getCoordinatesFromBrowserGps() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation unavailable"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (position) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: "gps"
          });
        },
        function (err) {
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    });
  }

  async function detectLocationCoordinates(preferGps) {
    let gpsAllowed = Boolean(preferGps);
    if (!gpsAllowed && navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm && perm.state === "granted") {
          gpsAllowed = true;
        }
      } catch (e) {
        // Ignore Permissions API errors
      }
    }

    if (gpsAllowed) {
      try {
        const coords = await getCoordinatesFromBrowserGps();
        let cityLabel = "Current Location";
        try {
          const revRes = await fetch(
            "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
              encodeURIComponent(coords.latitude) +
              "&longitude=" +
              encodeURIComponent(coords.longitude) +
              "&localityLanguage=en"
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            cityLabel =
              revData.city ||
              revData.locality ||
              revData.principalSubdivision ||
              revData.countryName ||
              cityLabel;
          }
        } catch (e) {
          // Keep default cityLabel if reverse-geocoding fails
        }
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: cityLabel
        };
      } catch (e) {
        // Fall through to IP geolocation
      }
    }

    try {
      const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo && geo.latitude && geo.longitude) {
          const labelParts = [geo.city, geo.country].filter(Boolean);
          return {
            latitude: Number(geo.latitude),
            longitude: Number(geo.longitude),
            location: labelParts[0] || "Local Weather"
          };
        }
      }
    } catch (e) {
      // Fall through to secondary IP provider
    }

    const backupRes = await fetch("https://ipwho.is/");
    if (backupRes.ok) {
      const backup = await backupRes.json();
      if (backup && backup.success !== false && typeof backup.latitude === "number") {
        return {
          latitude: backup.latitude,
          longitude: backup.longitude,
          location: backup.city || backup.country || "Local Weather"
        };
      }
    }

    throw new Error("Could not detect location");
  }

  async function detectLocalWeather(preferGps) {
    weatherLoading = true;
    renderWeatherWidget();

    try {
      const coords = await detectLocationCoordinates(preferGps);
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        encodeURIComponent(coords.latitude) +
        "&longitude=" +
        encodeURIComponent(coords.longitude) +
        "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";

      const weatherRes = await fetch(url);
      if (!weatherRes.ok) {
        throw new Error("Weather request failed");
      }

      const data = await weatherRes.json();
      const current = data && data.current ? data.current : null;
      if (!current || typeof current.temperature_2m !== "number") {
        throw new Error("Invalid weather payload");
      }

      const condition = mapWmoToWeatherCondition(
        Number(current.weather_code),
        Number(current.wind_speed_10m || 0)
      );

      appState.weather = {
        condition: condition,
        tempC: Math.round(current.temperature_2m),
        unit: appState.weather && appState.weather.unit === "F" ? "F" : "C",
        location: coords.location || "Local Weather",
        lastUpdated: Date.now()
      };
      saveState();
    } catch (error) {
      if (!appState.weather || typeof appState.weather.tempC !== "number") {
        appState.weather = {
          condition: "sunny",
          tempC: 22,
          unit: appState.weather && appState.weather.unit === "F" ? "F" : "C",
          location: "Weather unavailable offline",
          lastUpdated: 0
        };
      }
    } finally {
      weatherLoading = false;
      renderWeatherWidget();
    }
  }

  function renderWeatherWidget() {
    const weather = appState.weather || {
      condition: "sunny",
      tempC: null,
      unit: "C",
      location: "Detecting location..."
    };

    const artEl = document.getElementById("weather-pixel-art");
    if (artEl) {
      artEl.innerHTML = getWeatherSvg(weather.condition || "sunny", 46);
    }

    const tempEl = document.getElementById("weather-temp-display");
    const unit = weather.unit === "F" ? "F" : "C";
    if (tempEl) {
      if (typeof weather.tempC === "number") {
        const displayVal =
          unit === "F" ? Math.round((weather.tempC * 9) / 5 + 32) : Math.round(weather.tempC);
        tempEl.textContent = displayVal + "°" + unit;
      } else {
        tempEl.textContent = "--°" + unit;
      }
    }

    const unitBtn = document.getElementById("weather-unit-btn");
    if (unitBtn) {
      unitBtn.textContent = unit === "C" ? "°F" : "°C";
    }

    const refreshBtn = document.getElementById("weather-refresh-btn");
    if (refreshBtn) {
      refreshBtn.disabled = weatherLoading;
    }

    const condEl = document.getElementById("weather-condition-display");
    if (condEl) {
      condEl.textContent = weatherLoading
        ? "Detecting..."
        : WEATHER_CONDITION_LABELS[weather.condition] || "Sunny";
    }

    const locEl = document.getElementById("weather-location-display");
    if (locEl) {
      locEl.textContent = weather.location || "Local Weather";
    }
  }

  function isSpecialReminder(rem) {
    if (!rem) return false;
    return Boolean(
      rem.isSpecial ||
        rem.category === "Special Date" ||
        rem.category === "Birthday" ||
        rem.category === "Anniversary"
    );
  }

  function doesReminderMatchDate(rem, isoDate) {
    if (!rem || !rem.date || !isoDate) return false;
    if (isSpecialReminder(rem)) {
      return rem.date.slice(5) === isoDate.slice(5);
    }
    return rem.date === isoDate;
  }

  function getNextOccurrenceIso(rem, todayIso) {
    if (!rem || !rem.date) return todayIso;
    if (!isSpecialReminder(rem)) return rem.date;
    const todayYear = Number(todayIso.slice(0, 4));
    const mmdd = rem.date.slice(5);
    const thisYearIso = todayYear + "-" + mmdd;
    if (thisYearIso >= todayIso) {
      return thisYearIso;
    }
    return (todayYear + 1) + "-" + mmdd;
  }

  function getDaysUntilLabel(targetIso, todayIso) {
    const tParts = targetIso.split("-");
    const cParts = todayIso.split("-");
    if (tParts.length !== 3 || cParts.length !== 3) return "";
    const targetMs = new Date(Number(tParts[0]), Number(tParts[1]) - 1, Number(tParts[2])).getTime();
    const todayMs = new Date(Number(cParts[0]), Number(cParts[1]) - 1, Number(cParts[2])).getTime();
    const diffDays = Math.round((targetMs - todayMs) / 86400000);
    if (diffDays === 0) return "Today!";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return "In " + diffDays + " days";
    return "";
  }

  function jumpCalendarToDate(isoDate, openSelectedDay) {
    if (!isoDate) return;
    const parts = isoDate.split("-");
    if (parts.length !== 3) return;
    calendarViewYear = Number(parts[0]);
    calendarViewMonth = Number(parts[1]) - 1;
    selectedCalendarDate = isoDate;
    if (openSelectedDay) {
      reminderViewMode = "selected";
    }
    const remDateInput = document.getElementById("reminder-date");
    if (remDateInput) remDateInput.value = isoDate;
    renderCalendarWidget();
  }

  function createCalendarDayButton(isoDate, dayNum, isOutsideMonth, todayIso, reminders) {
    const dayReminders = reminders.filter(function (r) {
      return doesReminderMatchDate(r, isoDate);
    });
    const hasSpecial = dayReminders.some(function (r) {
      return isSpecialReminder(r);
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "cal-day-btn" +
      (isOutsideMonth ? " is-outside-month" : "") +
      (dayReminders.length > 0 ? " has-reminders" : "") +
      (hasSpecial ? " has-special" : "") +
      (isoDate === todayIso ? " is-today" : "") +
      (isoDate === selectedCalendarDate ? " is-selected" : "");
    btn.setAttribute(
      "aria-label",
      formatShortDate(isoDate) +
        (dayReminders.length > 0 ? ", " + dayReminders.length + " reminder(s)" : "")
    );
    btn.setAttribute("aria-pressed", isoDate === selectedCalendarDate ? "true" : "false");
    if (dayReminders.length > 0) {
      btn.title = dayReminders
        .map(function (r) {
          return (isSpecialReminder(r) ? "★ " : "") + (r.emoji ? r.emoji + " " : "") + r.title;
        })
        .join(" · ");
    }

    const topMini = document.createElement("span");
    topMini.className = "cal-day-top";

    const numSpan = document.createElement("span");
    numSpan.className = "tabular-num";
    numSpan.textContent = String(dayNum);
    topMini.appendChild(numSpan);

    if (hasSpecial) {
      const starSpan = document.createElement("span");
      starSpan.className = "cal-day-star";
      starSpan.setAttribute("aria-hidden", "true");
      starSpan.textContent = "★";
      topMini.appendChild(starSpan);
    }

    const firstEmoji = dayReminders.find(function (r) {
      return r.emoji;
    });
    if (firstEmoji) {
      const emojiSpan = document.createElement("span");
      emojiSpan.className = "cal-day-emoji";
      emojiSpan.setAttribute("aria-hidden", "true");
      emojiSpan.textContent = firstEmoji.emoji;
      topMini.appendChild(emojiSpan);
    }

    btn.appendChild(topMini);

    const dotsRow = document.createElement("span");
    dotsRow.className = "cal-dots-row";
    dayReminders.slice(0, 3).forEach(function (r) {
      const colorInfo =
        PASTEL_COLORS.find(function (c) {
          return c.id === r.color;
        }) || PASTEL_COLORS[1];
      const dot = document.createElement("span");
      dot.className = "cal-dot";
      dot.style.backgroundColor = colorInfo.hex;
      dotsRow.appendChild(dot);
    });
    btn.appendChild(dotsRow);

    btn.addEventListener("click", function () {
      jumpCalendarToDate(isoDate, true);
    });

    return btn;
  }

  function renderCalendarWidget() {
    const calendarCard = document.getElementById("calendar-card");
    if (calendarCard) {
      calendarCard.classList.remove(
        "pastel-cream",
        "pastel-pink",
        "pastel-sage",
        "pastel-lavender",
        "pastel-butter",
        "pastel-sky"
      );
      calendarCard.classList.add("pastel-" + (appState.calendarColor || "cream"));
    }

    const calColorPicker = document.getElementById("calendar-color-picker");
    renderSwatchButtons(calColorPicker, PASTEL_COLORS, appState.calendarColor || "cream", true, function (colorId) {
      appState.calendarColor = colorId;
      saveState();
      renderCalendarWidget();
    });

    const reminderColorPicker = document.getElementById("reminder-color-picker");
    renderSwatchButtons(
      reminderColorPicker,
      PASTEL_COLORS,
      appState.selectedReminderColor || "pink",
      true,
      function (colorId) {
        appState.selectedReminderColor = colorId;
        saveState();
        renderCalendarWidget();
      }
    );

    const monthSelect = document.getElementById("cal-month-select");
    if (monthSelect) {
      monthSelect.value = String(calendarViewMonth);
    }

    const yearSelect = document.getElementById("cal-year-select");
    const reminders = Array.isArray(appState.reminders) ? appState.reminders : [];
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      const yearsSet = new Set();
      for (let y = currentYear - 10; y <= currentYear + 15; y += 1) {
        yearsSet.add(y);
      }
      yearsSet.add(calendarViewYear);
      reminders.forEach(function (r) {
        if (r.date && r.date.length >= 4) {
          const yr = Number(r.date.slice(0, 4));
          if (!Number.isNaN(yr) && yr > 1900 && yr < 2200) yearsSet.add(yr);
        }
      });

      const sortedYears = Array.from(yearsSet).sort(function (a, b) {
        return a - b;
      });
      yearSelect.innerHTML = "";
      sortedYears.forEach(function (yr) {
        const opt = document.createElement("option");
        opt.value = String(yr);
        opt.textContent = String(yr);
        if (yr === calendarViewYear) opt.selected = true;
        yearSelect.appendChild(opt);
      });
    }
    const daysGrid = document.getElementById("calendar-days-grid");
    const todayIso = getTodayString();

    if (daysGrid) {
      daysGrid.innerHTML = "";
      const firstDayOfWeek = new Date(calendarViewYear, calendarViewMonth, 1).getDay();
      const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();

      // Previous month trailing days so neighboring dates are 1 click away
      const prevMonthDate = new Date(calendarViewYear, calendarViewMonth, 0);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonthIdx = prevMonthDate.getMonth();
      const prevMonthDays = prevMonthDate.getDate();

      for (let i = firstDayOfWeek - 1; i >= 0; i -= 1) {
        const prevDay = prevMonthDays - i;
        const isoDate =
          prevYear +
          "-" +
          String(prevMonthIdx + 1).padStart(2, "0") +
          "-" +
          String(prevDay).padStart(2, "0");
        daysGrid.appendChild(createCalendarDayButton(isoDate, prevDay, true, todayIso, reminders));
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day += 1) {
        const monthStr = String(calendarViewMonth + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        const isoDate = calendarViewYear + "-" + monthStr + "-" + dayStr;
        daysGrid.appendChild(createCalendarDayButton(isoDate, day, false, todayIso, reminders));
      }

      // Next month leading days to complete the final week row
      const totalCells = firstDayOfWeek + daysInMonth;
      const remainder = totalCells % 7;
      if (remainder !== 0) {
        const trailingCount = 7 - remainder;
        const nextMonthDate = new Date(calendarViewYear, calendarViewMonth + 1, 1);
        const nextYear = nextMonthDate.getFullYear();
        const nextMonthIdx = nextMonthDate.getMonth();
        for (let d = 1; d <= trailingCount; d += 1) {
          const isoDate =
            nextYear +
            "-" +
            String(nextMonthIdx + 1).padStart(2, "0") +
            "-" +
            String(d).padStart(2, "0");
          daysGrid.appendChild(createCalendarDayButton(isoDate, d, true, todayIso, reminders));
        }
      }
    }

    // Update reminder view buttons
    document.querySelectorAll("[data-reminder-view]").forEach(function (btn) {
      const mode = btn.getAttribute("data-reminder-view");
      btn.classList.toggle("active", mode === reminderViewMode);
    });

    const headingEl = document.getElementById("selected-date-heading");
    if (headingEl) {
      headingEl.textContent =
        reminderViewMode === "upcoming"
          ? "All Upcoming Important Dates"
          : "Dates for " + formatShortDate(selectedCalendarDate);
    }

    const reminderFormEl = document.getElementById("reminder-form");
    const reminderErrorEl = document.getElementById("reminder-error");
    if (reminderFormEl) {
      reminderFormEl.hidden = reminderViewMode === "upcoming";
    }
    if (reminderErrorEl && reminderViewMode === "upcoming") {
      reminderErrorEl.hidden = true;
    }

    const listEl = document.getElementById("calendar-reminders-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    let visibleReminders = [];
    if (reminderViewMode === "upcoming") {
      visibleReminders = reminders
        .filter(function (r) {
          return getNextOccurrenceIso(r, todayIso) >= todayIso;
        })
        .sort(function (a, b) {
          return getNextOccurrenceIso(a, todayIso).localeCompare(getNextOccurrenceIso(b, todayIso));
        });
    } else {
      visibleReminders = reminders.filter(function (r) {
        return doesReminderMatchDate(r, selectedCalendarDate);
      });
    }

    if (visibleReminders.length === 0) {
      if (reminderViewMode === "upcoming") {
        listEl.hidden = false;
        const emptyLi = document.createElement("li");
        emptyLi.className = "empty-state";
        emptyLi.textContent = "No upcoming important dates yet.";
        listEl.appendChild(emptyLi);
      } else {
        listEl.hidden = true;
      }
      return;
    }

    listEl.hidden = false;

    visibleReminders.forEach(function (rem) {
      const isSpecial = isSpecialReminder(rem);
      const li = document.createElement("li");
      li.className =
        "reminder-item pastel-" + (rem.color || "pink") + (isSpecial ? " is-special" : "");

      const topRow = document.createElement("div");
      topRow.className = "reminder-item-top";

      const infoWrap = document.createElement("div");
      const titleEl = document.createElement("p");
      titleEl.className = "reminder-item-title";
      if (rem.emoji) {
        const emojiSpan = document.createElement("span");
        emojiSpan.className = "task-emoji-badge";
        emojiSpan.setAttribute("aria-hidden", "true");
        emojiSpan.textContent = rem.emoji;
        titleEl.appendChild(emojiSpan);
      }
      titleEl.appendChild(document.createTextNode((isSpecial ? "★ " : "") + rem.title));

      const nextIso = getNextOccurrenceIso(rem, todayIso);
      const countdown = getDaysUntilLabel(nextIso, todayIso);
      const metaEl = document.createElement("p");
      metaEl.className = "reminder-item-meta";
      metaEl.textContent =
        (rem.category || "Reminder") +
        " · " +
        formatShortDate(isSpecial ? nextIso : rem.date) +
        (isSpecial ? " · Yearly" : "") +
        (countdown ? " (" + countdown + ")" : "");

      infoWrap.appendChild(titleEl);
      infoWrap.appendChild(metaEl);

      if (reminderViewMode === "upcoming") {
        infoWrap.className = "reminder-jump-trigger";
        infoWrap.title = "Jump to this date on the calendar";
        infoWrap.addEventListener("click", function () {
          jumpCalendarToDate(nextIso, true);
        });
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-small btn-outline";
      editBtn.textContent = editingReminderId === rem.id ? "Close" : "Edit";
      editBtn.addEventListener("click", function () {
        editingReminderId = editingReminderId === rem.id ? null : rem.id;
        renderCalendarWidget();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        deleteReminder(rem.id);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      topRow.appendChild(infoWrap);
      topRow.appendChild(actionsDiv);
      li.appendChild(topRow);

      // Quick color customization bar
      const customizeBar = document.createElement("div");
      customizeBar.className = "task-customize-bar";
      const colorRow = document.createElement("div");
      colorRow.className = "inline-color-row";
      const colorLabel = document.createElement("span");
      colorLabel.className = "muted-text";
      colorLabel.textContent = "Color:";
      colorRow.appendChild(colorLabel);

      const swatchWrap = document.createElement("div");
      swatchWrap.className = "inline-color-row";
      renderSwatchButtons(swatchWrap, PASTEL_COLORS, rem.color || "pink", true, function (newColor) {
        setReminderColor(rem.id, newColor);
      });
      colorRow.appendChild(swatchWrap);
      customizeBar.appendChild(colorRow);
      li.appendChild(customizeBar);

      // Inline edit form for reminder
      if (editingReminderId === rem.id) {
        const editPanel = document.createElement("form");
        editPanel.className = "inline-edit-panel";

        const titleField = document.createElement("div");
        titleField.className = "form-field form-field-grow";
        const titleLbl = document.createElement("label");
        titleLbl.textContent = "Title";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.maxLength = 70;
        titleInput.required = true;
        titleInput.value = rem.title;
        titleField.appendChild(titleLbl);
        titleField.appendChild(titleInput);

        const emojiField = document.createElement("div");
        emojiField.className = "form-field form-field-compact";
        const emojiLbl = document.createElement("label");
        emojiLbl.textContent = "Emoji";
        const emojiInput = document.createElement("input");
        emojiInput.type = "text";
        emojiInput.className = "input-emoji";
        emojiInput.maxLength = 12;
        emojiInput.placeholder = "📌";
        emojiInput.value = rem.emoji || "";
        emojiField.appendChild(emojiLbl);
        emojiField.appendChild(emojiInput);

        const dateField = document.createElement("div");
        dateField.className = "form-field";
        const dateLbl = document.createElement("label");
        dateLbl.textContent = "Date";
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = rem.date || getTodayString();
        dateField.appendChild(dateLbl);
        dateField.appendChild(dateInput);

        const catField = document.createElement("div");
        catField.className = "form-field";
        const catLbl = document.createElement("label");
        catLbl.textContent = "Type";
        const catSelect = document.createElement("select");
        ["Reminder", "Special Date", "Birthday", "Anniversary", "Exam", "Deadline", "Event", "Holiday", "Personal"].forEach(function (cat) {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          if (rem.category === cat) opt.selected = true;
          catSelect.appendChild(opt);
        });
        catField.appendChild(catLbl);
        catField.appendChild(catSelect);

        const saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.className = "btn btn-small btn-primary";
        saveBtn.textContent = "Save";

        editPanel.appendChild(titleField);
        editPanel.appendChild(emojiField);
        editPanel.appendChild(dateField);
        editPanel.appendChild(catField);
        editPanel.appendChild(saveBtn);

        editPanel.addEventListener("submit", function (event) {
          event.preventDefault();
          const updatedTitle = titleInput.value.trim();
          if (!updatedTitle) {
            titleInput.focus();
            return;
          }
          updateReminderDetails(
            rem.id,
            updatedTitle,
            dateInput.value || getTodayString(),
            catSelect.value,
            emojiInput.value.trim()
          );
        });

        li.appendChild(editPanel);
      }

      listEl.appendChild(li);
    });
  }

  function renderPlannerSection() {
    const taskColorPicker = document.getElementById("task-color-picker");
    renderSwatchButtons(taskColorPicker, PASTEL_COLORS, appState.selectedTaskColor, false, function (colorId) {
      appState.selectedTaskColor = colorId;
      saveState();
      renderPlannerSection();
    });

    const totalTasks = appState.tasks.length;
    const completedTasks = appState.tasks.filter(function (t) {
      return t.completed;
    }).length;

    const summaryStat = document.getElementById("planner-summary-stat");
    if (summaryStat) {
      summaryStat.textContent = completedTasks + " / " + totalTasks;
    }

    // Update active filter buttons
    const filterBtns = document.querySelectorAll("[data-task-filter]");
    filterBtns.forEach(function (btn) {
      const isActive = btn.getAttribute("data-task-filter") === appState.taskFilter;
      btn.classList.toggle("active", isActive);
    });

    const filteredTasks = appState.tasks.filter(function (task) {
      if (appState.taskFilter === "pending") return !task.completed;
      if (appState.taskFilter === "completed") return task.completed;
      return true;
    });

    const countLabel = document.getElementById("planner-count-label");
    if (countLabel) {
      countLabel.textContent =
        filteredTasks.length + (filteredTasks.length === 1 ? " task shown" : " tasks shown");
    }

    const listEl = document.getElementById("task-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (filteredTasks.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "empty-state";
      emptyLi.textContent =
        appState.tasks.length === 0
          ? "Your planner is empty. Add a task above to start earning seeds!"
          : "No tasks match this filter.";
      listEl.appendChild(emptyLi);
      return;
    }

    filteredTasks.forEach(function (task) {
      const li = document.createElement("li");
      const colorClass = " pastel-" + (task.color || "cream");
      li.className = "task-item" + colorClass + (task.completed ? " is-completed" : "");

      const topRow = document.createElement("div");
      topRow.className = "task-item-top";

      const mainDiv = document.createElement("div");
      mainDiv.className = "task-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", "Mark " + task.title + " as completed");
      checkbox.addEventListener("change", function () {
        toggleTaskComplete(task.id);
      });

      const detailsDiv = document.createElement("div");
      detailsDiv.className = "task-details";

      const titleEl = document.createElement("span");
      titleEl.className = "task-title";
      if (task.customEmoji) {
        const emojiSpan = document.createElement("span");
        emojiSpan.className = "task-emoji-badge";
        emojiSpan.setAttribute("aria-hidden", "true");
        emojiSpan.textContent = task.customEmoji;
        titleEl.appendChild(emojiSpan);
      }
      titleEl.appendChild(document.createTextNode(task.title));

      const metaEl = document.createElement("span");
      metaEl.className = "task-meta";
      const statusText = task.completed ? "Completed" : "Pending";
      const seedNote = task.rewarded ? " · +5 Seeds earned" : " · Worth +5 Seeds";
      metaEl.textContent =
        task.category + " · Due " + formatShortDate(task.dueDate) + " · " + statusText + seedNote;

      detailsDiv.appendChild(titleEl);
      detailsDiv.appendChild(metaEl);
      mainDiv.appendChild(checkbox);
      mainDiv.appendChild(detailsDiv);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "task-actions";

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "btn btn-small btn-outline";
      toggleBtn.textContent = task.completed ? "Undo" : "Complete";
      toggleBtn.addEventListener("click", function () {
        toggleTaskComplete(task.id);
      });

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-small btn-outline";
      editBtn.textContent = editingTaskId === task.id ? "Close" : "Edit";
      editBtn.addEventListener("click", function () {
        editingTaskId = editingTaskId === task.id ? null : task.id;
        renderPlannerSection();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        deleteTask(task.id);
      });

      actionsDiv.appendChild(toggleBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      topRow.appendChild(mainDiv);
      topRow.appendChild(actionsDiv);
      li.appendChild(topRow);

      // Quick 1-click color customization bar
      const customizeBar = document.createElement("div");
      customizeBar.className = "task-customize-bar";

      const colorRow = document.createElement("div");
      colorRow.className = "inline-color-row";

      const colorLabel = document.createElement("span");
      colorLabel.className = "muted-text";
      colorLabel.textContent = "Color:";
      colorRow.appendChild(colorLabel);

      const swatchWrap = document.createElement("div");
      swatchWrap.className = "inline-color-row";
      renderSwatchButtons(swatchWrap, PASTEL_COLORS, task.color || "cream", true, function (newColor) {
        setTaskColor(task.id, newColor);
      });
      colorRow.appendChild(swatchWrap);
      customizeBar.appendChild(colorRow);

      li.appendChild(customizeBar);

      // Inline edit form when editing this task
      if (editingTaskId === task.id) {
        const editPanel = document.createElement("form");
        editPanel.className = "inline-edit-panel";

        const titleField = document.createElement("div");
        titleField.className = "form-field form-field-grow";
        const titleLabel = document.createElement("label");
        titleLabel.textContent = "Title";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.maxLength = 80;
        titleInput.value = task.title;
        titleInput.required = true;
        titleField.appendChild(titleLabel);
        titleField.appendChild(titleInput);

        const emojiField = document.createElement("div");
        emojiField.className = "form-field form-field-compact";
        const emojiLabel = document.createElement("label");
        emojiLabel.textContent = "Emoji";
        const emojiInput = document.createElement("input");
        emojiInput.type = "text";
        emojiInput.className = "input-emoji";
        emojiInput.maxLength = 12;
        emojiInput.placeholder = "🌸";
        emojiInput.value = task.customEmoji || "";
        emojiField.appendChild(emojiLabel);
        emojiField.appendChild(emojiInput);

        const catField = document.createElement("div");
        catField.className = "form-field";
        const catLabel = document.createElement("label");
        catLabel.textContent = "Category";
        const catSelect = document.createElement("select");
        ["Study", "Personal", "Chores", "Creative", "Health"].forEach(function (cat) {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          if (task.category === cat) opt.selected = true;
          catSelect.appendChild(opt);
        });
        catField.appendChild(catLabel);
        catField.appendChild(catSelect);

        const dateField = document.createElement("div");
        dateField.className = "form-field";
        const dateLabel = document.createElement("label");
        dateLabel.textContent = "Due Date";
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = task.dueDate || getTodayString();
        dateField.appendChild(dateLabel);
        dateField.appendChild(dateInput);

        const saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.className = "btn btn-small btn-primary";
        saveBtn.textContent = "Save";

        editPanel.appendChild(titleField);
        editPanel.appendChild(emojiField);
        editPanel.appendChild(catField);
        editPanel.appendChild(dateField);
        editPanel.appendChild(saveBtn);

        editPanel.addEventListener("submit", function (event) {
          event.preventDefault();
          const updatedTitle = titleInput.value.trim();
          if (!updatedTitle) {
            titleInput.focus();
            return;
          }
          updateTaskDetails(
            task.id,
            updatedTitle,
            catSelect.value,
            dateInput.value || getTodayString(),
            emojiInput.value.trim()
          );
        });

        li.appendChild(editPanel);
      }

      listEl.appendChild(li);
    });
  }

  function renderGardenSection() {
    const balanceEl = document.getElementById("garden-seed-balance");
    if (balanceEl) {
      balanceEl.textContent = appState.seeds + (appState.seeds === 1 ? " Seed" : " Seeds");
    }

    const bloomedCount = appState.gardenPots.filter(function (p) {
      return p.stage === 3;
    }).length;
    const bloomCountEl = document.getElementById("garden-bloom-count");
    if (bloomCountEl) {
      bloomCountEl.textContent = bloomedCount + " / " + TOTAL_POTS + " Pots Blooming";
    }

    const selectedFlower =
      FLOWER_CATALOG.find(function (f) {
        return f.id === appState.selectedFlowerId;
      }) || FLOWER_CATALOG[0];

    const noticeEl = document.getElementById("selected-seed-notice");
    if (noticeEl) {
      noticeEl.textContent =
        "Selected seed: " +
        selectedFlower.name +
        " (" +
        selectedFlower.cost +
        " seeds). Click any empty pot below to plant it.";
    }

    // Render Seed Shop
    const shopGrid = document.getElementById("seed-shop-grid");
    if (shopGrid) {
      shopGrid.innerHTML = "";

      FLOWER_CATALOG.forEach(function (flower) {
        const card = document.createElement("div");
        const isSelected = appState.selectedFlowerId === flower.id;
        card.className = "seed-packet-card" + (isSelected ? " is-selected" : "");

        const art = document.createElement("div");
        art.className = "seed-packet-art";
        art.innerHTML = getPlantStageSvg(flower.id, 3, 46);

        const name = document.createElement("span");
        name.className = "seed-packet-name";
        name.textContent = flower.name;

        const cost = document.createElement("span");
        cost.className = "seed-packet-cost tabular-num";
        cost.textContent = flower.cost + " Seeds";

        const selectBtn = document.createElement("button");
        selectBtn.type = "button";
        selectBtn.className = isSelected
          ? "btn btn-small btn-primary"
          : "btn btn-small btn-outline";
        selectBtn.textContent = isSelected ? "Selected" : "Select";
        selectBtn.addEventListener("click", function () {
          appState.selectedFlowerId = flower.id;
          saveState();
          renderGardenSection();
        });

        card.appendChild(art);
        card.appendChild(name);
        card.appendChild(cost);
        card.appendChild(selectBtn);
        shopGrid.appendChild(card);
      });
    }

    // Render 9 Garden Pots
    const potsGrid = document.getElementById("garden-pots-grid");
    if (potsGrid) {
      potsGrid.innerHTML = "";

      appState.gardenPots.forEach(function (pot) {
        const card = document.createElement("article");
        let stateClass = "";
        if (pot.stage === 3) stateClass = " is-bloomed";
        else if (pot.flowerId !== null) stateClass = " is-growing";
        card.className = "pot-card" + stateClass;

        const artFrame = document.createElement("div");
        artFrame.className = "pot-art-frame";
        artFrame.innerHTML = getPlantStageSvg(pot.flowerId, pot.stage, 84, pot.potColor);

        const titleEl = document.createElement("h3");
        titleEl.className = "pot-title";

        const stageEl = document.createElement("p");
        stageEl.className = "pot-stage-text";

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "pot-actions";

        if (!pot.flowerId) {
          titleEl.textContent = "Pot #" + (pot.potIndex + 1) + " · Empty";
          stageEl.textContent = "Ready for a seed";

          const plantBtn = document.createElement("button");
          plantBtn.type = "button";
          plantBtn.className = "btn btn-small btn-primary";
          plantBtn.textContent = "Plant " + selectedFlower.name + " (" + selectedFlower.cost + ")";
          plantBtn.addEventListener("click", function () {
            plantFlowerInPot(pot.potIndex);
          });
          actionsDiv.appendChild(plantBtn);
        } else {
          const flowerInfo =
            FLOWER_CATALOG.find(function (f) {
              return f.id === pot.flowerId;
            }) || FLOWER_CATALOG[0];

          titleEl.textContent = flowerInfo.name;

          if (pot.stage === 1) {
            stageEl.textContent = "Stage 1/3 · Sprout";
          } else if (pot.stage === 2) {
            stageEl.textContent = "Stage 2/3 · Budding";
          } else {
            stageEl.textContent = "Stage 3/3 · Full Bloom";
          }

          if (pot.stage < 3) {
            const waterBtn = document.createElement("button");
            waterBtn.type = "button";
            waterBtn.className = "btn btn-small btn-secondary";
            waterBtn.textContent = "Water (" + WATER_COST_SEEDS + " Seeds)";
            waterBtn.addEventListener("click", function () {
              waterPot(pot.potIndex);
            });
            actionsDiv.appendChild(waterBtn);
          } else {
            const bloomBtn = document.createElement("button");
            bloomBtn.type = "button";
            bloomBtn.className = "btn btn-small btn-outline";
            bloomBtn.textContent = "Full Bloom";
            bloomBtn.disabled = true;
            actionsDiv.appendChild(bloomBtn);
          }

          const clearBtn = document.createElement("button");
          clearBtn.type = "button";
          clearBtn.className = "btn btn-small btn-outline";
          clearBtn.textContent = "Clear";
          clearBtn.addEventListener("click", function () {
            clearPot(pot.potIndex);
          });
          actionsDiv.appendChild(clearBtn);
        }

        const potColorRow = document.createElement("div");
        potColorRow.className = "pot-color-row";
        const potColorOptions = POT_COLORS.map(function (c) {
          return { id: c.id, label: "Pot color: " + c.label, hex: c.main };
        });
        renderSwatchButtons(
          potColorRow,
          potColorOptions,
          pot.potColor || "terracotta",
          true,
          function (newPotColor) {
            setPotColor(pot.potIndex, newPotColor);
          }
        );

        card.appendChild(artFrame);
        card.appendChild(titleEl);
        card.appendChild(stageEl);
        card.appendChild(actionsDiv);
        card.appendChild(potColorRow);
        potsGrid.appendChild(card);
      });
    }
  }

  function renderHabitsSection() {
    const habitColorPicker = document.getElementById("habit-color-picker");
    renderSwatchButtons(habitColorPicker, PASTEL_COLORS, appState.selectedHabitColor, false, function (colorId) {
      appState.selectedHabitColor = colorId;
      saveState();
      renderHabitsSection();
    });

    const totalHabits = appState.habits.length;
    const doneHabits = appState.habits.filter(function (h) {
      return h.doneToday;
    }).length;
    const percent = totalHabits === 0 ? 0 : Math.round((doneHabits / totalHabits) * 100);

    const progressTextEl = document.getElementById("habits-progress-text");
    const trackEl = document.getElementById("habits-progress-track");
    const fillEl = document.getElementById("habits-progress-fill");

    if (progressTextEl) {
      progressTextEl.textContent =
        percent + "% completed today (" + doneHabits + " of " + totalHabits + " habits)";
    }
    if (trackEl) trackEl.setAttribute("aria-valuenow", String(percent));
    if (fillEl) fillEl.style.width = percent + "%";

    const gridEl = document.getElementById("habits-grid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    if (appState.habits.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "empty-state";
      emptyBox.textContent = "No habits tracked yet. Add a daily habit above!";
      gridEl.appendChild(emptyBox);
      return;
    }

    appState.habits.forEach(function (habit) {
      const card = document.createElement("article");
      const colorClass = " pastel-" + (habit.color || "cream");
      card.className = "habit-card" + colorClass + (habit.doneToday ? " is-done" : "");

      const topRow = document.createElement("div");
      topRow.className = "habit-card-top";

      const leftDiv = document.createElement("div");
      leftDiv.className = "habit-left";

      const iconBox = document.createElement("div");
      iconBox.className = "habit-icon-box";
      if (habit.icon === "custom" && habit.customEmoji) {
        const emojiSpan = document.createElement("span");
        emojiSpan.className = "habit-emoji-display";
        emojiSpan.setAttribute("aria-hidden", "true");
        emojiSpan.textContent = habit.customEmoji;
        iconBox.appendChild(emojiSpan);
      } else {
        iconBox.innerHTML = getHabitIconSvg(habit.icon, 36);
      }

      const infoDiv = document.createElement("div");
      infoDiv.className = "habit-info";

      const nameEl = document.createElement("h3");
      nameEl.className = "habit-name";
      nameEl.textContent = habit.name;

      const metaEl = document.createElement("p");
      metaEl.className = "habit-meta tabular-num";
      const statusLabel = habit.doneToday ? "Done today" : "Not done yet";
      metaEl.textContent = statusLabel + " · Total days: " + habit.totalDays;

      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(metaEl);

      leftDiv.appendChild(iconBox);
      leftDiv.appendChild(infoDiv);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "habit-actions";

      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = habit.doneToday
        ? "btn btn-small btn-primary"
        : "btn btn-small btn-secondary";
      toggleBtn.textContent = habit.doneToday ? "Done" : "Check Off";
      toggleBtn.addEventListener("click", function () {
        toggleHabit(habit.id);
      });

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-small btn-outline";
      editBtn.textContent = editingHabitId === habit.id ? "Close" : "Edit";
      editBtn.addEventListener("click", function () {
        editingHabitId = editingHabitId === habit.id ? null : habit.id;
        renderHabitsSection();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-danger";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", function () {
        deleteHabit(habit.id);
      });

      actionsDiv.appendChild(toggleBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      topRow.appendChild(leftDiv);
      topRow.appendChild(actionsDiv);
      card.appendChild(topRow);

      // Quick 1-click habit color bar
      const customizeBar = document.createElement("div");
      customizeBar.className = "habit-customize-bar";

      const colorRow = document.createElement("div");
      colorRow.className = "inline-color-row";
      const colorLabel = document.createElement("span");
      colorLabel.className = "muted-text";
      colorLabel.textContent = "Color:";
      colorRow.appendChild(colorLabel);

      const swatchWrap = document.createElement("div");
      swatchWrap.className = "inline-color-row";
      renderSwatchButtons(swatchWrap, PASTEL_COLORS, habit.color || "cream", true, function (newColor) {
        setHabitColor(habit.id, newColor);
      });
      colorRow.appendChild(swatchWrap);
      customizeBar.appendChild(colorRow);
      card.appendChild(customizeBar);

      // Inline edit form for habit name & icon
      if (editingHabitId === habit.id) {
        const editPanel = document.createElement("form");
        editPanel.className = "inline-edit-panel";

        const nameField = document.createElement("div");
        nameField.className = "form-field form-field-grow";
        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Habit Name";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 50;
        nameInput.value = habit.name;
        nameInput.required = true;
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);

        const iconField = document.createElement("div");
        iconField.className = "form-field";
        const iconLabel = document.createElement("label");
        iconLabel.textContent = "Icon";
        const iconSelect = document.createElement("select");
        [
          { value: "star", label: "Sparkle Star" },
          { value: "study", label: "Open Book" },
          { value: "water", label: "Water Drop" },
          { value: "read", label: "Book Stack" },
          { value: "exercise", label: "Pixel Heart" },
          { value: "flower", label: "Flower" },
          { value: "custom", label: "Custom Emoji" }
        ].forEach(function (optInfo) {
          const opt = document.createElement("option");
          opt.value = optInfo.value;
          opt.textContent = optInfo.label;
          if (habit.icon === optInfo.value) opt.selected = true;
          iconSelect.appendChild(opt);
        });
        iconField.appendChild(iconLabel);
        iconField.appendChild(iconSelect);

        const emojiField = document.createElement("div");
        emojiField.className = "form-field form-field-compact";
        emojiField.hidden = iconSelect.value !== "custom";
        const emojiLabel = document.createElement("label");
        emojiLabel.textContent = "Custom Emoji";
        const emojiInput = document.createElement("input");
        emojiInput.type = "text";
        emojiInput.className = "input-emoji";
        emojiInput.maxLength = 12;
        emojiInput.placeholder = "🧘";
        emojiInput.value = habit.customEmoji || "";
        emojiField.appendChild(emojiLabel);
        emojiField.appendChild(emojiInput);

        iconSelect.addEventListener("change", function () {
          const isCustom = iconSelect.value === "custom";
          emojiField.hidden = !isCustom;
          if (isCustom) emojiInput.focus();
        });

        const saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.className = "btn btn-small btn-primary";
        saveBtn.textContent = "Save";

        editPanel.appendChild(nameField);
        editPanel.appendChild(iconField);
        editPanel.appendChild(emojiField);
        editPanel.appendChild(saveBtn);

        editPanel.addEventListener("submit", function (event) {
          event.preventDefault();
          const newName = nameInput.value.trim();
          if (!newName) {
            nameInput.focus();
            return;
          }
          const chosenIcon = iconSelect.value;
          const chosenEmoji = emojiInput.value.trim();
          if (chosenIcon === "custom" && !chosenEmoji) {
            showMessage("Please enter a custom emoji before saving this habit.", true);
            emojiInput.focus();
            return;
          }
          updateHabitDetails(habit.id, newName, chosenIcon, chosenEmoji);
        });

        card.appendChild(editPanel);
      }

      gridEl.appendChild(card);
    });
  }

  function renderJournalSection() {
    const journalColorPicker = document.getElementById("journal-color-picker");
    renderSwatchButtons(journalColorPicker, PASTEL_COLORS, appState.selectedJournalColor, false, function (colorId) {
      appState.selectedJournalColor = colorId;
      saveState();
      renderJournalSection();
    });

    const entries = Array.isArray(appState.journalEntries) ? appState.journalEntries : [];
    const summaryStat = document.getElementById("journal-summary-stat");
    const countLabel = document.getElementById("journal-count-label");

    if (summaryStat) {
      summaryStat.textContent = entries.length + (entries.length === 1 ? " Entry" : " Entries");
    }
    if (countLabel) {
      countLabel.textContent = entries.length + (entries.length === 1 ? " entry saved" : " entries saved");
    }

    const listEl = document.getElementById("journal-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (entries.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "empty-state";
      emptyBox.textContent = "Your journal is empty. Write your first reflection above!";
      listEl.appendChild(emptyBox);
      return;
    }

    const sortedEntries = entries.slice().sort(function (a, b) {
      const dateDiff = (b.date || "").localeCompare(a.date || "");
      if (dateDiff !== 0) return dateDiff;
      return (b.id || "").localeCompare(a.id || "");
    });

    sortedEntries.forEach(function (entry) {
      const card = document.createElement("article");
      const colorClass = " pastel-" + (entry.color || "cream");
      card.className = "journal-entry-card" + colorClass;

      const header = document.createElement("div");
      header.className = "journal-entry-header";

      const titleRow = document.createElement("div");
      titleRow.className = "journal-entry-title-row";

      const titleEl = document.createElement("h3");
      titleEl.className = "journal-entry-title";
      titleEl.textContent = entry.title || "Daily Reflection";

      const metaEl = document.createElement("p");
      metaEl.className = "journal-entry-meta";
      metaEl.textContent =
        formatShortDate(entry.date) + (entry.mood ? " · Mood: " + entry.mood : "");

      titleRow.appendChild(titleEl);
      titleRow.appendChild(metaEl);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "journal-entry-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-small btn-outline";
      editBtn.textContent = editingJournalId === entry.id ? "Close" : "Edit";
      editBtn.addEventListener("click", function () {
        editingJournalId = editingJournalId === entry.id ? null : entry.id;
        renderJournalSection();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        deleteJournalEntry(entry.id);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      header.appendChild(titleRow);
      header.appendChild(actionsDiv);
      card.appendChild(header);

      const bodyEl = document.createElement("p");
      bodyEl.className = "journal-entry-body";
      bodyEl.textContent = entry.body;
      card.appendChild(bodyEl);

      // 1-click color customization bar
      const customizeBar = document.createElement("div");
      customizeBar.className = "task-customize-bar";
      const colorRow = document.createElement("div");
      colorRow.className = "inline-color-row";
      const colorLabel = document.createElement("span");
      colorLabel.className = "muted-text";
      colorLabel.textContent = "Color:";
      colorRow.appendChild(colorLabel);

      const swatchWrap = document.createElement("div");
      swatchWrap.className = "inline-color-row";
      renderSwatchButtons(swatchWrap, PASTEL_COLORS, entry.color || "cream", true, function (newColor) {
        setJournalColor(entry.id, newColor);
      });
      colorRow.appendChild(swatchWrap);
      customizeBar.appendChild(colorRow);
      card.appendChild(customizeBar);

      // Inline edit form
      if (editingJournalId === entry.id) {
        const editPanel = document.createElement("form");
        editPanel.className = "inline-edit-panel";

        const titleField = document.createElement("div");
        titleField.className = "form-field form-field-grow";
        const titleLbl = document.createElement("label");
        titleLbl.textContent = "Title";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.maxLength = 80;
        titleInput.value = entry.title || "";
        titleInput.placeholder = "Daily Reflection";
        titleField.appendChild(titleLbl);
        titleField.appendChild(titleInput);

        const dateField = document.createElement("div");
        dateField.className = "form-field";
        const dateLbl = document.createElement("label");
        dateLbl.textContent = "Date";
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = entry.date || getTodayString();
        dateField.appendChild(dateLbl);
        dateField.appendChild(dateInput);

        const moodField = document.createElement("div");
        moodField.className = "form-field";
        const moodLbl = document.createElement("label");
        moodLbl.textContent = "Mood";
        const moodSelect = document.createElement("select");
        const presetMoods = ["☀️ Sunny", "🌸 Happy", "🌿 Calm", "✨ Focused", "🍵 Cozy", "🌙 Tired"];
        const isPreset = presetMoods.indexOf(entry.mood) !== -1;
        presetMoods.forEach(function (m) {
          const opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          if (entry.mood === m) opt.selected = true;
          moodSelect.appendChild(opt);
        });
        const customOpt = document.createElement("option");
        customOpt.value = "custom";
        customOpt.textContent = "Custom Emoji";
        if (!isPreset && entry.mood) customOpt.selected = true;
        moodSelect.appendChild(customOpt);
        moodField.appendChild(moodLbl);
        moodField.appendChild(moodSelect);

        const emojiField = document.createElement("div");
        emojiField.className = "form-field form-field-compact";
        emojiField.hidden = moodSelect.value !== "custom";
        const emojiLbl = document.createElement("label");
        emojiLbl.textContent = "Mood Emoji";
        const emojiInput = document.createElement("input");
        emojiInput.type = "text";
        emojiInput.className = "input-emoji";
        emojiInput.maxLength = 12;
        emojiInput.placeholder = "🌻";
        emojiInput.value = !isPreset ? (entry.mood || "") : "";
        emojiField.appendChild(emojiLbl);
        emojiField.appendChild(emojiInput);

        moodSelect.addEventListener("change", function () {
          const isCustom = moodSelect.value === "custom";
          emojiField.hidden = !isCustom;
          if (isCustom) emojiInput.focus();
        });

        const bodyField = document.createElement("div");
        bodyField.className = "form-field journal-body-field";
        const bodyLbl = document.createElement("label");
        bodyLbl.textContent = "Journal Note";
        const bodyTextarea = document.createElement("textarea");
        bodyTextarea.rows = 3;
        bodyTextarea.maxLength = 1200;
        bodyTextarea.required = true;
        bodyTextarea.value = entry.body;
        bodyField.appendChild(bodyLbl);
        bodyField.appendChild(bodyTextarea);

        const saveBtn = document.createElement("button");
        saveBtn.type = "submit";
        saveBtn.className = "btn btn-small btn-primary";
        saveBtn.textContent = "Save";

        editPanel.appendChild(titleField);
        editPanel.appendChild(dateField);
        editPanel.appendChild(moodField);
        editPanel.appendChild(emojiField);
        editPanel.appendChild(bodyField);
        editPanel.appendChild(saveBtn);

        editPanel.addEventListener("submit", function (event) {
          event.preventDefault();
          const newBody = bodyTextarea.value.trim();
          if (!newBody) {
            bodyTextarea.focus();
            return;
          }
          let chosenMood = moodSelect.value;
          if (chosenMood === "custom") {
            const customMoodEmoji = emojiInput.value.trim();
            if (!customMoodEmoji) {
              showMessage("Please enter a custom mood emoji before saving.", true);
              emojiInput.focus();
              return;
            }
            chosenMood = customMoodEmoji;
          }
          updateJournalDetails(
            entry.id,
            titleInput.value.trim(),
            dateInput.value || getTodayString(),
            chosenMood,
            newBody
          );
        });

        card.appendChild(editPanel);
      }

      listEl.appendChild(card);
    });
  }

  function renderAll() {
    renderHeader();
    renderHomeSection();
    renderPlannerSection();
    renderGardenSection();
    renderHabitsSection();
    renderJournalSection();
  }

  // --------------------------------------------------------------------------
  // 8. Interactive Actions: Tasks, Garden, Habits
  // --------------------------------------------------------------------------
  function addTask(title, category, dueDate, color, customEmoji) {
    const newTask = {
      id: "task-" + Date.now(),
      title: title,
      category: category,
      dueDate: dueDate,
      color: color || "cream",
      customEmoji: customEmoji || "",
      completed: false,
      rewarded: false
    };

    appState.tasks.unshift(newTask);
    saveState();
    renderAll();
    showMessage('Added task "' + title + '".', false);
  }

  function setTaskColor(taskId, colorId) {
    const task = appState.tasks.find(function (t) {
      return t.id === taskId;
    });
    if (!task) return;

    task.color = colorId;
    saveState();
    renderAll();
  }

  function updateTaskDetails(taskId, title, category, dueDate, customEmoji) {
    const task = appState.tasks.find(function (t) {
      return t.id === taskId;
    });
    if (!task) return;

    task.title = title;
    task.category = category;
    task.dueDate = dueDate;
    task.customEmoji = customEmoji || "";
    editingTaskId = null;

    saveState();
    renderAll();
    showMessage('Updated task "' + title + '".', false);
  }

  function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(function (t) {
      return t.id === taskId;
    });
    if (!task) return;

    task.completed = !task.completed;

    // Award 5 seeds only the very first time this task is completed
    if (task.completed && !task.rewarded) {
      task.rewarded = true;
      appState.seeds += TASK_REWARD_SEEDS;
      showMessage(
        'Completed "' + task.title + '"! Earned +' + TASK_REWARD_SEEDS + " seeds.",
        false
      );
      triggerPetalConfetti(28);
    } else if (task.completed) {
      showMessage('Marked "' + task.title + '" completed (seeds already awarded).', false);
      triggerPetalConfetti(24);
    } else {
      showMessage('Marked "' + task.title + '" as pending.', false);
    }

    saveState();
    renderAll();
  }

  function deleteTask(taskId) {
    const index = appState.tasks.findIndex(function (t) {
      return t.id === taskId;
    });
    if (index === -1) return;

    const removed = appState.tasks.splice(index, 1)[0];
    saveState();
    renderAll();
    showMessage('Deleted task "' + removed.title + '".', false);
  }

  function plantFlowerInPot(potIndex) {
    const pot = appState.gardenPots[potIndex];
    if (!pot || pot.flowerId !== null) return;

    const flower =
      FLOWER_CATALOG.find(function (f) {
        return f.id === appState.selectedFlowerId;
      }) || FLOWER_CATALOG[0];

    if (appState.seeds < flower.cost) {
      const needed = flower.cost - appState.seeds;
      showMessage(
        "Need " + needed + " more seed(s) to plant " + flower.name + ". Complete tasks in Planner!",
        true
      );
      return;
    }

    appState.seeds -= flower.cost;
    pot.flowerId = flower.id;
    pot.stage = 1; // Sprout

    saveState();
    renderAll();
    showMessage("Planted " + flower.name + " in Pot #" + (potIndex + 1) + "! (-" + flower.cost + " seeds)", false);
  }

  function waterPot(potIndex) {
    const pot = appState.gardenPots[potIndex];
    if (!pot || !pot.flowerId || pot.stage >= 3) return;

    if (appState.seeds < WATER_COST_SEEDS) {
      showMessage(
        "You need " + WATER_COST_SEEDS + " seeds to water a plant. Complete a task to earn +5 seeds!",
        true
      );
      return;
    }

    const flower =
      FLOWER_CATALOG.find(function (f) {
        return f.id === pot.flowerId;
      }) || FLOWER_CATALOG[0];

    appState.seeds -= WATER_COST_SEEDS;
    pot.stage += 1;

    saveState();
    renderAll();

    if (pot.stage === 3) {
      showMessage(flower.name + " reached Full Bloom in Pot #" + (potIndex + 1) + "!", false);
    } else {
      showMessage("Watered " + flower.name + "! It grew to Stage " + pot.stage + "/3.", false);
    }
  }

  function clearPot(potIndex) {
    const pot = appState.gardenPots[potIndex];
    if (!pot) return;

    pot.flowerId = null;
    pot.stage = 0;

    saveState();
    renderAll();
    showMessage("Cleared Pot #" + (potIndex + 1) + " for a new seed.", false);
  }

  function setPotColor(potIndex, potColorId) {
    const pot = appState.gardenPots[potIndex];
    if (!pot) return;

    pot.potColor = potColorId;
    saveState();
    renderGardenSection();
  }

  function toggleHabit(habitId) {
    const habit = appState.habits.find(function (h) {
      return h.id === habitId;
    });
    if (!habit) return;

    habit.doneToday = !habit.doneToday;
    if (habit.doneToday) {
      habit.totalDays += 1;
      const allHabitsDone =
        appState.habits.length > 0 &&
        appState.habits.every(function (h) {
          return h.doneToday;
        });

      if (allHabitsDone) {
        showMessage("Amazing! All daily habits completed for today!", false);
        triggerPetalConfetti(42);
      } else {
        showMessage('Checked off "' + habit.name + '" for today!', false);
        triggerPetalConfetti(22);
      }
    } else {
      habit.totalDays = Math.max(0, habit.totalDays - 1);
      showMessage('Unchecked "' + habit.name + '".', false);
    }

    saveState();
    renderAll();
  }

  function addHabit(name, icon, color, customEmoji) {
    const newHabit = {
      id: "habit-" + Date.now(),
      name: name,
      icon: icon || "star",
      customEmoji: customEmoji || "",
      color: color || "cream",
      doneToday: false,
      totalDays: 0
    };

    appState.habits.push(newHabit);
    saveState();
    renderAll();
    showMessage('Added habit "' + name + '".', false);
  }

  function setHabitColor(habitId, colorId) {
    const habit = appState.habits.find(function (h) {
      return h.id === habitId;
    });
    if (!habit) return;

    habit.color = colorId;
    saveState();
    renderHabitsSection();
  }

  function updateHabitDetails(habitId, name, icon, customEmoji) {
    const habit = appState.habits.find(function (h) {
      return h.id === habitId;
    });
    if (!habit) return;

    habit.name = name;
    habit.icon = icon;
    habit.customEmoji = icon === "custom" ? customEmoji || "" : habit.customEmoji || "";
    editingHabitId = null;

    saveState();
    renderHabitsSection();
    showMessage('Updated habit "' + name + '".', false);
  }

  function deleteHabit(habitId) {
    const index = appState.habits.findIndex(function (h) {
      return h.id === habitId;
    });
    if (index === -1) return;

    const removed = appState.habits.splice(index, 1)[0];
    saveState();
    renderAll();
    showMessage('Removed habit "' + removed.name + '".', false);
  }

  function resetTodayHabits() {
    appState.habits.forEach(function (habit) {
      habit.doneToday = false;
    });
    appState.lastHabitDate = getTodayString();
    saveState();
    renderAll();
    showMessage("Reset today's habit checkboxes for a fresh start.", false);
  }

  function addJournalEntry(title, date, mood, color, body) {
    const newEntry = {
      id: "journal-" + Date.now(),
      title: title || "",
      date: date || getTodayString(),
      mood: mood || "☀️ Sunny",
      color: color || "butter",
      body: body
    };

    if (!Array.isArray(appState.journalEntries)) {
      appState.journalEntries = [];
    }
    appState.journalEntries.unshift(newEntry);
    saveState();
    renderAll();
    showMessage("Saved journal entry for " + formatShortDate(newEntry.date) + ".", false);
  }

  function setJournalColor(entryId, colorId) {
    const entry = appState.journalEntries.find(function (e) {
      return e.id === entryId;
    });
    if (!entry) return;

    entry.color = colorId;
    saveState();
    renderJournalSection();
  }

  function updateJournalDetails(entryId, title, date, mood, body) {
    const entry = appState.journalEntries.find(function (e) {
      return e.id === entryId;
    });
    if (!entry) return;

    entry.title = title;
    entry.date = date;
    entry.mood = mood;
    entry.body = body;
    editingJournalId = null;

    saveState();
    renderAll();
    showMessage("Updated journal entry.", false);
  }

  function deleteJournalEntry(entryId) {
    const index = appState.journalEntries.findIndex(function (e) {
      return e.id === entryId;
    });
    if (index === -1) return;

    appState.journalEntries.splice(index, 1);
    saveState();
    renderAll();
    showMessage("Deleted journal entry.", false);
  }

  function addReminder(title, date, category, emoji, color) {
    const isSpecial =
      category === "Special Date" || category === "Birthday" || category === "Anniversary";
    const newReminder = {
      id: "rem-" + Date.now(),
      title: title,
      date: date || getTodayString(),
      category: category || "Reminder",
      emoji: emoji || "",
      color: color || "pink",
      isSpecial: isSpecial
    };

    if (!Array.isArray(appState.reminders)) {
      appState.reminders = [];
    }
    appState.reminders.push(newReminder);
    selectedCalendarDate = newReminder.date;
    const parts = newReminder.date.split("-");
    if (parts.length === 3) {
      calendarViewYear = Number(parts[0]);
      calendarViewMonth = Number(parts[1]) - 1;
    }

    saveState();
    renderCalendarWidget();
    showMessage(
      (isSpecial ? 'Saved special date "' : 'Added reminder "') +
        title +
        '" for ' +
        formatShortDate(newReminder.date) +
        ".",
      false
    );
  }

  function setReminderColor(reminderId, colorId) {
    const rem = appState.reminders.find(function (r) {
      return r.id === reminderId;
    });
    if (!rem) return;

    rem.color = colorId;
    saveState();
    renderCalendarWidget();
  }

  function updateReminderDetails(reminderId, title, date, category, emoji) {
    const rem = appState.reminders.find(function (r) {
      return r.id === reminderId;
    });
    if (!rem) return;

    rem.title = title;
    rem.date = date;
    rem.category = category;
    rem.emoji = emoji;
    rem.isSpecial =
      category === "Special Date" || category === "Birthday" || category === "Anniversary";
    editingReminderId = null;
    selectedCalendarDate = date;

    saveState();
    renderCalendarWidget();
    showMessage('Updated reminder "' + title + '".', false);
  }

  function deleteReminder(reminderId) {
    const index = appState.reminders.findIndex(function (r) {
      return r.id === reminderId;
    });
    if (index === -1) return;

    const removed = appState.reminders.splice(index, 1)[0];
    saveState();
    renderCalendarWidget();
    showMessage('Removed reminder "' + removed.title + '".', false);
  }

  // --------------------------------------------------------------------------
  // 9. Static Pixel-Art Slots & Event Listeners Setup
  // --------------------------------------------------------------------------
  function populateStaticPixelArt() {
    const introHero = document.getElementById("intro-hero-art");
    if (introHero) introHero.innerHTML = getPlantStageSvg("sunflower", 3, 58);

    const introPlannerIcon = document.getElementById("intro-icon-planner");
    if (introPlannerIcon) introPlannerIcon.innerHTML = getHabitIconSvg("study", 28);

    const introGardenIcon = document.getElementById("intro-icon-garden");
    if (introGardenIcon) introGardenIcon.innerHTML = getPlantStageSvg("tulip", 3, 30);

    const introHabitsIcon = document.getElementById("intro-icon-habits");
    if (introHabitsIcon) introHabitsIcon.innerHTML = getHabitIconSvg("exercise", 28);

    const introJournalIcon = document.getElementById("intro-icon-journal");
    if (introJournalIcon) introJournalIcon.innerHTML = getHabitIconSvg("journal", 28);

    const brandIcon = document.getElementById("brand-pixel-icon");
    if (brandIcon) brandIcon.innerHTML = getSunflowerLogoSvg(28);

    const headerSeed = document.getElementById("header-seed-icon");
    if (headerSeed) headerSeed.innerHTML = getSeedIconSvg(20);

    const homeSeedArt = document.getElementById("home-seed-art");
    if (homeSeedArt) homeSeedArt.innerHTML = getSeedIconSvg(28);

    const homeTaskArt = document.getElementById("home-task-art");
    if (homeTaskArt) homeTaskArt.innerHTML = getHabitIconSvg("study", 28);

    const homeHabitArt = document.getElementById("home-habit-art");
    if (homeHabitArt) homeHabitArt.innerHTML = getPlantStageSvg("daisy", 3, 30);

    const homeJournalArt = document.getElementById("home-journal-art");
    if (homeJournalArt) homeJournalArt.innerHTML = getHabitIconSvg("journal", 28);
  }

  let introLoadingTimer = null;

  function startIntroLoadingAnimation() {
    const labelEl = document.getElementById("intro-loading-label");
    const percentEl = document.getElementById("intro-loading-percent");
    const trackEl = document.getElementById("intro-progress-track");
    const fillEl = document.getElementById("intro-progress-fill");

    if (introLoadingTimer) {
      clearInterval(introLoadingTimer);
      introLoadingTimer = null;
    }

    const setIntroProgress = function (value) {
      const clamped = Math.min(100, Math.max(0, value));
      if (fillEl) fillEl.style.width = clamped + "%";
      if (percentEl) percentEl.textContent = clamped + "%";
      if (trackEl) trackEl.setAttribute("aria-valuenow", String(clamped));
      if (labelEl) {
        if (clamped < 45) {
          labelEl.textContent = "Preparing your planner and seed pouch...";
        } else if (clamped < 90) {
          labelEl.textContent = "Setting up your 9 flower pots...";
        } else if (clamped < 100) {
          labelEl.textContent = "Polishing your daily habit tracker...";
        } else {
          labelEl.textContent = "Ready to bloom!";
        }
      }
    };

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIntroProgress(100);
      return;
    }

    let progress = 0;
    setIntroProgress(0);

    introLoadingTimer = setInterval(function () {
      progress += 10;
      setIntroProgress(progress);
      if (progress >= 100) {
        clearInterval(introLoadingTimer);
        introLoadingTimer = null;
      }
    }, 95);
  }

  function enterMainApp() {
    const introScreen = document.getElementById("intro-screen");
    const appShell = document.getElementById("app-shell");
    if (!introScreen || !appShell) return;

    if (introLoadingTimer) {
      clearInterval(introLoadingTimer);
      introLoadingTimer = null;
    }

    introScreen.classList.add("is-leaving");
    setTimeout(function () {
      introScreen.hidden = true;
      introScreen.classList.remove("is-leaving");
      appShell.hidden = false;
      window.scrollTo({ top: 0, behavior: "auto" });
      const homeHeading = document.getElementById("home-heading");
      if (homeHeading) {
        homeHeading.setAttribute("tabindex", "-1");
        homeHeading.focus();
      }
    }, 180);
  }

  function openIntroScreen() {
    const introScreen = document.getElementById("intro-screen");
    const appShell = document.getElementById("app-shell");
    if (!introScreen || !appShell) return;

    appShell.hidden = true;
    introScreen.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
    startIntroLoadingAnimation();

    const enterBtn = document.getElementById("enter-app-btn");
    if (enterBtn) enterBtn.focus();
  }

  function bindEventListeners() {
    // Top navigation buttons
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = btn.getAttribute("data-section");
        if (target) switchSection(target);
      });
    });

    // Brand link -> Home
    const brandLink = document.querySelector(".brand-link");
    if (brandLink) {
      brandLink.addEventListener("click", function (event) {
        event.preventDefault();
        switchSection("home");
      });
    }

    // Section jump buttons on Home & Header Seed button
    document.querySelectorAll("[data-section-jump]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const target = btn.getAttribute("data-section-jump");
        if (target) switchSection(target);
      });
    });

    // Task filter tabs
    document.querySelectorAll("[data-task-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        appState.taskFilter = btn.getAttribute("data-task-filter") || "all";
        saveState();
        renderPlannerSection();
      });
    });

    // Add Task form submission
    const taskForm = document.getElementById("task-form");
    const taskTitleInput = document.getElementById("task-title");
    const taskEmojiInput = document.getElementById("task-emoji");
    const taskCategoryInput = document.getElementById("task-category");
    const taskDateInput = document.getElementById("task-date");
    const taskErrorEl = document.getElementById("task-error");

    if (taskDateInput && !taskDateInput.value) {
      taskDateInput.value = getTodayString();
    }

    if (taskForm) {
      taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = taskTitleInput ? taskTitleInput.value.trim() : "";
        const customEmoji = taskEmojiInput ? taskEmojiInput.value.trim() : "";
        const category = taskCategoryInput ? taskCategoryInput.value : "Study";
        const dueDate = taskDateInput ? taskDateInput.value : getTodayString();

        if (!title) {
          if (taskErrorEl) {
            taskErrorEl.textContent = "Please enter a task title before adding.";
            taskErrorEl.hidden = false;
          }
          if (taskTitleInput) taskTitleInput.focus();
          return;
        }

        if (taskErrorEl) taskErrorEl.hidden = true;
        addTask(title, category, dueDate || getTodayString(), appState.selectedTaskColor, customEmoji);

        if (taskTitleInput) taskTitleInput.value = "";
        if (taskEmojiInput) taskEmojiInput.value = "";
      });
    }

    // Add Habit form submission
    const habitForm = document.getElementById("habit-form");
    const habitInput = document.getElementById("habit-input");
    const habitIconSelect = document.getElementById("habit-icon-select");
    const habitEmojiField = document.getElementById("habit-emoji-field");
    const habitEmojiInput = document.getElementById("habit-emoji-input");
    const habitErrorEl = document.getElementById("habit-error");

    if (habitIconSelect && habitEmojiField) {
      const syncHabitEmojiField = function () {
        const isCustom = habitIconSelect.value === "custom";
        habitEmojiField.hidden = !isCustom;
        if (habitErrorEl) habitErrorEl.hidden = true;
        if (isCustom && habitEmojiInput) {
          habitEmojiInput.focus();
        }
      };
      habitIconSelect.addEventListener("change", syncHabitEmojiField);
    }

    if (habitForm) {
      habitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = habitInput ? habitInput.value.trim() : "";
        const icon = habitIconSelect ? habitIconSelect.value : "star";
        const customEmoji = habitEmojiInput ? habitEmojiInput.value.trim() : "";

        if (!name) {
          if (habitErrorEl) {
            habitErrorEl.textContent = "Please enter a habit name.";
            habitErrorEl.hidden = false;
          }
          if (habitInput) habitInput.focus();
          return;
        }

        if (icon === "custom" && !customEmoji) {
          if (habitErrorEl) {
            habitErrorEl.textContent = "Please enter a custom emoji for your habit icon.";
            habitErrorEl.hidden = false;
          }
          if (habitEmojiInput) habitEmojiInput.focus();
          return;
        }

        if (habitErrorEl) habitErrorEl.hidden = true;
        addHabit(name, icon, appState.selectedHabitColor, customEmoji);

        if (habitInput) habitInput.value = "";
        if (habitEmojiInput) habitEmojiInput.value = "";
      });
    }

    // Add Journal Entry form submission
    const journalForm = document.getElementById("journal-form");
    const journalTitleInput = document.getElementById("journal-title");
    const journalDateInput = document.getElementById("journal-date");
    const journalMoodSelect = document.getElementById("journal-mood-select");
    const journalEmojiField = document.getElementById("journal-emoji-field");
    const journalEmojiInput = document.getElementById("journal-emoji-input");
    const journalBodyInput = document.getElementById("journal-body");
    const journalErrorEl = document.getElementById("journal-error");

    if (journalDateInput && !journalDateInput.value) {
      journalDateInput.value = getTodayString();
    }

    if (journalMoodSelect && journalEmojiField) {
      journalMoodSelect.addEventListener("change", function () {
        const isCustom = journalMoodSelect.value === "custom";
        journalEmojiField.hidden = !isCustom;
        if (journalErrorEl) journalErrorEl.hidden = true;
        if (isCustom && journalEmojiInput) {
          journalEmojiInput.focus();
        }
      });
    }

    if (journalForm) {
      journalForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = journalTitleInput ? journalTitleInput.value.trim() : "";
        const date = journalDateInput ? journalDateInput.value : getTodayString();
        let mood = journalMoodSelect ? journalMoodSelect.value : "☀️ Sunny";
        const customEmoji = journalEmojiInput ? journalEmojiInput.value.trim() : "";
        const body = journalBodyInput ? journalBodyInput.value.trim() : "";

        if (mood === "custom") {
          if (!customEmoji) {
            if (journalErrorEl) {
              journalErrorEl.textContent = "Please enter a mood emoji or choose a preset mood.";
              journalErrorEl.hidden = false;
            }
            if (journalEmojiInput) journalEmojiInput.focus();
            return;
          }
          mood = customEmoji;
        }

        if (!body) {
          if (journalErrorEl) {
            journalErrorEl.textContent = "Please write a short reflection before saving.";
            journalErrorEl.hidden = false;
          }
          if (journalBodyInput) journalBodyInput.focus();
          return;
        }

        if (journalErrorEl) journalErrorEl.hidden = true;
        addJournalEntry(
          title,
          date || getTodayString(),
          mood,
          appState.selectedJournalColor,
          body
        );

        if (journalTitleInput) journalTitleInput.value = "";
        if (journalEmojiInput) journalEmojiInput.value = "";
        if (journalBodyInput) journalBodyInput.value = "";
      });
    }

    // Auto-detected weather unit toggle & manual refresh
    const weatherUnitBtn = document.getElementById("weather-unit-btn");
    const weatherRefreshBtn = document.getElementById("weather-refresh-btn");

    if (weatherUnitBtn) {
      weatherUnitBtn.addEventListener("click", function () {
        if (!appState.weather) appState.weather = createDefaultState().weather;
        appState.weather.unit = appState.weather.unit === "F" ? "C" : "F";
        saveState();
        renderWeatherWidget();
      });
    }

    if (weatherRefreshBtn) {
      weatherRefreshBtn.addEventListener("click", function () {
        detectLocalWeather(true);
      });
    }

    // Calendar month & year navigation + view toggle
    const calPrevYearBtn = document.getElementById("cal-prev-year-btn");
    const calNextYearBtn = document.getElementById("cal-next-year-btn");
    const calMonthSelect = document.getElementById("cal-month-select");
    const calYearSelect = document.getElementById("cal-year-select");

    if (calPrevYearBtn) {
      calPrevYearBtn.addEventListener("click", function () {
        calendarViewYear -= 1;
        renderCalendarWidget();
      });
    }

    if (calNextYearBtn) {
      calNextYearBtn.addEventListener("click", function () {
        calendarViewYear += 1;
        renderCalendarWidget();
      });
    }

    if (calMonthSelect) {
      calMonthSelect.addEventListener("change", function () {
        calendarViewMonth = Number(calMonthSelect.value);
        renderCalendarWidget();
      });
    }

    if (calYearSelect) {
      calYearSelect.addEventListener("change", function () {
        calendarViewYear = Number(calYearSelect.value);
        renderCalendarWidget();
      });
    }

    document.querySelectorAll("[data-reminder-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        reminderViewMode = btn.getAttribute("data-reminder-view") || "selected";
        renderCalendarWidget();
      });
    });

    // Add Important Date / Reminder form
    const reminderForm = document.getElementById("reminder-form");
    const reminderTitleInput = document.getElementById("reminder-title");
    const reminderEmojiInput = document.getElementById("reminder-emoji");
    const reminderDateInput = document.getElementById("reminder-date");
    const reminderCategoryInput = document.getElementById("reminder-category");
    const reminderErrorEl = document.getElementById("reminder-error");

    if (reminderDateInput && !reminderDateInput.value) {
      reminderDateInput.value = selectedCalendarDate;
    }

    if (reminderDateInput) {
      reminderDateInput.addEventListener("change", function () {
        if (reminderDateInput.value) {
          jumpCalendarToDate(reminderDateInput.value, true);
        }
      });
    }

    if (reminderForm) {
      reminderForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = reminderTitleInput ? reminderTitleInput.value.trim() : "";
        const emoji = reminderEmojiInput ? reminderEmojiInput.value.trim() : "";
        const date = reminderDateInput ? reminderDateInput.value : selectedCalendarDate;
        const category = reminderCategoryInput ? reminderCategoryInput.value : "Reminder";

        if (!title) {
          if (reminderErrorEl) {
            reminderErrorEl.textContent = "Please enter a reminder title.";
            reminderErrorEl.hidden = false;
          }
          if (reminderTitleInput) reminderTitleInput.focus();
          return;
        }

        if (reminderErrorEl) reminderErrorEl.hidden = true;
        addReminder(title, date || getTodayString(), category, emoji, appState.selectedReminderColor);

        if (reminderTitleInput) reminderTitleInput.value = "";
        if (reminderEmojiInput) reminderEmojiInput.value = "";
      });
    }

    // Reset today's habits button
    const resetTodayBtn = document.getElementById("reset-today-habits-btn");
    if (resetTodayBtn) {
      resetTodayBtn.addEventListener("click", resetTodayHabits);
    }

    // Intro loading screen Enter & Welcome Guide buttons
    const enterAppBtn = document.getElementById("enter-app-btn");
    if (enterAppBtn) {
      enterAppBtn.addEventListener("click", enterMainApp);
    }

    const showIntroBtn = document.getElementById("show-intro-btn");
    if (showIntroBtn) {
      showIntroBtn.addEventListener("click", openIntroScreen);
    }

    // Reset sample data button (two-click inline confirmation)
    const resetDemoBtn = document.getElementById("reset-demo-btn");
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener("click", function () {
        if (!resetConfirmArmed) {
          resetConfirmArmed = true;
          resetDemoBtn.textContent = "Click again to confirm reset";
          if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
          resetConfirmTimer = setTimeout(function () {
            resetConfirmArmed = false;
            resetDemoBtn.textContent = "Reset Demo Data";
          }, 4000);
          return;
        }

        resetConfirmArmed = false;
        if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
        resetDemoBtn.textContent = "Reset Demo Data";
        editingTaskId = null;
        editingHabitId = null;
        editingJournalId = null;
        editingReminderId = null;
        const now = new Date();
        calendarViewYear = now.getFullYear();
        calendarViewMonth = now.getMonth();
        selectedCalendarDate = getTodayString();
        appState = createDefaultState();
        saveState();
        renderAll();
        detectLocalWeather(false);
        showMessage("Reset Sunseed back to sample starter data.", false);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 10. Initialize App on DOM Ready
  // --------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    populateStaticPixelArt();
    bindEventListeners();
    switchSection(activeSection);
    startIntroLoadingAnimation();
    detectLocalWeather(false);
  });
})();

/* Launchpad Finance Pathway Tracker
   Offline-first (file:// compatible), no modules, no fetch, no external deps.
*/
(() => {
  "use strict";

  // ---------- Utilities ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
  const nowISODate = () => new Date().toISOString().slice(0, 10);

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 1800);
  }

  function setCrumbs(label) {
    $("#crumbs").textContent = label;
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function safeParseJSON(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  // ---------- Built-in Glossary + Ideas (editable later inside app too) ----------
  const BUILTIN_GLOSSARY = [
    { term: "Inflation", def: "A general increase in prices over time, reducing purchasing power. Often measured by CPI." },
    { term: "GDP", def: "Gross Domestic Product — total value of goods/services produced in a country over a period." },
    { term: "Interest Rate", def: "Cost of borrowing / return on lending. Central bank policy rates influence many markets." },
    { term: "Bond Yield", def: "Return earned from holding a bond; moves inversely to bond prices." },
    { term: "Equity", def: "Ownership stake in a company (shares/stock)." },
    { term: "Diversification", def: "Spreading investments/exposures across assets to reduce risk." },
    { term: "Standard Deviation", def: "Measure of variability. In finance, used as a simple measure of volatility." },
    { term: "Regression", def: "Statistical method to estimate relationships between variables (e.g., linear regression)." },
    { term: "Probability Distribution", def: "Describes the likelihood of different outcomes. Key in stats/actuarial work." },
    { term: "Time Value of Money", def: "Money today is worth more than the same amount later due to earning potential." },
  ];

  const IDEAS_LIBRARY = [
    {
      subject: "Finance / Accounting",
      items: [
        { title: "Build an Excel Budget + Forecast Model", why: "Shows practical finance skills + modelling mindset.", steps: ["Create income/expense categories", "Add monthly forecast tab", "Add charts + scenario toggles", "Write a 200-word reflection"], est: "4–6 hours" },
        { title: "Company Annual Report Summary", why: "Demonstrates interest + analysis + communication.", steps: ["Pick a listed company", "Read annual report highlights", "Summarise strategy/risks", "Write 300-word insight note"], est: "2–3 hours" },
        { title: "Virtual Work Experience (Finance)", why: "Evidence of commitment + employability skills.", steps: ["Find a virtual programme", "Take notes", "Save certificate/screenshot", "Write STAR reflection"], est: "5–10 hours" },
      ]
    },
    {
      subject: "Economics",
      items: [
        { title: "Write a Short Econ Essay (800–1200 words)", why: "Builds argumentation + real-world links.", steps: ["Pick a policy topic", "Use 3 sources", "Include diagram/intuition", "Write reflection: what changed your mind?"], est: "3–5 hours" },
        { title: "Track Inflation + Interest Rates Monthly", why: "Shows consistent interest & data habit.", steps: ["Create a simple tracker", "Add monthly notes", "Explain causes + effects", "Turn it into PS paragraph"], est: "30 mins/month" },
      ]
    },
    {
      subject: "Maths / Stats / Data Science / Actuarial",
      items: [
        { title: "Python Mini Project: Data Cleaning + Visuals", why: "Perfect for data science & actuarial applications.", steps: ["Find a dataset (Kaggle or gov)", "Clean missing values", "Make 3 charts", "Write 200-word interpretation"], est: "4–8 hours" },
        { title: "Statistics Report: Sampling & Bias", why: "Shows critical thinking (key in stats/actuarial).", steps: ["Pick a claim in media", "Discuss sampling bias", "Suggest better design", "Write 1-page report"], est: "2–4 hours" },
        { title: "Competition Attempt (Math Challenge / Essay Prize)", why: "A credible signal of ability & ambition.", steps: ["Choose 1 competition", "Register / plan", "Do 3 practice sessions", "Record learnings"], est: "2–10 hours" },
      ]
    },
  ];

  // ---------- Storage ----------
  const STORAGE_KEY = "launchpad_finance_state_v1";

  function defaultState() {
    return {
      meta: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      settings: {
        theme: "dark",
        autosave: true,
      },
      profile: {
        name: "",
        school: "",
        targetYear: "2026",
        intendedPath: "Finance / Accounting / Maths / Econ / Stats / Data Science / Actuarial",
        email: "",
        ucasEmail: "",
        predicted: "",
        gcse: "",
        links: {
          linkedin: "",
          github: "",
          portfolio: "",
          drive: ""
        }
      },
      // UCAS choices
      ucasChoices: [
        // empty initially
      ],
      // Apprenticeships
      apprenticeships: [
        // items
      ],
      personalStatement: {
        currentText: "",
        versions: [],
        paragraphBank: [
          { id: uid(), title: "Why this subject", text: "", tags: "motivation", evidenceLinks: "" },
          { id: uid(), title: "Supercurricular reflection", text: "", tags: "supercurricular", evidenceLinks: "" },
          { id: uid(), title: "Work experience / insight", text: "", tags: "experience", evidenceLinks: "" },
        ]
      },
      entryTests: [
        // {id, name, regDeadline, testDate, links, topics, practiceLog[]}
      ],
      supercurricular: [
        // {id, title, category, est, steps[], doneSteps[], notes, evidenceLink}
      ],
      documents: [
        // {id, title, category, link, tags, notes, date}
      ],
      resources: [
        // {id, title, url, category, tags, notes}
      ],
      deadlines: [
        // {id, title, date, relatedType, relatedId, notes, done}
      ]
    };
  }

  let STATE = loadState();

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const st = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
      return st;
    }
    const parsed = safeParseJSON(raw);
    if (!parsed || typeof parsed !== "object") {
      const st = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
      return st;
    }
    // Minimal migrations (future-proof)
    if (!parsed.meta) parsed.meta = { version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (!parsed.settings) parsed.settings = { theme: "dark", autosave: true };
    if (!parsed.profile) parsed.profile = defaultState().profile;
    if (!Array.isArray(parsed.ucasChoices)) parsed.ucasChoices = [];
    if (!Array.isArray(parsed.apprenticeships)) parsed.apprenticeships = [];
    if (!parsed.personalStatement) parsed.personalStatement = defaultState().personalStatement;
    if (!Array.isArray(parsed.entryTests)) parsed.entryTests = [];
    if (!Array.isArray(parsed.supercurricular)) parsed.supercurricular = [];
    if (!Array.isArray(parsed.documents)) parsed.documents = [];
    if (!Array.isArray(parsed.resources)) parsed.resources = [];
    if (!Array.isArray(parsed.deadlines)) parsed.deadlines = [];
    return parsed;
  }

  function saveState(showToast = true) {
    STATE.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    if (showToast) toast("Saved");
    showSavedIndicator();
  }

  function showSavedIndicator() {
    const el = $("#saveIndicator");
    el.classList.add("is-on");
    clearTimeout(showSavedIndicator._t);
    showSavedIndicator._t = setTimeout(() => el.classList.remove("is-on"), 1200);
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    STATE.settings.theme = t;
  }

  // ---------- Global Search ----------
  function buildSearchIndex(state) {
    const chunks = [];

    // Profile
    chunks.push({ type: "Profile", title: state.profile.name || "Profile", route: "#/settings", text: JSON.stringify(state.profile) });

    // UCAS
    for (const c of state.ucasChoices) {
      chunks.push({
        type: "UCAS",
        title: `${c.university || "University"} — ${c.course || "Course"}`,
        route: "#/ucas",
        text: JSON.stringify(c)
      });
    }

    // Apprenticeships
    for (const a of state.apprenticeships) {
      chunks.push({
        type: "Apprenticeship",
        title: `${a.company || "Company"} — ${a.role || "Role"}`,
        route: "#/apprenticeships",
        text: JSON.stringify(a)
      });
    }

    // PS
    chunks.push({ type: "Personal Statement", title: "Current draft", route: "#/personal-statement", text: state.personalStatement.currentText || "" });
    for (const p of state.personalStatement.paragraphBank) {
      chunks.push({ type: "PS Paragraph", title: p.title || "Paragraph", route: "#/personal-statement", text: JSON.stringify(p) });
    }

    // Entry tests
    for (const t of state.entryTests) {
      chunks.push({ type: "Entry Test", title: t.name || "Test", route: "#/entry-tests", text: JSON.stringify(t) });
    }

    // Supercurricular
    for (const s of state.supercurricular) {
      chunks.push({ type: "Supercurricular", title: s.title || "Item", route: "#/supercurricular", text: JSON.stringify(s) });
    }

    // Docs
    for (const d of state.documents) {
      chunks.push({ type: "Document", title: d.title || "Document", route: "#/documents", text: JSON.stringify(d) });
    }

    // Resources
    for (const r of state.resources) {
      chunks.push({ type: "Resource", title: r.title || "Link", route: "#/resources", text: JSON.stringify(r) });
    }

    // Deadlines
    for (const dl of state.deadlines) {
      chunks.push({ type: "Deadline", title: dl.title || "Deadline", route: "#/deadlines", text: JSON.stringify(dl) });
    }

    return chunks;
  }

  function openSearchModal(results) {
    const page = $("#page");
    const html = `
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Search Results</h2>
            <p class="card__sub">${results.length} result(s)</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--ghost" id="closeSearchBtn" type="button">Close</button>
          </div>
        </div>
        <div class="card__body">
          ${results.length === 0 ? `<div class="muted">No matches. Try different keywords.</div>` : `
            <table class="table">
              <thead><tr><th>Type</th><th>Match</th><th>Action</th></tr></thead>
              <tbody>
                ${results.slice(0, 50).map(r => `
                  <tr>
                    <td><span class="badge">${escapeHtml(r.type)}</span></td>
                    <td>${escapeHtml(r.title)}</td>
                    <td><a class="btn btn--ghost" href="${r.route}">Open</a></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="small muted" style="margin-top:10px;">Showing up to 50 results.</div>
          `}
        </div>
      </div>
    `;
    page.innerHTML = html;
    $("#closeSearchBtn").addEventListener("click", () => router.go(router.currentRoute()));
  }

  // ---------- Progress Rings ----------
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function ringSVG(pct /* 0..1 */, strokeClass = "ring-stroke") {
    const r = 46;
    const c = 2 * Math.PI * r;
    const dash = c * clamp01(pct);
    const gap = c - dash;

    // We intentionally don’t set explicit colors in CSS; browser defaults apply.
    // If you want, we can later add per-ring accent gradients.
    return `
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="12"></circle>
        <circle cx="60" cy="60" r="${r}" fill="none"
          stroke="rgba(138,209,255,0.95)"
          stroke-width="12"
          stroke-linecap="round"
          stroke-dasharray="${dash} ${gap}"
          transform="rotate(-90 60 60)"></circle>
      </svg>
    `;
  }

  function computeReadiness(state) {
    // UCAS readiness checklist signals
    const ucasCount = state.ucasChoices.length;
    const ucasCompleteFields = state.ucasChoices.filter(c =>
      (c.university && c.course && c.courseCode && c.entryRequirements) ||
      (c.university && c.course && c.entryRequirements)
    ).length;

    const psHasDraft = (state.personalStatement.currentText || "").trim().length >= 300;
    const hasDeadlines = state.deadlines.length > 0;

    const ucasScore = clamp01(
      (ucasCount >= 1 ? 0.25 : 0) +
      (ucasCount >= 3 ? 0.15 : 0) +
      (ucasCount >= 5 ? 0.10 : 0) +
      (ucasCompleteFields / Math.max(1, ucasCount)) * 0.25 +
      (psHasDraft ? 0.20 : 0) +
      (hasDeadlines ? 0.05 : 0)
    );

    // Apprenticeship readiness
    const appsCount = state.apprenticeships.length;
    const appsApplied = state.apprenticeships.filter(a => a.stage === "Applied" || a.stage === "Online Tests" || a.stage === "Interviews/AC" || a.stage === "Offer").length;
    const cvLink = (state.profile.links?.drive || "").trim().length > 0;
    const linkedin = (state.profile.links?.linkedin || "").trim().length > 0;

    const appsScore = clamp01(
      (appsCount >= 2 ? 0.20 : 0) +
      (appsCount >= 6 ? 0.20 : 0) +
      (appsApplied / Math.max(1, appsCount)) * 0.35 +
      (cvLink ? 0.15 : 0) +
      (linkedin ? 0.10 : 0)
    );

    // Portfolio / supercurricular readiness
    const scCount = state.supercurricular.length;
    const scDone = state.supercurricular.filter(s => (s.doneSteps?.length || 0) >= (s.steps?.length || 0) && (s.steps?.length || 0) > 0).length;
    const github = (state.profile.links?.github || "").trim().length > 0;
    const docsCount = state.documents.length;

    const scScore = clamp01(
      (scCount >= 2 ? 0.25 : 0) +
      (scDone / Math.max(1, scCount)) * 0.35 +
      (github ? 0.15 : 0) +
      (docsCount >= 3 ? 0.15 : 0) +
      (docsCount >= 8 ? 0.10 : 0)
    );

    const overall = clamp01(ucasScore * 0.38 + appsScore * 0.34 + scScore * 0.28);
    return { ucasScore, appsScore, scScore, overall };
  }

  // ---------- Router ----------
  const router = {
    routes: {},
    register(path, label, renderFn) { this.routes[path] = { label, renderFn }; },
    currentRoute() {
      const hash = location.hash || "#/dashboard";
      const path = hash.replace("#", "");
      return this.routes[path] ? path : "/dashboard";
    },
    go(path) {
      location.hash = "#" + path;
    },
    render() {
      const path = this.currentRoute();
      const route = this.routes[path];
      setCrumbs(route.label);
      // nav highlight
      $$(".nav__item").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + path));
      // render
      route.renderFn();
    }
  };

  // ---------- Page Rendering Helpers ----------
  function setPage(html) {
    $("#page").innerHTML = html;
    wireCommonAutosave();
  }

  function wireCommonAutosave() {
    if (!STATE.settings.autosave) return;
    // For inputs with data-bind paths, we autosave on blur/change.
    $$("[data-bind]").forEach(el => {
      el.addEventListener("change", () => {
        bindWrite(el);
        saveState(false);
      });
      el.addEventListener("blur", () => {
        bindWrite(el);
        saveState(false);
      });
    });
  }

  function bindRead(path) {
    const parts = path.split(".");
    let cur = STATE;
    for (const p of parts) {
      if (!cur) return "";
      cur = cur[p];
    }
    return cur ?? "";
  }

  function bindWrite(el) {
    const path = el.getAttribute("data-bind");
    if (!path) return;
    const parts = path.split(".");
    let cur = STATE;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!(p in cur)) cur[p] = {};
      cur = cur[p];
    }
    const last = parts[parts.length - 1];
    cur[last] = el.type === "checkbox" ? !!el.checked : el.value;
  }

  function fmtDate(d) {
    if (!d) return "";
    return d;
  }

  // ---------- Pages ----------
  function pageDashboard() {
    const { ucasScore, appsScore, scScore, overall } = computeReadiness(STATE);

    const upcoming = STATE.deadlines
      .filter(d => !d.done && d.date)
      .slice()
      .sort((a,b) => (a.date || "").localeCompare(b.date || ""))
      .slice(0, 8);

    const recentMeta = STATE.meta.updatedAt ? new Date(STATE.meta.updatedAt).toLocaleString() : "";

    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Mission Control</h2>
              <p class="card__sub">Your full UCAS + Degree Apprenticeship launchpad. Last saved: <span class="muted">${escapeHtml(recentMeta)}</span></p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <span class="badge badge--ok">Offline-ready</span>
              <span class="badge badge--warn">Export backups</span>
            </div>
          </div>
          <div class="card__body">
            <div class="rings">
              ${ringBlock("Overall", overall)}
              ${ringBlock("UCAS Ready", ucasScore)}
              ${ringBlock("Apprenticeships Ready", appsScore)}
              ${ringBlock("Portfolio Ready", scScore)}
            </div>
            <hr class="sep" />
            <div class="grid grid-2">
              <button class="btn btn--primary" id="quickAddCourseBtn" type="button">+ Add UCAS Choice</button>
              <button class="btn btn--primary" id="quickAddApprBtn" type="button">+ Add Apprenticeship</button>
              <button class="btn btn--ghost" id="quickAddDeadlineBtn" type="button">+ Add Deadline</button>
              <button class="btn btn--ghost" id="quickAddResourceBtn" type="button">+ Add Resource Link</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Next Deadlines</h2>
              <p class="card__sub">Keep these visible. Add more in the Deadlines page.</p>
            </div>
          </div>
          <div class="card__body">
            ${upcoming.length === 0 ? `<div class="muted">No upcoming deadlines yet. Add one using <span class="kbd">+ Add Deadline</span>.</div>` : `
              <table class="table">
                <thead><tr><th>Date</th><th>Title</th><th>Notes</th></tr></thead>
                <tbody>
                  ${upcoming.map(d => `
                    <tr>
                      <td>${escapeHtml(fmtDate(d.date))}</td>
                      <td>${escapeHtml(d.title || "")}</td>
                      <td class="muted">${escapeHtml((d.notes || "").slice(0, 120))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `}
          </div>
        </div>
      </div>
    `);

    $("#quickAddCourseBtn").addEventListener("click", () => {
      addUcasChoice();
      router.go("/ucas");
    });
    $("#quickAddApprBtn").addEventListener("click", () => {
      addApprenticeship();
      router.go("/apprenticeships");
    });
    $("#quickAddDeadlineBtn").addEventListener("click", () => {
      addDeadline();
      router.go("/deadlines");
    });
    $("#quickAddResourceBtn").addEventListener("click", () => {
      addResource();
      router.go("/resources");
    });
  }

  function ringBlock(label, pct01) {
    const pct = Math.round(clamp01(pct01) * 100);
    return `
      <div class="ring" title="${escapeHtml(label)} readiness">
        ${ringSVG(pct01)}
        <div class="ring__pct">${pct}%</div>
        <div class="ring__label">
          <span>${escapeHtml(label)}</span>
          <span>${pct}/100</span>
        </div>
      </div>
    `;
  }

  // ---- UCAS Tracker ----
  function pageUCAS() {
    const choices = STATE.ucasChoices;

    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">UCAS Tracker</h2>
              <p class="card__sub">Add up to 5 choices. Each choice has notes, requirements, tests, and links.</p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <button class="btn btn--primary" id="addChoiceBtn" type="button">+ Add Choice</button>
              <span class="badge">${choices.length}/5</span>
            </div>
          </div>
          <div class="card__body">
            ${choices.length === 0 ? `<div class="muted">No UCAS choices yet. Click <b>+ Add Choice</b>.</div>` : `
              <div class="grid">
                ${choices.map(c => choiceCard(c)).join("")}
              </div>
            `}
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Compare Overview</h2>
              <p class="card__sub">Quick side-by-side view. Keep requirements + notes here for easy reference.</p>
            </div>
          </div>
          <div class="card__body">
            ${choices.length === 0 ? `<div class="muted">Add choices to see the comparison table.</div>` : `
              <table class="table">
                <thead>
                  <tr>
                    <th>University</th><th>Course</th><th>Code</th><th>Status</th><th>Entry Req</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${choices.map(c => `
                    <tr>
                      <td>${escapeHtml(c.university || "")}</td>
                      <td>${escapeHtml(c.course || "")}</td>
                      <td class="muted">${escapeHtml(c.courseCode || "")}</td>
                      <td>${escapeHtml(c.status || "Researching")}</td>
                      <td class="muted">${escapeHtml((c.entryRequirements || "").slice(0, 80))}</td>
                      <td class="muted">${escapeHtml((c.notes || "").slice(0, 80))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `}
          </div>
        </div>
      </div>
    `);

    $("#addChoiceBtn").addEventListener("click", () => addUcasChoice(true));
    $$("#addChoiceBtn2").forEach(btn => btn.addEventListener("click", () => addUcasChoice(true)));

    // Wire card events
    $$(".choice").forEach(card => {
      const id = card.getAttribute("data-id");
      const choice = STATE.ucasChoices.find(x => x.id === id);
      if (!choice) return;

      card.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.value = choice[field] ?? "";
        inp.addEventListener("change", () => {
          choice[field] = inp.value;
          autosave();
        });
        inp.addEventListener("blur", () => {
          choice[field] = inp.value;
          autosave();
        });
      });

      const delBtn = card.querySelector("[data-del]");
      delBtn.addEventListener("click", () => {
        if (!confirm("Delete this UCAS choice?")) return;
        STATE.ucasChoices = STATE.ucasChoices.filter(x => x.id !== id);
        autosave(true);
        pageUCAS();
      });

      const addDeadlineBtn = card.querySelector("[data-add-deadline]");
      addDeadlineBtn.addEventListener("click", () => {
        const title = `${choice.university || "UCAS"} — ${choice.course || "Choice"} deadline`;
        STATE.deadlines.unshift({ id: uid(), title, date: "", relatedType: "UCAS", relatedId: id, notes: "", done: false });
        autosave(true);
        toast("Deadline entry added (set date in Deadlines page)");
      });
    });
  }

  function choiceCard(c) {
    return `
      <details class="accordion choice" data-id="${escapeHtml(c.id)}" open>
        <summary>${escapeHtml(c.university || "New UCAS Choice")} — <span class="muted">${escapeHtml(c.course || "Course")}</span></summary>
        <div class="acc-body">
          <div class="grid grid-2">
            <div>
              <label class="small muted">University</label>
              <input class="input" data-field="university" placeholder="e.g., LSE" />
            </div>
            <div>
              <label class="small muted">Course</label>
              <input class="input" data-field="course" placeholder="e.g., BSc Finance" />
            </div>

            <div>
              <label class="small muted">Course code</label>
              <input class="input" data-field="courseCode" placeholder="e.g., N300" />
            </div>
            <div>
              <label class="small muted">Status</label>
              <select class="select" data-field="status">
                <option>Researching</option>
                <option>Shortlisted</option>
                <option>Firm choice candidate</option>
                <option>Applied</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div class="grid" style="grid-column: 1 / -1;">
              <div>
                <label class="small muted">Entry requirements</label>
                <textarea class="textarea" data-field="entryRequirements" placeholder="A-level requirements, GCSE requirements, preferred subjects, etc."></textarea>
              </div>
              <div class="grid grid-2">
                <div>
                  <label class="small muted">Admissions tests</label>
                  <input class="input" data-field="admissionsTests" placeholder="e.g., TMUA / MAT / none / interview maths test" />
                </div>
                <div>
                  <label class="small muted">Interview notes / requirements</label>
                  <input class="input" data-field="interview" placeholder="e.g., online interview / assessment centre / none" />
                </div>
              </div>
              <div class="grid grid-2">
                <div>
                  <label class="small muted">Course link</label>
                  <input class="input" data-field="courseLink" placeholder="Paste URL" />
                </div>
                <div>
                  <label class="small muted">Open day / resources link</label>
                  <input class="input" data-field="resourceLink" placeholder="Paste URL" />
                </div>
              </div>
              <div>
                <label class="small muted">Notes</label>
                <textarea class="textarea" data-field="notes" placeholder="Modules you like, why it fits, costs, employability, anything important."></textarea>
              </div>

              <div class="row" style="flex:0;">
                <button class="btn btn--ghost" data-add-deadline type="button">+ Add related deadline</button>
                <button class="btn btn--danger" data-del type="button">Delete choice</button>
              </div>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  function addUcasChoice(navigateToast = false) {
    if (STATE.ucasChoices.length >= 5) {
      toast("UCAS allows 5 choices — you’re at 5/5.");
      return;
    }
    STATE.ucasChoices.unshift({
      id: uid(),
      university: "",
      course: "",
      courseCode: "",
      status: "Researching",
      entryRequirements: "",
      admissionsTests: "",
      interview: "",
      courseLink: "",
      resourceLink: "",
      notes: ""
    });
    autosave(true);
    if (navigateToast) toast("UCAS choice added");
    pageUCAS();
  }

  // ---- Apprenticeships ----
  const KANBAN_STAGES = ["Researching", "Applied", "Online Tests", "Interviews/AC", "Offer", "Rejected"];

  function pageApprenticeships() {
    const items = STATE.apprenticeships;

    setPage(`
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Degree Apprenticeships</h2>
            <p class="card__sub">Track roles like a pipeline. Each role stores requirements, tests, and notes.</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--primary" id="addApprBtn" type="button">+ Add Role</button>
            <span class="badge">${items.length} total</span>
          </div>
        </div>
        <div class="card__body">
          <div class="kanban">
            ${KANBAN_STAGES.map(stage => kanbanCol(stage, items)).join("")}
          </div>
          <hr class="sep"/>
          <div class="muted small">
            Tip: Move roles between stages using the <b>Stage</b> dropdown inside each card.
          </div>
        </div>
      </div>
    `);

    $("#addApprBtn").addEventListener("click", () => addApprenticeship(true));

    // Wire per-card actions
    $$(".appr-card").forEach(card => {
      const id = card.getAttribute("data-id");
      const item = STATE.apprenticeships.find(x => x.id === id);
      if (!item) return;

      card.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        if (inp.tagName === "SELECT") {
          inp.value = item[field] ?? "Researching";
        } else {
          inp.value = item[field] ?? "";
        }
        inp.addEventListener("change", () => {
          item[field] = inp.value;
          autosave();
          // rerender to reflect stage moves
          pageApprenticeships();
        });
        inp.addEventListener("blur", () => {
          item[field] = inp.value;
          autosave();
        });
      });

      const delBtn = card.querySelector("[data-del]");
      delBtn.addEventListener("click", () => {
        if (!confirm("Delete this apprenticeship role?")) return;
        STATE.apprenticeships = STATE.apprenticeships.filter(x => x.id !== id);
        autosave(true);
        pageApprenticeships();
      });

      const addDeadlineBtn = card.querySelector("[data-add-deadline]");
      addDeadlineBtn.addEventListener("click", () => {
        const title = `${item.company || "Company"} — ${item.role || "Role"} deadline`;
        STATE.deadlines.unshift({ id: uid(), title, date: "", relatedType: "Apprenticeship", relatedId: id, notes: "", done: false });
        autosave(true);
        toast("Deadline entry added (set date in Deadlines page)");
      });
    });
  }

  function kanbanCol(stage, items) {
    const list = items.filter(x => (x.stage || "Researching") === stage);
    return `
      <div class="kanban__col">
        <div class="kanban__title">
          <span>${escapeHtml(stage)}</span>
          <span class="badge">${list.length}</span>
        </div>
        <div class="kanban__list">
          ${list.map(apprCard).join("")}
          ${list.length === 0 ? `<div class="muted small">No roles here yet.</div>` : ""}
        </div>
      </div>
    `;
  }

  function apprCard(a) {
    return `
      <details class="accordion appr-card" data-id="${escapeHtml(a.id)}">
        <summary>${escapeHtml(a.company || "New Company")} — <span class="muted">${escapeHtml(a.role || "Role")}</span></summary>
        <div class="acc-body">
          <div class="grid grid-2">
            <div>
              <label class="small muted">Company</label>
              <input class="input" data-field="company" placeholder="e.g., Deloitte" />
            </div>
            <div>
              <label class="small muted">Role</label>
              <input class="input" data-field="role" placeholder="e.g., Degree Apprentice — Audit" />
            </div>

            <div>
              <label class="small muted">Stage</label>
              <select class="select" data-field="stage">
                ${KANBAN_STAGES.map(s => `<option>${escapeHtml(s)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="small muted">Location</label>
              <input class="input" data-field="location" placeholder="e.g., London / Manchester" />
            </div>

            <div>
              <label class="small muted">Salary (if known)</label>
              <input class="input" data-field="salary" placeholder="e.g., £22,000" />
            </div>
            <div>
              <label class="small muted">Start date / intake</label>
              <input class="input" data-field="startDate" placeholder="e.g., Sep 2026" />
            </div>

            <div class="grid" style="grid-column: 1 / -1;">
              <div>
                <label class="small muted">Requirements</label>
                <textarea class="textarea" data-field="requirements" placeholder="GCSE/A-level requirements, eligibility, right-to-work, etc."></textarea>
              </div>

              <div class="grid grid-2">
                <div>
                  <label class="small muted">Job link</label>
                  <input class="input" data-field="jobLink" placeholder="Paste URL" />
                </div>
                <div>
                  <label class="small muted">Prep resources link</label>
                  <input class="input" data-field="prepLink" placeholder="Paste URL" />
                </div>
              </div>

              <div>
                <label class="small muted">Notes</label>
                <textarea class="textarea" data-field="notes" placeholder="Online test topics, interview questions, company values, what to research, etc."></textarea>
              </div>

              <div class="row" style="flex:0;">
                <button class="btn btn--ghost" data-add-deadline type="button">+ Add related deadline</button>
                <button class="btn btn--danger" data-del type="button">Delete role</button>
              </div>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  function addApprenticeship(showToastMsg = false) {
    STATE.apprenticeships.unshift({
      id: uid(),
      company: "",
      role: "",
      stage: "Researching",
      location: "",
      salary: "",
      startDate: "",
      requirements: "",
      jobLink: "",
      prepLink: "",
      notes: ""
    });
    autosave(true);
    if (showToastMsg) toast("Apprenticeship role added");
    pageApprenticeships();
  }

  // ---- Personal Statement ----
  function pagePersonalStatement() {
    const ps = STATE.personalStatement;

    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Personal Statement</h2>
              <p class="card__sub">Draft + versions. Keep it reflective: what you did → what you learned → why it matters.</p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <button class="btn btn--primary" id="saveVersionBtn" type="button">Save as Version</button>
            </div>
          </div>
          <div class="card__body">
            <label class="small muted">Current draft</label>
            <textarea class="textarea" id="psText" placeholder="Write your full personal statement here...">${escapeHtml(ps.currentText || "")}</textarea>
            <div class="row" style="margin-top:10px; align-items:flex-start;">
              <div class="muted small" id="psCount"></div>
              <div style="flex:0;">
                <span class="badge" id="psQualityBadge">Draft</span>
              </div>
            </div>

            <hr class="sep" />
            <h3 style="margin:0 0 10px 0;">Versions</h3>
            ${ps.versions.length === 0 ? `<div class="muted">No versions saved yet.</div>` : `
              <table class="table">
                <thead><tr><th>Date</th><th>Label</th><th>Actions</th></tr></thead>
                <tbody>
                  ${ps.versions.slice().reverse().map(v => `
                    <tr>
                      <td>${escapeHtml(new Date(v.createdAt).toLocaleString())}</td>
                      <td>${escapeHtml(v.label)}</td>
                      <td>
                        <button class="btn btn--ghost" data-loadver="${escapeHtml(v.id)}" type="button">Load</button>
                        <button class="btn btn--danger" data-delver="${escapeHtml(v.id)}" type="button">Delete</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Paragraph Bank</h2>
              <p class="card__sub">Build reusable blocks (supercurricular, work experience, projects). Add evidence links.</p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <button class="btn btn--primary" id="addParaBtn" type="button">+ Add Paragraph</button>
            </div>
          </div>
          <div class="card__body">
            <div class="grid">
              ${ps.paragraphBank.map(p => paraCard(p)).join("")}
            </div>
          </div>
        </div>
      </div>
    `);

    const psText = $("#psText");
    const updateCounts = () => {
      const text = psText.value || "";
      const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
      $("#psCount").textContent = `Words: ${words} • Characters: ${text.length}`;
      const badge = $("#psQualityBadge");
      if (words >= 550 && words <= 700) badge.textContent = "In range";
      else if (words >= 300) badge.textContent = "Draft";
      else badge.textContent = "Start writing";
    };

    psText.addEventListener("input", () => {
      ps.currentText = psText.value;
      updateCounts();
      autosave();
    });

    updateCounts();

    $("#saveVersionBtn").addEventListener("click", () => {
      const label = prompt("Version label (e.g., v1, v2, final draft):", `v${(ps.versions.length + 1)}`);
      if (!label) return;
      ps.versions.push({ id: uid(), label, createdAt: new Date().toISOString(), text: ps.currentText || "" });
      autosave(true);
      pagePersonalStatement();
      toast("Version saved");
    });

    // load/delete version
    $$("[data-loadver]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-loadver");
        const v = ps.versions.find(x => x.id === id);
        if (!v) return;
        ps.currentText = v.text;
        autosave(true);
        pagePersonalStatement();
        toast("Version loaded");
      });
    });

    $$("[data-delver]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delver");
        if (!confirm("Delete this version?")) return;
        ps.versions = ps.versions.filter(x => x.id !== id);
        autosave(true);
        pagePersonalStatement();
      });
    });

    $("#addParaBtn").addEventListener("click", () => {
      ps.paragraphBank.unshift({ id: uid(), title: "New paragraph", text: "", tags: "", evidenceLinks: "" });
      autosave(true);
      pagePersonalStatement();
    });

    // Wire paragraph cards
    $$(".para").forEach(card => {
      const id = card.getAttribute("data-id");
      const p = ps.paragraphBank.find(x => x.id === id);
      if (!p) return;

      card.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.value = p[field] ?? "";
        inp.addEventListener("input", () => {
          p[field] = inp.value;
          autosave();
        });
      });

      card.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this paragraph?")) return;
        ps.paragraphBank = ps.paragraphBank.filter(x => x.id !== id);
        autosave(true);
        pagePersonalStatement();
      });
    });
  }

  function paraCard(p) {
    return `
      <details class="accordion para" data-id="${escapeHtml(p.id)}">
        <summary>${escapeHtml(p.title || "Paragraph")}</summary>
        <div class="acc-body">
          <div class="grid">
            <div>
              <label class="small muted">Title</label>
              <input class="input" data-field="title" placeholder="e.g., Work experience reflection" />
            </div>
            <div>
              <label class="small muted">Tags</label>
              <input class="input" data-field="tags" placeholder="e.g., supercurricular, project, leadership" />
            </div>
            <div>
              <label class="small muted">Text</label>
              <textarea class="textarea" data-field="text" placeholder="Write the paragraph here..."></textarea>
            </div>
            <div>
              <label class="small muted">Evidence links (Drive / certificates / GitHub)</label>
              <input class="input" data-field="evidenceLinks" placeholder="Paste link(s)" />
            </div>
            <button class="btn btn--danger" data-del type="button">Delete paragraph</button>
          </div>
        </div>
      </details>
    `;
  }

  // ---- Entry tests ----
  function pageEntryTests() {
    const tests = STATE.entryTests;

    setPage(`
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Entry Tests & Prep</h2>
            <p class="card__sub">Track registrations, dates, topics, resources, and practice scores.</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--primary" id="addTestBtn" type="button">+ Add Test</button>
          </div>
        </div>
        <div class="card__body">
          ${tests.length === 0 ? `<div class="muted">No tests added yet.</div>` : `
            <div class="grid">
              ${tests.map(testCard).join("")}
            </div>
          `}
        </div>
      </div>
    `);

    $("#addTestBtn").addEventListener("click", () => {
      STATE.entryTests.unshift({
        id: uid(),
        name: "",
        regDeadline: "",
        testDate: "",
        links: "",
        topics: "",
        practiceLog: []
      });
      autosave(true);
      pageEntryTests();
    });

    $$(".test").forEach(card => {
      const id = card.getAttribute("data-id");
      const t = STATE.entryTests.find(x => x.id === id);
      if (!t) return;

      card.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.value = t[field] ?? "";
        inp.addEventListener("input", () => { t[field] = inp.value; autosave(); });
        inp.addEventListener("change", () => { t[field] = inp.value; autosave(); });
      });

      card.querySelector("[data-addscore]").addEventListener("click", () => {
        const score = prompt("Practice score (e.g., 18/25, 72%, etc):");
        if (!score) return;
        const notes = prompt("Notes (optional):", "") || "";
        t.practiceLog.unshift({ id: uid(), date: nowISODate(), score, notes });
        autosave(true);
        pageEntryTests();
      });

      card.querySelectorAll("[data-delscore]").forEach(btn => {
        btn.addEventListener("click", () => {
          const sid = btn.getAttribute("data-delscore");
          t.practiceLog = t.practiceLog.filter(x => x.id !== sid);
          autosave(true);
          pageEntryTests();
        });
      });

      card.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this test?")) return;
        STATE.entryTests = STATE.entryTests.filter(x => x.id !== id);
        autosave(true);
        pageEntryTests();
      });
    });
  }

  function testCard(t) {
    return `
      <details class="accordion test" data-id="${escapeHtml(t.id)}">
        <summary>${escapeHtml(t.name || "New test")} <span class="muted">(${escapeHtml(t.testDate || "no date")})</span></summary>
        <div class="acc-body">
          <div class="grid grid-2">
            <div>
              <label class="small muted">Test name</label>
              <input class="input" data-field="name" placeholder="e.g., TMUA / Maths test / Numerical reasoning" />
            </div>
            <div>
              <label class="small muted">Registration deadline</label>
              <input class="input" type="date" data-field="regDeadline" />
            </div>
            <div>
              <label class="small muted">Test date</label>
              <input class="input" type="date" data-field="testDate" />
            </div>
            <div>
              <label class="small muted">Links</label>
              <input class="input" data-field="links" placeholder="Registration page / resources" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="small muted">Topics checklist / plan</label>
              <textarea class="textarea" data-field="topics" placeholder="List topics, weak spots, practice plan..."></textarea>
            </div>
          </div>

          <hr class="sep" />

          <div class="row" style="align-items:flex-start;">
            <div>
              <h4 style="margin:0 0 8px 0;">Practice log</h4>
              ${(!t.practiceLog || t.practiceLog.length === 0) ? `<div class="muted small">No scores logged yet.</div>` : `
                <table class="table">
                  <thead><tr><th>Date</th><th>Score</th><th>Notes</th><th></th></tr></thead>
                  <tbody>
                    ${t.practiceLog.map(p => `
                      <tr>
                        <td>${escapeHtml(p.date)}</td>
                        <td>${escapeHtml(p.score)}</td>
                        <td class="muted">${escapeHtml((p.notes||"").slice(0,80))}</td>
                        <td><button class="btn btn--danger" data-delscore="${escapeHtml(p.id)}" type="button">Delete</button></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `}
            </div>
            <div style="flex:0; min-width:180px;">
              <button class="btn btn--primary w-100" data-addscore type="button">+ Add practice score</button>
              <button class="btn btn--danger w-100" style="margin-top:10px;" data-del type="button">Delete test</button>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  // ---- Supercurricular ----
  function pageSupercurricular() {
    const items = STATE.supercurricular;

    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Supercurricular Planner</h2>
              <p class="card__sub">Track projects, competitions, reading, and evidence. Mark steps done.</p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <button class="btn btn--primary" id="addSCBtn" type="button">+ Add Item</button>
            </div>
          </div>
          <div class="card__body">
            ${items.length === 0 ? `<div class="muted">No items added yet. Use the ideas library on the right, or add your own.</div>` : `
              <div class="grid">
                ${items.map(scCard).join("")}
              </div>
            `}
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Ideas Library</h2>
              <p class="card__sub">Pre-loaded ideas for finance/econ/maths/stats/data. Click “Add to Planner”.</p>
            </div>
          </div>
          <div class="card__body">
            <div class="grid">
              ${IDEAS_LIBRARY.map(ideasBlock).join("")}
            </div>
          </div>
        </div>
      </div>
    `);

    $("#addSCBtn").addEventListener("click", () => {
      STATE.supercurricular.unshift({
        id: uid(),
        title: "",
        category: "",
        est: "",
        steps: ["Plan", "Do", "Write reflection", "Save evidence"],
        doneSteps: [],
        notes: "",
        evidenceLink: ""
      });
      autosave(true);
      pageSupercurricular();
    });

    // Wire planner item cards
    $$(".sc").forEach(card => {
      const id = card.getAttribute("data-id");
      const s = STATE.supercurricular.find(x => x.id === id);
      if (!s) return;

      card.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.value = s[field] ?? "";
        inp.addEventListener("input", () => { s[field] = inp.value; autosave(); });
        inp.addEventListener("change", () => { s[field] = inp.value; autosave(); });
      });

      // Steps checkboxes
      card.querySelectorAll("[data-step]").forEach(chk => {
        const step = chk.getAttribute("data-step");
        chk.checked = (s.doneSteps || []).includes(step);
        chk.addEventListener("change", () => {
          s.doneSteps = s.doneSteps || [];
          if (chk.checked) {
            if (!s.doneSteps.includes(step)) s.doneSteps.push(step);
          } else {
            s.doneSteps = s.doneSteps.filter(x => x !== step);
          }
          autosave();
        });
      });

      card.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this supercurricular item?")) return;
        STATE.supercurricular = STATE.supercurricular.filter(x => x.id !== id);
        autosave(true);
        pageSupercurricular();
      });
    });

    // Wire idea add buttons
    $$("[data-add-idea]").forEach(btn => {
      btn.addEventListener("click", () => {
        const payload = safeParseJSON(btn.getAttribute("data-add-idea"));
        if (!payload) return;
        STATE.supercurricular.unshift({
          id: uid(),
          title: payload.title,
          category: payload.category,
          est: payload.est,
          steps: payload.steps,
          doneSteps: [],
          notes: `Why it helps: ${payload.why}\n\nReflection:\n- What did I do?\n- What did I learn?\n- How does this connect to finance/econ/maths/stats?\n`,
          evidenceLink: ""
        });
        autosave(true);
        toast("Added to planner");
        pageSupercurricular();
      });
    });
  }

  function scCard(s) {
    const steps = Array.isArray(s.steps) && s.steps.length ? s.steps : ["Plan", "Do", "Reflect", "Evidence"];
    return `
      <details class="accordion sc" data-id="${escapeHtml(s.id)}">
        <summary>${escapeHtml(s.title || "New Item")} <span class="muted">${escapeHtml(s.category || "")}</span></summary>
        <div class="acc-body">
          <div class="grid grid-2">
            <div>
              <label class="small muted">Title</label>
              <input class="input" data-field="title" placeholder="e.g., Python mini project" />
            </div>
            <div>
              <label class="small muted">Category</label>
              <input class="input" data-field="category" placeholder="e.g., Project / Competition / Reading" />
            </div>
            <div>
              <label class="small muted">Estimated time</label>
              <input class="input" data-field="est" placeholder="e.g., 4–6 hours" />
            </div>
            <div>
              <label class="small muted">Evidence link</label>
              <input class="input" data-field="evidenceLink" placeholder="Drive / GitHub / file path" />
            </div>
            <div style="grid-column:1/-1;">
              <label class="small muted">Steps (tick off)</label>
              <div class="grid" style="gap:8px; margin-top:8px;">
                ${steps.map(step => `
                  <label class="badge" style="justify-content:flex-start;">
                    <input type="checkbox" data-step="${escapeHtml(step)}" style="margin-right:8px;" />
                    ${escapeHtml(step)}
                  </label>
                `).join("")}
              </div>
            </div>
            <div style="grid-column:1/-1;">
              <label class="small muted">Notes / Reflection</label>
              <textarea class="textarea" data-field="notes" placeholder="What you did, what you learned, impact, how it links to your course/career..."></textarea>
            </div>
            <button class="btn btn--danger" data-del type="button">Delete item</button>
          </div>
        </div>
      </details>
    `;
  }

  function ideasBlock(block) {
    return `
      <details class="accordion">
        <summary>${escapeHtml(block.subject)}</summary>
        <div class="acc-body">
          <div class="grid">
            ${block.items.map(it => `
              <div class="item-card">
                <h4>${escapeHtml(it.title)}</h4>
                <div class="meta">${escapeHtml(it.why)}</div>
                <div class="meta" style="margin-top:6px;">Est: ${escapeHtml(it.est)}</div>
                <div class="actions">
                  <button class="btn btn--primary" type="button"
                    data-add-idea='${escapeHtml(JSON.stringify({ title: it.title, category: block.subject, why: it.why, steps: it.steps, est: it.est }))}'>
                    Add to Planner
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </details>
    `;
  }

  // ---- Documents ----
  function pageDocuments() {
    const docs = STATE.documents;

    setPage(`
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Documents & Evidence</h2>
            <p class="card__sub">Store references to files/Drive links (certificates, CV versions, project writeups).</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--primary" id="addDocBtn" type="button">+ Add Document</button>
          </div>
        </div>
        <div class="card__body">
          ${docs.length === 0 ? `<div class="muted">No documents added yet.</div>` : `
            <table class="table">
              <thead><tr><th>Title</th><th>Category</th><th>Link / Path</th><th>Tags</th><th></th></tr></thead>
              <tbody>
                ${docs.map(d => `
                  <tr data-id="${escapeHtml(d.id)}">
                    <td><input class="input" data-field="title" value="${escapeHtml(d.title)}" placeholder="Title" /></td>
                    <td><input class="input" data-field="category" value="${escapeHtml(d.category)}" placeholder="Category" /></td>
                    <td><input class="input" data-field="link" value="${escapeHtml(d.link)}" placeholder="Drive link / file path" /></td>
                    <td><input class="input" data-field="tags" value="${escapeHtml(d.tags)}" placeholder="Tags" /></td>
                    <td><button class="btn btn--danger" data-del type="button">Delete</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
          <hr class="sep"/>
          <div class="small muted">Tip: keep a Google Drive folder link in your profile for CV + certificates.</div>
        </div>
      </div>
    `);

    $("#addDocBtn").addEventListener("click", () => {
      STATE.documents.unshift({ id: uid(), title: "", category: "", link: "", tags: "", notes: "", date: nowISODate() });
      autosave(true);
      pageDocuments();
    });

    // Wire table editing
    $$("tr[data-id]").forEach(row => {
      const id = row.getAttribute("data-id");
      const d = STATE.documents.find(x => x.id === id);
      if (!d) return;

      row.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.addEventListener("input", () => { d[field] = inp.value; autosave(); });
        inp.addEventListener("blur", () => { d[field] = inp.value; autosave(); });
      });

      row.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this document entry?")) return;
        STATE.documents = STATE.documents.filter(x => x.id !== id);
        autosave(true);
        pageDocuments();
      });
    });
  }

  // ---- Resources ----
  function pageResources() {
    const res = STATE.resources;

    setPage(`
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Links & Resources</h2>
            <p class="card__sub">Save important links (course pages, apprenticeship portals, prep resources).</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--primary" id="addResBtn" type="button">+ Add Link</button>
          </div>
        </div>
        <div class="card__body">
          ${res.length === 0 ? `<div class="muted">No links saved yet.</div>` : `
            <table class="table">
              <thead><tr><th>Title</th><th>URL</th><th>Category</th><th>Tags</th><th></th></tr></thead>
              <tbody>
                ${res.map(r => `
                  <tr data-id="${escapeHtml(r.id)}">
                    <td><input class="input" data-field="title" value="${escapeHtml(r.title)}" placeholder="Title" /></td>
                    <td><input class="input" data-field="url" value="${escapeHtml(r.url)}" placeholder="https://..." /></td>
                    <td><input class="input" data-field="category" value="${escapeHtml(r.category)}" placeholder="e.g., UCAS / Tests / Apprenticeships" /></td>
                    <td><input class="input" data-field="tags" value="${escapeHtml(r.tags)}" placeholder="Tags" /></td>
                    <td>
                      <button class="btn btn--ghost" data-open type="button">Open</button>
                      <button class="btn btn--danger" data-del type="button">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `);

    $("#addResBtn").addEventListener("click", () => addResource(true));

    $$("tr[data-id]").forEach(row => {
      const id = row.getAttribute("data-id");
      const r = STATE.resources.find(x => x.id === id);
      if (!r) return;

      row.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        inp.addEventListener("input", () => { r[field] = inp.value; autosave(); });
        inp.addEventListener("blur", () => { r[field] = inp.value; autosave(); });
      });

      row.querySelector("[data-open]").addEventListener("click", () => {
        if (!r.url) return toast("No URL set");
        window.open(r.url, "_blank");
      });

      row.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this link?")) return;
        STATE.resources = STATE.resources.filter(x => x.id !== id);
        autosave(true);
        pageResources();
      });
    });
  }

  function addResource(showToastMsg = false) {
    STATE.resources.unshift({ id: uid(), title: "", url: "", category: "", tags: "", notes: "" });
    autosave(true);
    if (showToastMsg) toast("Link added");
    pageResources();
  }

  // ---- Glossary ----
  function pageGlossary() {
    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Glossary</h2>
              <p class="card__sub">Expandable finance/econ/stats definitions. Add your own below.</p>
            </div>
            <div class="row" style="flex:0; gap:10px;">
              <button class="btn btn--primary" id="addTermBtn" type="button">+ Add Term</button>
            </div>
          </div>
          <div class="card__body">
            <div class="grid" id="terms"></div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Quick “Next Steps” Prompts</h2>
              <p class="card__sub">Use these as weekly prompts to stay consistent.</p>
            </div>
          </div>
          <div class="card__body">
            <ul style="margin:0; padding-left:18px; color: var(--text1); line-height:1.6;">
              <li>Log 2 new apprenticeships to research this week.</li>
              <li>Do 2 numerical reasoning practice sessions and record scores.</li>
              <li>Add 1 supercurricular item and write a reflection paragraph.</li>
              <li>Update UCAS choice notes with entry requirements + why it fits.</li>
              <li>Export a backup JSON once per month.</li>
            </ul>
          </div>
        </div>
      </div>
    `);

    // Store glossary terms inside resources list? We’ll keep it local to this page by using documents as a simple list:
    // Better: keep custom glossary in STATE.settings for simplicity:
    if (!Array.isArray(STATE.settings.customGlossary)) {
      STATE.settings.customGlossary = [];
    }

    const terms = [...BUILTIN_GLOSSARY, ...STATE.settings.customGlossary];

    const termsEl = $("#terms");
    termsEl.innerHTML = terms.map((t, idx) => `
      <details class="accordion" ${idx < 3 ? "open" : ""} data-term-index="${idx}">
        <summary>${escapeHtml(t.term)}</summary>
        <div class="acc-body">
          <div class="muted">${escapeHtml(t.def)}</div>
          ${idx >= BUILTIN_GLOSSARY.length ? `
            <div style="margin-top:12px;">
              <button class="btn btn--danger" data-delcustom="${idx - BUILTIN_GLOSSARY.length}" type="button">Delete custom term</button>
            </div>
          ` : ""}
        </div>
      </details>
    `).join("");

    $("#addTermBtn").addEventListener("click", () => {
      const term = prompt("Term name:");
      if (!term) return;
      const def = prompt("Definition:");
      if (!def) return;
      STATE.settings.customGlossary.unshift({ term, def });
      autosave(true);
      pageGlossary();
    });

    $$("[data-delcustom]").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-delcustom"));
        if (!confirm("Delete this custom glossary term?")) return;
        STATE.settings.customGlossary.splice(i, 1);
        autosave(true);
        pageGlossary();
      });
    });
  }

  // ---- Deadlines ----
  function pageDeadlines() {
    const list = STATE.deadlines.slice().sort((a,b) => (a.date || "").localeCompare(b.date || ""));

    setPage(`
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">Deadlines</h2>
            <p class="card__sub">Track everything that has a date (registrations, tests, open days, application cutoffs).</p>
          </div>
          <div class="row" style="flex:0; gap:10px;">
            <button class="btn btn--primary" id="addDLBtn" type="button">+ Add Deadline</button>
          </div>
        </div>
        <div class="card__body">
          ${list.length === 0 ? `<div class="muted">No deadlines yet.</div>` : `
            <table class="table">
              <thead><tr><th>Done</th><th>Date</th><th>Title</th><th>Related</th><th>Notes</th><th></th></tr></thead>
              <tbody>
                ${list.map(d => `
                  <tr data-id="${escapeHtml(d.id)}">
                    <td style="width:60px;">
                      <input type="checkbox" data-field="done" ${d.done ? "checked" : ""} />
                    </td>
                    <td style="min-width:140px;">
                      <input class="input" type="date" data-field="date" value="${escapeHtml(d.date || "")}" />
                    </td>
                    <td>
                      <input class="input" data-field="title" value="${escapeHtml(d.title || "")}" placeholder="Deadline title" />
                    </td>
                    <td class="muted small" style="min-width:120px;">
                      ${escapeHtml(d.relatedType || "")}
                    </td>
                    <td>
                      <input class="input" data-field="notes" value="${escapeHtml(d.notes || "")}" placeholder="Notes" />
                    </td>
                    <td style="width:90px;">
                      <button class="btn btn--danger" data-del type="button">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `);

    $("#addDLBtn").addEventListener("click", () => addDeadline(true));

    $$("tr[data-id]").forEach(row => {
      const id = row.getAttribute("data-id");
      const d = STATE.deadlines.find(x => x.id === id);
      if (!d) return;

      row.querySelectorAll("[data-field]").forEach(inp => {
        const field = inp.getAttribute("data-field");
        if (inp.type === "checkbox") {
          inp.addEventListener("change", () => { d[field] = inp.checked; autosave(); });
        } else {
          inp.addEventListener("input", () => { d[field] = inp.value; autosave(); });
          inp.addEventListener("blur", () => { d[field] = inp.value; autosave(); });
        }
      });

      row.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Delete this deadline?")) return;
        STATE.deadlines = STATE.deadlines.filter(x => x.id !== id);
        autosave(true);
        pageDeadlines();
      });
    });
  }

  function addDeadline(showToastMsg = false) {
    STATE.deadlines.unshift({ id: uid(), title: "", date: "", relatedType: "", relatedId: "", notes: "", done: false });
    autosave(true);
    if (showToastMsg) toast("Deadline added");
    pageDeadlines();
  }

  // ---- Settings ----
  function pageSettings() {
    setPage(`
      <div class="grid grid-2">
        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">Profile</h2>
              <p class="card__sub">Basic info + important links. These help readiness scoring.</p>
            </div>
          </div>
          <div class="card__body">
            <div class="grid grid-2">
              <div>
                <label class="small muted">Name</label>
                <input class="input" data-bind="profile.name" value="${escapeHtml(bindRead("profile.name"))}" />
              </div>
              <div>
                <label class="small muted">School / College</label>
                <input class="input" data-bind="profile.school" value="${escapeHtml(bindRead("profile.school"))}" />
              </div>
              <div>
                <label class="small muted">Target year</label>
                <input class="input" data-bind="profile.targetYear" value="${escapeHtml(bindRead("profile.targetYear"))}" />
              </div>
              <div>
                <label class="small muted">Path</label>
                <input class="input" data-bind="profile.intendedPath" value="${escapeHtml(bindRead("profile.intendedPath"))}" />
              </div>
              <div>
                <label class="small muted">Email</label>
                <input class="input" data-bind="profile.email" value="${escapeHtml(bindRead("profile.email"))}" />
              </div>
              <div>
                <label class="small muted">UCAS email</label>
                <input class="input" data-bind="profile.ucasEmail" value="${escapeHtml(bindRead("profile.ucasEmail"))}" />
              </div>
              <div style="grid-column:1/-1;">
                <label class="small muted">Predicted grades</label>
                <input class="input" data-bind="profile.predicted" value="${escapeHtml(bindRead("profile.predicted"))}" placeholder="e.g., A*A*A, or A*AA" />
              </div>
              <div style="grid-column:1/-1;">
                <label class="small muted">GCSEs</label>
                <input class="input" data-bind="profile.gcse" value="${escapeHtml(bindRead("profile.gcse"))}" placeholder="e.g., 999888777" />
              </div>
            </div>

            <hr class="sep" />

            <h3 style="margin:0 0 10px 0;">Important links</h3>
            <div class="grid grid-2">
              <div>
                <label class="small muted">LinkedIn</label>
                <input class="input" data-bind="profile.links.linkedin" value="${escapeHtml(bindRead("profile.links.linkedin"))}" placeholder="https://..." />
              </div>
              <div>
                <label class="small muted">GitHub</label>
                <input class="input" data-bind="profile.links.github" value="${escapeHtml(bindRead("profile.links.github"))}" placeholder="https://..." />
              </div>
              <div>
                <label class="small muted">Portfolio</label>
                <input class="input" data-bind="profile.links.portfolio" value="${escapeHtml(bindRead("profile.links.portfolio"))}" placeholder="https://..." />
              </div>
              <div>
                <label class="small muted">Drive folder (CV/certs)</label>
                <input class="input" data-bind="profile.links.drive" value="${escapeHtml(bindRead("profile.links.drive"))}" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h2 class="card__title">App Settings & Backup</h2>
              <p class="card__sub">Theme, autosave, export/import, reset.</p>
            </div>
          </div>
          <div class="card__body">
            <div class="grid">
              <div class="row" style="align-items:flex-end;">
                <div>
                  <label class="small muted">Theme</label>
                  <select class="select" id="themeSelect">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div>
                  <label class="small muted">Autosave</label>
                  <select class="select" id="autosaveSelect">
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-2">
                <button class="btn btn--primary" id="saveNowBtn" type="button">Save now</button>
                <button class="btn btn--ghost" id="exportNowBtn" type="button">Export backup</button>
              </div>

              <div class="grid grid-2">
                <label class="btn btn--ghost file-btn">
                  Import backup
                  <input id="importNowInput" type="file" accept="application/json" />
                </label>
                <button class="btn btn--danger" id="resetBtn" type="button">Reset app</button>
              </div>

              <div class="small muted">
                Storage is saved on this browser/computer only. Export monthly to keep it safe.
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    const themeSelect = $("#themeSelect");
    themeSelect.value = STATE.settings.theme || "dark";
    themeSelect.addEventListener("change", () => {
      applyTheme(themeSelect.value);
      autosave(true);
      toast("Theme updated");
    });

    const autosaveSelect = $("#autosaveSelect");
    autosaveSelect.value = String(STATE.settings.autosave !== false);
    autosaveSelect.addEventListener("change", () => {
      STATE.settings.autosave = autosaveSelect.value === "true";
      autosave(true);
      toast("Autosave updated");
    });

    $("#saveNowBtn").addEventListener("click", () => saveState(true));
    $("#exportNowBtn").addEventListener("click", () => doExport());

    $("#importNowInput").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const data = safeParseJSON(text);
      if (!data) return toast("Invalid JSON file");
      if (!confirm("Import this backup? This will overwrite current data.")) return;
      STATE = data;
      applyTheme(STATE.settings?.theme || "dark");
      saveState(true);
      router.render();
      toast("Imported backup");
    });

    $("#resetBtn").addEventListener("click", () => {
      if (!confirm("Reset EVERYTHING? This cannot be undone unless you exported a backup.")) return;
      STATE = defaultState();
      applyTheme(STATE.settings.theme);
      saveState(true);
      router.go("/dashboard");
      toast("Reset complete");
    });
  }

  // ---------- Global Export / Import ----------
  function doExport() {
    const fileName = `launchpad-backup-${nowISODate()}.json`;
    downloadText(fileName, JSON.stringify(STATE, null, 2));
    toast("Exported backup JSON");
  }

  // ---------- Autosave wrapper ----------
  function autosave(forceToast = false) {
    if (STATE.settings.autosave) saveState(false);
    if (forceToast) saveState(true);
  }

  // ---------- App Wiring ----------
  function wireTopbar() {
    $("#saveBtn").addEventListener("click", () => saveState(true));
    $("#exportBtn").addEventListener("click", () => doExport());

    $("#importInput").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const data = safeParseJSON(text);
      if (!data) return toast("Invalid JSON file");
      if (!confirm("Import this backup? This will overwrite current data.")) return;
      STATE = data;
      applyTheme(STATE.settings?.theme || "dark");
      saveState(true);
      router.render();
      toast("Imported backup");
    });

    $("#themeToggleBtn").addEventListener("click", () => {
      const next = (STATE.settings.theme === "dark") ? "light" : "dark";
      applyTheme(next);
      saveState(false);
      toast(`Theme: ${next}`);
    });

    // Global search: Enter triggers results overlay in page area
    const search = $("#globalSearch");
    search.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = (search.value || "").trim().toLowerCase();
      if (!q) return;
      const index = buildSearchIndex(STATE);
      const results = index.filter(x => (x.title + " " + x.text).toLowerCase().includes(q));
      openSearchModal(results);
    });
  }

  function wireSidebar() {
    $("#toggleSidebarBtn").addEventListener("click", () => {
      const sb = $("#sidebar");
      // desktop collapse could be implemented; for now just a toast
      toast("Tip: On mobile, use ☰ to open/close menu.");
    });

    $("#mobileMenuBtn").addEventListener("click", () => {
      $("#sidebar").classList.toggle("is-open");
    });

    // close sidebar on nav click (mobile)
    $$(".nav__item").forEach(a => a.addEventListener("click", () => {
      $("#sidebar").classList.remove("is-open");
    }));
  }

  // ---------- Register routes ----------
  router.register("/dashboard", "Dashboard", pageDashboard);
  router.register("/ucas", "UCAS Tracker", pageUCAS);
  router.register("/apprenticeships", "Degree Apprenticeships", pageApprenticeships);
  router.register("/personal-statement", "Personal Statement", pagePersonalStatement);
  router.register("/entry-tests", "Entry Tests & Prep", pageEntryTests);
  router.register("/supercurricular", "Supercurricular Planner", pageSupercurricular);
  router.register("/documents", "Documents & Evidence", pageDocuments);
  router.register("/resources", "Links & Resources", pageResources);
  router.register("/glossary", "Glossary & Ideas", pageGlossary);
  router.register("/deadlines", "Deadlines", pageDeadlines);
  router.register("/settings", "Settings & Backup", pageSettings);

  // ---------- Init ----------
  function init() {
    applyTheme(STATE.settings.theme || "dark");
    wireTopbar();
    wireSidebar();

    window.addEventListener("hashchange", () => router.render());
    // default route
    if (!location.hash) location.hash = "#/dashboard";
    router.render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
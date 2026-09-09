// GenAI Leader Exam Practice - client-side app (no build step, no framework)

(function () {
  "use strict";

  const { EXAM_SECTIONS, PRACTICE_QUESTIONS, GLOSSARY } = EXAM_DATA;

  // ---------- Tab switching ----------
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  // ---------- Quiz state ----------
  let quizQuestions = PRACTICE_QUESTIONS.slice();
  let currentIndex = 0;
  let answers = {}; // questionId -> selectedIndex
  let score = 0;

  const sectionFilter = document.getElementById("sectionFilter");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const quizCard = document.getElementById("quizCard");
  const quizStatus = document.getElementById("quizStatus");
  const quizProgressFill = document.getElementById("quizProgressFill");
  const scoreSummary = document.getElementById("scoreSummary");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // populate section filter
  EXAM_SECTIONS.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.title;
    sectionFilter.appendChild(opt);
  });

  function applyFilters() {
    const sec = sectionFilter.value;
    const diff = difficultyFilter.value;
    quizQuestions = PRACTICE_QUESTIONS.filter((q) => {
      const secOk = sec === "all" || q.sectionId === sec;
      const diffOk = diff === "all" || q.difficulty === diff;
      return secOk && diffOk;
    });
    currentIndex = 0;
    answers = {};
    score = 0;
    scoreSummary.classList.add("hidden");
    renderQuestion();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sectionTitle(id) {
    const s = EXAM_SECTIONS.find((x) => x.id === id);
    return s ? s.title : id;
  }

  function renderQuestion() {
    if (quizQuestions.length === 0) {
      quizCard.innerHTML = "<p>No questions match the selected filters.</p>";
      quizStatus.textContent = "";
      quizProgressFill.style.width = "0%";
      return;
    }
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= quizQuestions.length) {
      showSummary();
      return;
    }

    scoreSummary.classList.add("hidden");
    const q = quizQuestions[currentIndex];
    const savedAnswer = answers[q.id];

    quizStatus.textContent = `Question ${currentIndex + 1} of ${quizQuestions.length} | Score: ${score}`;
    quizProgressFill.style.width = `${((currentIndex) / quizQuestions.length) * 100}%`;

    let html = `
      <div class="question-meta">
        <span>${sectionTitle(q.sectionId)}</span>
        <span>${q.difficulty}</span>
      </div>
      <div class="question-text">${escapeHtml(q.question)}</div>
      <div class="options">
    `;

    q.options.forEach((opt, i) => {
      let cls = "option";
      let disabled = "";
      if (savedAnswer !== undefined) {
        disabled = "disabled";
        if (i === q.correctIndex) cls += " correct";
        else if (i === savedAnswer) cls += " incorrect";
      }
      html += `<button class="${cls}" data-index="${i}" ${disabled}>${escapeHtml(opt)}</button>`;
    });

    html += `</div>`;

    if (savedAnswer !== undefined) {
      html += `
        <div class="explanation">
          <h4>Explanation</h4>
          <p>${escapeHtml(q.explanation)}</p>
          ${
            q.whyOthersWrong && q.whyOthersWrong.length
              ? `<h4>Why other options are wrong</h4><ul>${q.whyOthersWrong
                  .map((w) => `<li>${escapeHtml(w)}</li>`)
                  .join("")}</ul>`
              : ""
          }
          ${q.officialDoc ? `<p><a href="${q.officialDoc}" target="_blank" rel="noopener">Official documentation &rarr;</a></p>` : ""}
        </div>
      `;
    }

    quizCard.innerHTML = html;

    quizCard.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => selectAnswer(q, parseInt(btn.dataset.index, 10)));
    });
  }

  function selectAnswer(q, index) {
    if (answers[q.id] !== undefined) return; // already answered
    answers[q.id] = index;
    if (index === q.correctIndex) score++;
    renderQuestion();
  }

  function showSummary() {
    quizCard.innerHTML = "";
    quizProgressFill.style.width = "100%";
    const total = quizQuestions.length;
    const pct = total ? Math.round((score / total) * 100) : 0;
    quizStatus.textContent = "Quiz complete!";
    scoreSummary.classList.remove("hidden");
    scoreSummary.innerHTML = `
      <h2>Results</h2>
      <p>You scored <strong>${score} / ${total}</strong> (${pct}%)</p>
      <p>${pct >= 80 ? "Great job — you're exam ready!" : pct >= 60 ? "Good progress, review the missed topics." : "Keep practicing, focus on the study Q&A tab."}</p>
    `;
  }

  prevBtn.addEventListener("click", () => {
    currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    renderQuestion();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex++;
    renderQuestion();
  });

  document.getElementById("shuffleBtn").addEventListener("click", () => {
    quizQuestions = shuffle(quizQuestions);
    currentIndex = 0;
    renderQuestion();
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    answers = {};
    score = 0;
    currentIndex = 0;
    scoreSummary.classList.add("hidden");
    renderQuestion();
  });

  sectionFilter.addEventListener("change", applyFilters);
  difficultyFilter.addEventListener("change", applyFilters);

  // ---------- Study Q&A ----------
  const studyList = document.getElementById("studyList");
  const studySearch = document.getElementById("studySearch");

  function renderStudy(filterText) {
    const term = (filterText || "").toLowerCase().trim();
    let html = "";
    EXAM_SECTIONS.forEach((section) => {
      let sectionHtml = "";
      section.topics.forEach((topic) => {
        if (!topic.studyQA || !topic.studyQA.length) return;
        const items = topic.studyQA.filter((qa) => {
          if (!term) return true;
          return (
            qa.question.toLowerCase().includes(term) ||
            qa.answer.toLowerCase().includes(term)
          );
        });
        if (!items.length) return;
        sectionHtml += `<div class="study-topic"><h3>${escapeHtml(topic.title)}</h3>`;
        items.forEach((qa, idx) => {
          sectionHtml += `
            <div class="qa-item">
              <div class="q">Q: ${escapeHtml(qa.question)}</div>
              <div class="a">${escapeHtml(qa.answer)}${
                qa.officialSource
                  ? ` <br/><a href="${qa.officialSource}" target="_blank" rel="noopener">Source &rarr;</a>`
                  : ""
              }</div>
            </div>
          `;
        });
        sectionHtml += `</div>`;
      });
      if (sectionHtml) {
        html += `<div class="study-section"><h2>${escapeHtml(section.title)}</h2>${sectionHtml}</div>`;
      }
    });
    studyList.innerHTML = html || "<p>No matching study questions found.</p>";

    studyList.querySelectorAll(".qa-item .q").forEach((q) => {
      q.addEventListener("click", () => {
        q.parentElement.classList.toggle("open");
      });
    });
  }

  studySearch.addEventListener("input", (e) => renderStudy(e.target.value));

  // ---------- Glossary ----------
  const glossaryList = document.getElementById("glossaryList");
  const glossarySearch = document.getElementById("glossarySearch");

  function renderGlossary(filterText) {
    const term = (filterText || "").toLowerCase().trim();
    const items = GLOSSARY.filter((g) => {
      if (!term) return true;
      return (
        g.term.toLowerCase().includes(term) ||
        g.definition.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term)
      );
    });
    glossaryList.innerHTML = items
      .map(
        (g) => `
        <div class="glossary-item">
          <div class="term">${escapeHtml(g.term)}</div>
          <div class="cat">${escapeHtml(g.category)}</div>
          <div class="def">${escapeHtml(g.definition)}</div>
        </div>
      `
      )
      .join("") || "<p>No matching terms found.</p>";
  }

  glossarySearch.addEventListener("input", (e) => renderGlossary(e.target.value));

  // ---------- Utils ----------
  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------- Init ----------
  renderQuestion();
  renderStudy("");
  renderGlossary("");
})();

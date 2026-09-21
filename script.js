const GITHUB_USER = "noctherias";
const PROJECT_LIMIT = 4;

document.getElementById("year").textContent = new Date().getFullYear();

const backdrop = document.getElementById("panelBackdrop");
const panels = [...document.querySelectorAll(".panel")];

function closePanels() {
  backdrop.classList.remove("open");
  panels.forEach(panel => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });
}

function openPanel(name) {
  closePanels();
  const panel = document.getElementById(`panel-${name}`);
  if (!panel) return;

  backdrop.classList.add("open");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

document.querySelectorAll("[data-panel]").forEach(button => {
  button.addEventListener("click", () => openPanel(button.dataset.panel));
});

document.querySelectorAll(".panel-close").forEach(button => {
  button.addEventListener("click", closePanels);
});

backdrop.addEventListener("click", closePanels);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();
});

const cursorGlow = document.getElementById("cursorGlow");
const heroArt = document.getElementById("heroArt");
const stage = document.querySelector(".gengar-stage");

document.addEventListener("pointermove", event => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

heroArt?.addEventListener("pointermove", event => {
  if (window.matchMedia("(max-width: 760px)").matches) return;

  const rect = heroArt.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  stage.style.transform = `
    rotateY(${x * 7}deg)
    rotateX(${y * -6}deg)
    translate3d(${x * 8}px, ${y * 8}px, 0)
  `;
});

heroArt?.addEventListener("pointerleave", () => {
  stage.style.transform = "";
});

const artwork = document.getElementById("gengarArtwork");

let switchedToRemote = false;

artwork.addEventListener("error", () => {
  if (!switchedToRemote) {
    switchedToRemote = true;
    artwork.src = artwork.dataset.fallback;
    return;
  }

  artwork.style.opacity = "0";
});

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function repoCard(repo, index) {
  const description = repo.description || "Öffentliches Projekt von Noctherias.";
  const language = repo.language || "Repository";

  return `
    <article class="project-card">
      <span class="card-index">${String(index + 1).padStart(2, "0")} // ${escapeHtml(language).toUpperCase()}</span>
      <h3>${escapeHtml(repo.name)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="card-meta">
        <span>★ ${repo.stargazers_count} · ${repo.forks_count} forks</span>
        <a href="${repo.html_url}" target="_blank" rel="noreferrer">Öffnen ↗</a>
      </div>
    </article>
  `;
}

async function loadProjects() {
  const grid = document.getElementById("projectGrid");

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
    );

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const repos = await response.json();

    const selected = repos
      .filter(repo => !repo.fork && !repo.archived)
      .sort((a, b) => {
        const scoreA =
          a.stargazers_count * 4 +
          a.forks_count * 2 +
          new Date(a.updated_at).getTime() / 1e12;

        const scoreB =
          b.stargazers_count * 4 +
          b.forks_count * 2 +
          new Date(b.updated_at).getTime() / 1e12;

        return scoreB - scoreA;
      })
      .slice(0, PROJECT_LIMIT);

    if (!selected.length) throw new Error("Keine Repositories");

    grid.innerHTML = selected.map(repoCard).join("");
  } catch (error) {
    console.error(error);

    grid.innerHTML = `
      <article class="project-card">
        <span class="card-index">01 // GITHUB</span>
        <h3>Repositories öffnen</h3>
        <p>Die GitHub-API konnte gerade nicht geladen werden.</p>
        <div class="card-meta">
          <span>@noctherias</span>
          <a href="https://github.com/noctherias?tab=repositories" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </article>
      <article class="project-card">
        <span class="card-index">02 // VOID</span>
        <h3>Noctherias</h3>
        <p>Code, Tools, Interfaces und Experimente aus der Nacht.</p>
        <div class="card-meta">
          <span>Dark Cosmic</span>
          <span>2026</span>
        </div>
      </article>
      <article class="project-card">
        <span class="card-index">03 // STACK</span>
        <h3>Python + C#</h3>
        <p>Automatisierung, Desktop-Anwendungen und eigene Werkzeuge.</p>
        <div class="card-meta">
          <span>Development</span>
          <span>Active</span>
        </div>
      </article>
      <article class="project-card">
        <span class="card-index">04 // NIGHT</span>
        <h3>Dark Interface</h3>
        <p>Eine kompakte One-Screen-Oberfläche ohne klassisches Scroll-Layout.</p>
        <div class="card-meta">
          <span>UI</span>
          <span>Live</span>
        </div>
      </article>
    `;
  }
}

loadProjects();

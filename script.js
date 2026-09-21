const GITHUB_USER = "noctherias";
const MAX_PROJECTS = 6;

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("de-CH", {
    year: "numeric",
    month: "short"
  }).format(new Date(dateString));
}

function repositoryCard(repo) {
  const description = repo.description || "Öffentliches GitHub-Projekt von Noctherias.";
  const language = repo.language || "Repository";

  return `
    <article class="project-card reveal">
      <div class="card-top">
        <span class="project-icon">✦</span>
        <span class="project-type">${escapeHtml(language)}</span>
      </div>

      <h3>${escapeHtml(repo.name)}</h3>
      <p>${escapeHtml(description)}</p>

      <div class="project-footer">
        <span>★ ${repo.stargazers_count} · ${formatDate(repo.updated_at)}</span>
        <a href="${repo.html_url}" target="_blank" rel="noreferrer">Öffnen ↗</a>
      </div>
    </article>
  `;
}

async function loadProjects() {
  const projectGrid = document.getElementById("projectGrid");

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
    );

    if (!response.ok) {
      throw new Error(`GitHub API: ${response.status}`);
    }

    const repos = await response.json();

    const visibleRepos = repos
      .filter(repo => !repo.fork && !repo.archived)
      .sort((a, b) => {
        const scoreA = (a.stargazers_count * 3) + (a.forks_count * 2) + new Date(a.updated_at).getTime() / 1e12;
        const scoreB = (b.stargazers_count * 3) + (b.forks_count * 2) + new Date(b.updated_at).getTime() / 1e12;
        return scoreB - scoreA;
      })
      .slice(0, MAX_PROJECTS);

    if (!visibleRepos.length) {
      projectGrid.innerHTML = `
        <article class="project-card">
          <div class="card-top">
            <span class="project-icon">✦</span>
            <span class="project-type">GitHub</span>
          </div>
          <h3>Noch keine öffentlichen Projekte gefunden</h3>
          <p>Sobald öffentliche Repositories vorhanden sind, erscheinen sie automatisch hier.</p>
        </article>
      `;
      return;
    }

    projectGrid.innerHTML = visibleRepos.map(repositoryCard).join("");

    projectGrid.querySelectorAll(".reveal").forEach((element) => {
      revealObserver.observe(element);
    });

  } catch (error) {
    console.error(error);

    projectGrid.innerHTML = `
      <article class="project-card">
        <div class="card-top">
          <span class="project-icon">✦</span>
          <span class="project-type">GitHub</span>
        </div>
        <h3>Projekte konnten nicht geladen werden</h3>
        <p>Die GitHub-API war gerade nicht erreichbar. Deine Seite selbst funktioniert trotzdem normal.</p>
        <div class="project-footer">
          <span>noctherias</span>
          <a href="https://github.com/noctherias?tab=repositories" target="_blank" rel="noreferrer">Repositories ↗</a>
        </div>
      </article>
    `;
  }
}
loadProjects();

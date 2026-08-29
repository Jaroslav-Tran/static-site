import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const PORT = 3000;

const NAV = [
  { label: "Home", href: "/" },
  { label: "Advisory", href: "/advisory/" },
  { label: "Field Notes", href: "/field-notes/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

const FIELD_NOTE_CATEGORIES = [
  { name: "Essays", slug: "essays" },
  { name: "Book Notes", slug: "book-notes" },
  { name: "Reviews", slug: "reviews" },
  { name: "The Lab", slug: "the-lab" },
  { name: "Life", slug: "life" },
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugFromFile(filePath) {
  return path.basename(filePath, ".md");
}

function parseDate(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isoDate(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderNav(currentPath) {
  return NAV.map((item) => {
    const currentClass = item.href === currentPath ? " is-current" : "";
    return `<a class="nav-link${currentClass}" href="${item.href}">${item.label}</a>`;
  }).join("\n          ");
}

function newsletterForm() {
  return read(path.join(SRC, "templates", "newsletter.html"));
}

function contactForm(site) {
  const action = site.formspreeId
    ? `https://formspree.io/f/${site.formspreeId}`
    : "";

  return `
    <form class="contact-form" method="post"${action ? ` action="${action}"` : ""} data-form="contact">
      <label>
        Name
        <input type="text" name="name" required>
      </label>
      <label>
        Email
        <input type="email" name="email" required>
      </label>
      <label>
        Message
        <textarea name="message" rows="6" required></textarea>
      </label>
      <button type="submit">Send message</button>
    </form>
  `;
}

export function applyTemplate(template, values) {
  let html = template;
  for (const [key, value] of Object.entries(values)) {
    const replacement = value ?? "";
    html = html.replaceAll(`{{${key}}}`, () => replacement);
  }
  return html;
}

function applyLayout(layout, site, page) {
  const html = applyTemplate(layout, {
    siteTitle: escapeHtml(site.title),
    pageTitle: escapeHtml(page.title),
    description: escapeHtml(page.description || site.description),
    nav: renderNav(page.path),
    content: page.body,
    newsletterForm: newsletterForm(),
    year: String(new Date().getFullYear()),
    bodyClass: page.bodyClass || "",
  });
  return prefixSiteUrls(html, site.basePath);
}

function siteBasePath(site) {
  const fromEnv = process.env.BASE_PATH;
  const raw = fromEnv == null || fromEnv === "" ? site.basePath || "" : fromEnv;
  return String(raw).replace(/\/$/, "");
}

function prefixSiteUrls(html, basePath) {
  const base = String(basePath || "").replace(/\/$/, "");
  if (!base) return html;
  return html.replace(/(href|src|action)="\/(?!\/)/g, `$1="${base}/`);
}

function loadMarkdown(filePath) {
  const parsed = matter(read(filePath));
  return {
    ...parsed.data,
    slug: slugFromFile(filePath),
    contentHtml: marked.parse(parsed.content, { async: false }),
  };
}

function blogIndexHtml(template, posts) {
  const items = posts
    .map(
      (post) => `
        <li>
          <a href="/blog/${post.slug}/">
            <span class="post-date">${escapeHtml(formatDate(post.date))}</span>
            <strong>${escapeHtml(post.title)}</strong>
            <span>${escapeHtml(post.description || "")}</span>
          </a>
        </li>`,
    )
    .join("");

  return applyTemplate(template, { posts: items });
}

function pageBody(page) {
  const title = page.showTitle === false ? "" : `<h1>${escapeHtml(page.title)}</h1>`;
  const extra = page.extraHtml || "";
  return `
    <article class="page wrap">
      ${title}
      <div class="prose">${page.contentHtml}</div>
      ${extra}
    </article>
  `;
}

function postBody(template, post) {
  return applyTemplate(template, {
    title: escapeHtml(post.title),
    description: escapeHtml(post.description || ""),
    date: escapeHtml(formatDate(post.date)),
    isoDate: escapeHtml(isoDate(post.date)),
    content: post.contentHtml,
  });
}

function collectPosts() {
  const blogDir = path.join(SRC, "content", "blog");
  return fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => loadMarkdown(path.join(blogDir, name)))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function findCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  return (
    FIELD_NOTE_CATEGORIES.find((item) => item.name.toLowerCase() === raw || item.slug === raw) ||
    null
  );
}

function normalizeTags(tags) {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : String(tags).split(",");
  return list.map((tag) => String(tag).trim()).filter(Boolean);
}

function collectFieldNotes() {
  const notesDir = path.join(SRC, "content", "field-notes");
  fs.mkdirSync(notesDir, { recursive: true });
  return fs
    .readdirSync(notesDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const note = loadMarkdown(path.join(notesDir, name));
      const category = findCategory(note.category);
      if (!category) {
        throw new Error(
          `${name}: category must be one of ${FIELD_NOTE_CATEGORIES.map((item) => item.name).join(", ")}`,
        );
      }
      return {
        ...note,
        category: category.name,
        categorySlug: category.slug,
        tags: normalizeTags(note.tags),
        url: `/field-notes/${category.slug}/${note.slug}/`,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function categoryNavHtml(currentSlug) {
  const links = [
    `<a class="${currentSlug ? "" : "is-current"}" href="/field-notes/">All</a>`,
    ...FIELD_NOTE_CATEGORIES.map(
      (item) =>
        `<a class="${item.slug === currentSlug ? "is-current" : ""}" href="/field-notes/${item.slug}/">${escapeHtml(item.name)}</a>`,
    ),
  ];
  return `<nav class="category-nav">${links.join("")}</nav>`;
}

function fieldNoteListHtml(notes) {
  if (!notes.length) {
    return `<p class="lede">No notes in this category yet.</p>`;
  }
  return `<ul class="post-list">${notes
    .map(
      (note) => `
        <li>
          <a href="${note.url}">
            <span class="post-date">${escapeHtml(formatDate(note.date))} · ${escapeHtml(note.category)}</span>
            <strong>${escapeHtml(note.title)}</strong>
            <span>${escapeHtml(note.description || "")}</span>
          </a>
        </li>`,
    )
    .join("")}</ul>`;
}

function fieldNoteIndexBody(template, { title, lede, currentSlug, notes }) {
  return applyTemplate(template, {
    title: escapeHtml(title),
    lede: escapeHtml(lede),
    categoryNav: categoryNavHtml(currentSlug),
    posts: fieldNoteListHtml(notes),
  });
}

function fieldNotePostBody(template, note) {
  const tags = note.tags.length
    ? `<p class="post-tags">${note.tags.map((tag) => escapeHtml(tag)).join(" · ")}</p>`
    : "";
  return applyTemplate(template, {
    title: escapeHtml(note.title),
    description: escapeHtml(note.description || ""),
    date: escapeHtml(formatDate(note.date)),
    isoDate: escapeHtml(isoDate(note.date)),
    category: escapeHtml(note.category),
    categorySlug: note.categorySlug,
    tags,
    content: note.contentHtml,
  });
}

function buildFieldNotes(layout, site) {
  const indexTemplate = read(path.join(SRC, "templates", "field-notes-index.html"));
  const postTemplate = read(path.join(SRC, "templates", "field-notes-post.html"));
  const notes = collectFieldNotes();

  write(
    path.join(DIST, "field-notes", "index.html"),
    applyLayout(layout, site, {
      title: "Field Notes",
      description: "Essays, reviews, and notes from a curious life.",
      path: "/field-notes/",
      bodyClass: "inner",
      body: fieldNoteIndexBody(indexTemplate, {
        title: "Field Notes",
        lede: "Essays, book notes, reviews, experiments, and life — filed as they happen.",
        currentSlug: "",
        notes,
      }),
    }),
  );

  for (const category of FIELD_NOTE_CATEGORIES) {
    const inCategory = notes.filter((note) => note.categorySlug === category.slug);
    write(
      path.join(DIST, "field-notes", category.slug, "index.html"),
      applyLayout(layout, site, {
        title: category.name,
        description: `${category.name} in Field Notes.`,
        path: `/field-notes/${category.slug}/`,
        bodyClass: "inner",
        body: fieldNoteIndexBody(indexTemplate, {
          title: category.name,
          lede: `Notes in ${category.name}.`,
          currentSlug: category.slug,
          notes: inCategory,
        }),
      }),
    );
  }

  for (const note of notes) {
    write(
      path.join(DIST, "field-notes", note.categorySlug, note.slug, "index.html"),
      applyLayout(layout, site, {
        title: note.title,
        description: note.description,
        path: note.url,
        bodyClass: "inner",
        body: fieldNotePostBody(postTemplate, note),
      }),
    );
  }

  return notes.length;
}

function build() {
  const site = JSON.parse(read(path.join(SRC, "site.json")));
  site.basePath = siteBasePath(site);
  const layout = read(path.join(SRC, "templates", "layout.html"));
  const blogTemplate = read(path.join(SRC, "templates", "blog.html"));
  const blogIndexTemplate = read(path.join(SRC, "templates", "blog-index.html"));
  const posts = collectPosts();

  emptyDir(DIST);
  copyDir(path.join(SRC, "styles"), path.join(DIST, "styles"));
  copyDir(path.join(SRC, "js"), path.join(DIST, "js"));
  copyDir(path.join(SRC, "assets"), path.join(DIST, "assets"));
  copyDir(path.join(SRC, "static"), DIST);
  write(path.join(DIST, ".nojekyll"), "");

  write(
    path.join(DIST, "index.html"),
    applyLayout(layout, site, {
      title: site.title,
      description: site.description,
      path: "/",
      bodyClass: "home",
      body: read(path.join(SRC, "index.html")),
    }),
  );

  const pagesDir = path.join(SRC, "content", "pages");
  for (const name of fs.readdirSync(pagesDir).filter((file) => file.endsWith(".md"))) {
    const page = loadMarkdown(path.join(pagesDir, name));
    if (page.slug === "field-notes") continue;
    const extraHtml = page.slug === "contact" ? contactForm(site) : "";
    const html = applyLayout(layout, site, {
      title: page.title,
      description: page.description,
      path: `/${page.slug}/`,
      bodyClass: "inner",
      body: pageBody({ ...page, extraHtml }),
    });
    write(path.join(DIST, page.slug, "index.html"), html);
  }

  write(
    path.join(DIST, "blog", "index.html"),
    applyLayout(layout, site, {
      title: "Blog",
      description: "Notes, updates, and longer writing.",
      path: "/blog/",
      bodyClass: "inner",
      body: blogIndexHtml(blogIndexTemplate, posts),
    }),
  );

  for (const post of posts) {
    write(
      path.join(DIST, "blog", post.slug, "index.html"),
      applyLayout(layout, site, {
        title: post.title,
        description: post.description,
        path: `/blog/${post.slug}/`,
        bodyClass: "inner",
        body: postBody(blogTemplate, post),
      }),
    );
  }

  const fieldNoteCount = buildFieldNotes(layout, site);

  console.log(`Built ${posts.length} blog posts, ${fieldNoteCount} field notes, and the site pages into dist/`);
}

function contentType(filePath) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8",
  };
  return types[path.extname(filePath)] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((request, response) => {
    const urlPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const requested = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(DIST, requested);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    } else if (!path.extname(filePath) && fs.existsSync(filePath + ".html")) {
      filePath += ".html";
    } else if (!path.extname(filePath) && fs.existsSync(path.join(filePath, "index.html"))) {
      filePath = path.join(filePath, "index.html");
    }

    if (!filePath.startsWith(DIST) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });

  server.listen(PORT, () => {
    console.log(`Watching src/ and serving http://localhost:${PORT}`);
  });
}

function watchSources() {
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (error) {
        console.error(error);
      }
    }, 150);
  };

  fs.mkdirSync(path.join(SRC, "content", "field-notes"), { recursive: true });

  const dirs = [
    path.join(SRC, "content", "pages"),
    path.join(SRC, "content", "blog"),
    path.join(SRC, "content", "field-notes"),
    path.join(SRC, "templates"),
    path.join(SRC, "styles"),
    path.join(SRC, "js"),
    path.join(SRC, "static"),
    path.join(SRC, "assets"),
  ];

  for (const dir of dirs) {
    fs.watch(dir, schedule);
  }
  fs.watch(path.join(SRC, "site.json"), schedule);
  fs.watch(path.join(SRC, "index.html"), schedule);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  build();
  if (process.argv.includes("--watch")) {
    startServer();
    watchSources();
  }
}

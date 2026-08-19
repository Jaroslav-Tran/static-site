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
  { label: "Blog", href: "/blog/" },
  { label: "About", href: "/about/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
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

function newsletterForm(site) {
  const action = site.convertKitFormId
    ? `https://app.convertkit.com/forms/${site.convertKitFormId}/subscriptions`
    : "";

  return `
    <form class="signup-form" method="post"${action ? ` action="${action}"` : ""} data-form="newsletter">
      <label class="sr-only" for="newsletter-email">Email address</label>
      <input id="newsletter-email" type="email" name="email_address" placeholder="you@example.com" required>
      <button type="submit">Subscribe</button>
    </form>
  `;
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

function applyLayout(layout, site, page) {
  return layout
    .replaceAll("{{siteTitle}}", escapeHtml(site.title))
    .replaceAll("{{pageTitle}}", escapeHtml(page.title))
    .replaceAll("{{description}}", escapeHtml(page.description || site.description))
    .replaceAll("{{nav}}", renderNav(page.path))
    .replaceAll("{{content}}", page.body)
    .replaceAll("{{newsletterForm}}", newsletterForm(site))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replaceAll("{{bodyClass}}", page.bodyClass || "");
}

function loadMarkdown(filePath) {
  const parsed = matter(read(filePath));
  return {
    ...parsed.data,
    slug: slugFromFile(filePath),
    contentHtml: marked.parse(parsed.content, { async: false }),
  };
}

function latestPostsHtml(posts) {
  const items = posts
    .slice(0, 3)
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

  return `
    <section class="latest-posts">
      <div class="section-heading">
        <h2>Latest from the blog</h2>
        <a href="/blog/">See all posts</a>
      </div>
      <ul class="post-list">${items}</ul>
    </section>
  `;
}

function blogIndexHtml(posts) {
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

  return `
    <article class="page">
      <h1>Blog</h1>
      <p class="lede">Notes, updates, and longer writing.</p>
      <ul class="post-list">${items}</ul>
    </article>
  `;
}

function pageBody(page) {
  const title = page.showTitle === false ? "" : `<h1>${escapeHtml(page.title)}</h1>`;
  const extra = page.extraHtml || "";
  return `
    <article class="page">
      ${title}
      <div class="prose">${page.contentHtml}</div>
      ${extra}
    </article>
  `;
}

function postBody(post) {
  return `
    <article class="page post">
      <p class="meta"><a href="/blog/">Blog</a> · <time datetime="${escapeHtml(isoDate(post.date))}">${escapeHtml(formatDate(post.date))}</time></p>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="prose">${post.contentHtml}</div>
    </article>
  `;
}

function collectPosts() {
  const blogDir = path.join(SRC, "content", "blog");
  return fs
    .readdirSync(blogDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => loadMarkdown(path.join(blogDir, name)))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function build() {
  const site = JSON.parse(read(path.join(SRC, "site.json")));
  const layout = read(path.join(SRC, "templates", "layout.html"));
  const posts = collectPosts();

  emptyDir(DIST);
  copyDir(path.join(SRC, "styles"), path.join(DIST, "styles"));
  copyDir(path.join(SRC, "js"), path.join(DIST, "js"));
  copyDir(path.join(SRC, "static"), DIST);

  const pagesDir = path.join(SRC, "content", "pages");
  for (const name of fs.readdirSync(pagesDir).filter((file) => file.endsWith(".md"))) {
    const page = loadMarkdown(path.join(pagesDir, name));
    const isHome = page.slug === "index";
    const extraHtml = isHome ? latestPostsHtml(posts) : page.slug === "contact" ? contactForm(site) : "";
    const html = applyLayout(layout, site, {
      title: isHome ? site.title : page.title,
      description: page.description,
      path: isHome ? "/" : `/${page.slug}/`,
      bodyClass: isHome ? "home" : "",
      body: pageBody({ ...page, extraHtml }),
    });
    const outFile = isHome
      ? path.join(DIST, "index.html")
      : path.join(DIST, page.slug, "index.html");
    write(outFile, html);
  }

  write(
    path.join(DIST, "blog", "index.html"),
    applyLayout(layout, site, {
      title: "Blog",
      description: "Notes, updates, and longer writing.",
      path: "/blog/",
      body: blogIndexHtml(posts),
    }),
  );

  for (const post of posts) {
    write(
      path.join(DIST, "blog", post.slug, "index.html"),
      applyLayout(layout, site, {
        title: post.title,
        description: post.description,
        path: `/blog/${post.slug}/`,
        body: postBody(post),
      }),
    );
  }

  console.log(`Built ${posts.length} posts and the site pages into dist/`);
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

  const dirs = [
    path.join(SRC, "content", "pages"),
    path.join(SRC, "content", "blog"),
    path.join(SRC, "templates"),
    path.join(SRC, "styles"),
    path.join(SRC, "js"),
    path.join(SRC, "static"),
  ];

  for (const dir of dirs) {
    fs.watch(dir, schedule);
  }
  fs.watch(path.join(SRC, "site.json"), schedule);
}

build();

if (process.argv.includes("--watch")) {
  startServer();
  watchSources();
}

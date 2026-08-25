# Static site

A small website with a landing page, blog, About, FAQ, and contact page. The landing page body is HTML. The other pages and posts are Markdown. Header and footer come from a shared layout. The build step is a short Node script — not Next.js or another app framework.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The `dev` command builds the site, serves `dist/`, and rebuilds when files in `src/` change.

To build once:

```bash
npm run build
```

## How it is put together

| You edit | What it is |
| --- | --- |
| `src/index.html` | Landing page body (HTML, not Markdown) |
| `src/content/pages/` | About, FAQ, Contact as Markdown |
| `src/content/blog/` | Blog posts as Markdown |
| `src/templates/blog.html` | HTML template for a single blog post |
| `src/templates/blog-index.html` | HTML template for the `/blog/` list |
| `src/templates/newsletter.html` | Kit newsletter form (HTML you can edit) |
| `src/templates/layout.html` | Shared header, footer, and page shell |
| `src/styles/style.css` | Look and layout |
| `src/js/main.js` | Mobile menu and form fallbacks |
| `src/site.json` | Site name, description, and form IDs |
| `scripts/build.js` | Wraps pages in the layout and turns Markdown into HTML |

The homepage body in `src/index.html` is dropped into the layout as HTML. For the other pages, `gray-matter` reads the title and other details at the top of each Markdown file, `marked` converts the rest to HTML, and the script wraps that HTML in the same layout.

## Add a page

Create `src/content/pages/your-page.md`:

```md
---
title: Your page
description: A short summary.
---

Your content goes here.
```

It will be available at `/your-page/`. Add a link in `NAV` inside `scripts/build.js` if it should appear in the header.

## Add a blog post

Create a Markdown file in `src/content/blog/`. The file name becomes the URL, so `src/content/blog/new-post.md` is `/blog/new-post/`.

```md
---
title: New post
date: 2026-08-19
description: One sentence for the blog list.
---

The post itself.
```

Each post is converted from Markdown to HTML, dropped into `src/templates/blog.html`, then wrapped in the shared header and footer. It also appears on `/blog/`, which uses `src/templates/blog-index.html`.

## Newsletter (Kit)

The footer form is `src/templates/newsletter.html`. That file is the HTML embed: email field, Subscribe button, and a post to your Kit form. Edit copy, classes, and layout there. Styles live in `src/styles/style.css`.

Kit’s small `ck.5.js` script is included so success and error messages still come from Kit. The **Join the Newsletter** button in the header jumps to this form.

## Contact form

1. Create a form at [Formspree](https://formspree.io) and copy the form ID.
2. Paste it into `src/site.json` as `formspreeId`.
3. Rebuild.

You can point the contact form at a different service later by changing the action in `scripts/build.js`.

## Deploy to GitHub Pages

This repo is [Jaroslav-Tran/static-site](https://github.com/Jaroslav-Tran/static-site), so the site will be at:

**https://jaroslav-tran.github.io/static-site/**

GitHub cannot serve the Markdown source. A workflow in `.github/workflows/pages.yml` runs `npm run build` and publishes `dist/`. On GitHub it sets `BASE_PATH=/static-site` so links and CSS work under that folder. Locally, `npm run dev` still uses `/`.

1. Commit the workflow and push to `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.

Later pushes to `main` rebuild and publish on their own.

# Static site

A small website with a landing page, blog, About, FAQ, and contact page. Content is Markdown. The build step is a short Node script — not Next.js or another app framework.

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
| `src/content/pages/` | Landing and info pages as Markdown |
| `src/content/blog/` | Blog posts as Markdown |
| `src/templates/layout.html` | Shared header, footer, and page shell |
| `src/styles/style.css` | Look and layout |
| `src/js/main.js` | Mobile menu and form fallbacks |
| `src/site.json` | Site name, description, and form IDs |
| `scripts/build.js` | Turns Markdown into HTML |

`gray-matter` reads the title and other details at the top of each Markdown file. `marked` converts the rest to HTML. The script wraps that HTML in the layout and writes the result to `dist/`.

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

Create a file in `src/content/blog/`, for example `src/content/blog/new-post.md`:

```md
---
title: New post
date: 2026-08-19
description: One sentence for the blog list.
---

The post itself.
```

That post will show up on `/blog/` and at `/blog/new-post/`.

## Newsletter (ConvertKit)

1. In ConvertKit, create a form and copy its numeric form ID.
2. Paste it into `src/site.json` as `convertKitFormId`.
3. Rebuild.

The footer form then posts to ConvertKit. Until an ID is set, submitting the form shows a reminder instead.

## Contact form

1. Create a form at [Formspree](https://formspree.io) and copy the form ID.
2. Paste it into `src/site.json` as `formspreeId`.
3. Rebuild.

You can point the contact form at a different service later by changing the action in `scripts/build.js`.

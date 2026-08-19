---
title: FAQ
description: Short answers to common questions about this site.
---

<details>
  <summary>How do I add a new page?</summary>
  Create a Markdown file in <code>src/content/pages/</code>. The file name becomes the URL, so <code>about.md</code> becomes <code>/about/</code>. Then run <code>npm run build</code> or keep <code>npm run dev</code> running.
</details>

<details>
  <summary>How do I add a blog post?</summary>
  Add a Markdown file in <code>src/content/blog/</code> with <code>title</code>, <code>date</code>, and <code>description</code> at the top. The file name is the post URL.
</details>

<details>
  <summary>Do I need Next.js or React?</summary>
  No. The site is plain HTML, CSS, and a little JavaScript. Node is only used to convert Markdown into HTML.
</details>

<details>
  <summary>How does the newsletter form work?</summary>
  Put your ConvertKit form ID in <code>src/site.json</code>. Until that is set, the form will remind you to add it.
</details>

<details>
  <summary>How does the contact form work?</summary>
  Put a Formspree form ID in <code>src/site.json</code>. You can swap that later for another form service if you prefer.
</details>

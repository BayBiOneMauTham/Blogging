# My Blog — Setup & Maintenance Guide

A static personal blog: warm paper-yellow theme, Akira red accent, Substack newsletter integration. No build tools, no server required — pure HTML/CSS/JS you can host anywhere.

---

## Quick Start

```bash
# Preview locally (required — fetch() won't work over file://)
python3 -m http.server 8080
# then open http://localhost:8080
```

To go live: drag the entire `my-blog/` folder to [Netlify Drop](https://app.netlify.com/drop) — done.

---

## Writing & Publishing a Post (Hands-Free)

Everything is automated. Here's the full workflow:

### 1. Open the Admin Panel
Navigate to `admin.html` (or `http://localhost:8080/admin.html` locally).
- **Username:** `admin`  **Password:** `Blog@2026!` ← change this after first login (see below)

### 2. Fill in the Meta Bar
At the top of the editor, fill in:
| Field | Example |
|-------|---------|
| Title | `My First Post` |
| Slug | `my-first-post` (lowercase, hyphens only) |
| Tags | `tech, writing` (comma-separated) |
| Date | auto-filled to today |
| Read time | `4 min read` |
| Featured | check to pin on homepage hero |

### 3. Write in Markdown
Use the editor on the left — live preview on the right. Toolbar shortcuts: **B**, *I*, H2, H3, links, images, code blocks, blockquotes.

Keyboard shortcuts: `Ctrl+B` bold · `Ctrl+I` italic · `Tab` → 2-space indent

### 4. Click "Publish Post ↓"
Three files download automatically:
- **`your-slug.html`** — the complete post page
- **`posts.json`** — updated with your new post entry
- **`sitemap.xml`** — regenerated with all posts

### 5. Move the Files
```
your-slug.html   →   my-blog/posts/
posts.json       →   my-blog/           (replace existing)
sitemap.xml      →   my-blog/           (replace existing)
```

### 6. Deploy
Re-upload / re-drag the folder to Netlify. Or if using Git:
```bash
git add posts/your-slug.html posts.json sitemap.xml
git commit -m "Add post: Your Post Title"
git push
```

That's it. `index.html` and `blog.html` auto-update because they read `posts.json` on every page load — no manual card editing needed.

---

## How Posts Are Stored

`posts.json` is the single source of truth. Each entry:

```json
{
  "slug":     "my-first-post",
  "title":    "My First Post",
  "excerpt":  "First 180 characters of the post body...",
  "tags":     ["tech", "writing"],
  "date":     "2026-07-29",
  "readtime": "4 min read",
  "featured": false
}
```

- **Featured: true** → post appears in the homepage "Featured" section
- Posts are sorted newest-first automatically
- Tag filter buttons on `blog.html` are auto-generated from all unique tags

---

## Personalize the Blog

Find and replace these placeholders across all HTML files:

| Placeholder | Replace with |
|-------------|-------------|
| `Your Name` | Your real name |
| `yourblog.com` | Your domain |
| `@yourhandle` | Twitter/X handle |
| `yourusername` | GitHub username |
| `your.blog` | Nav logo text |
| `YOUR-SUBSTACK-NAME` | Your Substack subdomain |

Quick way:
```bash
cd my-blog
grep -rl "Your Name" . --include="*.html" | xargs sed -i '' 's/Your Name/Jane Doe/g'
```

---

## Changing Your Admin Password

1. Open browser console on any page
2. Run:
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-password'))
  .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
```
3. Copy the hash
4. Open `admin.html`, find `ADMIN_HASH =` and replace the value

---

## File Structure

```
my-blog/
├── index.html          ← Homepage (auto-populated from posts.json)
├── blog.html           ← All posts + tag filter (auto-populated)
├── about.html          ← About page
├── notes.html          ← Photo / notes gallery
├── admin.html          ← Password-protected editor (keep private)
├── style.css           ← All styles — edit design tokens here
├── script.js           ← Posts rendering, tag filter, TOC, nav effects
├── posts.json          ← The data store — auto-updated on publish
├── sitemap.xml         ← Auto-regenerated on publish
├── robots.txt          ← Disallows /admin.html from indexing
└── posts/
    ├── post-template.html   ← Reference template (not linked publicly)
    └── hello-world.html     ← Example post
```

---

## Customizing the Design

All colors and fonts are CSS variables at the top of `style.css`:

```css
--bg:           #f5f0e8;   /* warm paper yellow */
--text:         #2e1f14;   /* dark sepia ink */
--accent:       #e81828;   /* Kaneda red */
--accent-amber: #ff6600;   /* amber glow */
--font-mono: 'JetBrains Mono', monospace;
--font-body: 'Inter', system-ui;
```

Change any value and it propagates to the entire site.

---

## Adding Images to Posts

1. Drop image files into `my-blog/images/`
2. Reference them in Markdown:
```markdown
![Alt text](../images/your-image.jpg)
```

---

## Analytics

### Built-in (localStorage)
The admin panel's Analytics tab shows total views, weekly views, top pages, and a 14-day sparkline — all tracked locally in the visitor's browser. No server needed. Data resets if the visitor clears their cache.

### Real-time (Umami — optional, free)
For server-side real-time analytics:
1. Sign up at [umami.is](https://umami.is) → create a website
2. Add the script tag to every HTML page's `<head>`
3. Paste your Umami share URL in the admin Analytics tab → embedded directly

---

## Substack Integration

Your Substack is the distribution channel; this blog is your owned home for SEO and archiving.

- Newsletter subscribe embed: already in `index.html` — replace `YOUR-SUBSTACK-NAME` with your Substack username
- Cross-post strategy: publish on Substack first for subscribers → copy to this blog for SEO and permanent archive
- Link from Substack to your blog: add `yourblog.com` to your Substack profile and mention it in posts

---

## Hosting Options

| Platform | How | Cost |
|----------|-----|------|
| **Netlify** | Drag-and-drop folder at netlify.com/drop | Free |
| **GitHub Pages** | Push to repo → Settings → Pages → Deploy from branch | Free |
| **Vercel** | Import GitHub repo → auto-deploy | Free |

All options support custom domains.

---

## Local Development

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

`fetch()` requires HTTP — opening `index.html` directly via `file://` will show a warning instead of posts. Always use the local server during development.

# Username Generator

A small client-side tool that generates pronounceable, random usernames.

## Features

- Configurable username length (1-20 characters)
- "Ease to Read" and "Ease to Say" sliders to bias generation toward simpler
  letter patterns or vowel/consonant clustering
- Copy-to-clipboard button
- No build step or dependencies — plain HTML/CSS/JS

## Project structure

```
index.html              Page markup
css/style.css            Styles
js/usernameGenerator.js  Generation algorithm (framework/DOM free)
js/app.js                DOM wiring / UI logic
```

## Usage

```bash
npm install
npm run dev
```

Then open the URL Vite prints (defaults to http://localhost:5173).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
```

You can also just open [index.html](index.html) directly in a browser —
no build step is required.

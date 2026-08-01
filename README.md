# Username Generator

A small client-side tool that generates pronounceable, random usernames.

## Features

- Configurable username length (1-20 characters)
- "Ease to Read" and "Ease to Say" sliders (1-500) to bias generation toward
  simpler letter patterns and phonotactically valid consonant clusters;
  values above 100 progressively narrow the letter/cluster pool down to the
  most common/easiest entries
- Language selector (English / Italiano) that changes letter frequency and
  valid consonant clusters used by the ease sliders
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

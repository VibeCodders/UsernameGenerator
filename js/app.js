(() => {
  const lengthInput = document.getElementById('length');
  const countInput = document.getElementById('count');
  const styleSelect = document.getElementById('style');
  const languageSelect = document.getElementById('language');
  const easyReadInput = document.getElementById('easyRead');
  const easyReadValue = document.getElementById('easyReadValue');
  const easySayInput = document.getElementById('easySay');
  const easySayValue = document.getElementById('easySayValue');
  const generateBtn = document.getElementById('generateBtn');
  const resultList = document.getElementById('resultList');
  const errorEl = document.getElementById('error');
  const themeToggle = document.getElementById('themeToggle');
  const historyList = document.getElementById('historyList');
  const favoritesList = document.getElementById('favoritesList');
  const panelTabs = document.querySelectorAll('.panel-tab');
  const toast = document.getElementById('toast');

  const HISTORY_KEY = 'usernameGenerator.history';
  const FAVORITES_KEY = 'usernameGenerator.favorites';
  const THEME_KEY = 'usernameGenerator.theme';
  const MAX_HISTORY = 20;

  function loadList(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode, quota, etc.) — silently skip persistence
    }
  }

  let history = loadList(HISTORY_KEY);
  let favorites = loadList(FAVORITES_KEY);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  easyReadInput.addEventListener('input', () => {
    easyReadValue.textContent = easyReadInput.value;
  });

  easySayInput.addEventListener('input', () => {
    easySayValue.textContent = easySayInput.value;
  });

  function showError(message) {
    errorEl.textContent = message;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('visible'), 1400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied "' + text + '"');
    } catch {
      showToast('Could not copy to clipboard.');
    }
  }

  function addToHistory(username) {
    history = [username, ...history.filter((u) => u !== username)].slice(0, MAX_HISTORY);
    saveList(HISTORY_KEY, history);
    renderHistory();
  }

  function isFavorite(username) {
    return favorites.includes(username);
  }

  function toggleFavorite(username) {
    if (isFavorite(username)) {
      favorites = favorites.filter((u) => u !== username);
    } else {
      favorites = [username, ...favorites];
    }
    saveList(FAVORITES_KEY, favorites);
    renderHistory();
    renderFavorites();
    renderResults(lastResults);
  }

  function makeUsernameRow(username, { showFavorite = true, showRemove = false, onRemove } = {}) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'username';
    span.textContent = username;
    li.appendChild(span);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => copyText(username));
    li.appendChild(copyBtn);

    if (showFavorite) {
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'fav-btn' + (isFavorite(username) ? ' active' : '');
      favBtn.textContent = isFavorite(username) ? '★' : '☆';
      favBtn.title = isFavorite(username) ? 'Remove from favorites' : 'Add to favorites';
      favBtn.setAttribute('aria-label', favBtn.title);
      favBtn.addEventListener('click', () => toggleFavorite(username));
      li.appendChild(favBtn);
    }

    if (showRemove) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'fav-btn';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + username);
      removeBtn.addEventListener('click', onRemove);
      li.appendChild(removeBtn);
    }

    return li;
  }

  let lastResults = [];

  function renderResults(usernames) {
    resultList.innerHTML = '';
    usernames.forEach((username) => {
      const li = makeUsernameRow(username, { showFavorite: true });
      li.className = 'result-item';
      resultList.appendChild(li);
    });
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No history yet — generate a username to get started.';
      historyList.appendChild(empty);
      return;
    }
    history.forEach((username) => {
      historyList.appendChild(makeUsernameRow(username, { showFavorite: true }));
    });
  }

  function renderFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No favorites yet — star a username to save it here.';
      favoritesList.appendChild(empty);
      return;
    }
    favorites.forEach((username) => {
      favoritesList.appendChild(
        makeUsernameRow(username, {
          showFavorite: false,
          showRemove: true,
          onRemove: () => toggleFavorite(username),
        })
      );
    });
  }

  panelTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      panelTabs.forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      const target = tab.dataset.panel;
      historyList.hidden = target !== 'history';
      favoritesList.hidden = target !== 'favorites';
    });
  });

  function generate() {
    const length = Number(lengthInput.value);
    const count = Number(countInput.value);

    if (!Number.isFinite(length) || length < 1 || length > 20) {
      showError('Length must be a number between 1 and 20.');
      resultList.innerHTML = '';
      return;
    }

    if (!Number.isFinite(count) || count < 1 || count > 10) {
      showError('Count must be a number between 1 and 10.');
      resultList.innerHTML = '';
      return;
    }

    showError('');
    const style = styleSelect.value;
    const language = languageSelect.value;
    const usernames = [];
    for (let i = 0; i < count; i++) {
      const base = generateUsername(length, Number(easyReadInput.value), Number(easySayInput.value), language);
      usernames.push(applyStyle(base, style));
    }

    lastResults = usernames;
    renderResults(usernames);
    usernames.forEach(addToHistory);
  }

  generateBtn.addEventListener('click', generate);
  lengthInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });

  renderHistory();
  renderFavorites();
})();

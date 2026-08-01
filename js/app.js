(() => {
  const lengthInput = document.getElementById('length');
  const easyReadInput = document.getElementById('easyRead');
  const easyReadValue = document.getElementById('easyReadValue');
  const easySayInput = document.getElementById('easySay');
  const easySayValue = document.getElementById('easySayValue');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');

  easyReadInput.addEventListener('input', () => {
    easyReadValue.textContent = easyReadInput.value;
  });

  easySayInput.addEventListener('input', () => {
    easySayValue.textContent = easySayInput.value;
  });

  function showError(message) {
    errorEl.textContent = message;
  }

  function generate() {
    const length = Number(lengthInput.value);

    if (!Number.isFinite(length) || length < 1 || length > 20) {
      showError('Length must be a number between 1 and 20.');
      resultEl.textContent = '';
      copyBtn.disabled = true;
      return;
    }

    showError('');
    const username = generateUsername(length, Number(easyReadInput.value), Number(easySayInput.value));
    resultEl.textContent = username;
    copyBtn.disabled = false;
  }

  generateBtn.addEventListener('click', generate);
  lengthInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });

  copyBtn.addEventListener('click', async () => {
    const username = resultEl.textContent;
    if (!username) return;
    try {
      await navigator.clipboard.writeText(username);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = original; }, 1200);
    } catch {
      showError('Could not copy to clipboard.');
    }
  });

  copyBtn.disabled = true;
})();

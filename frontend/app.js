const API = 'http://localhost:8000';

// ── State ──
let answerMode    = 'rag';
let selectedFile  = null;
let hasDocs       = false;
let isSending     = false;
let isUploading   = false;
let isGeneratingPpt = false;

// ── DOM refs ──
const chatMessages = document.getElementById('chat-messages');
const emptyState   = document.getElementById('empty-state');
const chatInput    = document.getElementById('chat-input');
const sendBtn      = document.getElementById('send-btn');
const uploadZone   = document.getElementById('upload-zone');
const fileInput    = document.getElementById('file-input');
const uploadBtn    = document.getElementById('upload-btn');
const ragBtn       = document.getElementById('rag-btn');
const directBtn    = document.getElementById('direct-btn');
const pptBtn       = document.getElementById('ppt-btn');
const pptHint      = document.getElementById('ppt-hint');
const statusBadge  = document.getElementById('status-badge');
const statusIcon   = document.getElementById('status-icon');
const statusText   = document.getElementById('status-text');
const modePill     = document.getElementById('mode-pill');
const docsBadge    = document.getElementById('docs-badge');
const uzName       = document.getElementById('uz-name');
const uzHint       = document.getElementById('uz-hint');
const uzIcon       = document.getElementById('uz-icon');

// ── SVG constants ──
const SVG_FILE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><polyline points="12 3 12 9 18 9"/><line x1="12" y1="13" x2="12" y2="18"/><polyline points="9.5 15.5 12 13 14.5 15.5"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
const SVG_UPLOAD_BTN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload PDF`;
const SVG_PPT_BTN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Generate Slides`;
const SVG_AI_AVATAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const SVG_USER_AVATAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

// ── Helpers ──

function setStatus(msg, type) {
  statusBadge.className = `status-badge visible status-${type}`;
  statusText.textContent = msg;
  if (type === 'info') {
    statusIcon.innerHTML = `<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`;
  } else if (type === 'success') {
    statusIcon.innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
  } else {
    statusIcon.innerHTML = `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`;
  }
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function appendMessage(text, sender, isError = false) {
  const empty = document.getElementById('empty-state');
  if (empty) empty.remove();

  const row = document.createElement('div');
  row.className = `msg-row ${sender}`;

  if (sender === 'ai') {
    row.innerHTML = `
      <div class="avatar av-ai">${SVG_AI_AVATAR}</div>
      <div class="bubble ai${isError ? ' error' : ''}">${escapeHtml(text)}</div>`;
  } else {
    row.innerHTML = `
      <div class="bubble user">${escapeHtml(text)}</div>
      <div class="avatar av-user">${SVG_USER_AVATAR}</div>`;
  }

  chatMessages.appendChild(row);
  scrollToBottom();
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.id = 'typing-row';
  row.innerHTML = `
    <div class="avatar av-ai">${SVG_AI_AVATAR}</div>
    <div class="bubble ai typing-bubble">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>`;
  chatMessages.appendChild(row);
  scrollToBottom();
}

function hideTyping() {
  const row = document.getElementById('typing-row');
  if (row) row.remove();
}

function setFileSelected(file) {
  selectedFile = file;
  if (file) {
    uploadZone.classList.add('has-file');
    uzName.textContent = file.name;
    uzHint.style.display = 'none';
    uzIcon.innerHTML = SVG_CHECK;
    uploadBtn.disabled = false;
  } else {
    uploadZone.classList.remove('has-file');
    uzName.textContent = 'Drop PDF here';
    uzHint.style.display = '';
    uzIcon.innerHTML = SVG_FILE;
    uploadBtn.disabled = true;
  }
}

function setHasDocs(val) {
  hasDocs = val;
  pptBtn.disabled = !val;
  pptHint.style.display = val ? 'none' : '';
  if (val) docsBadge.classList.add('visible');
}

function setMode(mode) {
  answerMode = mode;
  if (mode === 'rag') {
    ragBtn.classList.add('active');
    directBtn.classList.remove('active');
    modePill.textContent = '📚 PDF Source';
  } else {
    directBtn.classList.add('active');
    ragBtn.classList.remove('active');
    modePill.textContent = '⚡ Direct LLM';
  }
}

// ── Send message ──
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isSending) return;

  isSending = true;
  chatInput.disabled = true;
  sendBtn.disabled = true;
  appendMessage(text, 'user');
  chatInput.value = '';
  showTyping();

  const endpoint = answerMode === 'rag'
    ? `${API}/ask_rag/?query=${encodeURIComponent(text)}`
    : `${API}/ask_direct/?query=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    const answer = typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer);
    hideTyping();
    appendMessage(answer, 'ai');
  } catch (err) {
    hideTyping();
    appendMessage('Backend error — please try again.', 'ai', true);
  } finally {
    isSending = false;
    chatInput.disabled = false;
    sendBtn.disabled = !chatInput.value.trim();
    chatInput.focus();
  }
}

// ── Upload PDF ──
async function uploadPDF() {
  if (!selectedFile || isUploading) return;
  isUploading = true;
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = `<span class="spinner"></span> Indexing…`;
  setStatus('Processing document…', 'info');

  const form = new FormData();
  form.append('file', selectedFile);

  try {
    const res = await fetch(`${API}/upload_pdf/`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    setStatus(`${data.chunks_added} chunks indexed`, 'success');
    setHasDocs(true);
    setFileSelected(null);
  } catch (err) {
    setStatus('Upload failed — check backend', 'error');
  } finally {
    isUploading = false;
    uploadBtn.innerHTML = SVG_UPLOAD_BTN;
    uploadBtn.disabled = !selectedFile;
  }
}

// ── Generate PPT ──
async function generatePpt() {
  if (isGeneratingPpt || !hasDocs) return;
  isGeneratingPpt = true;
  pptBtn.disabled = true;
  pptBtn.innerHTML = `<span class="spinner"></span> Generating…`;
  setStatus('Building presentation…', 'info');

  try {
    const res = await fetch(`${API}/ppt/`);
    if (!res.ok) {
      let msg = `Failed (${res.status})`;
      try { const d = await res.json(); msg = d.detail?.error || d.error || msg; } catch {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.pptx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('Slides downloaded', 'success');
  } catch (err) {
    setStatus(err.message || 'Generation failed', 'error');
  } finally {
    isGeneratingPpt = false;
    pptBtn.disabled = !hasDocs;
    pptBtn.innerHTML = SVG_PPT_BTN;
  }
}

// ── Event listeners ──

fileInput.addEventListener('change', () => {
  const f = fileInput.files?.[0];
  if (f?.type === 'application/pdf') setFileSelected(f);
});

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const f = e.dataTransfer.files?.[0];
  if (f?.type === 'application/pdf') setFileSelected(f);
});

uploadBtn.addEventListener('click', uploadPDF);
ragBtn.addEventListener('click', () => setMode('rag'));
directBtn.addEventListener('click', () => setMode('direct'));
pptBtn.addEventListener('click', generatePpt);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

chatInput.addEventListener('input', () => {
  sendBtn.disabled = !chatInput.value.trim() || isSending;
});

sendBtn.addEventListener('click', sendMessage);

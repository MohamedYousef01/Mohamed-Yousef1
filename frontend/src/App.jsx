import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const API = 'http://localhost:8000';

/* ── Icon components ── */
function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.66z"/>
    </svg>
  );
}
function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      <polyline points="12 3 12 9 18 9"/>
      <line x1="12" y1="13" x2="12" y2="18"/>
      <polyline points="9.5 15.5 12 13 14.5 15.5"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function AiAvatar() {
  return (
    <div className="avatar av-ai">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.66z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.66z"/>
      </svg>
    </div>
  );
}
function UserAvatar() {
  return (
    <div className="avatar av-user">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  );
}
function StatusIcon({ type }) {
  if (type === 'success') return <polyline points="20 6 9 17 4 12"/>;
  if (type === 'error')   return <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>;
  return <><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>;
}

/* ── Agent flow diagram ── */
function AgentFlow({ toolUsed }) {
  const usedDoc = toolUsed && toolUsed !== 'general_chat_tool';
  const teal   = '#00d2b4';
  const dimClr = 'rgba(148,163,184,0.2)';

  const label = usedDoc
    ? (toolUsed === 'slides_generator_tool' ? 'slides via document' : 'answered from document')
    : 'answered directly';

  return (
    <div className="agent-flow">
      <svg viewBox="0 0 200 72" xmlns="http://www.w3.org/2000/svg">
        {/* Direct path: robot → user (arc below) */}
        <path
          d="M 44 42 Q 100 68 156 42"
          fill="none"
          stroke={usedDoc ? dimClr : teal}
          strokeWidth={usedDoc ? 1 : 1.8}
          strokeDasharray={usedDoc ? '4 3' : '0'}
        />
        {/* Doc path: robot → doc */}
        <line x1="42" y1="36" x2="88" y2="22"
          stroke={usedDoc ? teal : dimClr} strokeWidth={usedDoc ? 1.8 : 1}/>
        {/* Doc path: doc → user */}
        <line x1="112" y1="22" x2="158" y2="36"
          stroke={usedDoc ? teal : dimClr} strokeWidth={usedDoc ? 1.8 : 1}/>

        {/* Robot node */}
        <circle cx="28" cy="42" r="16" fill="#0b0f19" stroke={teal} strokeWidth="1.5"/>
        <rect x="21" y="36" width="14" height="11" rx="2" fill="none" stroke={teal} strokeWidth="1.2"/>
        <circle cx="25" cy="40" r="1.4" fill={teal}/><circle cx="31" cy="40" r="1.4" fill={teal}/>
        <line x1="25" y1="44" x2="31" y2="44" stroke={teal} strokeWidth="1.1"/>
        <line x1="28" y1="32" x2="28" y2="36" stroke={teal} strokeWidth="1.2"/>
        <circle cx="28" cy="31" r="1.5" fill={teal}/>

        {/* Document node */}
        <circle cx="100" cy="16" r="13" fill="#0b0f19"
          stroke={usedDoc ? teal : 'rgba(148,163,184,0.25)'}
          strokeWidth="1.5" opacity={usedDoc ? 1 : 0.45}/>
        <rect x="94.5" y="9" width="11" height="14" rx="1.5" fill="none"
          stroke={usedDoc ? teal : 'rgba(148,163,184,0.45)'} strokeWidth="1.1"/>
        <line x1="96.5" y1="13" x2="103.5" y2="13" stroke={usedDoc ? teal : 'rgba(148,163,184,0.4)'} strokeWidth="1"/>
        <line x1="96.5" y1="16" x2="103.5" y2="16" stroke={usedDoc ? teal : 'rgba(148,163,184,0.4)'} strokeWidth="1"/>
        <line x1="96.5" y1="19" x2="101"   y2="19" stroke={usedDoc ? teal : 'rgba(148,163,184,0.4)'} strokeWidth="1"/>

        {/* User node */}
        <circle cx="172" cy="42" r="16" fill="#0b0f19" stroke={teal} strokeWidth="1.5"/>
        <circle cx="172" cy="38" r="4" fill="none" stroke={teal} strokeWidth="1.2"/>
        <path d="M 164 52 Q 164 45 172 45 Q 180 45 180 52" fill="none" stroke={teal} strokeWidth="1.2"/>

        {/* Animated dot travelling along active path */}
        {usedDoc ? (
          <circle r="2.8" fill={teal} opacity="0.9">
            <animateMotion dur="1.6s" repeatCount="indefinite"
              path="M 42 36 L 88 22 L 112 22 L 158 36"/>
          </circle>
        ) : (
          <circle r="2.8" fill={teal} opacity="0.9">
            <animateMotion dur="1.6s" repeatCount="indefinite"
              path="M 44 42 Q 100 68 156 42"/>
          </circle>
        )}
      </svg>
      <span className="agent-flow-label">{label}</span>
    </div>
  );
}

/* ── Sources panel ── */
function SourcesPanel({ data, onClose }) {
  const [expandedChunks, setExpandedChunks] = useState(new Set([0]));

  function toggleChunk(i) {
    setExpandedChunks(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <aside className={`sources-panel${data ? ' visible' : ''}`}>
      <div className="sp-header">
        <div className="sp-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Sources
        </div>
        <button className="sp-close" onClick={onClose} aria-label="Close sources">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {data && (
        <>
          <div className="sp-meta">
            <div className="sp-meta-row">
              <span className="sp-meta-label">Tool</span>
              <span className="sp-meta-value sp-tool">{data.tool}</span>
            </div>
            <div className="sp-meta-row">
              <span className="sp-meta-label">File</span>
              <span className="sp-meta-value">{data.source_file || 'uploaded_document'}</span>
            </div>
            <div className="sp-meta-row">
              <span className="sp-meta-label">Chunks</span>
              <span className="sp-meta-value">{data.chunks.length} retrieved</span>
            </div>
          </div>

          <div className="sp-chunks">
            {data.chunks.map((chunk, i) => (
              <div key={i} className={`sp-chunk${expandedChunks.has(i) ? ' expanded' : ''}`}>
                <button className="sp-chunk-header" onClick={() => toggleChunk(i)}>
                  <span className="sp-chunk-label">
                    <span className="sp-chunk-num">#{i + 1}</span>
                    {chunk.page !== '?' && <span className="sp-page-badge">p.{chunk.page}</span>}
                  </span>
                  <svg className="sp-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expandedChunks.has(i) && (
                  <div className="sp-chunk-body">{chunk.content}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

/* ── Main App ── */
export default function App() {
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState('');
  const [selectedFile,    setSelectedFile]    = useState(null);
  const [answerMode,      setAnswerMode]      = useState('rag');
  const [hasDocs,         setHasDocs]         = useState(false);
  const [isSending,       setIsSending]       = useState(false);
  const [isUploading,     setIsUploading]     = useState(false);
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [status,          setStatus]          = useState(null);
  const [isDragging,      setIsDragging]      = useState(false);
  const [sourcesPanel,    setSourcesPanel]    = useState(null); // { tool, source_file, chunks }

  const chatEndRef   = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  function handleFileSelect(file) {
    if (file?.type === 'application/pdf') setSelectedFile(file);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInput('');
    setIsSending(true);

    if (answerMode === 'rag') {
      try {
        const res = await fetch(`${API}/ask_rag/?query=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const answer = data.answer || 'No answer returned.';
        const msgSources = { tool: data.tool, source_file: data.source_file, chunks: data.chunks || [] };
        setMessages(prev => [...prev, { text: answer, sender: 'ai', sources: msgSources, toolUsed: 'document_qa_tool' }]);
        if (msgSources.chunks.length > 0) setSourcesPanel(msgSources);
      } catch {
        setMessages(prev => [...prev, { text: 'Backend error — please try again.', sender: 'ai', error: true }]);
      }
    } else if (answerMode === 'direct') {
      try {
        const res = await fetch(`${API}/ask_direct/?query=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const answer = typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer);
        setMessages(prev => [...prev, { text: answer, sender: 'ai', toolUsed: 'general_chat_tool' }]);
      } catch {
        setMessages(prev => [...prev, { text: 'Backend error — please try again.', sender: 'ai', error: true }]);
      }
    } else {
      // auto mode — agent decides the tool
      try {
        const res = await fetch(`${API}/ask/?query=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const answer = typeof data.answer === 'string' ? data.answer : JSON.stringify(data.answer);
        setMessages(prev => [...prev, { text: answer, sender: 'ai', toolUsed: data.tool_used ?? null }]);
      } catch {
        setMessages(prev => [...prev, { text: 'Backend error — please try again.', sender: 'ai', error: true }]);
      }
    }

    setIsSending(false);
  }

  async function uploadPDF() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setStatus({ msg: 'Processing document…', type: 'info' });

    const form = new FormData();
    form.append('file', selectedFile);
    try {
      const res = await fetch(`${API}/upload_pdf/`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setStatus({ msg: `${data.chunks_added} chunks indexed`, type: 'success' });
      setHasDocs(true);
      setSelectedFile(null);
    } catch {
      setStatus({ msg: 'Upload failed — check backend', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  }

  async function generatePpt() {
    if (isGeneratingPpt || !hasDocs) return;
    setIsGeneratingPpt(true);
    setStatus({ msg: 'Building presentation…', type: 'info' });
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
      a.href = url; a.download = 'presentation.pptx';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setStatus({ msg: 'Slides downloaded', type: 'success' });
    } catch (err) {
      setStatus({ msg: err.message || 'Generation failed', type: 'error' });
    } finally {
      setIsGeneratingPpt(false);
    }
  }

  return (
    <div className="app">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><BrainIcon /></div>
          <span className="logo-name">llm-project</span>
        </div>

        <div className="sb-section">
          <span className="sb-label">Document</span>
          <div
            className={`upload-zone${selectedFile ? ' has-file' : ''}${isDragging ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
              onChange={e => handleFileSelect(e.target.files?.[0])} />
            <div className="uz-icon">{selectedFile ? <CheckIcon /> : <FileIcon />}</div>
            <span className="uz-name">{selectedFile ? selectedFile.name : 'Drop PDF here'}</span>
            {!selectedFile && <span className="uz-hint">or click to browse</span>}
          </div>

          <button className="btn btn-primary" onClick={uploadPDF} disabled={!selectedFile || isUploading}>
            {isUploading ? <><span className="spinner" /> Indexing…</> : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>Upload PDF</>
            )}
          </button>
        </div>

        <div className="sb-divider" />

        <div className="sb-section">
          <span className="sb-label">Answer Mode</span>
          <div className="mode-toggle">
            <button className={`mode-btn${answerMode === 'rag' ? ' active' : ''}`} onClick={() => setAnswerMode('rag')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>PDF Source (RAG)
            </button>
            <button className={`mode-btn${answerMode === 'direct' ? ' active' : ''}`} onClick={() => setAnswerMode('direct')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>Direct LLM
            </button>
            <button className={`mode-btn${answerMode === 'auto' ? ' active' : ''}`} onClick={() => setAnswerMode('auto')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
                <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
              </svg>Auto (Agent)
            </button>
          </div>
        </div>

        <div className="sb-divider" />

        <div className="sb-section">
          <span className="sb-label">Export</span>
          <button className="btn btn-amber" onClick={generatePpt} disabled={isGeneratingPpt || !hasDocs}>
            {isGeneratingPpt ? <><span className="spinner" /> Generating…</> : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>Generate Slides</>
            )}
          </button>
          {!hasDocs && <span className="hint">Upload a PDF first</span>}
        </div>

        {status && (
          <div className={`status-badge visible status-${status.type}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <StatusIcon type={status.type} />
            </svg>
            <span>{status.msg}</span>
          </div>
        )}

        <div className="sb-footer">
          <span>Gemma3 · 27B</span><div className="sb-footer-dot" /><span>Chroma RAG</span>
        </div>
      </aside>

      {/* ── Chat main ── */}
      <main className="chat-main">
        <div className="chat-header">
          <div className="ch-left">
            <span>Conversation</span>
            {hasDocs && (
              <div className="docs-badge visible">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Document loaded
              </div>
            )}
          </div>
          <div className="mode-pill">
            {answerMode === 'rag' ? '📚 PDF Source' : answerMode === 'direct' ? '⚡ Direct LLM' : '🤖 Auto (Agent)'}
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && !isSending ? (
            <div className="empty-state">
              <div className="empty-orb">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.66z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.66z"/>
                </svg>
              </div>
              <p className="empty-title">Ready to assist</p>
              <p className="empty-sub">Upload a PDF and ask questions about it,<br/>or switch to Direct LLM for general chat.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.sender}`}>
                  {msg.sender === 'ai' && <AiAvatar />}
                  <div className="msg-content">
                    <div className={`bubble ${msg.sender}${msg.error ? ' error' : ''}`}>
                      {msg.sender === 'ai' && !msg.error
                        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        : msg.text}
                    </div>
                    {msg.sender === 'ai' && msg.toolUsed !== undefined && (
                      <AgentFlow toolUsed={msg.toolUsed} />
                    )}
                    {msg.sender === 'ai' && msg.sources?.chunks?.length > 0 && (
                      <button
                        className="sources-btn"
                        onClick={() => setSourcesPanel(
                          sourcesPanel === msg.sources ? null : msg.sources
                        )}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {msg.sources.chunks.length} chunks retrieved
                      </button>
                    )}
                  </div>
                  {msg.sender === 'user' && <UserAvatar />}
                </div>
              ))}
              {isSending && (
                <div className="msg-row ai">
                  <AiAvatar />
                  <div className="bubble ai typing-bubble">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrap">
            <input id="chat-input" type="text" placeholder="Ask anything…" autoComplete="off"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={isSending} />
            <button className="send-btn" onClick={sendMessage} disabled={isSending || !input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </div>
          <span className="input-hint">Enter to send</span>
        </div>
      </main>

      {/* ── Sources panel ── */}
      <SourcesPanel data={sourcesPanel} onClose={() => setSourcesPanel(null)} />
    </div>
  );
}

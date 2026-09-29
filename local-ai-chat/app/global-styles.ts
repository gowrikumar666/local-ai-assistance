export const globalStyles = `
:root { color-scheme: light; }
html { scroll-behavior: smooth; }
html, body { height: 100%; max-width: 100%; }
body {
  margin: 0;
  padding: 0;
  min-height: 100dvh;
  overflow: hidden;
  background: #f7f7f8;
  color: #1e2c36;
  font-family: Arial, Helvetica, sans-serif;
}
* { box-sizing: border-box; }
button, input, textarea { font: inherit; }
::selection { background: rgba(239, 111, 97, 0.2); }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes typing {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-shimmer {
  background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}
.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #94a3b8;
  animation: typing 1.1s infinite ease-in-out;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
.composer-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.chat-pane { min-width: 0; min-height: 0; overflow: hidden; }
.chat-thread-scroll {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.chat-thread {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 48rem;
  min-height: 100%;
  margin: 0 auto;
  padding: 1rem 0.75rem 1.25rem;
}
@media (min-width: 640px) {
  .chat-thread { gap: 1.25rem; padding: 1.5rem 1.25rem 1.75rem; }
}

.chat-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  gap: 0.625rem;
}
.chat-row--user { justify-content: flex-end; }
.chat-row--assistant { justify-content: flex-start; }
.chat-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin-top: 0.15rem;
  border-radius: 999px;
  background: #10a37f;
  color: #fff;
}
@media (min-width: 640px) {
  .chat-avatar { width: 2rem; height: 2rem; }
}

.chat-bubble { min-width: 0; max-width: 100%; }
.chat-bubble--user {
  max-width: 88%;
  padding: 0.7rem 0.9rem;
  border-radius: 1.15rem 1.15rem 0.35rem 1.15rem;
  background: #ef6f61;
  color: #fff;
}
.chat-bubble--assistant {
  flex: 1 1 auto;
  max-width: calc(100% - 2.5rem);
  padding: 0.55rem 0.75rem;
  border-radius: 0.35rem 1.15rem 1.15rem 1.15rem;
  background: #fff;
  border: 1px solid #eceff1;
  color: #0d1b24;
}
@media (min-width: 640px) {
  .chat-bubble--user { max-width: 75%; padding: 0.8rem 1rem; }
  .chat-bubble--assistant { max-width: calc(100% - 2.75rem); padding: 0.7rem 1rem; }
}

.chat-bubble__file {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.45rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.chat-bubble--assistant .chat-bubble__file {
  background: #f1f5f9;
  color: #334155;
}
.chat-bubble__label {
  margin: 0 0 0.25rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
}
.chat-bubble__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
@media (min-width: 640px) {
  .chat-bubble__text { font-size: 15px; line-height: 1.7; }
}

.chat-markdown { white-space: normal; }
.chat-markdown > :first-child { margin-top: 0; }
.chat-markdown > :last-child { margin-bottom: 0; }
.chat-markdown p { margin: 0 0 0.75em; }
.chat-markdown h1, .chat-markdown h2, .chat-markdown h3, .chat-markdown h4 {
  margin: 1.1em 0 0.45em;
  line-height: 1.3;
}
.chat-markdown h1 { font-size: 1.3em; }
.chat-markdown h2 { font-size: 1.15em; }
.chat-markdown h3, .chat-markdown h4 { font-size: 1.02em; }
.chat-markdown ul, .chat-markdown ol { margin: 0 0 0.75em; padding-left: 1.4em; }
.chat-markdown li { margin: 0.2em 0; }
.chat-markdown li > p { margin: 0; }
.chat-markdown a { color: #d9534f; text-decoration: underline; }
.chat-markdown blockquote {
  margin: 0 0 0.75em;
  padding: 0.1em 0.9em;
  border-left: 3px solid #e2e8f0;
  color: #475569;
}
.chat-markdown hr { border: 0; border-top: 1px solid #e2e8f0; margin: 1em 0; }
.chat-markdown code {
  padding: 0.12em 0.4em;
  border-radius: 0.35rem;
  background: #f1f5f9;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88em;
}
.md-code {
  position: relative;
  margin: 0 0 0.85em;
  border-radius: 0.75rem;
  background: #0f172a;
  overflow: hidden;
}
.md-code pre {
  margin: 0;
  padding: 2.3rem 1rem 0.9rem;
  overflow-x: auto;
  color: #e2e8f0;
  line-height: 1.55;
}
.md-code pre code { padding: 0; background: none; color: inherit; font-size: 13px; }
.md-code__copy {
  position: absolute;
  top: 0.4rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border: 0;
  border-radius: 0.4rem;
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
  font-size: 11px;
  cursor: pointer;
}
.md-code__copy:hover { background: rgba(148, 163, 184, 0.32); }
.md-table { margin: 0 0 0.85em; overflow-x: auto; }
.md-table table { border-collapse: collapse; font-size: 0.93em; }
.md-table th, .md-table td { padding: 0.4rem 0.7rem; border: 1px solid #e2e8f0; text-align: left; }
.md-table th { background: #f8fafc; }

.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 1.5rem;
  text-align: center;
}
.chat-welcome__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 1.25rem;
  border-radius: 1rem;
  background: #ef6f61;
  color: #fff;
  box-shadow: 0 12px 24px rgba(239, 111, 97, 0.28);
}
.chat-welcome h1 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #1f2937; }
.chat-welcome p { margin: 0; max-width: 28rem; font-size: 0.875rem; color: #6b7280; }
.chat-empty { margin: 0; padding: 4rem 1rem; text-align: center; font-size: 0.875rem; color: #9ca3af; }
@media (min-width: 640px) {
  .chat-welcome__icon { width: 4rem; height: 4rem; }
  .chat-welcome h1 { font-size: 1.875rem; }
}

.chat-composer {
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  padding: 0.5rem 0.75rem 0.75rem;
  background: linear-gradient(to top, #f7f7f8 70%, rgba(247, 247, 248, 0.85));
}
@media (min-width: 640px) {
  .chat-composer { padding: 0.5rem 1rem 1rem; }
}
.chat-composer__shell {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  min-width: 0;
}
.chat-file-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  margin: 0 0 0.5rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  color: #334155;
  font-size: 12px;
}
.chat-file-chip__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-file-chip__remove {
  display: inline-flex;
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}
.chat-composer__inner {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  padding: 0.4rem 0.5rem 0.4rem 0.35rem;
  border: 1px solid #e5e7eb;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.18);
}
.chat-composer-input {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  max-height: 160px;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 0;
  font-size: 16px;
  line-height: 1.5;
  color: #1e2c36;
}
.chat-composer__hint {
  margin: 0.5rem 0 0;
  padding: 0 0.5rem;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #9ca3af;
}
@media (min-width: 640px) {
  .chat-composer-input { font-size: 15px; }
  .chat-composer__hint { margin-top: 0.75rem; }
}

.chat-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-width: 0;
  gap: 0.5rem;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.9);
  background: #f7f7f8;
}
.chat-header__meta { min-width: 0; }
@media (min-width: 640px) {
  .chat-header { padding: 0.75rem 1.25rem; }
}

.chat-error { position: absolute; z-index: 50; top: 0.75rem; right: 0.75rem; left: 0.75rem; }
.chat-error__inner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(239, 68, 68, 0.92);
  color: #fff;
  box-shadow: 0 10px 20px rgba(127, 29, 29, 0.2);
}
.chat-error__text { min-width: 0; font-size: 0.875rem; font-weight: 600; overflow-wrap: anywhere; }
.chat-error__close {
  margin-left: auto;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
}
@media (min-width: 640px) {
  .chat-error {
    top: 1rem;
    left: 50%;
    right: auto;
    width: 100%;
    max-width: 42rem;
    transform: translateX(-50%);
    padding: 0 1rem;
  }
  .chat-error__inner { align-items: center; padding: 0.75rem 1rem; }
}

.chat-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  color: #b7c4c6;
}
.chat-list-item.is-active { background: rgba(255, 255, 255, 0.12); color: #fff; }
.chat-list-item:hover { background: rgba(255, 255, 255, 0.08); }

.sidebar-skeleton { display: flex; flex-direction: column; gap: 0.5rem; padding: 0 0.35rem; }
.sidebar-skeleton__row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; }
.sidebar-skeleton__icon { width: 1rem; height: 1rem; flex-shrink: 0; border-radius: 4px; background: rgba(255, 255, 255, 0.1); }
.sidebar-skeleton__line { flex: 1; height: 0.75rem; border-radius: 999px; background: rgba(255, 255, 255, 0.1); }
.message-skeleton-user {
  height: 3rem;
  width: 55%;
  max-width: 220px;
  border-radius: 1.25rem 1.25rem 0.35rem 1.25rem;
  background: #e5e7eb;
}
.message-skeleton-line { height: 0.75rem; border-radius: 999px; background: #e5e7eb; }
.message-skeleton-lines { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.25rem; }
.typing-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  padding: 0.75rem;
  border: 1px solid #f3f4f6;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

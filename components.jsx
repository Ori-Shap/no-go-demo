// Friendly "Abigail" components

const { useState, useEffect, useMemo } = React;

function Arrow() {
  return (
    <svg className="arrow" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ===== Sidebar ===== */
function Sidebar({ current, onJump, completed, pendingCount }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div>
          No-Go AI
          <small>Your AI helper</small>
        </div>
      </div>

      <div className="steps">
        {STEPS.map((s) => {
          const isDone = completed.includes(s.id) && current !== s.id;
          const isActive = current === s.id;
          const cls = "step" + (isActive ? " active" : "") + (isDone ? " done" : "");
          const badge = s.id === "recommend" && pendingCount > 0 ? pendingCount : null;
          return (
            <div key={s.id} className={cls} onClick={() => onJump(s.id)}>
              <div className="num"><span>{s.n}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {s.label}
                {badge && <span className="sidebar-badge">{badge}</span>}
              </div>
              <div className="tag">{isActive ? "Now" : ""}</div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">A</div>
        <div className="who">
          <strong>Abigail Reyes</strong>
          <small>Accounting · Harbor & Stone</small>
        </div>
      </div>
    </aside>
  );
}

/* ===== 1. Connect (with inline scan) ===== */
function Connect({ onDone, connectAllTrigger, autoAdvance, connected, setConnected }) {
  const [selected, setSelected] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [phase, setPhase] = useState("connect"); // "connect" | "scanning" | "scanned"
  const [progress, setProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  const required = CONNECTOR_CATALOG.filter(c => c.recommended).map(c => c.id);
  const reqDone = required.filter(id => connected[id]).length;
  const totalConnected = Object.values(connected).filter(v => v === true).length;
  const canLookAround = reqDone >= 3;
  const selectedCount = Object.values(selected).filter(Boolean).length;

  // Tweak-driven trigger
  useEffect(() => {
    if (connectAllTrigger) {
      CONNECTOR_CATALOG.forEach((c, i) => {
        if (connected[c.id] === true) return;
        setTimeout(() => setConnected(s => ({ ...s, [c.id]: "loading" })), i * 120);
        setTimeout(() => setConnected(s => ({ ...s, [c.id]: true })), i * 120 + 600);
      });
    }
  }, [connectAllTrigger]);

  useEffect(() => {
    if (!autoAdvance) return;
    if (canLookAround && phase === "connect") {
      const t = setTimeout(() => startScan(), 900);
      return () => clearTimeout(t);
    }
  }, [autoAdvance, canLookAround, phase]);

  // Run scan animation when phase flips to "scanning"
  useEffect(() => {
    if (phase !== "scanning") return;
    let raf, start = performance.now(), dur = 4000;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setScanDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  function startScan() {
    setPhase("scanning");
  }

  function toggleSelect(c) {
    setSelected(s => ({ ...s, [c.id]: !s[c.id] }));
  }

  function disconnect(c) {
    setConnected(s => ({ ...s, [c.id]: false }));
  }

  function confirmConnect() {
    setShowConfirm(false);
    const toConnect = CONNECTOR_CATALOG.filter(c => selected[c.id]);
    toConnect.forEach((c, i) => {
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: "loading" })), i * 120);
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: true })), i * 120 + 600);
    });
    setSelected({});
  }

  const total = SCAN_TARGETS.reduce((s, t) => s + t.count, 0);
  const scanned = Math.round(total * progress);
  const found = Math.min(4, Math.floor(progress * 5));

  const recommended = CONNECTOR_CATALOG.filter(c => c.recommended);
  const others = CONNECTOR_CATALOG.filter(c => !c.recommended);
  const unconnectedRec = recommended.filter(c => connected[c.id] !== true);
  const unconnectedOther = others.filter(c => connected[c.id] !== true);

  return (
    <div className="fade-in">
      <div className="greeting">Hi Abigail, let's get you set up</div>
      <h1 className="display"><strong>Connect</strong> your apps.</h1>
      <p className="lede">
        Pick the apps you use. Read-only — No-Go AI won't send or change anything.
      </p>

      {/* Connected apps — always visible as icon row */}
      {totalConnected > 0 && (
        <div className="connected-row" style={{ marginTop: 20 }}>
          {CONNECTOR_CATALOG.filter(c => connected[c.id] === true).map(c => (
            <div className="connected-icon-item" key={c.id}>
              <img src={c.icon} alt={c.label} title={c.label} />
              {phase === "connect" && (
                <button className="disconnect-btn" onClick={() => disconnect(c)} title="Disconnect">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unconnected apps grid — tap to select, then connect */}
      {(unconnectedRec.length > 0 || unconnectedOther.length > 0) && (
        <div className="connector-list">
          {unconnectedRec.map(c => {
            const isLoading = connected[c.id] === "loading";
            const isSel = !!selected[c.id];
            return (
              <div className={"connector" + (isSel ? " selected" : "")} key={c.id}
                   onClick={() => !isLoading && phase === "connect" && toggleSelect(c)}
                   style={{ cursor: phase === "connect" ? "pointer" : "default" }}>
                <div className="ic"><img src={c.icon} alt={c.label} /></div>
                <span className="label">{c.label}</span>
                <div className="right">
                  {isLoading ? <span className="spinner" /> : isSel && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect width="18" height="18" rx="5" fill="var(--primary)" />
                      <path d="M5 9l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
          {unconnectedOther.length > 0 && unconnectedRec.length > 0 && (
            <div className="connector-divider">Others</div>
          )}
          {unconnectedOther.map(c => {
            const isLoading = connected[c.id] === "loading";
            const isSel = !!selected[c.id];
            return (
              <div className={"connector" + (isSel ? " selected" : "")} key={c.id}
                   onClick={() => !isLoading && phase === "connect" && toggleSelect(c)}
                   style={{ cursor: phase === "connect" ? "pointer" : "default" }}>
                <div className="ic"><img src={c.icon} alt={c.label} /></div>
                <span className="label">{c.label}</span>
                <div className="right">
                  {isLoading ? <span className="spinner" /> : isSel && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect width="18" height="18" rx="5" fill="var(--primary)" />
                      <path d="M5 9l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect selected button */}
      {phase === "connect" && selectedCount > 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn" onClick={() => setShowConfirm(true)}>
            Connect {selectedCount} app{selectedCount === 1 ? "" : "s"}
          </button>
        </div>
      )}

      {/* Scan section — appears inline after "Look around" is clicked */}
      {phase !== "connect" && (
        <div className="fade-in" style={{ marginTop: 36 }}>
          <div className="scan-hero">
            <div>
              <div className="big tabular">{scanned.toLocaleString()}</div>
              <div className="label">things read so far · out of {total.toLocaleString()}</div>
              <div style={{ marginTop: 14, fontSize: 15, color: "var(--ink)" }}>
                {found > 0 ? `Found ${found} type${found === 1 ? "" : "s"} of repetitive work` : "Looking for patterns…"}
              </div>
            </div>
            <div className="scan-ring">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="86" fill="none" stroke="oklch(92% 0.01 130)" strokeWidth="14" />
                <circle
                  cx="100" cy="100" r="86" fill="none"
                  stroke="oklch(58% 0.10 150)" strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 86}
                  strokeDashoffset={2 * Math.PI * 86 * (1 - progress)}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{ transition: "stroke-dashoffset 80ms linear" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div className="serif tabular" style={{ fontSize: 40, lineHeight: 1 }}>{Math.round(progress * 100)}<span style={{ fontSize: 22 }}>%</span></div>
              </div>
            </div>
          </div>

          <div className="scan-list">
            {SCAN_TARGETS.map((t, i) => {
              const start = i * 0.10;
              const end = start + 0.70;
              const local = Math.max(0, Math.min(1, (progress - start) / (end - start)));
              const isDone = local >= 1;
              const isActive = local > 0 && !isDone;
              return (
                <div key={t.id} className={"scan-row" + (isDone ? " done" : isActive ? " active" : "")}>
                  <div className="check" />
                  <div>
                    <div className="label">{t.label}</div>
                    {isActive && <div className="sub">{Math.round(t.count * local).toLocaleString()} of {t.count.toLocaleString()}</div>}
                    {isDone && <div className="sub">All {t.count.toLocaleString()} read</div>}
                  </div>
                  <div className="count">{isDone ? "Done" : isActive ? `${Math.round(local * 100)}%` : "Up next"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-bg" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {CONNECTOR_CATALOG.filter(c => selected[c.id]).map(c => (
                <img key={c.id} src={c.icon} alt={c.label} style={{ width: 36, height: 36, objectFit: "contain" }} />
              ))}
            </div>
            <h3>Connect {selectedCount} app{selectedCount === 1 ? "" : "s"}?</h3>
            <p>Read-only access — no sending, no changes. You can disconnect anytime.</p>
            <div className="actions" style={{ marginTop: 20 }}>
              <button className="btn ghost" onClick={() => setShowConfirm(false)}>Not now</button>
              <button className="btn" onClick={confirmConnect}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {phase === "connect" ? (
        canLookAround && (
          <div className="cta-center">
            <button className="btn lg" onClick={startScan}>
              Find repetitive work <Arrow />
            </button>
          </div>
        )
      ) : (
        <div className="cta">
          <div className="text">
            {scanDone
              ? <span><strong>All done.</strong> No-Go AI found 4 things it could help with. Let's look.</span>
              : <span>This is read-only. Nothing is being sent or changed.</span>}
          </div>
          <button className="btn lg" disabled={!scanDone} onClick={onDone}>
            See what we found <Arrow />
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== 3. Recommend ===== */
function Recommend({ onSetup, deployed }) {
  const available = FOUND_LOOPS.filter(l => !deployed.includes(l.id));
  const [selected, setSelected] = useState(() => {
    const init = {};
    available.forEach(l => { init[l.id] = !!l.primary; });
    return init;
  });
  const [expanded, setExpanded] = useState(null);

  function toggle(id, e) {
    e.stopPropagation();
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="fade-in">
      <div className="greeting">Here's what we found</div>
      <h1 className="display">Pick what to <strong>hand over.</strong></h1>
      <p className="lede">
        We scanned 90 days of data. Tap to select, tap a row to see why.
      </p>

      <div className="suggest-list">
        {available.map(l => {
          const isSel = !!selected[l.id];
          const isExp = expanded === l.id;
          return (
            <div key={l.id} className={"suggest-item" + (isSel ? " selected" : "")} onClick={() => setExpanded(isExp ? null : l.id)}>
              <div className="suggest-top">
                <div className="sel-check" onClick={(e) => toggle(l.id, e)}>
                  {isSel ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="6" fill="var(--primary)" />
                      <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="0.5" y="0.5" width="19" height="19" rx="5.5" stroke="var(--rule-2)" />
                    </svg>
                  )}
                </div>
                <div className="suggest-info">
                  <div className="suggest-title">
                    {l.title}
                    {l.primary && <span className="pill primary" style={{ marginLeft: 8 }}><span className="dot" />Recommended</span>}
                  </div>
                  <div className="suggest-values">
                    <div className="suggest-val">
                      <span className="suggest-val-num">{l.count.replace("/month", "")}</span>
                      <span className="suggest-val-label">/month</span>
                    </div>
                    <div className="suggest-val">
                      <span className="suggest-val-num">{l.hours.replace("/month", "")}</span>
                      <span className="suggest-val-label">saved</span>
                    </div>
                    {l.revenue !== "—" && (
                      <div className="suggest-val">
                        <span className="suggest-val-num suggest-val-green">{l.revenue.replace("/month", "")}</span>
                        <span className="suggest-val-label">/month</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="suggest-arrow" style={{ transform: isExp ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>
              {isExp && (
                <div className="suggest-detail fade-in">
                  {l.reasons.map((r, i) => (
                    <div className="cf-row" key={i}>
                      <div className="ic" />
                      <div>{r}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="cta-center">
          <button className="btn lg" onClick={onSetup}>
            Hand over {selectedCount} {selectedCount === 1 ? "task" : "tasks"} <Arrow />
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== 4. Setup ===== */
function Setup({ onReady }) {
  const [workflow, setWorkflow] = useState(HOW_IT_WORKS.map(s => ({ ...s })));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState("edit"); // "edit" | "pipeline" | "results"
  const [pipelineStage, setPipelineStage] = useState(0); // 0, 1, 2, 3(done)
  const [showFailures, setShowFailures] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const chatEndRef = React.useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  function sendMessage() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setMessages(m => [...m, { from: "user", text }]);
    setTyping(true);

    const lower = text.toLowerCase();
    const match = WORKFLOW_REPLIES.find(r => r.keywords.some(k => lower.includes(k)));

    setTimeout(() => {
      const reply = match ? match.text : WORKFLOW_DEFAULT_REPLY;
      setMessages(m => [...m, { from: "ai", text: reply }]);
      if (match) {
        setWorkflow(wf => {
          const next = [...wf];
          if (match.change) {
            next[match.change.idx] = { ...next[match.change.idx], label: match.change.label, detail: match.change.detail };
          }
          if (match.add) {
            next.push(match.add);
          }
          return next;
        });
      }
      setTyping(false);
    }, 800 + Math.random() * 600);
  }

  const PIPELINE = ["Build", "Test", "Simulate"];

  function startPipeline() {
    setPhase("pipeline");
    setPipelineStage(0);
    setTimeout(() => setPipelineStage(1), 1400);
    setTimeout(() => setPipelineStage(2), 2800);
    setTimeout(() => { setPipelineStage(3); setTimeout(() => setPhase("results"), 600); }, 4200);
  }

  return (
    <div className="fade-in">
      <div className="greeting">Setting up your workflow</div>
      <h1 className="display">Here's <strong>the workflow.</strong></h1>
      <p className="lede">
        Tap a step to see details. Type below to tweak it.
      </p>

      {/* Workflow steps */}
      <div className="steps-friendly">
        {workflow.map((s, i) => (
          <div className="sf-row" key={i} onClick={() => setExpandedStep(expandedStep === i ? null : i)} style={{ cursor: "pointer" }}>
            <div className={"sf-num " + (s.kind === "human" ? "gold" : s.kind === "trigger" ? "mint" : "")}>{i + 1}</div>
            <div>
              <div className="lbl">{s.label}</div>
              {expandedStep === i && <div className="det fade-in">{s.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      {phase === "edit" && (
        <>
          {messages.length > 0 && (
            <div className="setup-chat" style={{ marginTop: 16 }}>
              <div className="setup-chat-body">
                {messages.map((m, i) => (
                  <div key={i} className={"bubble " + (m.from === "ai" ? "ai" : "draft")} style={m.from === "user" ? { alignSelf: "flex-end" } : {}}>
                    {m.text}
                  </div>
                ))}
                {typing && (
                  <div className="bubble ai" style={{ color: "var(--ink-3)" }}>Thinking…</div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
          <div className="setup-chat-standalone">
            <input
              type="text"
              placeholder="Change anything — tone, timing, escalation…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={typing}
            />
            <button className="btn sm" onClick={sendMessage} disabled={!input.trim() || typing}>Send</button>
          </div>

          <div className="cta-center">
            <button className="btn lg" onClick={startPipeline}>
              Approve <Arrow />
            </button>
          </div>
        </>
      )}

      {/* Pipeline stepper */}
      {phase === "pipeline" && (
        <div className="pipeline-stepper fade-in" style={{ marginTop: 28 }}>
          {PIPELINE.map((label, i) => {
            const isDone = pipelineStage > i;
            const isActive = pipelineStage === i;
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className={"pipeline-arrow" + (pipelineStage > i ? " done" : "")}>
                    <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                      <path d="M1 7h21M17 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className={"pipeline-step" + (isDone ? " done" : isActive ? " active" : "")}>
                  <div className="pipeline-step-icon">
                    {isDone ? "✓" : isActive ? <span className="spinner" /> : ""}
                  </div>
                  <div className="pipeline-step-label">{label}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Results */}
      {phase === "results" && (
        <div className="fade-in" style={{ marginTop: 28 }}>
          <div className="sim-result">
            <div className="sim-result-top">
              <span className="pill go" style={{ height: 30, fontSize: 14 }}><span className="dot" /> Safe to deploy</span>
            </div>
            <div className="sim-result-score serif tabular">{SIM_RESULTS.score}%<small> success rate</small></div>
            <div className="sim-result-counts">
              <span><strong>{SIM_RESULTS.total}</strong> scenarios tested</span>
              <span style={{ color: "var(--go)" }}><strong>{SIM_RESULTS.passed}</strong> passed</span>
              <span style={{ color: "var(--wait)" }}><strong>{SIM_RESULTS.failed}</strong> failed</span>
            </div>
          </div>

          <div
            onClick={() => setShowFailures(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 14, fontSize: 14, color: "var(--ink-2)" }}
          >
            <span>{SIM_RESULTS.failed} failed scenario{SIM_RESULTS.failed === 1 ? "" : "s"}</span>
            <span style={{ fontSize: 12, color: "var(--ink-3)", transition: "transform 200ms", transform: showFailures ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </div>
          {showFailures && (
            <div className="fail-list fade-in" style={{ marginTop: 8 }}>
              {SIM_RESULTS.failures.map((f, i) => (
                <div className="fail-row" key={i}>
                  <div className="fail-tenant">{f.tenant}</div>
                  <div className="fail-reason">{f.reason}</div>
                  <div className="fail-suggestion">{f.suggestion}</div>
                </div>
              ))}
            </div>
          )}

          <div className="cta-center">
            <button className="btn lg" onClick={onReady}>
              Deploy <Arrow />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 5. Inbox / Approval ===== */
function Inbox({ onDone }) {
  const [activeId, setActiveId] = useState(DRAFTS[0].id);
  const [handled, setHandled] = useState({});
  const [trusted, setTrusted] = useState(false);
  const [trustModal, setTrustModal] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const active = DRAFTS.find(d => d.id === activeId);

  function handle(action, opts = {}) {
    const auto = !!opts.auto;
    setHandled(h => ({ ...h, [activeId]: { action, auto } }));
    const next = DRAFTS.find(d => d.id !== activeId && !handled[d.id]);
    if (next) setTimeout(() => setActiveId(next.id), auto ? 900 : 400);
  }

  // Auto-run after trust granted
  useEffect(() => {
    if (!trusted) return;
    const remaining = DRAFTS.filter(d => !handled[d.id]);
    if (remaining.length === 0) { setAutoRunning(false); return; }
    setAutoRunning(true);
    const next = remaining[0];
    setActiveId(next.id);
    const t = setTimeout(() => {
      // For "wait" risk drafts, auto-route to the recommended primary action (e.g. "Send to Priya")
      // For "low" risk, send.
      setHandled(h => ({ ...h, [next.id]: { action: next.primary, auto: true } }));
    }, 1100);
    return () => clearTimeout(t);
  }, [trusted, handled]);

  function confirmTrust() {
    setTrustModal(false);
    setTrusted(true);
  }

  const handledCount = Object.keys(handled).length;
  const canContinue = handledCount >= 1;
  const remainingCount = DRAFTS.length - handledCount;
  const showTrustOffer = handledCount >= 1 && !trusted && remainingCount > 0;

  return (
    <div className="fade-in">
      <div className="greeting">Good morning, Abigail</div>
      <h1 className="display">
        Here's what I found <strong>this morning.</strong>
        {trusted && <span className="trust-badge"><span className="dot" />Trusted</span>}
      </h1>
      <p className="lede">
        {trusted
          ? <>You've trusted me with this kind of work. I'll handle the rest the way you would — and you can take the wheel back any time.</>
          : <>Three drafts ready for you. Take a look, send the ones that look right, and ask me about anything that doesn't.</>}
      </p>

      <div className="chat">
        <div>
          <div className="chat-list-head">
            <span>Today · {DRAFTS.length}</span>
            <span>{handledCount} done</span>
          </div>
          <div className="chat-list">
            {DRAFTS.map(d => {
              const isActive = d.id === activeId;
              const h = handled[d.id];
              const isHandled = !!h;
              return (
                <div
                  key={d.id}
                  className={"chat-item" + (isActive ? " active" : "") + (isHandled ? " handled" : "")}
                  onClick={() => setActiveId(d.id)}
                >
                  <div className="av">{d.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="name">
                      <span>{d.name}</span>
                      <span className="time">
                        {isHandled
                          ? (h.auto ? <span className="auto-tag">auto</span> : "✓")
                          : d.time}
                      </span>
                    </div>
                    <div className="preview">{d.aiNote}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chat-pane" key={active.id}>
          <div className="chat-head">
            <div className="av">{active.initials}</div>
            <div style={{ flex: 1 }}>
              <h3>{active.name}</h3>
              <div className="sub">{active.account}</div>
            </div>
            {active.risk === "wait" && <span className="pill wait"><span className="dot" />Heads up</span>}
            {active.risk === "low" && <span className="pill go"><span className="dot" />Looks safe</span>}
          </div>

          <div className="chat-body">
            <div className="bubble ai">{active.aiNote}</div>

            {active.note && (
              <div className="bubble note">
                <strong>Heads up:</strong> {active.note}
              </div>
            )}

            {active.body && (
              <div className="bubble draft">
                <div className="draft-label">Draft email · ready to send</div>
                {active.subject && <div className="subj">Subject: {active.subject}</div>}
                {active.body}
              </div>
            )}
            {active.risk === "wait" && !active.body && (
              <div className="bubble ai">
                I haven't drafted an email — I think this should go to a person first.
              </div>
            )}
          </div>

          {handled[active.id] ? (
            <div className={"chat-handled" + (handled[active.id].auto ? " auto" : "")}>
              <div className="ic">{handled[active.id].auto ? "⚡" : "✓"}</div>
              <div>
                <strong>
                  {handled[active.id].auto ? "Auto-sent by No-Go AI." : `${handled[active.id].action}.`}
                </strong>{" "}
                {handled[active.id].action === "Send it" && (handled[active.id].auto
                  ? "I'll let you know if there's no reply in a week."
                  : "Sent. I'll check back in a week if there's no reply.")}
                {handled[active.id].action === "Send to Priya" && (handled[active.id].auto
                  ? "Routed to Priya with the full email thread."
                  : "Sent to Priya with the full email thread.")}
                {handled[active.id].action === "Edit first" && "Saved as a draft for you to edit."}
                {handled[active.id].action === "Skip" && "Skipped. I won't bring this up again for two weeks."}
              </div>
            </div>
          ) : autoRunning ? (
            <div className="chat-handled auto pending">
              <div className="ic spinning">⏳</div>
              <div><strong>No-Go AI is handling this…</strong> {active.primary.toLowerCase()}</div>
            </div>
          ) : (
            <>
              <div className="chat-actions">
                {active.actions.map(a => (
                  <button
                    key={a}
                    className={"btn " + (a === active.primary ? "" : "ghost")}
                    onClick={() => handle(a)}
                  >{a}</button>
                ))}
              </div>
              {showTrustOffer && (
                <div className="trust-offer">
                  <div className="trust-offer-text">
                    <strong>Like what you're seeing?</strong>{" "}
                    Trust No-Go to handle the remaining {remainingCount === 1 ? "draft" : `${remainingCount} drafts`} like this — same kind of work, same judgment.
                  </div>
                  <button className="btn ghost sm" onClick={() => setTrustModal(true)}>
                    Trust No-Go <Arrow />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="cta">
        <div className="text">
          {canContinue
            ? <span><strong>Nice work.</strong> Want to see what a month of this looks like?</span>
            : <span>Try sending one, or send it to a person — that's it.</span>}
        </div>
        <button className="btn lg" disabled={!canContinue} onClick={onDone}>See the month <Arrow /></button>
      </div>

      {trustModal && (
        <div className="modal-scrim" onClick={() => setTrustModal(false)}>
          <div className="modal trust-modal" onClick={e => e.stopPropagation()}>
            <div className="trust-modal-head">
              <div className="trust-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3>Trust No-Go to handle late-rent reminders</h3>
                <div className="sub">From now on, I'll send these without asking first.</div>
              </div>
            </div>

            <div className="trust-modal-body">
              <div className="trust-section-title">What I'll do on my own</div>
              <ul className="trust-list">
                <li><span className="ic ok">✓</span> Send late-rent reminders that look like the ones you've approved</li>
                <li><span className="ic ok">✓</span> Match the tone to the tenant's history (gentle for first-timers, firmer for repeat lateness)</li>
                <li><span className="ic ok">✓</span> Log every send to your No-Go AI activity feed</li>
              </ul>

              <div className="trust-section-title">What I'll still ask about</div>
              <ul className="trust-list">
                <li><span className="ic alert">!</span> Anything unusual — payment plans, disputes, hardship mentions</li>
                <li><span className="ic alert">!</span> Tenants I've never written to before</li>
                <li><span className="ic alert">!</span> Anything I'm not sure about</li>
              </ul>

              <div className="trust-undo">
                <strong>You can take this back any time.</strong> Just say "stop auto-sending" or flip the switch in settings. I'll go back to asking first.
              </div>
            </div>

            <div className="trust-modal-actions">
              <button className="btn ghost" onClick={() => setTrustModal(false)}>Not yet</button>
              <button className="btn" onClick={confirmTrust}>Trust No-Go</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 6. Savings ===== */
function CountUp({ to, prefix = "", suffix = "", decimals = 0, dur = 1100 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - start) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  const formatted = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();
  return <span className="tabular">{prefix}{formatted}{suffix}</span>;
}

/* ===== Running ===== */
function Running({ onBackToRecommend }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [editing, setEditing] = useState(false);
  const [workflow, setWorkflow] = useState(HOW_IT_WORKS.map(s => ({ ...s })));
  const [messages, setMessages] = useState([]);
  const [editInput, setEditInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const chatEndRef = React.useRef(null);

  // Simulate time passing — stats count up
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => { if (elapsed < 30) setElapsed(e => e + 1); }, 100);
    return () => clearTimeout(t);
  }, [elapsed, paused]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const progress = Math.min(1, elapsed / 30);

  function sendEdit() {
    const text = editInput.trim();
    if (!text || typing) return;
    setEditInput("");
    setMessages(m => [...m, { from: "user", text }]);
    setTyping(true);

    const lower = text.toLowerCase();
    const match = WORKFLOW_REPLIES.find(r => r.keywords.some(k => lower.includes(k)));

    setTimeout(() => {
      const reply = match ? match.text : WORKFLOW_DEFAULT_REPLY;
      setMessages(m => [...m, { from: "ai", text: reply }]);
      if (match) {
        setWorkflow(wf => {
          const next = [...wf];
          if (match.change) {
            next[match.change.idx] = { ...next[match.change.idx], label: match.change.label, detail: match.change.detail };
          }
          if (match.add) next.push(match.add);
          return next;
        });
      }
      setTyping(false);
    }, 800 + Math.random() * 600);
  }

  return (
    <div className="fade-in">
      <div className="greeting">Workflows are live</div>
      <h1 className="display">Your agents are <strong>running.</strong></h1>
      <p className="lede">
        Deployed workflows are active. You'll get approvals on WhatsApp.
      </p>

      {/* Active workflow card */}
      <div className={"running-card" + (paused ? "" : " live")} style={{ marginTop: 28 }}>
        <div className="running-card-header">
          <div>
            <div className="running-card-title">Chasing late rent</div>
            <div className="running-card-sub">Deployed just now · runs every weekday at 8am</div>
          </div>
          <span className={paused ? "pill wait" : "pill go"}>
            <span className="dot" />{paused ? "Paused" : "Live"}
          </span>
        </div>
        <div className="running-stats">
          <div className="running-stat">
            <div className="running-stat-v tabular"><CountUp to={Math.round(148 * progress)} /></div>
            <div className="running-stat-k">reminders sent</div>
          </div>
          <div className="running-stat">
            <div className="running-stat-v tabular"><CountUp to={Math.round(31 * progress)} />h</div>
            <div className="running-stat-k">hours saved</div>
          </div>
          <div className="running-stat">
            <div className="running-stat-v tabular" style={{ color: paused ? "var(--ink-3)" : "var(--go)" }}>$<CountUp to={Math.round(92 * progress)} />k</div>
            <div className="running-stat-k">collected</div>
          </div>
          <div className="running-stat">
            <div className="running-stat-v tabular">6.1x</div>
            <div className="running-stat-k">ROI</div>
          </div>
        </div>

        {/* Actions */}
        <div className="running-actions">
          <button className="running-icon-btn" onClick={() => setPaused(p => !p)} title={paused ? "Resume" : "Pause"}>
            {paused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
          </button>
          <button className="running-icon-btn" onClick={() => setEditing(e => !e)} title={editing ? "Close editor" : "Edit workflow"}>
            {editing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            )}
          </button>
        </div>

        {/* Inline edit */}
        {editing && (
          <div className="running-edit fade-in">
            <div className="steps-friendly" style={{ marginTop: 0 }}>
              {workflow.map((s, i) => (
                <div className="sf-row" key={i} onClick={() => setExpandedStep(expandedStep === i ? null : i)} style={{ cursor: "pointer" }}>
                  <div className={"sf-num " + (s.kind === "human" ? "gold" : s.kind === "trigger" ? "mint" : "")}>{i + 1}</div>
                  <div>
                    <div className="lbl">{s.label}</div>
                    {expandedStep === i && <div className="det fade-in">{s.detail}</div>}
                  </div>
                </div>
              ))}
            </div>

            {messages.length > 0 && (
              <div className="setup-chat" style={{ marginTop: 12 }}>
                <div className="setup-chat-body">
                  {messages.map((m, i) => (
                    <div key={i} className={"bubble " + (m.from === "ai" ? "ai" : "draft")} style={m.from === "user" ? { alignSelf: "flex-end" } : {}}>
                      {m.text}
                    </div>
                  ))}
                  {typing && <div className="bubble ai" style={{ color: "var(--ink-3)" }}>Thinking…</div>}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            <div className="setup-chat-standalone" style={{ marginTop: 12 }}>
              <input
                type="text"
                placeholder="Change anything — tone, timing, escalation…"
                value={editInput}
                onChange={e => setEditInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendEdit()}
                disabled={typing}
              />
              <button className="btn sm" onClick={sendEdit} disabled={!editInput.trim() || typing}>Send</button>
            </div>
          </div>
        )}
      </div>

      {/* Back to recommend */}
      <div className="cta-center" style={{ marginTop: 32 }}>
        <button className="btn lg" onClick={onBackToRecommend}>
          Automate more <Arrow />
        </button>
      </div>

      {/* Closing */}
      <div className="card card-pad-lg" style={{ marginTop: 32, background: "var(--ink)", color: "white", border: 0 }}>
        <div style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.015em", fontWeight: 300 }}>
          No-Go AI learns your work, asks before it acts, and proves it saved you time.
        </div>
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 300, color: "oklch(82% 0.02 240)" }}>
          We don't sell AI. We sell time back to you and your team.
        </div>
      </div>

    </div>
  );
}

Object.assign(window, {
  Sidebar, Connect, Recommend, Setup, Running,
});

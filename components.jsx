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
function Sidebar({ current, onJump, completed }) {
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
          return (
            <div key={s.id} className={cls} onClick={() => onJump(s.id)}>
              <div className="num"><span>{s.n}</span></div>
              <div>{s.label}</div>
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
  const [authing, setAuthing] = useState(null);
  const [phase, setPhase] = useState("connect"); // "connect" | "scanning" | "scanned"
  const [progress, setProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [showConnected, setShowConnected] = useState(false);

  const required = CONNECTOR_CATALOG.filter(c => c.recommended).map(c => c.id);
  const reqDone = required.filter(id => connected[id]).length;
  const totalConnected = Object.values(connected).filter(v => v === true).length;
  const canLookAround = reqDone >= 3;

  const [connectAllModal, setConnectAllModal] = useState(false);

  function connectAll() {
    const unconnected = CONNECTOR_CATALOG.filter(c => connected[c.id] !== true);
    if (unconnected.length === 0) return;
    setConnectAllModal(true);
  }

  function confirmAll() {
    setConnectAllModal(false);
    CONNECTOR_CATALOG.forEach((c, i) => {
      if (connected[c.id] === true) return;
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: "loading" })), i * 120);
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: true })), i * 120 + 600);
    });
  }

  // Tweak-driven trigger
  useEffect(() => { if (connectAllTrigger) connectAll(); }, [connectAllTrigger]);

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

  function start(c) {
    if (connected[c.id]) setConnected(s => ({ ...s, [c.id]: false }));
    else setAuthing(c);
  }
  function confirm() {
    const c = authing;
    setAuthing(null);
    setConnected(s => ({ ...s, [c.id]: "loading" }));
    setTimeout(() => setConnected(s => ({ ...s, [c.id]: true })), 800);
  }

  const total = SCAN_TARGETS.reduce((s, t) => s + t.count, 0);
  const scanned = Math.round(total * progress);
  const found = Math.min(4, Math.floor(progress * 5));

  return (
    <div className="fade-in">
      <div className="greeting">Hi Abigail, let's get you set up</div>
      <h1 className="display"><strong>Connect</strong> the apps where your work lives.</h1>
      <p className="lede">
        Pick the apps you use every day. No-Go AI will read them so it can help — but it won't
        change anything or send anything without asking you first.
      </p>

      <div className="connect-summary">
        <div className="cs-card">
          <div className="k">Connected</div>
          <div className="v tabular">{totalConnected}<small>/ 6</small></div>
        </div>
        <div className="cs-card">
          <div className="k">Recommended apps</div>
          <div className="v tabular">{reqDone}<small>/ 4 (need 3)</small></div>
        </div>
        <div className="cs-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="k">Quick option</div>
          <button
            className="btn sm"
            onClick={connectAll}
            disabled={totalConnected === CONNECTOR_CATALOG.length || phase !== "connect"}
            style={{ alignSelf: "flex-start", marginTop: 8 }}
          >
            {totalConnected === CONNECTOR_CATALOG.length ? "All connected ✓" : "Connect all apps"}
          </button>
        </div>
      </div>

      {/* Connected apps bar */}
      {totalConnected > 0 && (
        <div className="connected-bar" style={{ marginTop: 20 }}>
          <div className="connected-bar-header" onClick={() => setShowConnected(s => !s)} style={{ cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
              {totalConnected} connected
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{showConnected ? "▲ Hide" : "▼ Show"}</span>
          </div>
          {showConnected && (
            <div className="connected-icons-row">
              {CONNECTOR_CATALOG.filter(c => connected[c.id] === true).map(c => (
                <div className="connected-icon-item" key={c.id}>
                  <img src={c.icon} alt={c.label} title={c.label} />
                  {phase === "connect" && (
                    <button className="disconnect-btn" onClick={() => start(c)} title="Disconnect">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="connector-list">
        {CONNECTOR_CATALOG.filter(c => connected[c.id] !== true).map(c => {
          const state = connected[c.id];
          const isLoading = state === "loading";
          return (
            <div className="connector" key={c.id}>
              {c.recommended && <span className="pill go rec-pill"><span className="dot" />Rec</span>}
              <div className="info-trigger">
                i
                <div className="info-tooltip">{c.desc}</div>
              </div>
              <div className="ic"><img src={c.icon} alt={c.label} /></div>
              <span className="label">{c.label}</span>
              <div className="right">
                {isLoading ? (
                  <span className="row" style={{ gap: 8, justifyContent: "center" }}>
                    <span className="spinner" /> <span style={{ fontSize: 14, color: "var(--ink-3)" }}>Connecting…</span>
                  </span>
                ) : phase === "connect" ? (
                  <button className="btn" onClick={() => start(c)}>Connect</button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

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

      {authing && (
        <div className="modal-bg" onClick={() => setAuthing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="vendor-ic"><img src={authing.icon} alt={authing.label} style={{ width: 40, height: 40, objectFit: "contain" }} /></div>
            <h3>Connect {authing.label}?</h3>
            <p>You'll be sent to {authing.label} to log in. No-Go AI will only be able to:</p>
            <div className="scope-list">
              {(authing.scopes || []).map((s, i) => (
                <div className="scope-row" key={i}><div className="ic" /><div>{s}</div></div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>You can disconnect anytime in Settings.</p>
            <div className="actions">
              <button className="btn ghost" onClick={() => setAuthing(null)}>Not now</button>
              <button className="btn" onClick={confirm}>Yes, connect</button>
            </div>
          </div>
        </div>
      )}

      {connectAllModal && (
        <div className="modal-bg" onClick={() => setConnectAllModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="vendor-ic" style={{ display: "flex", gap: 4 }}>
              {CONNECTOR_CATALOG.filter(c => connected[c.id] !== true).slice(0, 4).map(c => (
                <img key={c.id} src={c.icon} alt={c.label} style={{ width: 28, height: 28, objectFit: "contain" }} />
              ))}
            </div>
            <h3>Connect all apps?</h3>
            <p>No-Go AI will connect to all remaining apps. For each one, it will only be able to read — no sending, no editing, no deleting.</p>
            <div className="scope-list">
              <div className="scope-row"><div className="ic" /><div>Read-only access to each app</div></div>
              <div className="scope-row"><div className="ic" /><div>No actions taken without your approval</div></div>
              <div className="scope-row"><div className="ic" /><div>Disconnect any app anytime in Settings</div></div>
            </div>
            <div className="actions">
              <button className="btn ghost" onClick={() => setConnectAllModal(false)}>Not now</button>
              <button className="btn" onClick={confirmAll}>Yes, connect all</button>
            </div>
          </div>
        </div>
      )}

      {phase === "connect" ? (
        canLookAround ? (
          <div className="cta-center">
            <div className="text" style={{ textAlign: "center", marginBottom: 16 }}>
              <strong>Looking good!</strong> Let's see what No-Go AI finds.
            </div>
            <button className="btn lg" onClick={startScan}>
              Look around <Arrow />
            </button>
          </div>
        ) : (
          <div className="cta">
            <div className="text">
              Connect at least <strong>three</strong> of the recommended apps to keep going.
            </div>
            <button className="btn lg" disabled>
              Look around <Arrow />
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
function Recommend({ onSetup }) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const init = {};
    FOUND_LOOPS.forEach(l => { init[l.id] = !!l.primary; });
    return init;
  });

  function toggle(id) {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="fade-in">
      <div className="greeting">Here's what No-Go AI thinks</div>
      <h1 className="display">Choose what to <strong>hand over.</strong></h1>
      <p className="lede">
        We found repetitive work we can help with. Pick what you'd like No-Go AI to handle —
        you can always change your mind later.
      </p>

      <div className="rec-headline">
        <div className="label">
          <span className="pill primary"><span className="dot" />Best place to start</span>
          <span className="info-trigger" style={{ position: "relative", top: 0, right: 0, marginLeft: 8 }}>
            i
            <div className="info-tooltip" style={{ top: 28, left: -100, right: "auto" }}>
              We saw 94 late-rent emails last month. They're almost the same every time — friendly
              reminder, then attach the balance, then check back in a week.
            </div>
          </span>
        </div>
        <h2>Chasing late rent</h2>

        <div className="rec-stats">
          <div className="rec-stat">
            <div className="k">How often it happens</div>
            <div className="v tabular">94<small> times/month</small></div>
          </div>
          <div className="rec-stat">
            <div className="k">Time you'd get back</div>
            <div className="v tabular">~22<small> hrs/month</small></div>
          </div>
          <div className="rec-stat">
            <div className="k">Likely collected faster</div>
            <div className="v tabular">$5.6<small>k / month</small></div>
          </div>
        </div>
      </div>

      <div
        className="collapsible-header"
        onClick={() => setWhyOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 36, marginBottom: 8 }}
      >
        <h3 className="serif" style={{ fontWeight: 400, fontSize: 26, margin: 0, letterSpacing: "-0.015em" }}>
          Why this one first?
        </h3>
        <span style={{ fontSize: 14, color: "var(--ink-3)", transition: "transform 200ms", transform: whyOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {whyOpen && (
        <div className="checks-friendly fade-in">
          {RECOMMEND_REASONS.map((r, i) => (
            <div className="cf-row" key={i}>
              <div className="ic" />
              <div>{r}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rec-list" style={{ marginTop: 28 }}>
        <div className="rec-list-head">
          {selectedCount} selected · click to select or deselect
        </div>
        {FOUND_LOOPS.map(l => (
          <div
            className={"rec-item " + l.readiness + (selected[l.id] ? " selected" : "")}
            key={l.id}
            onClick={() => toggle(l.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="sel-check">
              {selected[l.id] ? (
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
            <div className="badge">{l.emoji}</div>
            <div>
              <div className="title">{l.title}</div>
              <div className="sub">{l.count}</div>
            </div>
            <div>
              {l.primary && <span className="pill primary"><span className="dot" />Recommended</span>}
              {l.readiness === "wait" && <span className="pill wait"><span className="dot" />Maybe later</span>}
              {l.readiness === "no" && <span className="pill"><span className="dot" />Not safe yet</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="cta-center">
        <div className="text" style={{ textAlign: "center", marginBottom: 16 }}>
          <strong>You're always in control.</strong> Nothing gets sent without you clicking "Send."
        </div>
        <button className="btn lg" disabled={selectedCount === 0} onClick={onSetup}>
          Hand over {selectedCount} {selectedCount === 1 ? "task" : "tasks"} to No-Go <Arrow />
        </button>
      </div>
    </div>
  );
}

/* ===== 4. Setup ===== */
function Setup({ onReady }) {
  const [workflow, setWorkflow] = useState(HOW_IT_WORKS.map(s => ({ ...s })));
  const [messages, setMessages] = useState([
    { from: "ai", text: "Here's the workflow I've built for chasing late rent. Review the steps below — if you'd like to change anything, just tell me." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState("edit"); // "edit" | "pipeline" | "results" | "deploy"
  const [pipelineStage, setPipelineStage] = useState(0); // 0=dev, 1=test, 2=simulate
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

  function startPipeline() {
    setPhase("pipeline");
    setPipelineStage(0);
    setTimeout(() => setPipelineStage(1), 1800);
    setTimeout(() => setPipelineStage(2), 3600);
    setTimeout(() => setPhase("results"), 5800);
  }

  const PIPELINE_STAGES = [
    { label: "Building", desc: "Compiling workflow into executable steps…" },
    { label: "Testing", desc: "Running unit checks on each step…" },
    { label: "Simulating", desc: "Replaying 94 real scenarios from last month…" },
  ];

  return (
    <div className="fade-in">
      <div className="greeting">Setting up your workflow</div>
      <h1 className="display">Review and <strong>refine.</strong></h1>
      <p className="lede">
        No-Go AI built a workflow based on your data. Tweak it with the chat below, then approve to run it through safety checks.
      </p>

      {/* Workflow + Chat side by side */}
      {phase === "edit" ? (
        <div className="setup-grid">
          <div className="steps-friendly">
            {workflow.map((s, i) => (
              <div className="sf-row fade-in" key={i} onClick={() => setExpandedStep(expandedStep === i ? null : i)} style={{ cursor: "pointer" }}>
                <div className={"sf-num " + (s.kind === "human" ? "gold" : s.kind === "trigger" ? "mint" : "")}>{i + 1}</div>
                <div>
                  <div className="lbl">{s.label}</div>
                  {expandedStep === i && <div className="det fade-in">{s.detail}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="setup-chat">
            <div className="setup-chat-body">
              {messages.map((m, i) => (
                <div key={i} className={"bubble " + (m.from === "ai" ? "ai" : "draft")} style={m.from === "user" ? { alignSelf: "flex-end" } : {}}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="bubble ai" style={{ color: "var(--ink-3)" }}>
                  <span className="typing-dots">Thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="setup-chat-input">
              <input
                type="text"
                placeholder="Adjust the workflow…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                disabled={typing}
              />
              <button className="btn sm" onClick={sendMessage} disabled={!input.trim() || typing}>Send</button>
            </div>
          </div>
        </div>
      ) : (
        /* Workflow steps only (no chat) during pipeline/results */
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
      )}

      {/* Approve or Pipeline */}
      {phase === "edit" && (
        <div className="cta-center" style={{ marginTop: 32 }}>
          <div className="text" style={{ textAlign: "center", marginBottom: 16 }}>
            <strong>Happy with the workflow?</strong> Approve to run safety checks.
          </div>
          <button className="btn lg" onClick={startPipeline}>
            Approve & run checks <Arrow />
          </button>
        </div>
      )}

      {/* Pipeline animation */}
      {phase === "pipeline" && (
        <div className="pipeline fade-in" style={{ marginTop: 32 }}>
          <h3 className="serif" style={{ fontWeight: 400, fontSize: 26, letterSpacing: "-0.015em", marginBottom: 20 }}>
            Running safety checks…
          </h3>
          <div className="pipeline-stages">
            {PIPELINE_STAGES.map((s, i) => {
              const isDone = pipelineStage > i;
              const isActive = pipelineStage === i;
              return (
                <div key={i} className={"pipeline-stage" + (isDone ? " done" : isActive ? " active" : "")}>
                  <div className="pipeline-icon">
                    {isDone ? "✓" : isActive ? <span className="spinner" /> : (i + 1)}
                  </div>
                  <div>
                    <div className="pipeline-label">{s.label}</div>
                    <div className="pipeline-desc">{isDone ? "Complete" : isActive ? s.desc : "Waiting…"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "results" && (
        <div className="fade-in" style={{ marginTop: 32 }}>
          <div className="sim-result-hero">
            <div>
              <div className="sim-score tabular">{SIM_RESULTS.score}%</div>
              <div className="sim-score-label">success rate</div>
            </div>
            <div className="sim-stats">
              <div className="sim-stat">
                <div className="sim-stat-v tabular">{SIM_RESULTS.total}</div>
                <div className="sim-stat-k">scenarios tested</div>
              </div>
              <div className="sim-stat">
                <div className="sim-stat-v tabular" style={{ color: "var(--go)" }}>{SIM_RESULTS.passed}</div>
                <div className="sim-stat-k">passed</div>
              </div>
              <div className="sim-stat">
                <div className="sim-stat-v tabular" style={{ color: "var(--wait)" }}>{SIM_RESULTS.failed}</div>
                <div className="sim-stat-k">failed</div>
              </div>
            </div>
          </div>

          <div className="pill go" style={{ marginTop: 16, height: 28, fontSize: 13 }}>
            <span className="dot" /> Workflow marked as safe
          </div>

          {/* Failed scenarios */}
          <div
            className="collapsible-header"
            onClick={() => setShowFailures(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 24, marginBottom: 8 }}
          >
            <span style={{ fontSize: 15, fontWeight: 500 }}>
              {SIM_RESULTS.failed} failed scenario{SIM_RESULTS.failed === 1 ? "" : "s"}
            </span>
            <span style={{ fontSize: 14, color: "var(--ink-3)", transition: "transform 200ms", transform: showFailures ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </div>
          {showFailures && (
            <div className="fail-list fade-in">
              {SIM_RESULTS.failures.map((f, i) => (
                <div className="fail-row" key={i}>
                  <div className="fail-tenant">{f.tenant}</div>
                  <div className="fail-reason">{f.reason}</div>
                  <div className="fail-suggestion">{f.suggestion}</div>
                </div>
              ))}
            </div>
          )}

          <div className="cta-center" style={{ marginTop: 32 }}>
            <div className="text" style={{ textAlign: "center", marginBottom: 16 }}>
              <strong>Ready to go live.</strong> Deploy this workflow to start handling late rent reminders.
            </div>
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

function Savings({ onNext }) {
  return (
    <div className="fade-in">
      <div className="greeting">Last month with No-Go AI</div>
      <h1 className="display">Look at <strong>what we did together.</strong></h1>
      <p className="lede">
        This is the work No-Go AI helped you finish in November. No charts, no jargon — just what
        actually got done.
      </p>

      <div className="savings-hero">
        <div className="lbl">{SAVINGS.bigLabel}</div>
        <div className="big">$<CountUp to={SAVINGS.big} />{SAVINGS.bigUnit}</div>
        <div className="desc">{SAVINGS.desc}</div>
      </div>

      <div className="savings-grid">
        {SAVINGS.tiles.map((t, i) => (
          <div className="sg-card" key={i}>
            <div className="k">{t.k}</div>
            <div className="v">
              {t.prefix && t.prefix}
              <CountUp to={t.v} decimals={t.suffix === "h" || t.suffix === " days" || t.prefix === "$" ? 1 : 0} suffix={t.suffix || ""} />
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad-lg" style={{ marginTop: 20, background: "var(--mint-soft)", border: "1px solid var(--mint)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24 }}>☕</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>That's almost a full work week back.</div>
            <div style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55 }}>
              31 hours a month is the kind of time you can actually feel — for the work that
              really needs your judgment, or for going home on time.
            </div>
          </div>
        </div>
      </div>

      <div className="cta">
        <div className="text"><strong>One down, more to go.</strong> Want to see what's next?</div>
        <button className="btn lg" onClick={onNext}>What's next <Arrow /></button>
      </div>
    </div>
  );
}

/* ===== 7. Expansion ===== */
function Expansion({ onRestart }) {
  return (
    <div className="fade-in">
      <div className="greeting">The road ahead</div>
      <h1 className="display">One helper running. <strong>More coming.</strong></h1>
      <p className="lede">
        Now that late-rent reminders are working, No-Go AI can take on more — when you're ready,
        and only when it's safe.
      </p>

      <div className="exp-list">
        {EXPANSION.map((e, i) => (
          <div className={"exp-row" + (e.state === "live" ? " live" : "")} key={e.id}>
            <div className="num">{e.state === "live" ? "✓" : i + 1}</div>
            <div>
              <div className="lbl">{e.label}</div>
              <div className="sub">{e.sub}</div>
            </div>
            <div className="right">
              {e.state === "live" && <span className="pill go"><span className="dot" />Running</span>}
              {e.state === "next" && <span className="pill primary"><span className="dot" />Up next</span>}
              {e.state === "queue" && <span className="pill"><span className="dot" />Later</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad-lg" style={{ marginTop: 32, background: "var(--ink)", color: "white", border: 0 }}>
        <div className="serif" style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.015em" }}>
          No-Go AI is the helper that learns your work, asks before it acts, and proves it saved you time.
        </div>
        <div style={{ marginTop: 16, fontSize: 15, color: "oklch(82% 0.02 240)", maxWidth: "60ch" }}>
          We don't sell AI. We sell time back to you and your team.
        </div>
      </div>

      <div className="cta">
        <div className="text"><strong>End of the tour.</strong> You can replay any step from the side menu.</div>
        <button className="btn ghost lg" onClick={onRestart}>Start over</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  Sidebar, Connect, Recommend, Setup, Inbox, Savings, Expansion,
});

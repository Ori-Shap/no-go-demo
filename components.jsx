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

/* ===== 1. Connect ===== */
function Connect({ onContinue, connectAllTrigger, autoAdvance, connected, setConnected }) {
  const [authing, setAuthing] = useState(null);

  const required = CONNECTOR_CATALOG.filter(c => c.recommended).map(c => c.id);
  const reqDone = required.filter(id => connected[id]).length;
  const totalConnected = Object.values(connected).filter(v => v === true).length;
  const canContinue = reqDone >= 3;

  function connectAll() {
    setAuthing(null);
    CONNECTOR_CATALOG.forEach((c, i) => {
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: "loading" })), i * 120);
      setTimeout(() => setConnected(s => ({ ...s, [c.id]: true })), i * 120 + 600);
    });
  }

  // Tweak-driven trigger
  useEffect(() => { if (connectAllTrigger) connectAll(); }, [connectAllTrigger]);

  useEffect(() => {
    if (!autoAdvance) return;
    if (canContinue) {
      const t = setTimeout(() => onContinue(), 900);
      return () => clearTimeout(t);
    }
  }, [autoAdvance, canContinue]);

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
            disabled={totalConnected === CONNECTOR_CATALOG.length}
            style={{ alignSelf: "flex-start", marginTop: 8 }}
          >
            {totalConnected === CONNECTOR_CATALOG.length ? "All connected ✓" : "Connect all apps"}
          </button>
        </div>
      </div>

      <div className="connector-list">
        {CONNECTOR_CATALOG.map(c => {
          const state = connected[c.id];
          const isOn = state === true;
          const isLoading = state === "loading";
          return (
            <div className={"connector" + (isOn ? " connected" : "")} key={c.id}>
              <div className="ic">{c.emoji}</div>
              <div>
                <div className="row" style={{ gap: 10 }}>
                  <span className="label">{c.label}</span>
                  {c.recommended && <span className="pill go"><span className="dot" />Recommended</span>}
                </div>
                <div className="desc">{c.desc}</div>
              </div>
              <div className="right">
                {isOn ? (
                  <>
                    <span className="pill go" style={{ marginBottom: 8 }}><span className="dot" />Connected</span>
                    <br />
                    <button className="btn ghost sm" onClick={() => start(c)}>Disconnect</button>
                  </>
                ) : isLoading ? (
                  <span className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                    <span className="spinner" /> <span style={{ fontSize: 14, color: "var(--ink-3)" }}>Connecting…</span>
                  </span>
                ) : (
                  <button className="btn" onClick={() => start(c)} style={{ height: 44, fontSize: 15 }}>Connect</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {authing && (
        <div className="modal-bg" onClick={() => setAuthing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="vendor-ic">{authing.emoji}</div>
            <h3>Connect {authing.label}?</h3>
            <p>You'll be sent to {authing.label} to log in. No-Go AI will only be able to:</p>
            <div className="scope-list">
              <div className="scope-row"><div className="ic" /><div>Read your messages and information</div></div>
              <div className="scope-row"><div className="ic" /><div>Find documents and attachments</div></div>
              <div className="scope-row"><div className="ic" /><div>That's it — no sending, no changing</div></div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>You can disconnect anytime in Settings.</p>
            <div className="actions">
              <button className="btn ghost" onClick={() => setAuthing(null)}>Not now</button>
              <button className="btn" onClick={confirm}>Yes, connect</button>
            </div>
          </div>
        </div>
      )}

      <div className="cta">
        <div className="text">
          {canContinue
            ? <span><strong>Looking good!</strong> Let's see what No-Go AI finds.</span>
            : <span>Connect at least <strong>three</strong> of the recommended apps to keep going.</span>}
        </div>
        <button className="btn lg" disabled={!canContinue} onClick={onContinue}>
          Continue <Arrow />
        </button>
      </div>
    </div>
  );
}

/* ===== 2a. Connected snapshot ===== */
function Connected({ onScan, connected }) {
  const list = CONNECTED_SYSTEMS.filter(s => connected[s.id] === true);
  const fallback = list.length === 0 ? CONNECTED_SYSTEMS.slice(0, 4) : list;
  const count = fallback.length;
  return (
    <div className="fade-in">
      <div className="greeting">All set</div>
      <h1 className="display">{count} app{count === 1 ? "" : "s"} connected. Ready to <strong>look around?</strong></h1>
      <p className="lede">
        No-Go AI is going to read the last 90 days from your apps to find work it can help with.
        It only reads — it won't send or change anything.
      </p>

      <div className="systems-grid" style={{ marginTop: 28 }}>
        {fallback.map(s => (
          <div className="connector connected" key={s.id} style={{ gridTemplateColumns: "56px 1fr auto" }}>
            <div className="ic">{s.emoji}</div>
            <div>
              <div className="label">{s.label}</div>
              <div className="desc">{s.desc}</div>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>{s.time}</div>
          </div>
        ))}
      </div>

      <div className="cta">
        <div className="text">It usually takes about a minute. You can keep working — we'll let you know when it's done.</div>
        <button className="btn lg" onClick={onScan}>Look around <Arrow /></button>
      </div>
    </div>
  );
}

/* ===== 2b. Scan ===== */
function Scan({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf, start = performance.now(), dur = 4000;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = SCAN_TARGETS.reduce((s, t) => s + t.count, 0);
  const scanned = Math.round(total * progress);
  const found = Math.min(4, Math.floor(progress * 5));

  return (
    <div className="fade-in">
      <div className="greeting">Looking around your apps now</div>
      <h1 className="display">Reading the last 90 days.</h1>
      <p className="lede">
        This is just to find patterns — repetitive work that No-Go AI could help with.
        You'll see the suggestions in a moment.
      </p>

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

      <div className="cta">
        <div className="text">
          {done
            ? <span><strong>All done.</strong> No-Go AI found 4 things it could help with. Let's look.</span>
            : <span>This is read-only. Nothing is being sent or changed.</span>}
        </div>
        <button className="btn lg" disabled={!done} onClick={onDone}>See what we found <Arrow /></button>
      </div>
    </div>
  );
}

/* ===== 3. Recommend ===== */
function Recommend({ onSetup }) {
  return (
    <div className="fade-in">
      <div className="greeting">Here's what No-Go AI thinks</div>
      <h1 className="display">We can help with <strong>chasing late rent</strong> first.</h1>
      <p className="lede">
        It's the most common task we saw, it's safe to help with, and you'll feel the time saved
        almost right away.
      </p>

      <div className="rec-headline">
        <div className="label">
          <span className="pill primary"><span className="dot" />Best place to start</span>
        </div>
        <h2>Chasing late rent</h2>
        <p className="why">
          We saw 94 late-rent emails last month. They're almost the same every time — friendly
          reminder, then attach the balance, then check back in a week.
        </p>

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

      <h3 className="serif" style={{ fontWeight: 400, fontSize: 26, marginTop: 36, marginBottom: 8, letterSpacing: "-0.015em" }}>
        Why this one first?
      </h3>
      <div className="checks-friendly">
        {RECOMMEND_REASONS.map((r, i) => (
          <div className="cf-row" key={i}>
            <div className="ic" />
            <div>{r}</div>
          </div>
        ))}
      </div>

      <div className="rec-list">
        <div className="rec-list-head">
          We also found these — but they're not ready yet
        </div>
        {FOUND_LOOPS.filter(l => !l.primary).map(l => (
          <div className={"rec-item " + l.readiness} key={l.id}>
            <div className="badge">{l.emoji}</div>
            <div>
              <div className="title">{l.title}</div>
              <div className="sub">{l.count}</div>
            </div>
            <div>
              {l.readiness === "wait" && <span className="pill wait"><span className="dot" />Maybe later</span>}
              {l.readiness === "no" && <span className="pill"><span className="dot" />Not safe yet</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="cta">
        <div className="text">
          <strong>You're always in control.</strong> Nothing gets sent without you clicking "Send."
        </div>
        <button className="btn lg" onClick={onSetup}>Set this up <Arrow /></button>
      </div>
    </div>
  );
}

/* ===== 4. Setup ===== */
function Setup({ onReady }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= HOW_IT_WORKS.length) return;
    const t = setTimeout(() => setStep(s => s + 1), 320);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fade-in">
      <div className="greeting">Setting up your helper</div>
      <h1 className="display">Here's <strong>how it'll work.</strong></h1>
      <p className="lede">
        No-Go AI will follow these steps every weekday morning. You stay in charge — step 4 is
        where you say yes or no.
      </p>

      <div className="steps-friendly">
        {HOW_IT_WORKS.slice(0, step || HOW_IT_WORKS.length).map((s, i) => (
          <div className="sf-row" key={i}>
            <div className={"sf-num " + (s.kind === "human" ? "gold" : s.kind === "trigger" ? "mint" : "")}>{i + 1}</div>
            <div>
              <div className="lbl">{s.label}</div>
              <div className="det">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad-lg" style={{ marginTop: 20, background: "var(--gold-soft)", border: "1px solid var(--gold)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24 }}>👋</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>You're always the final say.</div>
            <div style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55 }}>
              No email gets sent without you clicking "Send it." If something looks unusual — a payment plan, a complaint, a missing invoice — No-Go AI will pause and ask you what to do.
            </div>
          </div>
        </div>
      </div>

      <div className="cta">
        <div className="text">
          {step < HOW_IT_WORKS.length
            ? <span>Setting things up…</span>
            : <span><strong>Ready.</strong> No-Go AI found 3 emails to look at this morning.</span>}
        </div>
        <button className="btn lg" disabled={step < HOW_IT_WORKS.length} onClick={onReady}>
          Open my inbox <Arrow />
        </button>
      </div>
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
  Sidebar, Connect, Connected, Scan, Recommend, Setup, Inbox, Savings, Expansion,
});

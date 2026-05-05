/* App orchestration */

const { useState: useAppState, useEffect: useAppEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "connectAll": false,
  "autoAdvance": false,
  "primaryColor": "#1f5fa8",
  "accentColor": "#94c8a4",
  "fontScale": 1.0,
  "skipToScreen": "connect"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useAppState("connect");
  const [completed, setCompleted] = useAppState([]);
  const [connectAllTrigger, setConnectAllTrigger] = useAppState(0);

  const [connected, setConnected] = useAppState({});

  // Apply theme tweaks live
  useAppEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", t.primaryColor);
    root.style.setProperty("--mint-deep", t.accentColor);
    root.style.fontSize = (16 * t.fontScale) + "px";
  }, [t.primaryColor, t.accentColor, t.fontScale]);

  // Skip to a specific screen on demand
  useAppEffect(() => {
    if (t.skipToScreen && t.skipToScreen !== "connect") {
      setScreen(t.skipToScreen);
      setTweak("skipToScreen", "connect");
    }
  }, [t.skipToScreen]);

  // Bump trigger whenever connectAll flips on, so Connect can react
  useAppEffect(() => {
    if (t.connectAll) setConnectAllTrigger(n => n + 1);
  }, [t.connectAll]);

  function done(stepId) {
    setCompleted(c => c.includes(stepId) ? c : [...c, stepId]);
  }
  function go(next, stepDone) {
    if (stepDone) done(stepDone);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const stepFromScreen = {
    connect: "connect", connected: "connect", scan: "discover",
    recommend: "recommend", setup: "deploy", inbox: "approve",
    savings: "measure", expansion: "measure",
  };

  function jump(stepId) {
    const target = {
      connect: "connect", discover: "scan", recommend: "recommend",
      deploy: "setup", approve: "inbox", measure: "savings",
    }[stepId];
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  let view;
  switch (screen) {
    case "connect": view = <Connect onContinue={() => go("connected", "connect")} connectAllTrigger={connectAllTrigger} autoAdvance={t.autoAdvance} connected={connected} setConnected={setConnected} />; break;
    case "connected": view = <Connected onScan={() => go("scan")} connected={connected} />; break;
    case "scan": view = <Scan onDone={() => go("recommend", "discover")} />; break;
    case "recommend": view = <Recommend onSetup={() => go("setup", "recommend")} />; break;
    case "setup": view = <Setup onReady={() => go("inbox", "deploy")} />; break;
    case "inbox": view = <Inbox onDone={() => go("savings", "approve")} />; break;
    case "savings": view = <Savings onNext={() => go("expansion")} />; break;
    case "expansion": view = <Expansion onRestart={() => { setCompleted([]); setConnected({}); go("connect"); }} />; break;
    default: view = null;
  }

  return (
    <div className="app">
      <Sidebar current={stepFromScreen[screen]} onJump={jump} completed={completed} />
      <main className="main" key={screen}>{view}</main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Demo shortcuts" />
        <TweakToggle label="Connect all apps" value={t.connectAll}
                     onChange={(v) => setTweak('connectAll', v)} />
        <TweakToggle label="Auto-continue after connect" value={t.autoAdvance}
                     onChange={(v) => setTweak('autoAdvance', v)} />
        <TweakSelect label="Jump to screen" value={t.skipToScreen}
                     options={["connect","connected","scan","recommend","setup","inbox","savings","expansion"]}
                     onChange={(v) => setTweak('skipToScreen', v)} />

        <TweakSection label="Look & feel" />
        <TweakColor label="Primary color" value={t.primaryColor}
                    onChange={(v) => setTweak('primaryColor', v)} />
        <TweakColor label="Accent color" value={t.accentColor}
                    onChange={(v) => setTweak('accentColor', v)} />
        <TweakSlider label="Text size" value={t.fontScale}
                     min={0.85} max={1.25} step={0.05} unit="×"
                     onChange={(v) => setTweak('fontScale', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

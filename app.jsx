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
  const [deployed, setDeployed] = useAppState([]);  // ids of deployed workflows
  const [selectedWorkflows, setSelectedWorkflows] = useAppState([]);  // ids chosen in Recommend

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
    connect: "connect",
    recommend: "recommend", setup: "deploy",
    running: "running",
  };

  function jump(stepId) {
    const target = {
      connect: "connect", discover: "connect", recommend: "recommend",
      deploy: "setup", running: "running",
    }[stepId];
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function onStartSetup(ids) {
    setSelectedWorkflows(ids);
    go("setup", "recommend");
  }

  function onDeployAll(ids) {
    setDeployed(d => [...d, ...ids.filter(id => !d.includes(id))]);
    done("deploy");
    setScreen("running");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openWhatsApp() {
    const w = 440, h = 720;
    const left = window.screenX + window.outerWidth - w - 40;
    const top = window.screenY + 60;
    window.open(
      "whatsapp/index.html",
      "whatsapp-demo",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no`
    );
  }

  let view;
  switch (screen) {
    case "connect": view = <Connect onDone={() => go("recommend", "connect")} connectAllTrigger={connectAllTrigger} autoAdvance={t.autoAdvance} connected={connected} setConnected={setConnected} />; break;
    case "recommend": view = <Recommend onSetup={onStartSetup} deployed={deployed} />; break;
    case "setup": view = <Setup workflowIds={selectedWorkflows} onDeployAll={onDeployAll} />; break;
    case "running": view = <Running deployed={deployed} onBackToRecommend={() => go("recommend")} onOpenWhatsApp={openWhatsApp} />; break;
    default: view = null;
  }

  return (
    <div className="app">
      <Sidebar current={stepFromScreen[screen]} onJump={jump} completed={completed} pendingCount={completed.includes("connect") ? FOUND_LOOPS.length - deployed.length : 0} />
      <main className="main" key={screen}>{view}</main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Demo shortcuts" />
        <TweakToggle label="Connect all apps" value={t.connectAll}
                     onChange={(v) => setTweak('connectAll', v)} />
        <TweakToggle label="Auto-continue after connect" value={t.autoAdvance}
                     onChange={(v) => setTweak('autoAdvance', v)} />
        <TweakSelect label="Jump to screen" value={t.skipToScreen}
                     options={["connect","recommend","setup","running"]}
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

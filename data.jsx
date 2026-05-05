// Friendlier mock data for "Abigail" version

const CONNECTOR_CATALOG = [
  { id: "gmail", label: "Gmail", icon: "icons/gmail.png", desc: "Where most of the day's work happens.", recommended: true,
    scopes: ["Read your emails and threads", "Search messages by sender or subject", "No sending, no deleting"] },
  { id: "qb", label: "QuickBooks", icon: "icons/quickbooks.png", desc: "Who paid, who hasn't, what's due.", recommended: true,
    scopes: ["Read invoices and balances", "View customer payment history", "No editing, no creating transactions"] },
  { id: "appfolio", label: "AppFolio", icon: "icons/appfolio.png", desc: "Tenants, leases, and balances.", recommended: true,
    scopes: ["Read tenant and lease records", "View maintenance requests", "No changes to any records"] },
  { id: "drive", label: "Google Drive", icon: "icons/drive.png", desc: "Invoices and lease documents.", recommended: true,
    scopes: ["Read documents and spreadsheets", "Find invoices and attachments", "No uploading, no editing files"] },
  { id: "outlook", label: "Outlook", icon: "icons/outlook.png", desc: "If you use Microsoft instead of Gmail.",
    scopes: ["Read your emails and calendar", "Search messages and contacts", "No sending, no deleting"] },
  { id: "stripe", label: "Stripe", icon: "icons/stripe.png", desc: "Confirms online payments.",
    scopes: ["Read payment records", "View transaction status", "No charges, no refunds"] },
];

const CONNECTED_SYSTEMS = [
  { id: "gmail", label: "Gmail", emoji: "✉️", desc: "1,486 emails read", time: "just now" },
  { id: "qb", label: "QuickBooks", emoji: "📒", desc: "428 balances read", time: "just now" },
  { id: "appfolio", label: "AppFolio", emoji: "🏢", desc: "312 tenants read", time: "1 min ago" },
  { id: "drive", label: "Google Drive", emoji: "📁", desc: "184 documents read", time: "2 min ago" },
  { id: "outlook", label: "Outlook", emoji: "📨", desc: "642 emails read", time: "3 min ago" },
  { id: "stripe", label: "Stripe", emoji: "💳", desc: "97 payments read", time: "3 min ago" },
];

const SCAN_TARGETS = [
  { id: "email", label: "Reading your emails", count: 1486 },
  { id: "balance", label: "Looking at unpaid balances", count: 428 },
  { id: "pms", label: "Reviewing tenant records", count: 312 },
  { id: "docs", label: "Scanning documents", count: 184 },
];

const FOUND_LOOPS = [
  { id: "rent", emoji: "💰", title: "Chasing late rent", count: "94 times last month", readiness: "go", primary: true },
  { id: "vendor", emoji: "🔧", title: "Following up with vendors", count: "63 times last month", readiness: "wait" },
  { id: "lease", emoji: "📝", title: "Lease renewals & paperwork", count: "38 times last month", readiness: "wait" },
  { id: "complaint", emoji: "🗣️", title: "Tenant complaints", count: "57 times last month", readiness: "no" },
];

const RECOMMEND_REASONS = [
  "It happens almost every day, so you'll feel the time back right away",
  "It's mostly the same email each time — easy and safe to draft",
  "If something looks unusual (like a payment plan), No-Go AI will ask you first",
  "Nothing gets sent until you click 'Send'",
];

const HOW_IT_WORKS = [
  { kind: "trigger", label: "When rent is 7+ days late", detail: "No-Go AI checks every morning at 8am." },
  { kind: "step", label: "Reads the tenant's history", detail: "Did they pay last month? Are they on a payment plan? Any open issues?" },
  { kind: "step", label: "Drafts a friendly message", detail: "Tone matches the situation — gentle for first-timers, firmer for repeat lateness." },
  { kind: "human", label: "Asks you to look it over", detail: "Right here in your No-Go AI inbox. Approve, edit, or skip." },
  { kind: "step", label: "Sends after you approve", detail: "Goes out from your normal email address. Logged for the record." },
];

// Smart replies for the workflow chat — keyword-matched
const WORKFLOW_REPLIES = [
  { keywords: ["tone", "soft", "gentle", "friendly", "nice"],
    text: "Got it — I've softened the tone across all templates. First-timers now get a warmer opener, and even repeat-late messages avoid any harsh language.",
    change: { idx: 2, label: "Drafts a warm, friendly message", detail: "Tone is always gentle — even for repeat lateness, the message stays supportive and professional." } },
  { keywords: ["day", "wait", "delay", "time", "sooner", "later", "week"],
    text: "Updated — I'll now wait 10 days instead of 7 before the first reminder, and space follow-ups 5 days apart instead of 3.",
    change: { idx: 0, label: "When rent is 10+ days late", detail: "No-Go AI checks every morning at 8am. Follow-ups spaced 5 days apart." } },
  { keywords: ["escalat", "manager", "priya", "forward", "route"],
    text: "Added an escalation step — if there's no response after two reminders, I'll flag it for Priya automatically instead of sending a third email.",
    change: null, add: { kind: "human", label: "Escalates to Priya after 2 tries", detail: "If no reply after two reminders, routes to your manager instead of sending more emails." } },
  { keywords: ["skip", "ignore", "exclude", "filter", "payment plan"],
    text: "Done — tenants on active payment plans will be automatically excluded. I'll only remind tenants with no arrangement in place.",
    change: { idx: 1, label: "Reads history (skips payment plans)", detail: "Checks for active payment plans and excludes those tenants automatically." } },
  { keywords: ["cc", "copy", "bcc", "notify"],
    text: "Added — I'll BCC you on every outgoing reminder so you always have a copy in your inbox.",
    change: { idx: 4, label: "Sends after you approve (BCC to you)", detail: "Goes from your email address. You get a BCC copy. Logged for the record." } },
];

const WORKFLOW_DEFAULT_REPLY = "Understood — I've updated the workflow with that change. Take another look at the steps below.";

// Simulation results
const SIM_RESULTS = {
  score: 96.4,
  total: 94,
  passed: 91,
  failed: 3,
  failures: [
    { tenant: "Unit 7C — David Park", reason: "Tenant has an open maintenance dispute. Reminder could escalate the situation.", suggestion: "Add dispute-detection to the skip list." },
    { tenant: "Unit 2A — Sarah Chen", reason: "Lease ends in 8 days. Late rent may be intentional move-out.", suggestion: "Cross-check lease end dates before sending." },
    { tenant: "Unit 15B — James Okafor", reason: "Tenant flagged as hardship case by property manager.", suggestion: "Exclude tenants with hardship flags." },
  ],
};

const DRAFTS = [
  {
    id: "d1",
    name: "Ava Thompson",
    initials: "AT",
    account: "Unit 4B, Harbor Lofts · $1,240 overdue",
    risk: "low",
    time: "9:14 AM",
    aiNote: "Ava's never been late before. I drafted a gentle reminder.",
    subject: "Quick reminder — November rent",
    body: "Hi Ava,\n\nJust a quick note — November rent ($1,240) shows as outstanding. If you've already sent it, please disregard, our system can take a day to update.\n\nLet me know if anything looks off.\n\nThanks,\nHarbor & Stone",
    actions: ["Send it", "Edit first", "Skip"],
    primary: "Send it",
  },
  {
    id: "d2",
    name: "Michael Reed",
    initials: "MR",
    account: "Unit 12A, Stoneview · $2,100 overdue",
    risk: "wait",
    time: "9:14 AM",
    aiNote: "Michael mentioned a payment plan in an email last month. I don't want to send a generic reminder over that — should I send this to Priya instead?",
    note: "Found in his Oct 18 email: \"…can we work out a plan for November?\"",
    actions: ["Send to Priya", "Edit first", "Skip"],
    primary: "Send to Priya",
  },
  {
    id: "d3",
    name: "Northline Cleaning",
    initials: "NC",
    account: "Vendor invoice · $3,700 pending",
    risk: "low",
    time: "9:14 AM",
    aiNote: "Northline asked for reimbursement but didn't attach the invoice PDF. I can ask them to send it.",
    subject: "Following up on INV-4421",
    body: "Hi Northline team,\n\nThanks for sending the reimbursement request. We have the invoice number (INV-4421) but the PDF didn't come through.\n\nCould you re-send the invoice? Once we have it we'll process the $3,700 within 5 business days.\n\nThanks,\nHarbor & Stone — Accounts Payable",
    actions: ["Send it", "Edit first", "Skip"],
    primary: "Send it",
  },
];

const SAVINGS = {
  big: 92,
  bigUnit: "k",
  bigLabel: "collected last month after No-Go AI's reminders",
  desc: "That's $92,000 you would have spent more time chasing — or might have written off.",
  tiles: [
    { k: "Reminders sent", v: 148 },
    { k: "Times No-Go AI asked you first", v: 39 },
    { k: "Hours saved", v: 31, suffix: "h" },
    { k: "Faster than usual by", v: 4.7, suffix: " days" },
    { k: "Returned for every $1 spent", v: 6.1, prefix: "$", suffix: "" },
    { k: "Things you didn't have to do yourself", v: 420 },
  ],
};

const EXPANSION = [
  { id: "rent", label: "Chasing late rent", state: "live", sub: "Running daily" },
  { id: "vendor", label: "Vendor follow-ups", state: "next", sub: "Ready when you are" },
  { id: "lease", label: "Lease renewals", state: "queue", sub: "Suggested for January" },
  { id: "maint", label: "Maintenance updates", state: "queue", sub: "Suggested later" },
];

const STEPS = [
  { id: "connect", label: "Connect", n: 1 },
  { id: "recommend", label: "Suggest", n: 2 },
  { id: "deploy", label: "Set up", n: 3 },
  { id: "approve", label: "Your inbox", n: 4 },
  { id: "measure", label: "What we did", n: 5 },
];

Object.assign(window, {
  CONNECTOR_CATALOG, CONNECTED_SYSTEMS, SCAN_TARGETS,
  FOUND_LOOPS, RECOMMEND_REASONS, HOW_IT_WORKS,
  WORKFLOW_REPLIES, WORKFLOW_DEFAULT_REPLY, SIM_RESULTS,
  DRAFTS, SAVINGS, EXPANSION, STEPS,
});

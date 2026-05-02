import { useState, useEffect, useRef } from "react";

const SAMPLE_WORDS = ["curling stone", "ephemeral", "serendipity", "melancholy", "luminous"];

const RANDOM_WORDS = [
  "serendipity", "ephemeral", "melancholy", "luminous", "wanderlust",
  "petrichor", "solitude", "resilience", "euphoria", "nostalgia",
  "enigma", "tranquil", "eloquent", "serene", "whimsical",
  "vivacious", "tenacity", "labyrinth", "cascade", "ethereal",
  "lullaby", "renaissance", "silhouette", "benevolent", "catastrophe",
  "zenith", "fracture", "momentum", "gossamer", "phantasm",
  "aurora", "laborious", "wistful", "conundrum", "epiphany",
  "fervent", "halcyon", "ineffable", "jubilant", "kaleidoscope"
];

const WALLPAPERS = [
  { bg: "linear-gradient(135deg, #0f0e17 0%, #1a1825 50%, #0f1419 100%)", blob1: "rgba(255,107,53,0.12)", blob2: "rgba(120,80,255,0.1)" },
  { bg: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)", blob1: "rgba(56,189,248,0.12)", blob2: "rgba(99,102,241,0.1)" },
  { bg: "linear-gradient(135deg, #0f1720 0%, #162032 50%, #0a1520 100%)", blob1: "rgba(52,211,153,0.12)", blob2: "rgba(16,185,129,0.1)" },
  { bg: "linear-gradient(135deg, #1a0f17 0%, #2d1525 50%, #150f1a 100%)", blob1: "rgba(244,114,182,0.12)", blob2: "rgba(168,85,247,0.1)" },
  { bg: "linear-gradient(135deg, #171007 0%, #2a1c0f 50%, #130e07 100%)", blob1: "rgba(251,191,36,0.12)", blob2: "rgba(245,158,11,0.1)" },
  { bg: "linear-gradient(135deg, #07170f 0%, #0f2a1c 50%, #071309 100%)", blob1: "rgba(74,222,128,0.12)", blob2: "rgba(34,197,94,0.1)" },
  { bg: "linear-gradient(135deg, #17070f 0%, #2a0f1c 50%, #130709 100%)", blob1: "rgba(251,113,133,0.12)", blob2: "rgba(239,68,68,0.1)" },
];

const T = {
  en: {
    sub: "Words made human-readable",
    placeholder: "Type any word or phrase…",
    lookup: "Look up",
    wotd: "✨ WORD OF THE DAY",
    wotdBtn: "Look it up →",
    searchTitle: "Search any word",
    searchSub: "Pronunciation shown in easy Latin — no weird symbols!",
    howToSay: "🔊 How to say it",
    stressed: "Capital letters = stressed syllable",
    meaning: "MEANING",
    example: "EXAMPLE",
    loading: "Looking it up…",
    error: "Couldn't find that word, please try again!",
    rateLimit: () => `😴 Daily limit reached! Come back tomorrow at 0:00 UTC / 07:00 WIB and we'll be ready again!`,
    report: "🚩 Report a Problem",
    reportTitle: "Report a Problem",
    reportPlaceholder: "Describe the problem… (e.g. wrong pronunciation, missing word)",
    reportSend: "Send Report",
    reportCancel: "Cancel",
    reportThanks: "Thanks for your report! 🙏",
    footer: "Pronunciation in readable Latin",
    privacyTitle: "Preferences",
    saveHistory: "Save search history",
    dailyWallpaper: "Daily wallpaper",
    privacyNote: "Data is stored locally on your device only.",
    done: "Done",
  },
  id: {
    sub: "Kamus yang mudah dibaca",
    placeholder: "Ketik kata atau frasa…",
    lookup: "Cari",
    wotd: "✨ KATA HARI INI",
    wotdBtn: "Cari artinya →",
    searchTitle: "Cari kata apa saja",
    searchSub: "Cara baca ditampilkan pakai Latin — tanpa simbol aneh!",
    howToSay: "🔊 Cara baca",
    stressed: "Huruf besar = suku kata yang ditekan",
    meaning: "ARTI",
    example: "CONTOH",
    loading: "Lagi dicari…",
    error: "Kata tidak ditemukan, coba lagi!",
    rateLimit: () => `😴 Batas harian tercapai! Kembali besok jam 0:00 UTC / 07:00 WIB ya!`,
    report: "🚩 Laporkan Masalah",
    reportTitle: "Laporkan Masalah",
    reportPlaceholder: "Ceritakan masalahnya… (mis. cara baca salah, kata tidak ada)",
    reportSend: "Kirim Laporan",
    reportCancel: "Batal",
    reportThanks: "Makasih laporannya! 🙏",
    footer: "Cara baca pakai Latin yang mudah dibaca",
    privacyTitle: "Preferensi",
    saveHistory: "Simpan riwayat pencarian",
    dailyWallpaper: "Wallpaper harian",
    privacyNote: "Data hanya disimpan di perangkat kamu.",
    done: "Selesai",
  }
};

function getWordOfTheDay() {
  const start = new Date(2026, 0, 1);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return RANDOM_WORDS[diff % RANDOM_WORDS.length];
}

function getDailyWallpaper() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return WALLPAPERS[day % WALLPAPERS.length];
}

function getWordFromUrl() {
  const path = window.location.pathname.replace(/^\//, "").trim();
  return path ? decodeURIComponent(path) : null;
}

function setUrlWord(word) {
  const encoded = encodeURIComponent(word.trim());
  window.history.pushState({}, "", "/" + encoded);
}

function clearUrl() {
  window.history.pushState({}, "", "/");
}

async function callModel(word, model, lang) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const langNote = lang === "id"
    ? 'Return the definition and example in INDONESIAN (Bahasa Indonesia). Keep the "phonetic" field in Latin letters only.'
    : 'Return the definition and example in English.';
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a dictionary assistant. ${langNote} For the word or phrase "${word}", return ONLY a JSON object with no markdown, no backticks, no extra text. Be accurate and honest with the phonetic transcription — do not censor or alter pronunciation spellings. Format:
{
  "word": "the word/phrase",
  "phonetic": "readable pronunciation using only Latin letters, hyphens, and capital letters for stress. Example: curling stone = KUR-ling STOWN, ephemeral = ih-FEM-er-ul, fuck = FUK. NO IPA symbols whatsoever. Do NOT censor the phonetic field.",
  "partOfSpeech": "noun/verb/adjective/etc",
  "definition": "clear, simple definition",
  "example": "one example sentence using the word",
  "origin": "brief word origin in 1 sentence"
}`
      }]
    })
  });
  const data = await response.json();
  if (response.status === 429 || data?.error?.code === 429 || data?.error?.message?.toLowerCase().includes("rate limit")) {
    throw new Error("RATE_LIMIT");
  }
  if (!data.choices?.[0]?.message?.content) throw new Error("No content");
  const clean = data.choices[0].message.content.trim().replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function lookupWord(word, lang) {
  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
  ];
  for (const model of models) {
    try {
      return await callModel(word, model, lang);
    } catch (e) {
      if (e.message === "RATE_LIMIT") throw e;
      continue;
    }
  }
  throw new Error("All models failed");
}

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [animate, setAnimate] = useState(false);
  const [wotdWord] = useState(getWordOfTheDay);
  const [lang, setLang] = useState("en");
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [saveHistory, setSaveHistory] = useState(() => localStorage.getItem("pref_saveHistory") !== "false");
  const [dailyWallpaper, setDailyWallpaper] = useState(() => localStorage.getItem("pref_wallpaper") !== "false");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("search_history") || "[]"); } catch { return []; }
  });
  const wallpaper = getDailyWallpaper();
  const inputRef = useRef(null);
  const t = T[lang];

  // On mount: load from URL
  useEffect(() => {
    const wordFromUrl = getWordFromUrl();
    if (wordFromUrl) {
      setQuery(wordFromUrl);
      search(wordFromUrl, lang);
    }
  }, []);

  // Re-search when lang changes if there's a result
  useEffect(() => {
    if (result) {
      search(result.word, lang);
    }
  }, [lang]);

  // Countdown timer
  useEffect(() => {
    if (!error?.includes("limit")) return;
    const tick = () => {
      const now = new Date();
      const reset = new Date();
      reset.setUTCHours(24, 0, 0, 0);
      const diff = reset - now;
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [error]);

  // Card animation
  useEffect(() => {
    if (result) {
      setAnimate(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }
  }, [result]);

  // Save preferences
  useEffect(() => { localStorage.setItem("pref_saveHistory", saveHistory); }, [saveHistory]);
  useEffect(() => { localStorage.setItem("pref_wallpaper", dailyWallpaper); }, [dailyWallpaper]);

  const search = async (word, currentLang) => {
    const w = (word || query).trim();
    if (!w) return;
    const useLang = currentLang || lang;
    setLoading(true);
    setError(null);
    setResult(null);
    setUrlWord(w);
    try {
      const data = await lookupWord(w, useLang);
      setResult(data);
      if (saveHistory) {
        setHistory(prev => {
          const next = [w, ...prev.filter(x => x !== w)].slice(0, 6);
          localStorage.setItem("search_history", JSON.stringify(next));
          return next;
        });
      }
    } catch (e) {
      if (e.message === "RATE_LIMIT") {
        setError(t.rateLimit());
      } else {
        setError(t.error);
      }
      clearUrl();
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") search(); };

  const randomWord = () => {
    const available = RANDOM_WORDS.filter(w => !history.includes(w));
    const pool = available.length > 0 ? available : RANDOM_WORDS;
    const w = pool[Math.floor(Math.random() * pool.length)];
    setQuery(w);
    search(w);
  };

  const sendReport = () => {
    if (!reportText.trim()) return;
    const subject = encodeURIComponent("Easyonary Bug Report");
    const body = encodeURIComponent(`Word searched: ${query || result?.word || "N/A"}\n\nProblem:\n${reportText}`);
    window.open(`mailto:YOUR_EMAIL_HERE?subject=${subject}&body=${body}`);
    setReportSent(true);
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportText(""); }, 2000);
  };

  const bg = dailyWallpaper ? wallpaper.bg : WALLPAPERS[0].bg;
  const b1color = dailyWallpaper ? wallpaper.blob1 : WALLPAPERS[0].blob1;
  const b2color = dailyWallpaper ? wallpaper.blob2 : WALLPAPERS[0].blob2;

  return (
    <div style={{...styles.root, background: bg}}>
      <div style={{...styles.blob1, background: `radial-gradient(circle, ${b1color} 0%, transparent 70%)`}} />
      <div style={{...styles.blob2, background: `radial-gradient(circle, ${b2color} 0%, transparent 70%)`}} />

      {/* Report Modal */}
      {showReport && (
        <div style={styles.modalOverlay} onClick={() => setShowReport(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{t.reportTitle}</div>
            {reportSent ? (
              <div style={styles.modalThanks}>{t.reportThanks}</div>
            ) : (
              <>
                <textarea style={styles.modalTextarea} value={reportText} onChange={e => setReportText(e.target.value)} placeholder={t.reportPlaceholder} rows={4} />
                <div style={styles.modalBtns}>
                  <button style={styles.modalCancel} onClick={() => setShowReport(false)}>{t.reportCancel}</button>
                  <button style={styles.modalSend} onClick={sendReport}>{t.reportSend}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPrefs && (
        <div style={styles.modalOverlay} onClick={() => setShowPrefs(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>{t.privacyTitle}</div>
            <div style={styles.prefRow}>
              <div style={styles.prefLabel}>{t.saveHistory}</div>
              <div style={{...styles.toggle, background: saveHistory ? "#ff6b35" : "rgba(255,255,255,0.15)"}} onClick={() => {
                const next = !saveHistory;
                setSaveHistory(next);
                if (!next) { setHistory([]); localStorage.removeItem("search_history"); }
              }}>
                <div style={{...styles.toggleDot, transform: saveHistory ? "translateX(20px)" : "translateX(2px)"}} />
              </div>
            </div>
            <div style={styles.prefRow}>
              <div style={styles.prefLabel}>{t.dailyWallpaper}</div>
              <div style={{...styles.toggle, background: dailyWallpaper ? "#ff6b35" : "rgba(255,255,255,0.15)"}} onClick={() => setDailyWallpaper(v => !v)}>
                <div style={{...styles.toggleDot, transform: dailyWallpaper ? "translateX(20px)" : "translateX(2px)"}} />
              </div>
            </div>
            <div style={styles.prefNote}>{t.privacyNote}</div>
            <div style={styles.modalBtns}>
              <button style={styles.modalSend} onClick={() => setShowPrefs(false)}>{t.done}</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>E</div>
            <div style={{flex: 1}}>
              <div style={styles.logoText}>Easyonary</div>
              <div style={styles.logoSub}>{t.sub}</div>
            </div>
            <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
              <button style={styles.prefBtn} onClick={() => setShowPrefs(true)} title="Preferences">⚙️</button>
              <div style={styles.langSwitch}>
                <button style={{...styles.langBtn, ...(lang === "en" ? styles.langActive : {})}} onClick={() => setLang("en")}>EN</button>
                <button style={{...styles.langBtn, ...(lang === "id" ? styles.langActive : {})}} onClick={() => setLang("id")}>ID</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <input ref={inputRef} style={styles.input} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} placeholder={t.placeholder} />
          <button style={{...styles.btn, opacity: loading ? 0.6 : 1}} onClick={() => search()} disabled={loading}>
            {loading ? "…" : t.lookup}
          </button>
          <button style={{...styles.btnGhost, opacity: loading ? 0.4 : 1}} onClick={randomWord} disabled={loading} title="Random word">🎲</button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={styles.historyRow}>
            {history.map(w => (
              <button key={w} style={styles.chip} onClick={() => { setQuery(w); search(w); }}>{w}</button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorWrap}>
            {error.includes("limit") ? (
              <>
                <div style={styles.limitIcon}>😴</div>
                <div style={styles.limitTitle}>Daily Limit Reached</div>
                <div style={styles.limitSub}>Easyonary uses free AI models that have a daily request limit.<br/>Everything resets at <strong>0:00 UTC / 07:00 WIB</strong>.</div>
                <div style={styles.countdownBox}>
                  <div style={styles.countdownLabel}>Resets in</div>
                  <div style={styles.countdownTimer}>{countdown}</div>
                </div>
              </>
            ) : (
              <div style={styles.error}>{error}</div>
            )}
            <button style={styles.reportBtn} onClick={() => setShowReport(true)}>{t.report}</button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{...styles.card, ...(animate ? styles.cardVisible : styles.cardHidden)}}>
            <div style={styles.wordRow}>
              <div>
                <div style={styles.wordText}>{result.word}</div>
                <div style={styles.pos}>{result.partOfSpeech}</div>
              </div>
              <button style={styles.reportBtnSmall} onClick={() => setShowReport(true)} title={t.report}>🚩</button>
            </div>
            <div style={styles.phoneticBox}>
              <div style={styles.phoneticLabel}>{t.howToSay}</div>
              <div style={styles.phoneticText}>{result.phonetic}</div>
              <div style={styles.phoneticNote}>{t.stressed}</div>
            </div>
            <div style={styles.divider} />
            <div style={styles.section}>
              <div style={styles.sectionLabel}>{t.meaning}</div>
              <div style={styles.sectionText}>{result.definition}</div>
            </div>
            {result.example && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>{t.example}</div>
                <div style={{...styles.sectionText, ...styles.example}}>"{result.example}"</div>
              </div>
            )}
            {result.origin && (
              <div style={styles.originBox}>
                <span style={styles.originIcon}>🌱</span>
                <span style={styles.originText}>{result.origin}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={styles.emptyState}>
            <div style={styles.wotdBox}>
              <div style={styles.wotdLabel}>{t.wotd}</div>
              <div style={styles.wotdWord}>{wotdWord}</div>
              <button style={styles.wotdBtn} onClick={() => { setQuery(wotdWord); search(wotdWord); }}>{t.wotdBtn}</button>
            </div>
            <div style={styles.emptyEmoji}>📖</div>
            <div style={styles.emptyTitle}>{t.searchTitle}</div>
            <div style={styles.emptySub}>{t.searchSub}</div>
            <div style={styles.sampleRow}>
              {SAMPLE_WORDS.slice(0, 4).map(w => (
                <button key={w} style={styles.sampleBtn} onClick={() => { setQuery(w); search(w); }}>{w}</button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <div style={styles.loadingText}>{t.loading}</div>
          </div>
        )}

        <div style={styles.footer}>
          Powered by <span style={{color:"#ff8c5a"}}>Claude · Anthropic</span> · {t.footer}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #8b8b9e; }
        input:focus { outline: none; border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.15) !important; }
        button:hover { filter: brightness(1.1); transform: translateY(-1px); }
        button { transition: all 0.15s ease; cursor: pointer; }
        textarea:focus { outline: none; border-color: #ff6b35 !important; }
        textarea { resize: vertical; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", transition: "background 1s ease" },
  blob1: { position: "fixed", top: "-200px", right: "-200px", width: "500px", height: "500px", borderRadius: "50%", pointerEvents: "none", transition: "background 1s ease" },
  blob2: { position: "fixed", bottom: "-150px", left: "-150px", width: "400px", height: "400px", borderRadius: "50%", pointerEvents: "none", transition: "background 1s ease" },
  container: { maxWidth: "660px", margin: "0 auto", padding: "40px 20px 60px", position: "relative", zIndex: 1 },
  header: { marginBottom: "36px" },
  logoRow: { display: "flex", alignItems: "center", gap: "14px" },
  logoIcon: { width: "48px", height: "48px", background: "linear-gradient(135deg, #ff6b35, #ff9a5c)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "900", color: "#fff", boxShadow: "0 4px 20px rgba(255,107,53,0.35)", flexShrink: 0 },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#f2f0ff" },
  logoSub: { fontSize: "13px", color: "#7c7b8e", marginTop: "2px" },
  prefBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", fontSize: "16px" },
  langSwitch: { display: "flex", gap: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", padding: "4px" },
  langBtn: { padding: "6px 12px", border: "none", borderRadius: "7px", background: "transparent", color: "#7c7b8e", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif" },
  langActive: { background: "rgba(255,107,53,0.2)", color: "#ff8c5a" },
  searchWrap: { display: "flex", gap: "10px", marginBottom: "14px" },
  input: { flex: 1, padding: "14px 18px", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", color: "#f2f0ff", fontSize: "16px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  btn: { padding: "14px 24px", background: "linear-gradient(135deg, #ff6b35, #ff4500)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: "600", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(255,107,53,0.3)", whiteSpace: "nowrap" },
  btnGhost: { padding: "14px 16px", background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: "18px" },
  historyRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  chip: { padding: "5px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", color: "#a09fba", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" },
  errorWrap: { textAlign: "center", padding: "20px 0" },
  error: { color: "#ff6b6b", fontSize: "16px", marginBottom: "12px" },
  limitIcon: { fontSize: "48px", marginBottom: "12px" },
  limitTitle: { fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#f2f0ff", marginBottom: "10px" },
  limitSub: { fontSize: "14px", color: "#7c7b8e", lineHeight: 1.7, marginBottom: "20px" },
  countdownBox: { background: "rgba(255,107,53,0.08)", border: "1.5px solid rgba(255,107,53,0.2)", borderRadius: "14px", padding: "16px 32px", display: "inline-block", marginBottom: "16px" },
  countdownLabel: { fontSize: "11px", fontWeight: "700", color: "#ff8c5a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" },
  countdownTimer: { fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "700", color: "#fff", letterSpacing: "0.05em" },
  reportBtn: { padding: "8px 18px", background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)", borderRadius: "999px", color: "#ff8c5a", fontSize: "13px", fontFamily: "'DM Sans', sans-serif" },
  reportBtnSmall: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", fontSize: "16px", lineHeight: 1 },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(12px)", transition: "all 0.4s ease" },
  cardHidden: { opacity: 0, transform: "translateY(20px)" },
  cardVisible: { opacity: 1, transform: "translateY(0)", animation: "fadeUp 0.4s ease both" },
  wordRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  wordText: { fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "700", color: "#f2f0ff", lineHeight: 1.1 },
  pos: { marginTop: "6px", display: "inline-block", padding: "3px 12px", background: "rgba(120,80,255,0.2)", border: "1px solid rgba(120,80,255,0.3)", borderRadius: "999px", color: "#b39dff", fontSize: "13px", fontWeight: "500" },
  phoneticBox: { background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,69,0,0.06))", border: "1.5px solid rgba(255,107,53,0.25)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" },
  phoneticLabel: { fontSize: "12px", fontWeight: "600", color: "#ff8c5a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" },
  phoneticText: { fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: "700", color: "#fff", letterSpacing: "0.05em" },
  phoneticNote: { marginTop: "8px", fontSize: "12px", color: "#7c7b8e" },
  divider: { height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "24px" },
  section: { marginBottom: "20px" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: "#6b6a80", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" },
  sectionText: { fontSize: "17px", color: "#cccadf", lineHeight: 1.65 },
  example: { fontStyle: "italic", color: "#a09fba", borderLeft: "3px solid rgba(255,107,53,0.4)", paddingLeft: "16px" },
  originBox: { display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px 16px", marginTop: "8px" },
  originIcon: { fontSize: "16px", lineHeight: 1.65 },
  originText: { fontSize: "14px", color: "#7c7b8e", lineHeight: 1.6 },
  emptyState: { textAlign: "center", paddingTop: "24px" },
  wotdBox: { background: "linear-gradient(135deg, rgba(120,80,255,0.15), rgba(80,40,200,0.08))", border: "1.5px solid rgba(120,80,255,0.3)", borderRadius: "16px", padding: "24px", marginBottom: "32px", textAlign: "center" },
  wotdLabel: { fontSize: "11px", fontWeight: "700", color: "#b39dff", letterSpacing: "0.15em", marginBottom: "10px" },
  wotdWord: { fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "700", color: "#f2f0ff", marginBottom: "16px", textTransform: "capitalize" },
  wotdBtn: { padding: "10px 24px", background: "linear-gradient(135deg, #7850ff, #5028c8)", border: "none", borderRadius: "999px", color: "#fff", fontWeight: "600", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(120,80,255,0.3)" },
  emptyEmoji: { fontSize: "52px", marginBottom: "16px" },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#f2f0ff", marginBottom: "10px" },
  emptySub: { fontSize: "15px", color: "#6b6a80", marginBottom: "28px" },
  sampleRow: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" },
  sampleBtn: { padding: "10px 20px", background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)", borderRadius: "999px", color: "#ff8c5a", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "48px" },
  spinner: { width: "36px", height: "36px", border: "3px solid rgba(255,107,53,0.2)", borderTop: "3px solid #ff6b35", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#7c7b8e", fontSize: "15px" },
  footer: { textAlign: "center", marginTop: "48px", color: "#3f3e52", fontSize: "13px" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" },
  modal: { background: "#1a1825", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "420px" },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#f2f0ff", marginBottom: "20px" },
  modalTextarea: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", color: "#f2f0ff", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", padding: "12px 16px", marginBottom: "16px" },
  modalBtns: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  modalCancel: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", color: "#7c7b8e", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" },
  modalSend: { padding: "10px 20px", background: "linear-gradient(135deg, #ff6b35, #ff4500)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: "600", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" },
  modalThanks: { textAlign: "center", color: "#ff8c5a", fontSize: "18px", padding: "20px 0" },
  prefRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  prefLabel: { fontSize: "15px", color: "#cccadf" },
  toggle: { width: "44px", height: "24px", borderRadius: "999px", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 },
  toggleDot: { position: "absolute", top: "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "transform 0.2s" },
  prefNote: { fontSize: "12px", color: "#6b6a80", marginBottom: "20px", lineHeight: 1.5 },
};

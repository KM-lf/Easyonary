import { useState, useEffect, useRef } from "react";

const SAMPLE_WORDS = ["curling stone", "ephemeral", "serendipity", "melancholy", "luminous"];

async function lookupWord(word) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a dictionary assistant. For the word or phrase "${word}", return ONLY a JSON object with no markdown, no backticks, no extra text. Format:
{
  "word": "the word/phrase",
  "phonetic": "readable pronunciation using only Latin letters, hyphens, and capital letters for stress. Example: curling stone = KUR-ling STOWN, ephemeral = ih-FEM-er-ul. NO IPA symbols whatsoever.",
  "partOfSpeech": "noun/verb/adjective/etc",
  "definition": "clear, simple definition in English",
  "example": "one example sentence using the word",
  "origin": "brief word origin in 1 sentence"
}`
      }]
    })
  });
  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [animate, setAnimate] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (result) {
      setAnimate(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    }
  }, [result]);

  const search = async (word) => {
    const w = (word || query).trim();
    if (!w) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lookupWord(w);
      setResult(data);
      setHistory(prev => [w, ...prev.filter(x => x !== w)].slice(0, 6));
    } catch (e) {
      setError("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") search();
  };

  const randomWord = () => {
    const w = SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)];
    setQuery(w);
    search(w);
  };

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>E</div>
            <div>
              <div style={styles.logoText}>Easyonary</div>
              <div style={styles.logoSub}>Words made human-readable</div>
            </div>
          </div>
        </div>

        <div style={styles.searchWrap}>
          <input
            ref={inputRef}
            style={styles.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type any word or phrase…"
          />
          <button
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
            onClick={() => search()}
            disabled={loading}
          >
            {loading ? "…" : "Look up"}
          </button>
          <button style={styles.btnGhost} onClick={randomWord} title="Random word">
            🎲
          </button>
        </div>

        {history.length > 0 && (
          <div style={styles.historyRow}>
            {history.map(w => (
              <button key={w} style={styles.chip} onClick={() => { setQuery(w); search(w); }}>
                {w}
              </button>
            ))}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {result && !loading && (
          <div style={{ ...styles.card, ...(animate ? styles.cardVisible : styles.cardHidden) }}>
            <div style={styles.wordRow}>
              <div>
                <div style={styles.wordText}>{result.word}</div>
                <div style={styles.pos}>{result.partOfSpeech}</div>
              </div>
            </div>

            <div style={styles.phoneticBox}>
              <div style={styles.phoneticLabel}>🔊 How to say it</div>
              <div style={styles.phoneticText}>{result.phonetic}</div>
              <div style={styles.phoneticNote}>Capital letters = stressed syllable</div>
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionLabel}>MEANING</div>
              <div style={styles.sectionText}>{result.definition}</div>
            </div>

            {result.example && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>EXAMPLE</div>
                <div style={{ ...styles.sectionText, ...styles.example }}>
                  "{result.example}"
                </div>
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

        {!result && !loading && !error && (
          <div style={styles.emptyState}>
            <div style={styles.emptyEmoji}>📖</div>
            <div style={styles.emptyTitle}>Search any word</div>
            <div style={styles.emptySub}>Pronunciation shown in easy Latin — no weird symbols!</div>
            <div style={styles.sampleRow}>
              {SAMPLE_WORDS.slice(0, 4).map(w => (
                <button key={w} style={styles.sampleBtn} onClick={() => { setQuery(w); search(w); }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <div style={styles.loadingText}>Looking it up…</div>
          </div>
        )}

        <div style={styles.footer}>Powered by <span style={{color:"#ff8c5a"}}>Claude · Anthropic</span> · Pronunciation in readable Latin</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0e17; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #8b8b9e; }
        input:focus { outline: none; border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.15) !important; }
        button:hover { filter: brightness(1.1); transform: translateY(-1px); }
        button { transition: all 0.15s ease; cursor: pointer; }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0e17 0%, #1a1825 50%, #0f1419 100%)",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: "-200px", right: "-200px",
    width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-150px", left: "-150px",
    width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(120,80,255,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: "660px", margin: "0 auto",
    padding: "40px 20px 60px", position: "relative", zIndex: 1,
  },
  header: { marginBottom: "36px" },
  logoRow: { display: "flex", alignItems: "center", gap: "14px" },
  logoIcon: {
    width: "48px", height: "48px",
    background: "linear-gradient(135deg, #ff6b35, #ff9a5c)",
    borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px", fontWeight: "900", color: "#fff",
    boxShadow: "0 4px 20px rgba(255,107,53,0.35)",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px", fontWeight: "700", color: "#f2f0ff",
  },
  logoSub: { fontSize: "13px", color: "#7c7b8e", marginTop: "2px" },
  searchWrap: { display: "flex", gap: "10px", marginBottom: "14px" },
  input: {
    flex: 1, padding: "14px 18px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "12px", color: "#f2f0ff",
    fontSize: "16px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },
  btn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #ff6b35, #ff4500)",
    border: "none", borderRadius: "12px", color: "#fff",
    fontWeight: "600", fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 16px rgba(255,107,53,0.3)", whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "14px 16px", background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: "18px",
  },
  historyRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  chip: {
    padding: "5px 14px", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px",
    color: "#a09fba", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px", padding: "32px", backdropFilter: "blur(12px)", transition: "all 0.4s ease",
  },
  cardHidden: { opacity: 0, transform: "translateY(20px)" },
  cardVisible: { opacity: 1, transform: "translateY(0)", animation: "fadeUp 0.4s ease both" },
  wordRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "20px",
  },
  wordText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px", fontWeight: "700", color: "#f2f0ff", lineHeight: 1.1,
  },
  pos: {
    marginTop: "6px", display: "inline-block", padding: "3px 12px",
    background: "rgba(120,80,255,0.2)", border: "1px solid rgba(120,80,255,0.3)",
    borderRadius: "999px", color: "#b39dff", fontSize: "13px", fontWeight: "500",
  },
  phoneticBox: {
    background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,69,0,0.06))",
    border: "1.5px solid rgba(255,107,53,0.25)",
    borderRadius: "14px", padding: "20px 24px", marginBottom: "24px",
  },
  phoneticLabel: {
    fontSize: "12px", fontWeight: "600", color: "#ff8c5a",
    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px",
  },
  phoneticText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "28px", fontWeight: "700", color: "#fff", letterSpacing: "0.05em",
  },
  phoneticNote: { marginTop: "8px", fontSize: "12px", color: "#7c7b8e" },
  divider: { height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "24px" },
  section: { marginBottom: "20px" },
  sectionLabel: {
    fontSize: "11px", fontWeight: "700", color: "#6b6a80",
    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px",
  },
  sectionText: { fontSize: "17px", color: "#cccadf", lineHeight: 1.65 },
  example: {
    fontStyle: "italic", color: "#a09fba",
    borderLeft: "3px solid rgba(255,107,53,0.4)", paddingLeft: "16px",
  },
  originBox: {
    display: "flex", gap: "10px", alignItems: "flex-start",
    background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "14px 16px", marginTop: "8px",
  },
  originIcon: { fontSize: "16px", lineHeight: 1.65 },
  originText: { fontSize: "14px", color: "#7c7b8e", lineHeight: 1.6 },
  error: { textAlign: "center", color: "#ff6b6b", padding: "20px", fontSize: "16px" },
  emptyState: { textAlign: "center", paddingTop: "48px" },
  emptyEmoji: { fontSize: "52px", marginBottom: "16px" },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "26px", color: "#f2f0ff", marginBottom: "10px",
  },
  emptySub: { fontSize: "15px", color: "#6b6a80", marginBottom: "28px" },
  sampleRow: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" },
  sampleBtn: {
    padding: "10px 20px", background: "rgba(255,107,53,0.12)",
    border: "1px solid rgba(255,107,53,0.25)", borderRadius: "999px",
    color: "#ff8c5a", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
  },
  loadingWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "16px", paddingTop: "48px",
  },
  spinner: {
    width: "36px", height: "36px",
    border: "3px solid rgba(255,107,53,0.2)", borderTop: "3px solid #ff6b35",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#7c7b8e", fontSize: "15px" },
  footer: { textAlign: "center", marginTop: "48px", color: "#3f3e52", fontSize: "13px" },
};

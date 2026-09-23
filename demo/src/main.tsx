import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  OccultProvider,
  NatalChartWheel,
  WesternNatalWheel,
  Bodygraph,
  CurrentDasha,
  TarotSpread,
} from "occult-api-ui";
import "occult-api-ui/styles.css";

/**
 * Supplied through the environment, never committed - see .env.example.
 * Defaults to the production API, since that is what a key from
 * occultapi.com/signup will work against; point VITE_OCCULT_BASE_URL at a
 * local server when developing against one.
 */
const API_KEY = import.meta.env.VITE_OCCULT_API_KEY;
const BASE_URL = import.meta.env.VITE_OCCULT_BASE_URL ?? "https://api.occultapi.com";

const BIRTH = {
  date: "1990-08-15",
  time: "10:30",
  latitude: 26.9124,
  longitude: 75.7873,
  timezone: 5.5,
  place: "Jaipur, India",
};

const page: React.CSSProperties = {
  maxWidth: 960,
  margin: "2rem auto",
  display: "grid",
  gap: "1.5rem",
  padding: "0 1rem",
  fontFamily: "system-ui, sans-serif",
};

/**
 * OccultClient throws on an empty key, so without this a first run after
 * `git clone` is a blank page and a console trace rather than an
 * instruction.
 */
function MissingKey() {
  return (
    <div style={page}>
      <h1>occult-api-ui demo</h1>
      <p>
        Set <code>VITE_OCCULT_API_KEY</code> before starting the dev server:
      </p>
      <pre style={{ background: "#f4f4f5", padding: "1rem", borderRadius: 8, overflowX: "auto" }}>
        {`cp .env.example .env
# put your key in .env, then
npm run dev`}
      </pre>
      <p>
        Don&apos;t have a key yet? Get one at{" "}
        <a href="https://occultapi.com/signup">occultapi.com/signup</a>.
      </p>
    </div>
  );
}

function App() {
  if (!API_KEY) return <MissingKey />;

  return (
    <OccultProvider apiKey={API_KEY} baseUrl={BASE_URL}>
      <div style={page}>
        <h1>occult-api-ui demo</h1>
        <NatalChartWheel {...BIRTH} />
        <WesternNatalWheel {...BIRTH} />
        <Bodygraph {...BIRTH} />
        <CurrentDasha {...BIRTH} />
        <TarotSpread spread="three_card" />
      </div>
    </OccultProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

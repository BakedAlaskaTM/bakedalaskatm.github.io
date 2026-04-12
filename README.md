# Dziwnystan Hunt Stats

Little website to track world records for ML's Dziwnystan hunt.

Built with React and Vite, this interface natively aggregates data sourced from both TMX (Trackmania Exchange) and Dedimania, compiling a comprehensive, localized leaderboard that condenses thousands of external records into one unified, hyper-responsive experience.

## Key Features

- **Global Leaderboard & Stats:** Highly interactive tables tracking all supported maps, calculating time deltas, filtering outputs, and visually demarcating records held securely by internal team members versus external players.
- **Dynamic Player Profiles:** Automatically derived profiles mapping out exactly which records each player personally holds across their various internal/external game identities (fully compatible with caching multiple alias IDs).
- **Historical Activity Feed:** A lazy-loaded, reverse-chronological timeline feed that parses aggregate data to visualize exactly when and where the team gained or lost track records, including detailed custom delta calculations and age milestones.
- **Progression Analytics:** Interactive `recharts` layouts graphically map the historical progress of total team World Records internally scaled against true comparative chronological time-axes.
- **Deep Client Routing:** Securely integrated `react-router-dom` using a HashRouter schema, ensuring direct internal URLs (e.g., `/#/player/baked_alaska`) can be organically shared, hard-refreshed, and safely deployed statically without standard 404 server configurations.

## Tech Stack

- **Framework**: React (`v19`) bootstrapped directly via **Vite** for massive performance enhancements and compilation improvements.
- **Styling**: **Tailwind CSS (`v4`)** implementing a pristine slate/glassmorphism dark-mode aesthetic leveraging `lucide-react` graphics.
- **Tables**: Headless UI abstractions managed by **TanStack Table**.
- **Charts**: **Recharts** driving heavily stylized, reactive data mappings.
- **Routing**: Deep SPA link mapping centralized via **React Router DOM**.

# Note
The website is vibe coded. You can tell. I suck at frontend.

# Graph Report - .  (2026-06-20)

## Corpus Check
- Corpus is ~15,102 words - fits in a single context window. You may not need a graph.

## Summary
- 227 nodes · 297 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Mock Data & Domain Types|Mock Data & Domain Types]]
- [[_COMMUNITY_UI Primitives & Helpers|UI Primitives & Helpers]]
- [[_COMMUNITY_Discover & Profile Cards|Discover & Profile Cards]]
- [[_COMMUNITY_3D Avatar Viewer|3D Avatar Viewer]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Build Tooling & Dev Deps|Build Tooling & Dev Deps]]
- [[_COMMUNITY_Duos Chat & Avatar|Duos Chat & Avatar]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_3D Background Particles|3D Background Particles]]
- [[_COMMUNITY_Landing, Privacy & Waitlist|Landing, Privacy & Waitlist]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_POC Background & Layout|POC Background & Layout]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Claude Settings|Claude Settings]]
- [[_COMMUNITY_POC Index Page|POC Index Page]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 16 edges
2. `compilerOptions` - 16 edges
3. `AppShell()` - 6 edges
4. `Chip()` - 5 edges
5. `DiscoverCard` - 5 edges
6. `scripts` - 5 edges
7. `Waitlist Signup Form` - 5 edges
8. `ExpBar()` - 4 edges
9. `Avatar()` - 4 edges
10. `UserProfile` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Consent Legal Basis for Email Processing` --rationale_for--> `Waitlist Signup Form`  [INFERRED]
  public/privacy.html → public/index.html
- `SwipeCardProps` --references--> `DiscoverCard`  [EXTRACTED]
  app/poc/_components/discover/SwipeCard.tsx → app/poc/_data/types.ts
- `Avatar()` --calls--> `cn()`  [EXTRACTED]
  app/poc/_components/ui/Avatar.tsx → app/poc/_data/utils.ts
- `Chip()` --calls--> `cn()`  [EXTRACTED]
  app/poc/_components/ui/Chip.tsx → app/poc/_data/utils.ts
- `Modal()` --calls--> `cn()`  [EXTRACTED]
  app/poc/_components/ui/Modal.tsx → app/poc/_data/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Waitlist Email Signup Flow** — public_index_waitlistform, public_index_waitlistapi, public_privacy_resend [INFERRED 0.85]
- **Waitlist Data Processors and Policy** — public_privacy_privacypolicy, public_privacy_resend, public_privacy_vercel [EXTRACTED 1.00]

## Communities (21 total, 5 thin omitted)

### Community 0 - "Mock Data & Domain Types"
Cohesion: 0.09
Nodes (30): mockInitialMessages, mockPartnerGameProfile, mockPartnerRevealedProfile, Badge, GameMode, GameRevealProfile, Gender, GENDERS (+22 more)

### Community 1 - "UI Primitives & Helpers"
Cohesion: 0.11
Nodes (14): cn(), ExpBar(), ExpBarProps, QueuePage(), Button, ButtonProps, Size, sizeClasses (+6 more)

### Community 2 - "Discover & Profile Cards"
Cohesion: 0.16
Nodes (12): mockCards, mockUser, DiscoverCard, INTENTION_LABELS, UserProfile, AvatarViewer3D, SwipeCard, SwipeCardProps (+4 more)

### Community 3 - "3D Avatar Viewer"
Cohesion: 0.10
Nodes (13): AvatarErrorBoundary, AvatarViewer3DProps, BASE_UVS_CLASSIC, FACE_ORDER, FaceUVs, isOverlayPixel(), mirrorHorizontalInPlace(), normalizeSkinTexture() (+5 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "Build Tooling & Dev Deps"
Cohesion: 0.11
Nodes (18): description, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+10 more)

### Community 6 - "Duos Chat & Avatar"
Cohesion: 0.18
Nodes (11): BOT_RESPONSES, DuosPage(), Message, mockDuo, SEED_MESSAGES, timeLabel(), Avatar(), AvatarProps (+3 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, clsx, dotenv, lucide-react, next, react, react-dom, @react-three/drei (+4 more)

### Community 8 - "App Shell & Navigation"
Cohesion: 0.24
Nodes (6): AppShell(), AppShellProps, BottomNav(), NAV_ITEMS, TopBar(), TopBarProps

### Community 10 - "Landing, Privacy & Waitlist"
Cohesion: 0.29
Nodes (10): Honeypot Anti-Bot Field, Queuepid Landing Page, Reduced Motion / Touch Accessibility Handling, /api/waitlist Endpoint, Waitlist Signup Form, Consent Legal Basis for Email Processing, Queuepid Privacy Policy, Resend (Email Processor) (+2 more)

### Community 11 - "Root Layout & Fonts"
Cohesion: 0.33
Nodes (4): inter, metadata, outfit, viewport

### Community 12 - "POC Background & Layout"
Cohesion: 0.40
Nodes (3): BackgroundParticles, PocBackground(), metadata

### Community 13 - "Vercel Config"
Cohesion: 0.40
Nodes (4): buildCommand, cleanUrls, framework, installCommand

## Knowledge Gaps
- **105 isolated node(s):** `allow`, `inter`, `outfit`, `metadata`, `viewport` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Primitives & Helpers` to `App Shell & Navigation`, `Mock Data & Domain Types`, `Discover & Profile Cards`, `Duos Chat & Avatar`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `App Shell & Navigation` to `Mock Data & Domain Types`, `Discover & Profile Cards`, `Duos Chat & Avatar`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Build Tooling & Dev Deps`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `allow`, `inter`, `outfit` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mock Data & Domain Types` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._
- **Should `UI Primitives & Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Should `3D Avatar Viewer` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
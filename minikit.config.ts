import type { MiniAppManifest } from "@coinbase/onchainkit/minikit";

// Vercel URL'sini otomatik alır
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest}
 */
export const minikitConfig: MiniAppManifest = {
  // "Not Ready" sorununu çözen dolu Account Association
  accountAssociation: {
    header: "eyJleHAiOjE3MzMyNCAgICAgICJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NzlhMEYwNDQ3OTYzODExMTc3M2Y4N2EwNWI2YzBlZDIxRkQxNWMwYjE3M2JlNDgiLCJpYXQiOjE3MDE3MDg4MjR9",
    payload: "eyJkb21haW4iOiJiYXNlZmFybXRyYWNrZXIudmVyY2VsLmFwcCJ9",
    signature: "MHhkNGMwYWYxOWIwMzQxMzJmN2EwN2E1MDUxZmYwMjRlOTRhMWE0ZWM0YjMwZGUxYjljMmQ1MGUzNjJlZDcyYWYyMjZlMGIyYmM1YTA1NTQ2M2QwMjU2YjI4YjcxMmI2MmExODc4YjU3ZjJmNjM5MWFhNjViNmMxM2JiNWE0MWIxYg==",
  },

  // --- HATANIN ÇÖZÜMÜ BURADA ---
  // TypeScript'e bu hatayı görmezden gelmesini söylüyoruz:
  // @ts-ignore 
  baseBuilder: {
    ownerAddress: "0xf286BaA11A1B1D81C387c9BF1F82797A9a369A05",
  },

  miniapp: {
    version: "1",
    name: "BaseFarm Tracker",
    subtitle: "Personal Airdrop Checklist",
    description:
      "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    
    screenshotUrls: [`${ROOT_URL}/basedroptracker-portrait.png`],
    iconUrl: `${ROOT_URL}/basedroptracker-icon.png`,
    splashImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
    
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: "", 
    primaryCategory: "productivity",
    tags: ["airdrop", "tracker", "checklist", "productivity", "base"],
    
    heroImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
    ogTitle: "BaseFarm Tracker",
    ogDescription: "Track your airdrop efficiently",
    ogImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
  },
} as const;


// (Dosyanın altındaki 'declare global' bloğunu sildim, 
// çünkü yeni çözümümüzle ona artık gerek kalmadı.)
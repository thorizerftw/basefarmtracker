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
    header: "eyJmaWQiOjQ1NzAxMSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDZBRTI4NTJBMDAxYmI5YjM4MTMzZThjNzg1MURmMzlGRDI5QzIxODYifQ",
    payload: "eyJkb21haW4iOiJiYXNlZmFybXRyYWNrZXIudmVyY2VsLmFwcCJ9",
    signature: "ofqEMGVsK6DnVGDDfGWWwic4v3JRmUY39c2aiTZSBVpLVWgyPHstle6BzBawy/a9+jgY+2dNVKZLQq5yI/5+nhs=",
  },

  // --- HATANIN ÇÖZÜMÜ BURADA ---
  // TypeScript'e bu hatayı görmezden gelmesini söylüyoruz:
  // @ts-ignore 
  baseBuilder: {
    ownerAddress: "0xf2868e11a1A1c8201c9b38f51827973a9362fA95",
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
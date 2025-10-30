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
  // Account Association (Burası "Ready" olduktan sonra doldurulacak)
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },

  miniapp: {
    version: "1",
    name: "BaseFarm Tracker",
    subtitle: "Personal Airdrop Checklist",
    description:
      "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    
    // Dosya isimleri (public klasöründe olduklarını varsayarak)
    screenshotUrls: [`${ROOT_URL}/basedroptracker-portrait.png`],
    iconUrl: `${ROOT_URL}/basedroptracker-icon.png`,
    splashImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
    
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: "", // Webhook kullanmıyoruz
    primaryCategory: "productivity",
    tags: ["airdrop", "tracker", "checklist", "productivity", "base"],
    
    // 'imageUrl' HATASINI ÇÖZMEK İÇİN BUNLARI EKLİYORUZ
    heroImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
    ogTitle: "BaseFarm Tracker",
    ogDescription: "Track your airdrop efficiently",
    ogImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
  },
} as const;

// Bu, Farcaster'ın 'imageUrl' hatasını çözer
declare global {
  interface MiniAppManifest {
    // VERCEL HATASININ ÇÖZÜMÜ:
    // 'MiniAppManifest["miniapp"]' yerine 'any' kullanarak
    // sonsuz döngü hatasını (recursive type) çözüyoruz.
    miniapp: any & {
      heroImageUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImageUrl?: string;
    };
  }
}


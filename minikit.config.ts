import type { MiniAppManifest } from "@coinbase/onchainkit/minikit"; // TİP IMPORT'U GERİ GELDİ!

// ROOT_URL tanımı (Bu doğruydu)
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL 
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
    : 'http://localhost:3000');
    
/**
 * MiniApp configuration object. Should align with Farcaster MiniApp specification.
 * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest}
 */
// TİP TANIMI GERİ GELDİ!
export const minikitConfig: MiniAppManifest & { baseBuilder?: { ownerAddress: string } } = { 
  // Account Association - Bunu base.dev'den alıp yapıştıracaksın
  accountAssociation: { 
    // Şimdilik boş kalsınlar, base.dev'den alınacak
    header: "", 
    payload: "", 
    signature: "" 
  },
  // baseBuilder alanı arkadaşının kodunda vardı
  baseBuilder: {
    ownerAddress: "" // Şimdilik boş kalsın
  },
  
  // === DÜZELTME: 'developer' ALANI SİLİNDİ ===
  // developer: { 
  //   name: "thorizerftw",
  //   url: "https://github.com/thorizerftw" 
  // },
  // ============================================

  miniapp: { 
    version: "1",
    name: "BaseFarm Tracker", 
    subtitle: "Personal Airdrop Checklist", 
    description: "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    // ÖNEMLİ: Resim dosyası adlarını kendi public/ klasöründeki adlarla değiştir
    // ve BU RESİMLERİN GERÇEKTEN 'public' klasöründe olduğundan emin ol!
    screenshotUrls: [`${ROOT_URL}/basedroptracker-portrait.png`], 
    iconUrl: `${ROOT_URL}/basedroptracker-icon.png`,             
    splashImageUrl: `${ROOT_URL}/basedroptracker-hero.png`,       
    splashBackgroundColor: "#0052FF", 
    homeUrl: ROOT_URL,
    webhookUrl: "", // Webhook kullanmıyoruz
    primaryCategory: "productivity", 
    tags: ["airdrop", "tracker", "checklist", "productivity", "base"], 
    heroImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
    tagline: "Track your airdrop efficiently", 
    ogTitle: "BaseFarm Tracker",
    ogDescription: "Organize your airdrop farming activities privately and securely.",
    ogImageUrl: `${ROOT_URL}/basedroptracker-hero.png`, 
  },
} as const;


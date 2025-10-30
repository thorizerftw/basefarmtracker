// app/utils.ts

/**
 * Mini-app'in Base App (veya Coinbase Wallet) içinde
 * yüklendiğini ve "hazır" olduğunu bildiren sinyali gönderir.
 * Bu, "Not Ready" hatasını önler.
 */
export function sendReadySignal() {
  if (typeof window === 'undefined') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const miniapp = (window as any)?.miniapp;

    if (miniapp?.actions?.ready) {
      miniapp.actions.ready();
    } else if (miniapp?.ready) {
      miniapp.ready(); // Eski SDK
    }
  } catch (e) {
    console.warn("MiniApp SDK 'ready' signal failed:", e);
  }
}
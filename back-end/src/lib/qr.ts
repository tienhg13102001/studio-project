import QRCode from "qrcode";

/** Social platforms we generate QR codes for (matches the Contact.socials shape). */
export const SOCIAL_PLATFORMS = ["zalo", "facebook", "youtube", "tiktok", "instagram"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Generates a PNG data-URL QR code for the given text/URL. */
export function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

import { assetUrl } from "../utils/assetUrl";

/** Persian trigger word — trim + NFC before compare */
export const BIRTHDAY_BLOW_WORD = "فوت";

/** Relative path under `project2/public/` */
export const BIRTHDAY_VIDEO_PATH = "/videos/birthday.mp4";

export const BIRTHDAY_VIDEO_SRC = assetUrl(BIRTHDAY_VIDEO_PATH);

export const BLOW_SEQUENCE_DURATION = 1.2;
export const BLOW_VIDEO_DELAY = 0.35;

export function normalizeBlowInput(value: string): string {
  return value.trim().normalize("NFC");
}

export function isValidBlowInput(value: string): boolean {
  return normalizeBlowInput(value) === BIRTHDAY_BLOW_WORD;
}

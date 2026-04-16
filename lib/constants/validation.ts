import { z } from "zod";

export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const zHexColor = z
  .string()
  .regex(HEX_COLOR_REGEX, "Couleur hex attendue (#RGB ou #RRGGBB)");

export const zDocumentStatus = z.enum(["missing", "uploaded", "approved", "rejected"]);


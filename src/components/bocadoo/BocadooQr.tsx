import { QRCodeSVG } from "qrcode.react";
import type { ComponentProps } from "react";

import { QR_BACKGROUND, QR_FOREGROUND } from "@/lib/qr-colors";

export type BocadooQrProps = Omit<ComponentProps<typeof QRCodeSVG>, "fgColor" | "bgColor">;

/**
 * QR de Bocadoo. Colores fijos en ambos temas (ver src/lib/qr-colors.ts); el contenedor que lo
 * rodea debe ser blanco (`bg-qr-bg`) para respetar la zona de silencio del código.
 */
export function BocadooQr(props: BocadooQrProps) {
  return <QRCodeSVG {...props} fgColor={QR_FOREGROUND} bgColor={QR_BACKGROUND} />;
}

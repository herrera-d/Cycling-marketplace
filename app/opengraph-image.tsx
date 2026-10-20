import { ImageResponse } from "next/og";

export const alt = "BiciMarket — Marketplace de ciclismo de segunda mano";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen para compartir en redes/mensajes (Open Graph, PLAN §9.1 Fase 8).
 * Se genera en el servidor con `next/og`: no hay binario que versionar y el
 * texto se compone con los mismos tokens de color que la app.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#fefdfc",
          color: "#110f0a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#008325",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 44,
            }}
          >
            🚲
          </div>
          <div style={{ fontSize: 56, fontWeight: 700 }}>BiciMarket</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            <div>Equipo de ciclismo</div>
            <div>de segunda mano</div>
          </div>
          <div style={{ fontSize: 40, color: "#6a6a65" }}>
            Compra y vende bicis, componentes y ropa · sin comisiones
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 32, color: "#008325" }}>
          <span>Publicá en 3 pasos</span>
          <span>·</span>
          <span>Guardá favoritos</span>
          <span>·</span>
          <span>Sin comisiones</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

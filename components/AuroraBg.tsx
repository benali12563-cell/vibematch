"use client";

/** CSS-only animated aurora — 3 glowing orbs that drift slowly */
export default function AuroraBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden>
      {/* Teal orb — top-left */}
      <div
        className="aurora-1"
        style={{
          position: "absolute",
          width: "90vw", maxWidth: 500, height: "90vw", maxHeight: 500,
          borderRadius: "50%",
          top: "-25%", left: "-20%",
          background: "radial-gradient(circle, rgba(0,206,209,.13) 0%, transparent 68%)",
          filter: "blur(55px)",
          willChange: "transform",
        }}
      />
      {/* Purple orb — bottom-right */}
      <div
        className="aurora-2"
        style={{
          position: "absolute",
          width: "75vw", maxWidth: 420, height: "75vw", maxHeight: 420,
          borderRadius: "50%",
          bottom: "2%", right: "-18%",
          background: "radial-gradient(circle, rgba(130,0,220,.09) 0%, transparent 68%)",
          filter: "blur(60px)",
          willChange: "transform",
        }}
      />
      {/* Blue orb — mid */}
      <div
        className="aurora-3"
        style={{
          position: "absolute",
          width: "65vw", maxWidth: 360, height: "65vw", maxHeight: 360,
          borderRadius: "50%",
          top: "38%", left: "15%",
          background: "radial-gradient(circle, rgba(0,70,210,.08) 0%, transparent 68%)",
          filter: "blur(50px)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

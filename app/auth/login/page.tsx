"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import Logo from "@/components/Logo";
import OTPLoginForm from "@/components/OTPLoginForm";

export default function LoginPage() {
  const { lang } = useApp();
  const router = useRouter();
  const isHe = lang === "he";

  return (
    <div style={{
      minHeight: "100dvh", background: "#000", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 24px",
      direction: isHe ? "rtl" : "ltr",
    }}>
      <div style={{ marginBottom: 32 }}><Logo sz={32} /></div>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
          {isHe ? "כניסה ל-VibeMatch" : "Sign in to VibeMatch"}
        </h2>
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
          {isHe ? "ללא סיסמה — קוד אימות למייל בלבד" : "No password — verification code by email"}
        </p>

        <OTPLoginForm
          isHe={isHe}
          onSuccess={() => { router.replace("/"); router.refresh(); }}
        />
      </div>
    </div>
  );
}

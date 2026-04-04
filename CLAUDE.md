# VibeMatch — Claude Context File
> תמיד קרא קובץ זה בתחילת כל שיחה. מכיל הכל.

## Stack
Next.js 15.3.6 · TypeScript strict · Supabase (Magic Link + SSR) · React Context (no Redux)
**ללא Tailwind** · ללא Framer Motion · CSS inline + globals.css בלבד
Fonts: Heebo (he) / Manrope (en) · Material Symbols Outlined
Deploy: Vercel auto מ-main | Dev branch: `claude/fix-typescript-deploy-cRub9`
Repo: `benali12563-cell/vibematch`

## Design Tokens
```
bg:#000  accent:#00CED1  danger:#FF4444  gold:#FFD700  pro:#a855f7
glass: backdrop-blur(16px) + rgba border
```

## כללי קוד — חובה
- כל component → `"use client"` בשורה 1
- `const isHe = lang === "he"` בכל component
- `direction: isHe ? "rtl" : "ltr"` | font: `isHe ? "'Heebo'" : "'Manrope','Heebo'"`
- כל state גלובלי → context בלבד (lib/context.tsx)
- ללא localStorage → React state / Supabase

## קבצים קריטיים
| קובץ | תפקיד |
|------|--------|
| `types/index.ts` | כל ה-types |
| `lib/context.tsx` | AppProvider — כל ה-state הגלובלי |
| `lib/constants.ts` | T(תרגומים), CATS, DV(ספקי דמו), NICHE_FIELDS |
| `components/SwipeHome.tsx` | פיד ראשי Instagram-style |
| `components/VendorDash.tsx` | דשבורד ספק (4 טאבים) |
| `components/LeadChatModal.tsx` | ליד + צ'אט + VideoModal |
| `components/PackageModal.tsx` | בונה חבילה אוטומטי |
| `components/PWASetup.tsx` | PWA install + push notifications |
| `app/globals.css` | keyframes + .glass/.glass-dark/.story-gradient |

## State גלובלי (useApp)
`lang, user, activeCat, areaFilter, likes, chatThreads, vendorAvailability, selectedDate, publishedVendors, budget, tlItems, eventInfo, vProfile, vendorIsPro, onboardingDone, guests`

## CatKey
`"all"|"venues"|"food"|"music"|"lighting"|"photo"|"beauty"|"entertainment"|"design"|"logistics"|"ceremony"|"digital"`

## פיצ'רים קיימים ✅
- Instagram snap-scroll feed עם 5 תמונות story-style לספק
- קטגוריות + "✨ הכל" מעורבב
- פילטר אזור / תאריך / מיון / סוג אירוע
- Trust badges (⚡מהיר / ✅אירועים / 🔒מאומת / 👑Pro)
- ליד → צ'אט פנימי + notifications
- וידאו ספק (Pro בלבד, YouTube/Vimeo/mp4)
- חבילה אוטומטית (6 קטגוריות, חלוקת תקציב)
- דשבורד ספק: Preview/Edit/Calendar/Leads + סטטיסטיקות
- ספקים דומים + אזהרת תפוס
- PWA: install banner + service worker + local push notifications
- Magic Link auth (owner) + PIN login (vendor, demo: 1234)

## פיצ'רים חסרים / TODO
- [ ] סינון דתי/חילוני/חרדי לשני הצדדים
- [ ] מענה ספק מה-Leads tab (UI מלא)
- [ ] Server-push notifications (VAPID + Supabase Edge Function)
- [ ] Last-minute deals — ספק מוריד מחיר לתאריך פתוח
- [ ] השוואת ספקים (side-by-side)
- [ ] ביקורות מאומתות post-event
- [ ] חוזה דיגיטלי + מקדמה

---

## 🧠 בעיות שוק אמיתיות + פתרונות לבנות

### 🔴 בעיות של הלקוח (בעל האירוע)
| בעיה | פתרון ב-VibeMatch |
|------|-------------------|
| מחירים מוסתרים — חייב להתקשר | מחיר גלוי על כל כרטיס |
| לא יודע מה זמין בתאריך שלו | פילטר תאריך + badge זמינות |
| קשה להשוות ספקים | TODO: מצב השוואה (pinned cards) |
| תקציב יוצא מכלל שליטה | בונה חבילה + tracker תקציב |
| לא בטוח שהספק אמין | Trust badges + ביקורות |
| לא יודע אם הספק מתאים דתית | TODO: סינון חילוני/דתי/חרדי |
| עסקת הרגע האחרון (חסכון) | TODO: Last-minute deals board |
| תיאום עם ספקים מפוצל בוואטסאפ | צ'אט מרכזי בתוך האפליקציה |

### 🔵 בעיות של הספק
| בעיה | פתרון ב-VibeMatch |
|------|-------------------|
| תאריכים פתוחים = הפסד כסף | TODO: Last-minute price drop |
| לידים לא רציניים מבזבזים זמן | טופס ליד מסנן (תאריך/אורחים/תקציב) |
| קשה לבנות אמינות אונליין | Trust badges + Pro video |
| אין visibility ללא פרסום יקר | פרופיל חינמי + SEO ב-/v/[slug] |
| לא יודע כמה ביקורים/שמירות יש | Stats panel (Preview tab) |
| ניהול מלאי תאריכים ידני | לוח שנה זמינות בדשבורד |

### 💰 מונטיזציה — רק אחרי 10,000 ספקים
> ⚠️ הפלטפורמה **חינמית לחלוטין** עד שמגיעים ל-10,000 ספקים פעילים.
> אין Pro, אין תשלומים, אין עמלות — הכל פתוח. המטרה עכשיו: גדילה ומסה קריטית.
> רק אחרי 10K ספקים מפעילים מונטיזציה:

| פיצ'ר | מודל הכנסה |
|-------|------------|
| Pro tier (וידאו + עדיפות בתצוגה) | חודשי ₪99-199 |
| Last-minute deal listing | עמלה 3-5% על עסקה |
| Verified badge | תשלום חד-פעמי ₪299 |
| Boost — ספק מופיע ראשון | ₪49 ל-7 ימים |
| חוזה דיגיטלי + תשלום מקדמה | עמלה 1.5% |

### 🚀 פיצ'רים הבאים (לפי עדיפות)
1. **סינון דתי/חילוני/חרדי** — multi-select לשני הצדדים
2. **מענה ספק ב-Leads** — שדה תשובה + notification ללקוח
3. **Last-minute deals** — ספק מסמן תאריך כ"מבצע" + מחיר מוזל
4. **השוואת ספקים** — לחיצה ארוכה = pin, כפתור "השווה 2-3 ספקים"
5. **ביקורת post-event** — לאחר תאריך האירוע, push לכתוב ביקורת
6. **Boost/עדיפות** — ספק Pro מופיע ב-3 הראשונים
7. **חוזה + מקדמה** — PDF חתימה דיגיטלית + Stripe/Paybox

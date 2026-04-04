import type { CatKey, Area, Vendor, Lang } from "@/types";

export const NICHE_FIELDS: Record<string, { k: string; l: string; type?: string; opts?: string[] }[]> = {
  venues: [{ k: "capacity", l: "קיבולת מקסימלית", type: "text" }, { k: "kosher", l: "כשרות", opts: ["כשר", "לא כשר", "מהדרין", "גמיש"] }, { k: "indoorOutdoor", l: "פנים/חוץ", opts: ["פנים", "חוץ", "שניהם"] }, { k: "parking", l: "חניה", opts: ["כלולה", "לא כלולה"] }],
  food: [{ k: "capacity", l: "כמות סועדים", type: "text" }, { k: "kosher", l: "כשרות", opts: ["כשר", "לא כשר", "מהדרין", "גמיש"] }, { k: "servingStyle", l: "סגנון הגשה", opts: ["ישיבה", "עמידה", "סטיישנים", "מעורב"] }, { k: "cuisineType", l: "סוג מטבח", type: "text" }],
  music: [{ k: "equipment", l: "ציוד", opts: ["כלול", "לא כלול"] }, { k: "style", l: "סגנון", opts: ["מזרחית", "אלקטרונית", "פופ", "שנות 80", "חסידית", "מעורב"] }, { k: "hours", l: "שעות", type: "text" }],
  lighting: [{ k: "equipment", l: "ציוד", opts: ["מלא", "בסיסי", "לפי בקשה"] }, { k: "includes", l: "כולל", type: "text" }],
  photo: [{ k: "type", l: "סוג", opts: ["סטילס", "וידאו", "שניהם"] }, { k: "sameDayEdit", l: "Same Day Edit", opts: ["כן", "לא"] }, { k: "album", l: "אלבום", opts: ["כלול", "בתוספת", "לא"] }],
  beauty: [{ k: "specialty", l: "התמחות", opts: ["כלות", "אירועים", "שניהם"] }, { k: "location", l: "מיקום", opts: ["מגיעה אליכם", "בסטודיו", "שניהם"] }],
  entertainment: [{ k: "showType", l: "סוג מופע", type: "text" }, { k: "duration", l: "משך", type: "text" }],
  design: [{ k: "specialty", l: "התמחות", type: "text" }, { k: "includes", l: "כולל", type: "text" }],
  logistics: [{ k: "vehicleType", l: "סוג רכב", opts: ["מיניבוס", "אוטובוס", "יוקרה", "משולב"] }, { k: "capacity", l: "נוסעים", type: "text" }],
  ceremony: [{ k: "ceremonyType", l: "סוג טקס", opts: ["אורתודוקסי", "קונסרבטיבי", "רפורמי", "חילוני"] }, { k: "chuppah", l: "חופה", opts: ["כלולה", "לא כלולה"] }],
  digital: [{ k: "type", l: "סוג", type: "text" }],
};

export const T: Record<string, Record<string, string>> = {
  he: { home: "בית", manage: "ניהול", timeline: "לוח זמנים", hosting: "אורחים", vendor: "כניסת ספק", login: "התחברות", checklist: "רשימה", budget: "תקציב", save: "שמור", saved: "נשמר", find: "חפש", manual: "הוסף ידנית", remove: "הסר", cancel: "ביטול", archive: "יעבור לארכיון", confirmRemove: "להסיר את", quote: "הצעת מחיר", copy: "העתק", copied: "הועתק", wa: "וואטסאפ", yourName: "השם שלך", go: "המשך", logout: "יציאה", preview: "תצוגה מקדימה", editProfile: "עריכת פרופיל", inviteBoost: "הזמן ספק וקבלו שניכם בוסט", linkCopied: "הלינק הועתק", gallery: "גלריה", desc: "תיאור", price: "מחיר", links: "קישורים", coupon: "קופון", profilePic: "החלף תמונה", saveAll: "שמור הכל", bizName: "שם העסק", noMore: "סיימנו", pickCat: "בחרו קטגוריה אחרת", match: "התאמה מושלמת", invited: "הוזמנתם", coming: "אני מגיע", notComing: "לא הפעם", howMany: "כמה מגיעים", thanks: "תודה רבה", waze: "נווט ב-Waze", maps: "Google Maps", team: "הצוות", meetTeam: "הכירו את הצוות", credits: "שתפו קרדיטים", addCustom: "הוסיפו שלב", guestLink: "העתק לינק", previewGuest: "תצוגה מקדימה", confirmed: "אישרו הגעה", sendGuests: "שלחו לינק לאורחים", authBanner: "התחברו כדי לשמור", allAreas: "הכל", north: "צפון", center: "מרכז", south: "דרום", jerusalem: "ירושלים", reviews: "ביקורות", recommends: "ממליצים גם על", updatePrice: "עדכן מחיר", eventDetails: "פרטי האירוע", eventAddress: "כתובת", eventDate: "תאריך", eventNotes: "הערות לאורחים", sendMagicLink: "שלח לינק כניסה ✉️", magicLinkSent: "בדוק את המייל שלך!", magicLinkDesc: "שלחנו לינק כניסה לכתובת", enterEmail: "הכנס אימייל לכניסה ללא סיסמה", adminPanel: "פאנל ניהול", points: "נקודות", badges: "תגים", leaderboard: "מובילים" },
  en: { home: "Home", manage: "Manage", timeline: "Timeline", hosting: "Guests", vendor: "Vendor Login", login: "Sign In", checklist: "Checklist", budget: "Budget", save: "Save", saved: "Saved", find: "Find", manual: "Add Manual", remove: "Remove", cancel: "Cancel", archive: "Will be archived", confirmRemove: "Remove", quote: "Get Quote", copy: "Copy", copied: "Copied", wa: "WhatsApp", yourName: "Your Name", go: "Continue", logout: "Sign Out", preview: "Preview", editProfile: "Edit Profile", inviteBoost: "Invite vendor — both get boosted", linkCopied: "Link copied", gallery: "Gallery", desc: "Description", price: "Price", links: "Links", coupon: "Coupon", profilePic: "Change photo", saveAll: "Save All", bizName: "Business Name", noMore: "All done", pickCat: "Pick another category", match: "Perfect Match", invited: "You're Invited", coming: "I'm Coming", notComing: "Can't Make It", howMany: "How many", thanks: "Thank You", waze: "Navigate Waze", maps: "Google Maps", team: "Your Team", meetTeam: "Meet the Team", credits: "Share Credits", addCustom: "Add Step", guestLink: "Copy Link", previewGuest: "Preview", confirmed: "Confirmed", sendGuests: "Send link to guests", authBanner: "Sign in to save", allAreas: "All", north: "North", center: "Center", south: "South", jerusalem: "Jerusalem", reviews: "reviews", recommends: "Also recommends", updatePrice: "Update price", eventDetails: "Event Details", eventAddress: "Address", eventDate: "Date", eventNotes: "Notes for guests", sendMagicLink: "Send Magic Link ✉️", magicLinkSent: "Check your email!", magicLinkDesc: "We sent a login link to", enterEmail: "Enter email — no password needed", adminPanel: "Admin Panel", points: "Points", badges: "Badges", leaderboard: "Leaderboard" },
};

export const CATS: { k: Exclude<CatKey, "all">; he: string; en: string }[] = [
  { k: "venues", he: "מקומות", en: "Venues" },
  { k: "food", he: "אוכל", en: "Food" },
  { k: "music", he: "מוזיקה", en: "Music" },
  { k: "lighting", he: "תאורה", en: "Lighting" },
  { k: "photo", he: "צילום", en: "Photo" },
  { k: "beauty", he: "יופי", en: "Beauty" },
  { k: "entertainment", he: "בידור", en: "Shows" },
  { k: "design", he: "עיצוב", en: "Design" },
  { k: "logistics", he: "לוגיסטיקה", en: "Logistics" },
  { k: "ceremony", he: "טקסים", en: "Ceremony" },
  { k: "digital", he: "דיגיטל", en: "Digital" },
];

export const AREAS: Area[] = ["allAreas", "north", "center", "south", "jerusalem"];

export const QF: Record<string, string[]> = {
  venues: ["כמה אורחים?", "תאריך?", "כשרות?", "עיצוב?"],
  food: ["אורחים?", "כשרות?", "הגשה?"],
  music: ["שעות?", "סגנון?", "הגברה?"],
  lighting: ["פנים/חוץ?", "שעות?"],
  photo: ["שעות?", "סטילס/וידאו?", "אלבום?"],
  beauty: ["למי?", "סגנון?"],
  entertainment: ["שעות?", "פנים/חוץ?"],
  design: ["אורחים?", "עיצוב?"],
  logistics: ["מאיפה?", "לאיפה?", "רכב?"],
  ceremony: ["סוג טקס?", "חופה?"],
  digital: ["אורחים?", "תאריך?"],
};

export const TL_PRESETS = ["קבלת פנים", "חופה", "ארוחה", "ריקוד ראשון", "מסיבה", "סיום"];

export const EVENT_TYPES = [
  { k: "wedding", he: "חתונה", emoji: "💍" },
  { k: "bar_mitzvah", he: "בר/בת מצווה", emoji: "✡️" },
  { k: "birthday", he: "יום הולדת", emoji: "🎂" },
  { k: "corporate", he: "אירוע חברה/כנס", emoji: "🏢" },
  { k: "equipment", he: "השכרת ציוד", emoji: "🎪" },
  { k: "private_party", he: "מסיבה פרטית", emoji: "🎉" },
];

export const EVENT_STYLES = [
  { k: "luxury", he: "יוקרתי", emoji: "👑" },
  { k: "rustic", he: "כפרי/בוהו", emoji: "🌿" },
  { k: "modern", he: "מודרני", emoji: "🔲" },
  { k: "classic", he: "קלאסי", emoji: "🎩" },
  { k: "colorful", he: "צבעוני/פסטיבלי", emoji: "🌈" },
  { k: "intimate", he: "אינטימי", emoji: "🕯️" },
];

export const EVENT_VIBES = [
  { k: "romantic", he: "רומנטי", emoji: "💕" },
  { k: "fun", he: "כיפי/מצחיק", emoji: "😂" },
  { k: "emotional", he: "רגשי/נוגע ללב", emoji: "🥹" },
  { k: "energetic", he: "אנרגטי/רוקד", emoji: "⚡" },
  { k: "spiritual", he: "רוחני/מסורתי", emoji: "🌌" },
  { k: "chill", he: "נינוח/שקט", emoji: "😌" },
];

export const BUDGET_RANGES = [
  { k: "under50k", he: "עד ₪50,000" },
  { k: "50_100k", he: "₪50,000 – ₪100,000" },
  { k: "100_200k", he: "₪100,000 – ₪200,000" },
  { k: "over200k", he: "מעל ₪200,000" },
];

export const BADGES = [
  { k: "first_like", label: "❤️ לייק ראשון", points: 10 },
  { k: "five_likes", label: "🔥 5 לייקים", points: 50 },
  { k: "event_created", label: "🎉 יצרת אירוע", points: 100 },
  { k: "rsvp_sent", label: "📨 שלחת הזמנות", points: 75 },
  { k: "profile_complete", label: "✅ פרופיל מלא", points: 25 },
];

function mg(n: string, s: string, p: string, r: number, c: string, rv: number, d: string, cp: string, imgs: string[], ni: Record<string, string>, deal: { text: string; endsIn: number } | null, recs: string[], area: Area): Vendor {
  return { name: n, sub: s, price: p, rating: r, city: c, reviews: rv, desc: d, coupon: cp, area, imgs, niche: ni, deal, recommends: recs, vendorReviews: [] };
}

export const DV: Record<Exclude<CatKey, "all">, Vendor[]> = {
  venues: [
    mg("Vista Hall", "אולמות", "החל מ-₪400", 4.9, "תל אביב", 342, "נוף פנורמי מקומה 40, אולם יוקרתי", "5% הנחה", ["✨", "🏙️", "🌃"], { kosher: "כשר", capacity: "500", indoorOutdoor: "שניהם" }, null, ["DJ Eyal"], "center"),
    mg("Royal Garden", "גנים", "החל מ-₪350", 4.8, "ראשון לציון", 215, "גן מעוצב ל-200-500", "", ["🌿", "🌸", "🌳"], {}, null, [], "center"),
    mg("Villa Paradiso", "וילות", "לפי בקשה", 4.7, "טבריה", 67, "וילה על שפת הכנרת", "", ["🏝️", "🌅", "🏊"], {}, null, [], "north"),
  ],
  food: [
    mg("Chef's Table", "קייטרינג", "החל מ-₪180", 4.9, "הרצליה", 267, "קייטרינג יוקרתי, צרפתי ואסייתי", "", ["🍽️", "🥘", "🍰"], { kosher: "כשר", servingStyle: "ישיבה" }, null, [], "center"),
    mg("BarCraft", "בר", "לפי בקשה", 4.7, "תל אביב", 134, "בר קוקטיילים מקצועי", "10% הנחה", ["🍸", "🍹", "🥂"], {}, { text: "₪3K במקום ₪5K", endsIn: 48 }, [], "center"),
  ],
  music: [
    mg("DJ Eyal", "DJ", "החל מ-₪5K", 4.9, "תל אביב", 256, "DJ חתונות מוביל, מעבר חלק", "", ["🎧", "🎵", "🎶"], { style: "מעורב", equipment: "כלול" }, null, ["BV Atmosphere", "Noa Beauty"], "center"),
    mg("Maya Levy", "זמרת", "לפי בקשה", 4.8, "הרצליה", 134, "זמרת סול ופופ", "", ["🎤", "🎵", "✨"], {}, null, [], "center"),
  ],
  lighting: [
    mg("BV Atmosphere", "תאורה", "לפי בקשה", 4.9, "תל אביב", 127, "תאורה קולנועית ואפקטים", "", ["🎆", "💡", "✨"], { equipment: "מלא" }, null, ["DJ Eyal"], "center"),
  ],
  photo: [
    mg("Lens & Light", "צלם", "החל מ-₪6K", 4.9, "תל אביב", 289, "צילום דוקומנטרי באור טבעי", "₪500 הנחה", ["📷", "📸", "🖼️"], { type: "שניהם", sameDayEdit: "כן" }, null, ["Noa Beauty"], "center"),
    mg("CineWed", "וידאו", "לפי בקשה", 4.8, "רמת גן", 167, "סרטי חתונה קולנועיים 4K", "", ["🎬", "🎥", "📽️"], { type: "וידאו" }, null, [], "center"),
  ],
  beauty: [
    mg("Noa Beauty", "איפור", "החל מ-₪2.5K", 4.9, "תל אביב", 312, "מאפרת כלות מקצועית", "", ["💋", "💄", "✨"], { specialty: "כלות", location: "שניהם" }, null, ["Lens & Light"], "center"),
  ],
  entertainment: [
    mg("FireShow IL", "מופע אש", "לפי בקשה", 4.6, "חיפה", 63, "מופעי אש ו-LED", "", ["🔥", "🎆", "✨"], { showType: "אש+LED" }, null, [], "north"),
  ],
  design: [
    mg("Bloom Studio", "פרחים", "לפי בקשה", 4.8, "תל אביב", 145, "סידורי פרחים בהתאמה אישית", "", ["🌸", "💐", "🌺"], {}, null, [], "center"),
  ],
  logistics: [
    mg("EasyRide", "הסעות", "החל מ-₪3K", 4.7, "תל אביב", 145, "שאטלים מרצדס", "", ["🚌", "🚐", "🚎"], { vehicleType: "משולב", capacity: "50" }, null, [], "center"),
  ],
  ceremony: [
    mg("Rabbi Moshe", "רב", "לפי בקשה", 4.8, "ירושלים", 94, "חופה אורתודוקסית ומודרנית", "", ["🕊️", "💍", "✡️"], { ceremonyType: "אורתודוקסי" }, null, [], "jerusalem"),
  ],
  digital: [
    mg("DigiVite", "הזמנות", "החל מ-₪500", 4.7, "תל אביב", 203, "הזמנות דיגיטליות מונפשות", "", ["📱", "💌", "✉️"], {}, null, [], "center"),
  ],
};

export function allVendors(): Vendor[] {
  return Object.values(DV).flat();
}

export function findVendor(name: string): Vendor | undefined {
  return allVendors().find((v) => v.name === name);
}

export function findCat(name: string): CatKey | "" {
  const entry = Object.entries(DV).find(([, arr]) => arr.some((v) => v.name === name));
  return (entry?.[0] as CatKey) ?? "";
}

export function catName(k: CatKey, lang: Lang): string {
  const c = CATS.find((x) => x.k === k);
  return c ? (lang === "en" ? c.en : c.he) : k;
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{overflow-x:hidden;background:#000}
input:focus,textarea:focus{outline:none}
::-webkit-scrollbar{width:0}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes toast{0%{opacity:0;transform:translateX(-50%) translateY(8px)}8%{opacity:1;transform:translateX(-50%)}85%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(0,206,209,.4)}50%{box-shadow:0 0 0 16px rgba(0,206,209,0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes spin{to{transform:rotate(360deg)}}
`;

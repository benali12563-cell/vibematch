import type { CatKey, Area, Vendor, Lang } from "@/types";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibematch-nine.vercel.app";

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
  { k: "wedding", he: "חתונה", en: "Wedding", emoji: "💍" },
  { k: "bar_mitzvah", he: "בר/בת מצווה", en: "Bar/Bat Mitzvah", emoji: "✡️" },
  { k: "birthday", he: "יום הולדת", en: "Birthday", emoji: "🎂" },
  { k: "corporate", he: "אירוע חברה/כנס", en: "Corporate Event", emoji: "🏢" },
  { k: "equipment", he: "השכרת ציוד", en: "Equipment Rental", emoji: "🎪" },
  { k: "private_party", he: "מסיבה פרטית", en: "Private Party", emoji: "🎉" },
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

// Helper: build picsum seed URL
function img(seed: string) { return `https://picsum.photos/seed/${seed}/800/1200`; }

export const DV: Record<Exclude<CatKey, "all">, Vendor[]> = {
  venues: [
    mg("Vista Hall", "אולמות אירועים", "₪380–₪550 לאורח", 4.9, "תל אביב", 342, "אולם יוקרתי בקומה 40 עם נוף פנורמי לעיר, כולל תאורת LED וחדרי הלבשה פרטיים.", "5% הנחה", [img("vistahall1"), img("vistahall2"), img("vistahall3")], { kosher: "כשר", capacity: "500", indoorOutdoor: "שניהם" }, null, ["DJ Eyal"], "center"),
    mg("Royal Garden", "גני אירועים", "₪280–₪420 לאורח", 4.8, "ראשון לציון", 215, "גן מעוצב ל-200–500 אורחים עם עצי זית עתיקים, פינות ישיבה ובריכת נוי.", "", [img("royalgarden1"), img("royalgarden2"), img("royalgarden3")], { kosher: "גמיש", capacity: "500", indoorOutdoor: "חוץ" }, null, [], "center"),
    mg("Villa Paradiso", "וילות", "₪300–₪490 לאורח", 4.7, "טבריה", 89, "וילה פרטית על שפת הכנרת, אירועים אינטימיים עד 150 אורחים עם בריכה ונוף מרהיב.", "", [img("villaparadiso1"), img("villaparadiso2"), img("villaparadiso3")], { kosher: "לא כשר", capacity: "150", indoorOutdoor: "שניהם" }, null, [], "north"),
    mg("לופט TLV", "לופטים תעשייתיים", "₪4,500–₪9,000 לאירוע", 4.6, "תל אביב", 118, "לופט תעשייתי עם גגון זכוכית ואווירה ייחודית, מתאים לאירועים של 50–100 אורחים.", "", [img("lofttlv1"), img("lofttlv2")], { indoorOutdoor: "פנים", capacity: "100" }, null, [], "center"),
    mg("אמפי הדרום", "מרחבי אירועים", "₪250–₪370 לאורח", 4.5, "אשדוד", 76, "מרחב פתוח עם נוף לים, קיבולת 300–500 אורחים, חניה בשפע.", "", [img("amphidrom1"), img("amphidrom2")], { indoorOutdoor: "חוץ", capacity: "500" }, null, [], "south"),
  ],
  food: [
    mg("Chef's Table", "קייטרינג", "₪180–₪320 לאורח", 4.9, "הרצליה", 267, "קייטרינג יוקרתי בסגנון צרפתי-אסייתי, שף בוגר Le Cordon Bleu פריז.", "", [img("chefstable1"), img("chefstable2"), img("chefstable3")], { kosher: "כשר", servingStyle: "ישיבה" }, null, [], "center"),
    mg("BarCraft", "בר קוקטיילים", "₪3,000–₪7,000 לאירוע", 4.7, "תל אביב", 134, "בר קוקטיילים ניידי עם ברמנים מקצועיים, תפריט מותאם לאירוע.", "10% הנחה", [img("barcraft1"), img("barcraft2")], { servingStyle: "עמידה" }, { text: "₪3K במקום ₪5K", endsIn: 48 }, [], "center"),
    mg("ממתקים של שירה", "שולחן מתוקים", "₪120–₪200 לאורח", 4.8, "פתח תקוה", 94, "שולחן מתוקים מעוצב — מקרונים, קנדי בר, עוגות אישיות ומגדה.", "", [img("sweetshira1"), img("sweetshira2")], { kosher: "כשר", servingStyle: "סטיישנים" }, null, [], "center"),
    mg("גריל נוסטרה", "שף פרטי", "₪200–₪340 לאורח", 4.6, "חיפה", 73, "שף פרטי עם 15 שנות ניסיון, מתמחה בבשרים ופירות ים, מגיע עם ציוד מלא.", "", [img("grillnostra1"), img("grillnostra2")], { kosher: "לא כשר", servingStyle: "ישיבה" }, null, [], "north"),
  ],
  music: [
    mg("DJ Eyal", "DJ", "₪5,500–₪12,000 לאירוע", 4.9, "תל אביב", 256, "DJ חתונות מוביל עם 10+ שנות ניסיון, ציוד Funktion-One, מיקס חלק ואנרגיה גבוהה.", "", [img("djeyal1"), img("djeyal2"), img("djeyal3")], { style: "מעורב", equipment: "כלול" }, null, ["BV Atmosphere", "Noa Beauty"], "center"),
    mg("מאיה לוי", "זמרת", "₪4,000–₪9,000 לאירוע", 4.8, "הרצליה", 134, "זמרת פופ וסול, בוגרת מכללת ריימן, מופיעה לאירועי יוקרה ועם ליווי לייב.", "", [img("mayalevy1"), img("mayalevy2")], { style: "פופ", equipment: "כלול" }, null, [], "center"),
    mg("להקת אורון", "להקה חיה", "₪8,000–₪18,000 לאירוע", 4.8, "ירושלים", 112, "להקה חיה בת 6 נגנים, רפרטואר עשיר של מזרחית, פופ ישראלי וקלאסיקות.", "", [img("lakataoron1"), img("lakataoron2")], { style: "מזרחית", equipment: "כלול" }, null, [], "jerusalem"),
    mg("אקוסטיק דו", "מוזיקה אקוסטית", "₪2,800–₪5,500 לאירוע", 4.7, "תל אביב", 87, "שני נגנים אקוסטיים — גיטרה ווקאל — לאירועים אינטימיים וקבלות פנים.", "", [img("acousticduo1"), img("acousticduo2")], { style: "פופ", equipment: "כלול" }, null, [], "center"),
  ],
  lighting: [
    mg("BV Atmosphere", "תאורה ואפקטים", "₪3,500–₪8,000 לאירוע", 4.9, "תל אביב", 127, "תאורה קולנועית, עשן נמוך, LED ו-Gobo Projectors להחיות כל מרחב.", "", [img("bvatmosphere1"), img("bvatmosphere2"), img("bvatmosphere3")], { equipment: "מלא" }, null, ["DJ Eyal"], "center"),
    mg("LightMasters", "תאורת אירועים", "₪2,800–₪6,500 לאירוע", 4.7, "ראשון לציון", 84, "תאורת אירועים מקצועית, מחירים הוגנים ומענה מהיר, ניסיון ב-500+ אירועים.", "", [img("lightmasters1"), img("lightmasters2")], { equipment: "מלא" }, null, [], "center"),
    mg("נורה צפון", "תאורה", "₪2,200–₪5,000 לאירוע", 4.6, "חיפה", 61, "תאורת אירועים לצפון הארץ, ציוד עדכני ותגובתיות גבוהה.", "", [img("noranorth1"), img("noranorth2")], { equipment: "בסיסי" }, null, [], "north"),
  ],
  photo: [
    mg("Lens & Light", "צלם", "₪6,000–₪14,000 לאירוע", 4.9, "תל אביב", 289, "צילום דוקומנטרי באור טבעי, אלבום פרימיום עם ריצוף עור + עריכה מלאה ב-21 יום.", "₪500 הנחה", [img("lenslight1"), img("lenslight2"), img("lenslight3")], { type: "שניהם", sameDayEdit: "כן", album: "כלול" }, null, ["Noa Beauty"], "center"),
    mg("CineWed", "צלם וידאו", "₪7,000–₪15,000 לאירוע", 4.8, "רמת גן", 167, "סרטי חתונה קולנועיים ב-4K, דרון מורשה, גרסת SDE ביום האירוע.", "", [img("cinewed1"), img("cinewed2")], { type: "וידאו", sameDayEdit: "כן", album: "לא" }, null, [], "center"),
    mg("נוף הגליל", "צלם", "₪4,800–₪9,500 לאירוע", 4.7, "נצרת עילית", 98, "צלם חתונות ואירועים בצפון, מתמחה בנופים טבעיים ואור שעת הזהב.", "", [img("nofhagalil1"), img("nofhagalil2")], { type: "סטילס", sameDayEdit: "לא", album: "בתוספת" }, null, [], "north"),
  ],
  beauty: [
    mg("Noa Beauty", "איפור כלות", "₪2,500–₪5,000 לאירוע", 4.9, "תל אביב", 312, "מאפרת כלות מקצועית עם 8 שנות ניסיון, מגיעה אליכם, ניסיון מראש כלול.", "", [img("noabeauty1"), img("noabeauty2"), img("noabeauty3")], { specialty: "כלות", location: "שניהם" }, null, ["Lens & Light"], "center"),
    mg("Studio Sivan", "שיער ואיפור", "₪1,800–₪3,500 לאירוע", 4.7, "ירושלים", 118, "סטודיו מקצועי לשיער ואיפור לאירועים, קבלת קהל עד 15 אורחות.", "", [img("studiosivan1"), img("studiosivan2")], { specialty: "אירועים", location: "בסטודיו" }, null, [], "jerusalem"),
    mg("Beauty on the Go", "מאפר/ת", "₪1,500–₪3,000 לאירוע", 4.6, "חיפה", 72, "מאפרת ניידת לצפון הארץ, חוויה מרגיעה ביום האירוע המיוחד שלכם.", "", [img("beautyonthego1"), img("beautyonthego2")], { specialty: "אירועים", location: "מגיעה אליכם" }, null, [], "north"),
  ],
  entertainment: [
    mg("FireShow IL", "מופע אש ו-LED", "₪2,500–₪5,500 למופע", 4.6, "חיפה", 63, "מופעי אש, LED ו-UV בעצימות גבוהה, 45–60 דקות של ריגוש חי.", "", [img("fireil1"), img("fireil2")], { showType: "אש+LED", duration: "45–60 דקות" }, null, [], "north"),
    mg("קוסם רז", "אילוז'ניסט", "₪1,800–₪4,000 להופעה", 4.8, "תל אביב", 142, "אילוז'ניסט ריאליטי לאירועים, קאמדי קסמים ומיני-שואו בין שולחנות.", "", [img("magicianraz1"), img("magicianraz2")], { showType: "קסמים+קאמדי", duration: "60 דקות" }, null, [], "center"),
    mg("ריקוד העמים", "רקדנים", "₪3,200–₪7,000 להופעה", 4.7, "תל אביב", 95, "להקת ריקוד מקצועית — בלי, אוריינטל, זומבה — פותחת את הרחבה לכולם.", "", [img("danceteam1"), img("danceteam2")], { showType: "ריקוד", duration: "30–60 דקות" }, null, [], "center"),
  ],
  design: [
    mg("Bloom Studio", "פרחים ועיצוב", "₪3,500–₪14,000 לאירוע", 4.8, "תל אביב", 145, "סידורי פרחים מרהיבים, חופת פרחים + ציפוי שולחנות, עיצוב מרחב מלא.", "", [img("bloomstudio1"), img("bloomstudio2"), img("bloomstudio3")], { specialty: "פרחים ועיצוב", includes: "חופה + שולחנות" }, null, [], "center"),
    mg("עיצוב עם לב", "עיצוב אירועים", "₪4,500–₪16,000 לאירוע", 4.7, "רמת גן", 96, "עיצוב מרחב מלא — שולחנות, חופה, פינות ישיבה ותפאורה בסגנון אישי.", "", [img("designwithlove1"), img("designwithlove2")], { specialty: "עיצוב מלא", includes: "הכל כלול" }, null, [], "center"),
  ],
  logistics: [
    mg("EasyRide", "הסעות לאירועים", "₪3,500–₪8,000 לאירוע", 4.7, "תל אביב", 145, "שאטלים מרצדס ומיניבוסים, שירות VIP לאורחים עם נהגים בחליפה.", "", [img("easyride1"), img("easyride2")], { vehicleType: "משולב", capacity: "50" }, null, [], "center"),
    mg("TransferVIP", "הסעות יוקרה", "₪5,500–₪13,000 לאירוע", 4.6, "הרצליה", 67, "ליימוזינים, Tesla ורכבי יוקרה לאירועי פרימיום, בר/בת מצווה וחתונות.", "", [img("transfervip1"), img("transfervip2")], { vehicleType: "יוקרה", capacity: "20" }, null, [], "center"),
  ],
  ceremony: [
    mg("הרב משה", "מסדר קידושין", "₪2,500–₪5,000 לטקס", 4.8, "ירושלים", 94, "חופה ייחודית, אישית ומרגשת — אורתודוקסי ומודרני כאחד, כותב טקסט לזוג.", "", [img("rabbimoshe1"), img("rabbimoshe2")], { ceremonyType: "אורתודוקסי", chuppah: "כלולה" }, null, [], "jerusalem"),
    mg("טקסי יונתן", "טקס אזרחי", "₪1,800–₪3,500 לטקס", 4.7, "תל אביב", 76, "מסדר טקסים אזרחיים ורגשיים לכל הזוגות, כותב נאום אישי בעברית ואנגלית.", "", [img("tacasyonatan1"), img("tacasyonatan2")], { ceremonyType: "חילוני", chuppah: "לא כלולה" }, null, [], "center"),
  ],
  digital: [
    mg("DigiVite", "הזמנות דיגיטליות", "₪500–₪1,500 לעיצוב", 4.7, "תל אביב", 203, "הזמנות דיגיטליות מונפשות עם RSVP חכם, מעקב אורחים ושיתוף בוואטסאפ.", "", [img("digivite1"), img("digivite2")], {}, null, [], "center"),
    mg("WeddingWeb IL", "אתר חתונה", "₪800–₪2,200 לאתר", 4.8, "תל אביב", 154, "אתר חתונה אישי עם קאונטדאון, גלריה, RSVP, מפה ו-Waze מובנה — בלייב תוך 24 שעות.", "", [img("weddingweb1"), img("weddingweb2")], {}, null, [], "center"),
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


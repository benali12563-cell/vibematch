const S = {
  wrap: { minHeight: "100dvh", background: "#000", color: "#999", padding: "52px 20px 60px", maxWidth: 680, margin: "0 auto", direction: "rtl" as const, fontFamily: "'Heebo', sans-serif", lineHeight: 1.85 },
  h1: { color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 },
  sub: { color: "#444", fontSize: 12, marginBottom: 32 },
  h2: { color: "#ddd", fontSize: 15, fontWeight: 700, marginTop: 32, marginBottom: 8, borderRight: "3px solid #00CED1", paddingRight: 10 },
  p: { fontSize: 13, marginBottom: 10 },
  box: { background: "rgba(0,206,209,.04)", border: "1px solid rgba(0,206,209,.12)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13 },
  warn: { background: "rgba(255,68,68,.04)", border: "1px solid rgba(255,68,68,.12)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#cc8888" },
  note: { fontSize: 11, color: "#333", marginTop: 40 },
};

export default function VendorTermsPage() {
  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>תנאי שימוש לספקים</h1>
      <p style={S.sub}>עדכון אחרון: מרץ 2026 | חל על כל ספק הרשום בפלטפורמה</p>

      <div style={S.box}>
        הרשמה כספק ב-VibeMatch מהווה הסכמה מלאה לתנאים אלה. קרא בעיון לפני הוספת פרופיל.
      </div>

      <h2 style={S.h2}>1. מהות הקשר</h2>
      <p style={S.p}>VibeMatch היא פלטפורמת פרסום דיגיטלית בלבד. <strong style={{ color: "#ccc" }}>VibeMatch אינה מעסיקה, אינה מייצגת, ואינה שותפה</strong> של הספק בשום צורה. הספק הוא עסק עצמאי אחראי.</p>
      <p style={S.p}>VibeMatch לא תהיה צד בשום חוזה שנכרת בין ספק ללקוח, ולא תישא בכל אחריות לתוצאות ההתקשרות.</p>

      <h2 style={S.h2}>2. תוכן הפרופיל</h2>
      <p style={S.p}>הספק מצהיר כי:</p>
      <p style={S.p}>א. כל המידע בפרופיל — שם, תמונות, תיאורים, מחירים, שעות — <strong style={{ color: "#ccc" }}>נכון, עדכני ומדויק.</strong></p>
      <p style={S.p}>ב. התמונות שהועלו הן בבעלותו המלאה, קיבל רשות שימוש עבורן, או שהן חופשיות מזכויות יוצרים.</p>
      <p style={S.p}>ג. אסור להציג תמונות, ביקורות, הסמכות או פרסים שאינם שלו.</p>
      <p style={S.p}>ד. אסור לפרסם מחירים מטעים, הנחות פיקטיביות, או "מחיר מקורי" שלא היה בפועל.</p>

      <div style={S.warn}>
        ⚠️ VibeMatch תסיר <strong>ללא התראה</strong> כל פרופיל הכולל מידע שקרי, תמונות גנובות, ביקורות מזויפות, או תוכן שמפר את תנאי השירות.
      </div>

      <h2 style={S.h2}>3. הגבלת אחריות VibeMatch כלפי ספקים</h2>
      <p style={S.p}>VibeMatch אינה מתחייבת למספר פניות, לידים, לייקים, או הכנסה כלשהי כתוצאה מהפרסום בפלטפורמה.</p>
      <p style={S.p}>VibeMatch אינה אחראית לנזקים שנגרמו לספק מלקוח שנמצא דרך הפלטפורמה — לרבות אי-תשלום, ביטול, פגיעה בשם, או כל נזק אחר.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>האחריות של VibeMatch</strong> כלפי ספק לא תעלה בשום מקרה על הסכום ששילם הספק לחברה ישירות ב-12 החודשים הקודמים.</p>

      <h2 style={S.h2}>4. אחריות הספק כלפי לקוחות</h2>
      <p style={S.p}>הספק אחראי באופן מלא ובלעדי לכל שירות שמספק ללקוחות שנמצאו דרך הפלטפורמה, לרבות:</p>
      <p style={S.p}>א. עמידה בכל דין, רישיון, ותקן מקצועי הנדרש לפעילותו.</p>
      <p style={S.p}>ב. קיום חוזה עם הלקוח, כולל פיצוי במקרה של ביטול חד-צדדי.</p>
      <p style={S.p}>ג. עמידה בחוק הגנת הצרכן, חוק המכר, וכל חקיקה רלוונטית.</p>
      <p style={S.p}>ד. אם בשל מחדל הספק תוגש תביעה נגד VibeMatch — <strong style={{ color: "#ccc" }}>הספק מתחייב לשפות את VibeMatch</strong> בגין כל הוצאה, קנס, פיצוי ושכ"ט עו"ד שתחויב בהם.</p>

      <h2 style={S.h2}>5. שיפוי והגנה על VibeMatch</h2>
      <p style={S.p}>הספק מסכים לשפות, להגן ולפצות את VibeMatch, בעלי מניותיה, עובדיה וסוכניה מפני כל תביעה, נזק, קנס, הוצאה משפטית, לרבות שכר טרחת עורך דין סביר — הנובעים מ:</p>
      <p style={S.p}>א. הפרת תנאים אלה על ידי הספק.</p>
      <p style={S.p}>ב. תוכן שגוי, מטעה, או מפר שפרסם הספק.</p>
      <p style={S.p}>ג. מחלוקת כלשהי בין הספק ללקוח.</p>
      <p style={S.p}>ד. כל פגיעה בזכויות יוצרים, סימן מסחרי, פרטיות, או זכות קניין רוחני אחרת בתוכן שהועלה.</p>

      <h2 style={S.h2}>6. ביטוח</h2>
      <p style={S.p}>VibeMatch ממליצה בחום לכל ספק להחזיק בביטוח אחריות מקצועית רלוונטי לתחום פעילותו. VibeMatch אינה מספקת ביטוח לספקים ואינה אחראית לנזקים שהיה ניתן למנוע בביטוח מתאים.</p>

      <h2 style={S.h2}>7. הסרת פרופיל</h2>
      <p style={S.p}>VibeMatch רשאית להשהות או למחוק פרופיל ספק בכל עת ולפי שיקול דעתה, לרבות — אך לא רק — בגין: תלונות לקוחות, פגיעה במוניטין הפלטפורמה, הפרת תנאים, חדלות פירעון, הרשעה פלילית.</p>
      <p style={S.p}>הספק לא יהיה זכאי לפיצוי בגין הסרת הפרופיל, אלא אם הוכח בפסיקה סופית שהסרה הייתה בחוסר תום לב מוחלט.</p>

      <h2 style={S.h2}>8. סמכות שיפוטית</h2>
      <p style={S.p}>על תנאים אלו יחול הדין הישראלי. סמכות שיפוט בלעדית — בתי המשפט במחוז תל אביב.</p>

      <p style={S.note}>© 2026 VibeMatch. לשאלות: legal@vibematch.co.il</p>
    </div>
  );
}

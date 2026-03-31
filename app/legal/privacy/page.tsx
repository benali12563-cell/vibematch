const S = {
  wrap: { minHeight: "100dvh", background: "#000", color: "#999", padding: "52px 20px 60px", maxWidth: 680, margin: "0 auto", direction: "rtl" as const, fontFamily: "'Heebo', sans-serif", lineHeight: 1.85 },
  h1: { color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 },
  sub: { color: "#444", fontSize: 12, marginBottom: 32 },
  h2: { color: "#ddd", fontSize: 15, fontWeight: 700, marginTop: 32, marginBottom: 8, borderRight: "3px solid #00CED1", paddingRight: 10 },
  p: { fontSize: 13, marginBottom: 10 },
  box: { background: "rgba(0,206,209,.04)", border: "1px solid rgba(0,206,209,.12)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13 },
  note: { fontSize: 11, color: "#333", marginTop: 40 },
};

export default function PrivacyPage() {
  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>מדיניות פרטיות</h1>
      <p style={S.sub}>עדכון אחרון: מרץ 2026 | תואמת חוק הגנת הפרטיות הישראלי ו-GDPR</p>

      <div style={S.box}>
        VibeMatch מחויבת לשמירה על פרטיות המשתמשים. מדיניות זו מסבירה אילו נתונים אנו אוספים, כיצד אנו משתמשים בהם, ומה הזכויות שלך.
      </div>

      <h2 style={S.h2}>1. נתונים שאנו אוספים</h2>
      <p style={S.p}><strong style={{ color: "#ccc" }}>נתונים שאתה מספק:</strong> כתובת אימייל, שם, מספר טלפון (אם ניתן), פרטי אירוע, רשימות אורחים, ותמונות שהועלו לפרופיל ספק.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>נתונים שנאספים אוטומטית:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה, זמני גישה ודפים שנצפו. אנו משתמשים ב-Supabase לאחסון מאובטח.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>לא אוספים:</strong> מידע פיננסי, מספרי כרטיסי אשראי, ספח תעודת זהות, או מידע רפואי.</p>

      <h2 style={S.h2}>2. שימוש במידע</h2>
      <p style={S.p}>א. אימות זהות ואבטחת חשבון.</p>
      <p style={S.p}>ב. הצגת תוצאות מותאמות (VibeMatching) בהתאם לפרטי האירוע שהזנת.</p>
      <p style={S.p}>ג. שליחת עדכונים אדמיניסטרטיביים (לדוגמה: שינויים בתנאים, עדכוני אבטחה).</p>
      <p style={S.p}>ד. שיפור השירות על בסיס נתוני שימוש אנונימיים.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>לא נמכור, נשכור, נחלוק</strong> את המידע שלך עם צד שלישי לצורכי שיווק ללא הסכמתך המפורשת.</p>

      <h2 style={S.h2}>3. שיתוף מידע עם צד שלישי</h2>
      <p style={S.p}><strong style={{ color: "#ccc" }}>Supabase (supabase.com):</strong> ספק תשתית הנתונים שלנו. הנתונים מאוחסנים בשרתים מאובטחים באיחוד האירופי. Supabase כפופה למדיניות GDPR.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>Vercel (vercel.com):</strong> ספק אחסון האתר. אוסף log files טכניים בלבד.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>גורמי חוק:</strong> נמסור מידע לרשויות אכיפת חוק רק בהתאם לדרישה חוקית מפורשת ומחייבת.</p>

      <h2 style={S.h2}>4. עוגיות (Cookies)</h2>
      <p style={S.p}>אנו משתמשים בעוגיות הכרחיות לצורך אימות פגישה (Session) בלבד. אנו <strong style={{ color: "#ccc" }}>לא משתמשים</strong> בעוגיות מעקב שיווקיות או בפיקסל פייסבוק.</p>

      <h2 style={S.h2}>5. אחסון ואבטחה</h2>
      <p style={S.p}>נתוניך מאוחסנים מוצפנים (AES-256) דרך Supabase. חיבורים מאובטחים ב-HTTPS/TLS. גישה לנתונים מוגבלת לצוות הטכני המורשה בלבד.</p>
      <p style={S.p}><strong style={{ color: "#ccc" }}>הבהרה חשובה:</strong> אף מערכת אינה אטומה לחלוטין. VibeMatch אינה יכולה להבטיח הגנה מוחלטת מפני כל פריצה, ואינה נושאת באחריות לנזקים שנגרמו מחדירה לא מורשית לשרתי צד שלישי.</p>

      <h2 style={S.h2}>6. זכויות המשתמש (זכויות GDPR)</h2>
      <p style={S.p}>בהתאם לחוק הגנת הפרטיות הישראלי ולתקנות GDPR, יש לך זכות:</p>
      <p style={S.p}>א. <strong style={{ color: "#ccc" }}>עיון</strong> — לבקש לראות את כל המידע האישי שנשמר עליך.</p>
      <p style={S.p}>ב. <strong style={{ color: "#ccc" }}>תיקון</strong> — לתקן מידע לא מדויק.</p>
      <p style={S.p}>ג. <strong style={{ color: "#ccc" }}>מחיקה ("הזכות להישכח")</strong> — לבקש מחיקת חשבונך וכל הנתונים הקשורים אליו.</p>
      <p style={S.p}>ד. <strong style={{ color: "#ccc" }}>ניידות</strong> — לקבל עותק מהנתונים שלך בפורמט קריא מכונה.</p>
      <p style={S.p}>ה. <strong style={{ color: "#ccc" }}>התנגדות</strong> — להתנגד לעיבוד מידע לצורכי שיווק.</p>
      <p style={S.p}>לממש זכויות אלה, פנה לנו: <span style={{ color: "#00CED1" }}>privacy@vibematch.co.il</span></p>

      <h2 style={S.h2}>7. שמירת נתונים</h2>
      <p style={S.p}>נתונים של חשבונות פעילים: נשמרים כל עוד החשבון פעיל. נתונים של חשבונות שנמחקו: נמחקים תוך 30 יום, מלבד נתונים שמחייב הדין לשמור.</p>

      <h2 style={S.h2}>8. קטינים</h2>
      <p style={S.p}>השירות אינו מיועד לבני פחות מ-18. אנו לא אוספים מידע ביודעין מקטינים. אם גילית שקטין רשם חשבון — פנה אלינו למחיקה מיידית.</p>

      <h2 style={S.h2}>9. שינויים במדיניות</h2>
      <p style={S.p}>שינויים מהותיים יפורסמו בפלטפורמה ויישלח עדכון לאימייל הרשום. המשך שימוש לאחר מועד כניסת השינויים לתוקף מהווה הסכמה.</p>

      <p style={S.note}>© 2026 VibeMatch. לשאלות בנושא פרטיות: privacy@vibematch.co.il</p>
    </div>
  );
}

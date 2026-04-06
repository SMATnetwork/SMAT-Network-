const admin = require('firebase-admin');

// আপনার JSON ফাইল থেকে পাওয়া ডেটা সরাসরি এখানে দেওয়া হলো
const serviceAccount = {
  "type": "service_account",
  "project_id": "smat-exchange",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqJ4r/T5LkFg4t\n+c39roDxDRxbOlrqeoGZDEoiCOBbeb3mp3nohQISR7l15TzrbvHCdukqrAvsYW/b\nmzbIxiwSPl3S24yfg5IDAke71O0bJyJ4oLmW5ZWIaijiR51h4cH2IaligiesYf8I\nfdPO8t9ef94QFjD64cM5I85RwVKd5BJ/YSsdmYbnca0+fFMIQA9vD1hR063737Ar\nLeF/C35CzvWy9ke7mua4IwOUQ0ZWpY7rkbvvsTpu4GNVyrMSxDlr1AF8g2pNhSd+\nK6WExjL9wuKee7XZ8ma/FaNtNxiSe4vmODwzMRkTag5Ni0dhR05ZvnGDxrx7rQwc\n3V3NL9rVAgMBAAECggEABAfSmKh5eIqBifsY8yQofO1G/sM5Bu+2ylm6l31MgTuM\nRnPbpP4iQILEmiNqEsKf7++8p2HdbhtDGM7fre2ser8m86PMkYppPEXYI1MlzbGa\n367Lo/nVawk8EDDK7IK6Qzq6ENxilQhaOp4ualXMTuhU/zO4s8yta5j/82WoBReU\nKRrI+PGSF1ziJnrFL5zq94A1E5sRTaSNpamqlDra0fferswIW1iNy+WjIx5SXY0u\nPu/WvH76OVnJKCBrRc9DUHoN9a1dROHkRV8hY677viZcu3g9dblPzY50XVj0nOyN\nrWvQs07+TCRBXdjZeVCjNU+8cVdv75lpV6/mLjzZcQKBgQDVE5HKXv91zhU7cDxr\nuFG1uHd7r+Cpr7Y4jCy1vNH5r5Xci0vDSb2HKM3841kM+KBENCv6yrQxoHGOfA6\nVvPpsGK7G57JEHpAFBxs1a8c6MLv62D9e+5c9qiCB9lL5HKUbEKhKxONuzg8wcl3\nOfvG1398+2OIenZdH69E163MhQKBgQDMbnijq/Jhhz8W5bhoadWHZulKimmCKT8G\njKv0Xcnm7rdBpUXZOiQ2c9K8kMpOf62GvMTPqZmhBm6bsa8QPi2nfYrmh+wEphLj\n6Gt4QfjaLB/AtNcmCNNRfyqXRDICn5QWfw8TtRhttU1Cjp76qGyTNi3mkmJOLWDM\ndo0JEH4OEQKBgQCWjUc7uDfEIyK5ZqoqWI5QIVBiIWlLhUnfsKI8Gsi2iwD+hHwM\nfLyEtONWi03h+Q8XpqvtQLp13WyghRuJ/RpGigyYrAFbi7r1P8B93dXnFUd3gdZ8\nBG79XILfrXAJwZZ77Kp/ehJM2HX55+rTxTJy4pz/0BgZvH2ZeuO6PrJciQKBgQDH\nCpRZP3Qp8yXBJH+M4eauA8wG8IbT3VbpCJPvxFVtjGVO/Bzq6MoTXmgDgrIHBhct\nBaRWUFotRvbwjmrV1MRcvEY+OH7a89uWnVft6cXinm14ElscRCGDyt3sE9DhbwAf\neyxx0rPrNUf5EqXFhbDZEDpWsZYXaeVCjfa5qZ4iEQKBgDnVNav5C+tZKa1Empb/\nTJN1kGuYg60pBiqHhH4GhjPsJ/rDlg88dy5ANzH/vldhNJHPzaVFuUP3gnGR2q6/\noWSOA1JUUfdSkUnsQU/TBwfkHHsZdelkXLQi0+t1cTzen8tIyav61m5QKxiUvPma\nCha4wG70DHGr7+0tl8mgIHln\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@smat-exchange.iam.gserviceaccount.com"
};

// ডাটাবেস ইউআরএল আপনার প্রজেক্ট অনুযায়ী দেওয়া হলো
const DATABASE_URL = "https://smat-exchange-default-rtdb.firebaseio.com";

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL
  });
  console.log("🔥 SMAT Server: Firebase Connected Successfully!");
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
  process.exit(1);
}

const db = admin.database();
const gameRef = db.ref('game_state/crash');

// গেম লুপ (সারাক্ষণ চলার জন্য)
async function startCrashCycle() {
  let gameId = 100000;
  while (true) {
    try {
      // Waiting Phase
      for (let i = 10; i >= 0; i--) {
        await gameRef.update({ status: 'waiting', timer: i, game_id: gameId });
        await new Promise(r => setTimeout(r, 1000));
      }

      // Running Phase
      const crashAt = parseFloat((1.01 + Math.random() * 5).toFixed(2)); // টেস্টের জন্য ৫ পর্যন্ত
      let current = 1.00;
      await gameRef.update({ status: 'running', current_multiplier: 1.00 });

      while (current < crashAt) {
        current = parseFloat((current + 0.05).toFixed(2));
        await gameRef.update({ current_multiplier: current });
        await new Promise(r => setTimeout(r, 150));
      }

      // Crashed Phase
      await gameRef.update({ status: 'crashed', last_crash: crashAt });
      gameId++;
      await new Promise(r => setTimeout(r, 4000));
    } catch (e) {
      console.log("Loop Error:", e.message);
    }
  }
}

startCrashCycle();
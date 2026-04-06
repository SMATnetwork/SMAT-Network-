const admin = require('firebase-admin');

// সরাসরি কী না লিখে এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করা হচ্ছে
const privateKey = process.env.FIREBASE_PRIVATE_KEY ? 
    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
    undefined;

const serviceAccount = {
  "type": "service_account",
  "project_id": "smat-exchange",
  "private_key": privateKey,
  "client_email": "firebase-adminsdk-fbsvc@smat-exchange.iam.gserviceaccount.com"
};

try {
    if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY is missing in Render Environment Variables!");
    }
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://smat-exchange-default-rtdb.firebaseio.com"
    });
    console.log("SMAT Game Server: Firebase Connected Successfully!");
} catch (error) {
    console.error("Firebase Initialization Error:", error.message);
    process.exit(1); 
}

const db = admin.database();
const gameRef = db.ref('game_state/crash');

// ২. আপনার দেওয়া প্রোবাবিলিটি লজিক
let over2xStreak = 0;
let under2xStreak = 0;
let gameId = 100000;

function calculateCrashPoint() {
    let r = Math.random() * 100;
    let cp = 1.00;

    if (under2xStreak >= 8) r = 52.5 + Math.random() * 47.5; 
    if (over2xStreak >= 7) r = Math.random() * 52.5; 

    if (r <= 5.0) cp = 1.00;
    else if (r <= 10.0) cp = 1.01 + Math.random() * 0.08;
    else if (r <= 15.0) cp = 1.10 + Math.random() * 0.09;
    else if (r <= 20.0) cp = 1.20 + Math.random() * 0.09;
    else if (r <= 25.0) cp = 1.30 + Math.random() * 0.09;
    else if (r <= 30.0) cp = 1.40 + Math.random() * 0.09;
    else if (r <= 34.5) cp = 1.50 + Math.random() * 0.09;
    else if (r <= 39.0) cp = 1.60 + Math.random() * 0.09;
    else if (r <= 43.5) cp = 1.70 + Math.random() * 0.09;
    else if (r <= 48.0) cp = 1.80 + Math.random() * 0.09;
    else if (r <= 52.5) cp = 1.90 + Math.random() * 0.09;
    else if (r <= 62.5) cp = 2.00 + Math.random() * 0.49;
    else if (r <= 69.5) cp = 2.50 + Math.random() * 0.24;
    else if (r <= 76.5) cp = 2.75 + Math.random() * 0.24;
    else if (r <= 81.5) cp = 3.00 + Math.random() * 0.49;
    else if (r <= 83.7) cp = 3.50 + Math.random() * 0.49;
    else if (r <= 85.9) cp = 4.00 + Math.random() * 0.49;
    else if (r <= 88.1) cp = 4.50 + Math.random() * 0.49;
    else if (r <= 90.1) cp = 5.00 + Math.random() * 0.49;
    else if (r <= 91.6) cp = 5.50 + Math.random() * 0.49;
    else if (r <= 93.1) cp = 6.00 + Math.random() * 0.99;
    else if (r <= 94.6) cp = 7.00 + Math.random() * 2.99;
    else if (r <= 95.6) cp = 10.00 + Math.random() * 4.99;
    else if (r <= 96.6) cp = 15.00 + Math.random() * 4.99;
    else if (r <= 97.1) cp = 20.00 + Math.random() * 4.99;
    else if (r <= 97.6) cp = 25.00 + Math.random() * 24.99;
    else if (r <= 98.1) cp = 50.00 + Math.random() * 24.99;
    else if (r <= 98.35) cp = 75.00 + Math.random() * 24.99;
    else if (r <= 98.60) cp = 100.00 + Math.random() * 49.99;
    else if (r <= 98.85) cp = 150.00 + Math.random() * 99.99;
    else if (r <= 99.10) cp = 250.00 + Math.random() * 249.99;
    else if (r <= 99.225) cp = 500.00 + Math.random() * 249.99;
    else if (r <= 99.35) cp = 750.00 + Math.random() * 249.99;
    else if (r <= 99.475) cp = 1000.00 + Math.random() * 499.99;
    else if (r <= 99.60) cp = 1500.00 + Math.random() * 499.99;
    else if (r <= 99.70) cp = 2000.00 + Math.random() * 499.99;
    else if (r <= 99.80) cp = 2500.00 + Math.random() * 2499.99;
    else if (r <= 99.85) cp = 5000.00 + Math.random() * 4999.99;
    else if (r <= 99.90) cp = 10000.00 + Math.random() * 14999.99;
    else if (r <= 99.93) cp = 25000.00 + Math.random() * 24999.99;
    else if (r <= 99.96) cp = 50000.00 + Math.random() * 49999.99;
    else if (r <= 99.98) cp = 100000.00 + Math.random() * 99999.99;
    else cp = 200000.00 + Math.random() * 799999.99;

    if (cp >= 2) { over2xStreak++; under2xStreak = 0; }
    else { under2xStreak++; over2xStreak = 0; }

    return parseFloat(cp.toFixed(2));
}

// ৩. গেম লুপ
async function startCrashCycle() {
    console.log("SMAT Game Server is starting...");
    while (true) {
        // ওয়েটিং ফেজ
        for (let i = 10; i >= 0; i--) {
            await gameRef.update({ status: 'waiting', timer: i, game_id: gameId });
            await new Promise(r => setTimeout(r, 1000));
        }

        const crashAt = calculateCrashPoint();
        let currentMultiplier = 1.00;
        await gameRef.update({ status: 'running', current_multiplier: 1.00 });

        // রানিং ফেজ
        while (currentMultiplier < crashAt) {
            currentMultiplier += (currentMultiplier < 10 ? 0.01 : currentMultiplier * 0.005);
            if (currentMultiplier >= crashAt) break;
            await gameRef.update({ current_multiplier: parseFloat(currentMultiplier.toFixed(2)) });
            await new Promise(r => setTimeout(r, 100)); // ১০০ms বিরতি
        }

        // ক্রাশড ফেজ
        await gameRef.update({ status: 'crashed', last_crash: crashAt });
        gameId++;
        await new Promise(r => setTimeout(r, 5000)); // ৫ সেকেন্ড বিরতি
    }
}

startCrashCycle();

const admin = require('firebase-admin');

// সরাসরি কী না লিখে এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করছি
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
    if (!privateKey) throw new Error("Key not found in Render settings!");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://smat-exchange-default-rtdb.firebaseio.com"
    });
    console.log("SMAT Server is LIVE and Connected!");
} catch (error) {
    console.error("Error:", error.message);
}

const db = admin.database();
const gameRef = db.ref('game_state/crash');

// আপনার দেওয়া লজিক (সংক্ষিপ্ত আকারে)
async function runGame() {
    let gameId = 1000;
    while (true) {
        await gameRef.update({ status: 'waiting', timer: 10, game_id: gameId });
        await new Promise(r => setTimeout(r, 10000));

        let crashAt = (Math.random() * 5 + 1).toFixed(2); // টেস্টের জন্য ছোট লিমিট
        let current = 1.00;
        await gameRef.update({ status: 'running', current_multiplier: 1.00 });

        while (current < crashAt) {
            current = parseFloat((current + 0.05).toFixed(2));
            await gameRef.update({ current_multiplier: current });
            await new Promise(r => setTimeout(r, 200));
        }

        await gameRef.update({ status: 'crashed', last_crash: crashAt });
        gameId++;
        await new Promise(r => setTimeout(r, 5000));
    }
}
runGame();
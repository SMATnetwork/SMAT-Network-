/**
 * SMAT CEX - Dynamic Central Engine (Wallet, Market & Trade Sync)
 * This script auto-generates assets for Wallet, Trade, and Market only.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMxtJedkehhxJRMPZLjhpKHqneHEWsGlE",
    authDomain: "smat-exchange.firebaseapp.com",
    databaseURL: "https://smat-exchange-default-rtdb.firebaseio.com",
    projectId: "smat-exchange",
    appId: "1:836334569396:web:679effe640b3453412d4e1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function getLiveBalance(coinKey) {
    let stored = localStorage.getItem(coinKey);
    return stored ? stored : "0.00000000"; 
}

function initSmatEngine() {
    console.log("🚀 SMAT Engine: Booting Dynamic Assets...");

    // শুধুমাত্র 'spotAssets' থেকে ডাটা নিবে যা Wallet, Market, Trade-এ যাবে
    const spotRef = ref(db, 'spotAssets');
    
    onValue(spotRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const DYNAMIC_COINS = [];

        for (const key in data) {
            const coin = data[key];
            const lowSym = coin.sym.toLowerCase();
            const upSym = coin.sym.toUpperCase();
            
            // ১. গ্লোবাল সিস্টেম ভেরিয়েবল তৈরি (Trade & Logic এর জন্য)
            window[lowSym + "Val"] = parseFloat(coin.price);
            window[lowSym + "Decimal"] = parseInt(coin.decimal) || 8;
            window[lowSym + "Contract"] = coin.contract || 'Native';
            window[lowSym + "Status"] = coin.status || 'active'; // Lock/Unlock Status
            window[lowSym + "LockMsg"] = coin.lock_msg || '';
            window[lowSym + "UnlockTime"] = coin.unlock_time || '';
            
            // ২. লাইভ ব্যালেন্স ম্যাপিং
            const rawBalance = await getLiveBalance(coin.key);
            window[lowSym + "Balance"] = parseFloat(rawBalance);

            // ৩. অটোমেটিক লগো এবং পেয়ার পাথ (UI এর জন্য)
            coin.logoPath = `assets/logos/${coin.logo || (lowSym + '.png')}`;
            coin.pairName = `${upSym}/USDT`;

            DYNAMIC_COINS.push(coin);
            
            // ৪. লোকাল স্টোরেজ সিঙ্ক
            localStorage.setItem(coin.key, rawBalance);
        }

        /**
         * ৫. অটো-ডিস্ট্রিবিউশন
         * এই একটি লিস্ট থেকেই Wallet, Market এবং Trade তাদের ডাটা অটো-রেন্ডার করে নিবে।
         */
        localStorage.setItem('marketStats', JSON.stringify(DYNAMIC_COINS));
        
        console.log("✅ SMAT Engine: " + DYNAMIC_COINS.length + " Assets Live in Wallet, Market & Trade.");
        
        // সব পেজকে সিগন্যাল পাঠানো যে ডাটা রেডি
        window.dispatchEvent(new Event('smat_engine_ready'));
    });
}

initSmatEngine();

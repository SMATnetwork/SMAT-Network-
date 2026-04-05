/**
 * SMAT CEX - Central Data Engine (Final Version)
 * Author: Gemini AI Collaboration
 * Description: Handles Global Balance, Price (Value), Volume, and Logos.
 */

// ১. এপিআই কনফিগারেশন
const API_CONFIG = {
    baseUrl: "api/v1", 
    isLive: false // ডাটাবেস লাইভ করলে ট্রু করে দিবেন
};

// ২. মূল কয়েন কনফিগারেশন (এখান থেকে লগো, নাম এবং সিম্বল অটো লোড হবে)
const GLOBAL_COINS = [
    { sym: 'smat', name: 'SMAT Native', price: 10.00, key: 'smat_balance', networks: ['SMAT Chain'] },
    { sym: 'btc', name: 'Bitcoin', price: 61000.00, key: 'btc_balance', networks: ['BTC', 'BEP20'] },
    { sym: 'eth', name: 'Ethereum', price: 2350.50, key: 'eth_balance', networks: ['ERC20', 'BEP20'] },
    { sym: 'bnb', name: 'Binance Coin', price: 588.00, key: 'bnb_balance', networks: ['BEP20'] },
    { sym: 'usdt', name: 'Tether', price: 1.00, key: 'usdt_balance', networks: ['TRC20', 'BEP20'] },
    { sym: 'sol', name: 'Solana', price: 145.00, key: 'sol_balance', networks: ['Mainnet'] },
    { sym: 'trx', name: 'TRON', price: 0.15, key: 'trx_balance', networks: ['TRC20'] }
    // নতুন কয়েন এড করতে হলে শুধু এখানে একটি লাইন বাড়াবেন, আর কিচ্ছু করতে হবে না।
];

/**
 * ৩. ব্যালেন্স ইনজেক্টর (Database/Local Connector)
 * ইউজারের রিয়াল ব্যালেন্স হ্যান্ডেল করার জন্য।
 */
async function getLiveBalance(coinKey) {
    if (API_CONFIG.isLive) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/get_balance.php?asset=${coinKey}`);
            const data = await response.json();
            return data.balance; 
        } catch (error) {
            console.error("Balance Fetch Error:", error);
            return "0.0000";
        }
    } else {
        // টেস্টিং মোড: লোকাল স্টোরেজ চেক করবে, না থাকলে ৫০০ ব্যালেন্স দিবে।
        let stored = localStorage.getItem(coinKey);
        return stored ? stored : "500.0000"; 
    }
}

/**
 * ৪. ওমনি-ইঞ্জিন (Initialization)
 * এই ফাংশনটি Balance, Value, Volume এবং Logo পাথ জেনারেট করে উইন্ডোতে সেট করে।
 */
async function initSmatEngine() {
    console.log("⚡ SMAT Engine Initializing Assets...");

    for (const coin of GLOBAL_COINS) {
        // ক) সিম্বলকে ছোট হাতের করে নেওয়া (ভেরিয়েবল তৈরির জন্য: smat)
        const lowSym = coin.sym.toLowerCase();
        
        // খ) সিম্বলকে বড় হাতের করা (ডিসপ্লে এবং পেয়ারের জন্য: SMAT)
        const upSym = coin.sym.toUpperCase();
        coin.displaySym = upSym; // মূল অবজেক্টেও আপডেট রাখা হলো

        // ১. ভ্যালু সেটআপ (Value) -> smatVal
        window[lowSym + "Val"] = parseFloat(coin.price);

        // ২. ভলিউম সেটআপ (Volume) -> smatVol
        window[lowSym + "Vol"] = parseFloat(coin.vol);

        // ৩. ব্যালেন্স সেটআপ (Balance) -> smatBalance
        const rawBalance = await getLiveBalance(coin.key);
        window[lowSym + "Balance"] = parseFloat(rawBalance);

        // ৪. লোগো পাথ সেটআপ (Logo) -> assets/logos/smat.png
        // আপনার গিটহাবের ফাইল নাম যেহেতু ছোট হাতের, তাই .toLowerCase() ব্যবহার করা হয়েছে।
        coin.logo = `assets/logos/${lowSym}.png`;

        // ৫. পেয়ার নাম সেটআপ (Pair) -> SMAT/USDT
        coin.pairName = `${upSym}/USDT`;

        // সিঙ্ক করার জন্য লোকাল স্টোরেজ আপডেট (অন্য পেজের জন্য ব্যাকআপ)
        localStorage.setItem(coin.key, rawBalance);
    }

    // ৫. মার্কেট স্ট্যাটাস গ্লোবাল অবজেক্টে সেভ (Home.html এর রেন্ডারিং এর জন্য)
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    
    console.log("✅ SMAT Engine: Value, Volume, Balance & Logos Synced.");
    
    // ইভেন্ট ডিসপ্যাচ করা যাতে অন্য পেজ বুঝতে পারে ডাটা রেডি
    window.dispatchEvent(new Event('smat_engine_ready'));
}

// ফাইল লোড হওয়ার সাথে সাথে ইঞ্জিন স্টার্ট হবে
initSmatEngine();

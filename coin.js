/**
 * SMAT CEX - Central Data Engine (Server-Ready)
 * এই ফাইলটি আপনার ডাটাবেস এবং ফ্রন্টএন্ডের মধ্যে কানেকশন রক্ষা করবে।
 */

// ১. আপনার সার্ভারের এপিআই ইউআরএল (ভবিষ্যতে এখানে আপনার ডোমেইন দিবেন)
const API_CONFIG = {
    baseUrl: "api/v1", // আপনার সার্ভারের ফোল্ডার পাথ
    isLive: false      // ডাটাবেস কানেক্ট হলে এটাকে true করে দিবেন
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
 * ৩. ব্যালেন্স ম্যানেজার (Database Connector)
 * ইউজারের ব্যালেন্স সরাসরি ডাটাবেস থেকে আনার জন্য এই ফাংশনটি কাজ করবে।
 */
async function fetchUserBalance(coinKey) {
    if (API_CONFIG.isLive) {
        try {
            // ডাটাবেস থেকে রিয়াল ডাটা কল (PHP/Node API)
            const response = await fetch(`${API_CONFIG.baseUrl}/get_balance.php?asset=${coinKey}`);
            const data = await response.json();
            return data.balance; 
        } catch (error) {
            console.error("Database connection failed:", error);
            return "0.0000";
        }
    } else {
        // টেস্টিং মোড: ডাটাবেস না থাকলে ৫০০ ব্যালেন্স দেখাবে
        let localData = localStorage.getItem(coinKey);
        return localData ? localData : "500.0000"; 
    }
}

/**
 * ৪. গ্লোবাল উইন্ডো ভেরিয়েবল সেটআপ
 * যাতে আপনি যেকোনো ফাইল থেকে সরাসরি btcVal বা btcBalance কল করতে পারেন।
 */
async function initSmatEngine() {
    console.log("⚡ SMAT Engine Initializing...");

    for (const coin of GLOBAL_COINS) {
        // ডাইনামিক প্রাইস ভেরিয়েবল (যেমন: smatVal)
        window[coin.sym + "Val"] = coin.price;
        
        // ডাইনামিক ব্যালেন্স ভেরিয়েবল (যেমন: smatBalance)
        const balance = await fetchUserBalance(coin.key);
        window[coin.sym + "Balance"] = parseFloat(balance);
        
        // সিঙ্ক করার জন্য লোকাল স্টোরেজেও রাখা (ব্যাকআপ হিসেবে)
        localStorage.setItem(coin.key, balance);
    }

    // মার্কেট স্ট্যাটাস সেভ
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    
    console.log("✅ All Assets Synced from Database/Sim.");
}

// ফাইল লোড হওয়ার সাথে সাথে ইঞ্জিন স্টার্ট হবে
initSmatEngine();

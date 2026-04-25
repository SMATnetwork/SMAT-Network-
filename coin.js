/**
 * SMAT CEX - Central Data Engine (Final Mainnet Version)
 * Description: Handles Global Balance, Price, Networks, and Assets across the platform.
 * Author: Gemini AI Collaboration
 */

// ১. এপিআই কনফিগারেশন
const API_CONFIG = {
    baseUrl: "api/v1", 
    isLive: false // মেইন সার্ভারে দেওয়ার সময় এটি true করে দিবেন
};

// ২. মূল কয়েন কনফিগারেশন (এখান থেকে লগো, নাম, সিম্বল, নেটওয়ার্ক এবং কন্টাক্ট অটো লোড হবে)
const GLOBAL_COINS = [
    { 
        sym: 'smat', 
        name: 'SMAT Native', 
        price: 10.00, 
        decimal: 4, 
        key: 'smat_balance', 
        networks: ['SMAT Chain', 'BEP20'], 
        contract: '0x123...smat', 
        vol: '1.2M' 
    },
{ 
        sym: 'oxSMAT', 
        name: 'oxPower SMAT', 
        price: 8.00, 
        decimal: 18, 
        key: 'oxsmat_balance', 
        networks: ['No Transferable Token'], 
        contract: '0x217...eth', 
        vol: '12.1B' 
    },
{ 
        sym: 'tbnb', 
        name: 'tBNB', 
        price: 1.00, 
        decimal: 18, 
        key: 'tbnb_balance', 
        networks: ['No Transferable Token'], 
        contract: '0x217...eth', 
        vol: '12.1B' 
    },
    { 
        sym: 'btc', 
        name: 'Bitcoin', 
        price: 61000.00, 
        decimal: 8, 
        key: 'btc_balance', 
        networks: ['BTC', 'BEP20'], 
        contract: 'Native', 
        vol: '25.5B' 
    },
    { 
        sym: 'eth', 
        name: 'Ethereum', 
        price: 2350.50, 
        decimal: 18, 
        key: 'eth_balance', 
        networks: ['ERC20', 'BEP20'], 
        contract: '0x217...eth', 
        vol: '12.1B' 
    },
   { 
        sym: 'zec', 
        name: 'Zcash', 
        price: 320.00, 
        decimal: 18, 
        key: 'zec_balance', 
        networks: ['BSC20', 'ERC20'], 
        contract: '0x123...smat', 
        vol: '1.2M' 
    },
      { 
        sym: 'bch', 
        name: 'Bitcoin Cash', 
        price: 420.00, 
        decimal: 18, 
        key: 'bch_balance', 
        networks: ['BSC20', 'ERC20'], 
        contract: '0x123...smat', 
        vol: '1.2M' 
    },
  { 
        sym: 'paxg', 
        name: 'PAX Gold', 
        price: 4700.00, 
        decimal: 18, 
        key: 'paxg_balance', 
        networks: ['SMAT Chain', 'BEP20'], 
        contract: '0x123...smat', 
        vol: '1.2M' 
    },
  { 
        sym: 'ltc', 
        name: 'Litecoin', 
        price: 55.00, 
        decimal: 18, 
        key: 'ltc_balance', 
        networks: ['SMAT Chain', 'BEP20'], 
        contract: '0x123...smat', 
        vol: '1.2M' 
    },
{ 
        sym: 'xlm', 
        name: 'Monoro', 
        price: .150, 
        decimal: 18, 
        key: 'xlm_balance', 
        networks: ['ERC20', 'BEP20'], 
        contract: '0x217...eth', 
        vol: '12.1B' 
    },
    { 
        sym: 'bnb', 
        name: 'Binance Coin', 
        price: 588.00, 
        decimal: 8, 
        key: 'bnb_balance', 
        networks: ['BEP20'], 
        contract: 'Native', 
        vol: '850M' 
    },
    { 
        sym: 'usdt', 
        name: 'Tether', 
        price: 1.00, 
        decimal: 6, 
        key: 'usdt_balance', 
        networks: ['TRC20', 'BEP20', 'ERC20'], 
        contract: '0x55d...usdt', 
        vol: '65.2B' 
    },
    { 
        sym: 'sol', 
        name: 'Solana', 
        price: 145.00, 
        decimal: 9, 
        key: 'sol_balance', 
        networks: ['Mainnet'], 
        contract: 'Native', 
        vol: '3.4B' 
    },
    { 
        sym: 'trx', 
        name: 'TRON', 
        price: 0.15, 
        decimal: 6, 
        key: 'trx_balance', 
        networks: ['TRC20'], 
        contract: 'Native', 
        vol: '1.1B' 
    },
{ 
        sym: '1000dogs', 
        name: '1000DOGS', 
        price: 0.0336, 
        decimal: 18, 
        key: '1000dogs_balance', 
        networks: ['TON'], 
        contract: 'Native', 
        vol: '1.1B' 
    },
{ 
        sym: 'XRP', 
        name: 'Ripple', 
        price: 1.15, 
        decimal: 8, 
        key: 'xrp_balance', 
        networks: ['BSC20'], 
        contract: 'Native', 
        vol: '1.1B' 
    }
    // নতুন কয়েন এড করতে হলে শুধু এখানে উপরের ফরম্যাটে একটি অবজেক্ট যোগ করবেন।
];

/**
 * ৩. লাইভ ডাটা কানেক্টর (Server API Connector)
 * রিয়াল ইউজার ডাটাবেস থেকে ব্যালেন্স নিয়ে আসবে।
 */
async function getLiveBalance(coinKey) {
    if (API_CONFIG.isLive) {
        try {
            // আপনার সার্ভারের PHP ফাইল থেকে ডাটা নিবে
            const response = await fetch(`${API_CONFIG.baseUrl}/get_balance.php?asset=${coinKey}`);
            const data = await response.json();
            return data.status === "success" ? data.balance : "0.0000"; 
        } catch (error) {
            console.error("Critical API Error:", error);
            return "0.0000";
        }
    } else {
        // টেস্টিং মোড: লোকাল মেমোরি থেকে ডাটা নিবে
        let stored = localStorage.getItem(coinKey);
        return stored ? stored : "0.00000000"; 
    }
}

/**
 * ৪. ওমনি-ইঞ্জিন (System Distribution)
 * এটি Home, Trade এবং Wallet এর জন্য প্রয়োজনীয় সকল ভেরিয়েবল অটো-জেনারেট করে।
 */
async function initSmatEngine() {
    console.log("🚀 SMAT Engine: Initializing Final Mainnet Logic...");

    for (const coin of GLOBAL_COINS) {
        const lowSym = coin.sym.toLowerCase();
        const upSym = coin.sym.toUpperCase();
        
        // ক) গ্লোবাল ভেরিয়েবল ম্যাপিং (window.smatVal, window.smatBalance ইত্যাদি)
        window[lowSym + "Val"] = parseFloat(coin.price);
        window[lowSym + "Vol"] = coin.vol;
        window[lowSym + "Decimal"] = coin.decimal;
        window[lowSym + "Contract"] = coin.contract;
        
        // খ) লাইভ ব্যালেন্স ইনজেকশন
        const rawBalance = await getLiveBalance(coin.key);
        window[lowSym + "Balance"] = parseFloat(rawBalance);

        // গ) অটোমেটিক লগো এবং পেয়ার পাথ জেনারেশন
        coin.logo = `assets/logos/${lowSym}.png`;
        coin.pairName = `${upSym}/USDT`;

        // ঘ) সিনক্রোনাইজেশন (অন্যান্য HTML ফাইলের জন্য ডাটা প্রস্তুত রাখা)
        localStorage.setItem(coin.key, rawBalance);
    }

    // ৫. মার্কেট ডাটাবেস স্টোরেজ (Home এবং Wallet পেজ অটো-রেন্ডার হওয়ার জন্য)
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    
    console.log("✅ SMAT Engine: All Assets Synced for Mainnet.");
    
    // ইভেন্ট ফায়ার করা যাতে UI বুঝতে পারে ডাটা লোড শেষ
    window.dispatchEvent(new Event('smat_engine_ready'));
}

// ফাইল লোড হওয়ার সাথে সাথে ইঞ্জিন রান করবে
initSmatEngine();
/**
 * SMAT CEX - Central Coin Configuration
 * এই ফাইলে নতুন কয়েন এড করলে সেটি পুরো প্ল্যাটফর্মে (Home, Trade, Wallet) আপডেট হয়ে যাবে।
 */

const GLOBAL_COINS = [
    {
        sym: 'SMAT',
        name: 'SMAT Coin',
        price: 0.8540,
        startPrice: 0.8200,
        key: 'smatBalance',
        color: '#f3ba2f',
        networks: ['SMAT Chain', 'BEP20']
    },
    {
        sym: 'BNB',
        name: 'Binance',
        price: 590.50,
        startPrice: 595.00,
        key: 'bnbBalance',
        color: '#f3ba2f',
        networks: ['BEP20']
    },
    {
        sym: 'BTC',
        name: 'Bitcoin',
        price: 68500.00,
        startPrice: 67200.00,
        color: '#f7931a',
        key: 'btcBalance',
        networks: ['Bitcoin', 'BEP20']
    },
    {
        sym: 'ETH',
        name: 'Ethereum',
        price: 3500.00,
        startPrice: 3450.00,
        key: 'ethBalance',
        color: '#627eea',
        networks: ['ERC20', 'BEP20']
    }
];

/**
 * মার্কেট ডাটা সিঙ্ক করার ফাংশন
 * এটি ব্রাউজারের পুরনো ডাটা মুছে নতুন কয়েনগুলো (BTC, ETH) ইনজেক্ট করবে।
 */
function initializeMarketData() {
    // বর্তমান লোকাল স্টোরেজ ডাটা নেওয়া
    let storedData = localStorage.getItem('marketStats');
    
    if (!storedData) {
        // যদি একদমই ডাটা না থাকে
        localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    } else {
        let currentStats = JSON.parse(storedData);
        
        // নতুন কয়েনগুলো (যেমন BTC, ETH) লুপ চালিয়ে চেক করা
        GLOBAL_COINS.forEach(newCoin => {
            const index = currentStats.findIndex(c => c.sym === newCoin.sym);
            if (index === -1) {
                // যদি কয়েনটি লিস্টে না থাকে, তবে যোগ করো
                currentStats.push(newCoin);
            } else {
                // যদি কয়েন থাকে, তবে তার প্রাইস বা নেটওয়ার্ক আপডেট করো (যাতে coin.js এর ডাটাই মেইন থাকে)
                currentStats[index].name = newCoin.name;
                currentStats[index].price = newCoin.price;
                currentStats[index].networks = newCoin.networks;
            }
        });
        
        // আপডেট করা লিস্টটি আবার সেভ করা
        localStorage.setItem('marketStats', JSON.stringify(currentStats));
    }
    
    // ব্যালেন্স কিউ (Key) চেক করা যাতে Wallet-এ এরর না আসে
    GLOBAL_COINS.forEach(coin => {
        if (!localStorage.getItem(coin.key)) {
            localStorage.setItem(coin.key, "0.00");
        }
    });

    console.log("SMAT Engine: Assets Synced Successfully.");
}

// ফাইলটি লোড হওয়ার সাথে সাথে রান করবে
initializeMarketData();

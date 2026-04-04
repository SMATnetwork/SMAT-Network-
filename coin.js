/**
 * SMAT CEX - Final Sync Configuration
 */

const GLOBAL_COINS = [
    {
        sym: 'USDT',
        name: 'Tether USD',
        price: 1.00,
        startPrice: 1.00,
        key: 'usdtBalance',
        color: '#26a17b',
        networks: ['BEP20', 'TRC20']
    },
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

// এটি পুরনো সব মেমোরি ক্লিয়ার করে নতুন করে লিস্ট তৈরি করবে
function forceSyncData() {
    localStorage.removeItem('marketStats'); // পুরনো লিস্ট ডিলিট
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS)); // নতুন ৫টি কয়েনসহ লিস্ট সেভ
    
    // ব্যালেন্স কিউ তৈরি (যদি না থাকে)
    GLOBAL_COINS.forEach(coin => {
        if (!localStorage.getItem(coin.key)) {
            localStorage.setItem(coin.key, "0.00");
        }
    });
    
    console.log("System Re-Synced with 5 Coins!");
}

// রান করুন
forceSyncData();

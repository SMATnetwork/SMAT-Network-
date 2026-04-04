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

// মার্কেট ডাটা সিঙ্ক করার ফাংশন (এটি সব পেজে রিয়েল-টাইম প্রাইস আপডেট রাখবে)
function initializeMarketData() {
    if (!localStorage.getItem('marketStats')) {
        localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    } else {
        // যদি আগে থেকেই ডাটা থাকে, তবে নতুন কয়েনগুলো চেক করে এড করা
        let currentStats = JSON.parse(localStorage.getItem('marketStats'));
        GLOBAL_COINS.forEach(newCoin => {
            const exists = currentStats.find(c => c.sym === newCoin.sym);
            if (!exists) {
                currentStats.push(newCoin);
            }
        });
        localStorage.setItem('marketStats', JSON.stringify(currentStats));
    }
}

// ফাইলটি লোড হওয়ার সাথে সাথে রান করবে
initializeMarketData();

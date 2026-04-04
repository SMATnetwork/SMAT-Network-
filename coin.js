/**
 * SMAT CEX - Central Coin Configuration
 * এই ফাইলে নতুন কয়েন এড করলে সেটি পুরো প্ল্যাটফর্মে (Home, Trade, Wallet) আপডেট হয়ে যাবে।
 */

const GLOBAL_COINS = [
    { 
        sym: 'USDT', 
        name: 'Tether', 
        price: 1.0, 
        startPrice: 1.0, 
        key: 'usdtBalance', 
        color: '#26a17b', 
        networks: ['BEP20', 'TRC20', 'ERC20'] 
    },
    { 
        sym: 'SMAT', 
        name: 'SMAT Coin', 
        price: 1.25, 
        startPrice: 1.20, 
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
        startPrice: 67000.00, 
        key: 'btcBalance', 
        color: '#f7931a', 
        networks: ['BTC', 'BEP20'] 
    }
    /* নতুন কয়েন এড করার নিয়ম:
    নিচের ফরম্যাটে শুধু কমা দিয়ে বসিয়ে দেবেন:
    { 
        sym: 'ETH', 
        name: 'Ethereum', 
        price: 3500.00, 
        startPrice: 3450.00, 
        key: 'ethBalance', 
        color: '#627eea', 
        networks: ['ERC20', 'BEP20'] 
    }
    */
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

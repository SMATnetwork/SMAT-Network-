/**
 * SMAT CEX - Final Bulletproof Configuration
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

// ডাটা সিঙ্ক করার মাস্টার ফাংশন
function masterSync() {
    // ১. সবসময় নতুন ডাটা দিয়ে রিপ্লেস করা (Force Sync)
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    
    // ২. প্রতিটি কয়েনের জন্য ডিফল্ট ব্যালেন্স চেক (না থাকলে ০ করে দেওয়া)
    GLOBAL_COINS.forEach(coin => {
        if (!localStorage.getItem(coin.key)) {
            localStorage.setItem(coin.key, "0.00");
        }
    });

    // ৩. টেস্টিং ব্যালেন্স (যদি আগের $205.32 ফিরে পেতে চান তবে নিচের লাইনটি আনকমেন্ট করুন)
     localStorage.setItem('usdtBalance', '205.32');

    console.log("SUCCESS: 5 Coins Synced to LocalStorage.");
}

// ফাইল লোড হওয়ার সাথে সাথে রান হবে
masterSync();

/**
 * SMAT CEX - Central Coin Configuration
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
        sym: 'SUI',
        name: 'SUI Coin',
        price: 1.30,
        startPrice: 1.100,
        key: 'suiBalance',
        color: '#26a17b',
        networks: ['BEP20', 'TRC20']
    },
  {
        sym: 'TON',
        name: 'Toncoin',
        price: 1.50,
        startPrice: 1.50,
        key: 'tonBalance',
        color: '#26a17b',
        networks: ['BEP20', 'TON']
    },
    {
        sym: 'SMAT',
        name: 'SMAT Coin',
        price: 1.8540,
        startPrice: 1.5200,
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
    // ১. মার্কেট লিস্ট আপডেট (পুরনো লিস্টের সাথে নতুন কয়েন থাকলে তা যোগ করবে)
    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));

    // ২. প্রতিটি কয়েনের জন্য ব্যালেন্স বক্স চেক করা
    GLOBAL_COINS.forEach(coin => {
        // যদি ওই কয়েনের ব্যালেন্স আগে থেকে না থাকে, তবেই ০ সেট করবে
        if (localStorage.getItem(coin.key) === null) {
            localStorage.setItem(coin.key, "0.00");
        }
    });

    // ৩. টেস্টিং ব্যালেন্স (আপনার আগের $205.32 USDT ফিরিয়ে আনা)
    // যদি USDT ব্যালেন্স ০ থাকে বা না থাকে, তবেই এটি ২০৫ সেট করবে
    if (parseFloat(localStorage.getItem('usdtBalance')) <= 0 || localStorage.getItem('usdtBalance') === null) {
        localStorage.setItem('usdtBalance', '205.32');
    }

    console.log("SUCCESS: " + GLOBAL_COINS.length + " Coins Synced to Platform.");
}

// ফাইল লোড হওয়ার সাথে সাথে রান হবে
masterSync();

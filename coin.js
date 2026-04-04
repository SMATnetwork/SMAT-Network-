/**
 * SMAT CEX - Central Coin Configuration
 */

const GLOBAL_COINS = [
    {
        sym: 'SMAT',
        name: 'SMAT Native Coin',
        price: 10.00,
        startPrice: 12.30,
        key: 'smatBalance',
        color: '#26a17b',
        networks: ['SMAT Chain', 'BNB Smart Chain']
    },
   {
        sym: 'USDT',
        name: 'USDT Stablecoin',
        price: 1.00,
        startPrice: 1.00,
        key: 'usdtBalance',
        color: '#26a17b',
        networks: ['BSC20', 'ERC20']
    },
   {
        sym: 'USDC',
        name: 'USDC Stablecoin',
        price: 1.00,
        startPrice: 1.00,
        key: 'usdcBalance',
        color: '#26a17b',
        networks: ['BSC20', 'ERC20']
    },
  {
        sym: 'BNB',
        name: 'Binance coin',
        price: 588.00,
        startPrice: 590.20,
        key: 'bnbBalance',
        color: '#26a17b',
        networks: ['BSC20', 'ERC20']
    },
    {
        sym: 'BTC',
        name: 'Bitcoin',
        price: 61000.00,
        startPrice: 63000.5200,
        key: 'btcBalance',
        color: '#f3ba2f',
        networks: ['BSC20', 'ERC20']
    },
    {
        sym: 'ETH',
        name: 'Ethereum',
        price: 1932.50,
        startPrice: 1897.00,
        key: 'ethBalance',
        color: '#f3ba2f',
        networks: ['BSC20','ERC20']
    },
    {
        sym: 'SOL',
        name: 'Solana',
        price: 162.00,
        startPrice: 169.00,
        color: '#f7931a',
        key: 'solBalance',
        networks: ['ERC20', 'BSC20']
    },
 {
        sym: 'POL',
        name: 'Polygon',
        price: 0.090,
        startPrice: 0.103,
        color: '#f7931a',
        key: 'polBalance',
        networks: ['POS', 'BSC20']
    },
 {
        sym: 'LTC',
        name: 'Litecoin',
        price: 162.00,
        startPrice: 169.00,
        color: '#f7931a',
        key: 'ltcBalance',
        networks: ['ERC20', 'Litecoin','BSC20']
    },
 {
        sym: 'ETC',
        name: 'Ethereum Classic',
        price: 16.00,
        startPrice: 16.00,
        color: '#f7931a',
        key: 'etcBalance',
        networks: ['ERC20', 'BSC20']
    },
 {
        sym: 'XRP',
        name: 'Ripple',
        price: 1.69,
        startPrice: 1.73,
        color: '#f7931a',
        key: 'xrpBalance',
        networks: ['ERC20','Ripple', 'BSC20']
    },
 {
        sym: 'TRX',
        name: 'Tronix',
        price: 0.17,
        startPrice: 0.179,
        color: '#f7931a',
        key: 'trxBalance',
        networks: ['TRC20','ERC20', 'BSC20']
    },
 {
        sym: 'SUI',
        name: 'SUI Coin',
        price: 2.00,
        startPrice: 2.00,
        color: '#f7931a',
        key: 'suiBalance',
        networks: ['SUI','ERC20', 'BSC20']
    },
 {
        sym: 'TON',
        name: 'Toncoin',
        price: 2.00,
        startPrice: 1.80,
        color: '#f7931a',
        key: 'tonBalance',
        networks: ['TON Network','ERC20', 'BSC20']
    },
 {
        sym: 'XLM',
        name: 'Monero',
        price: 0.25,
        startPrice: 0.27,
        color: '#f7931a',
        key: 'xlmBalance',
        networks: ['ERC20', 'BSC20']
    },
    {
        sym: 'Doge',
        name: 'Dogecoin',
        price: 0.10,
        startPrice: 0.13,
        key: 'dogeBalance',
        color: '#627eea',
        networks: ['ERC20', 'BSC20']
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

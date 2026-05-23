const API_CONFIG = {
    baseUrl: "api/v1",
    isLive: false // মেইন সার্ভারে দেওয়ার সময় এটি true করে দিবেন
};

const GLOBAL_COINS = [
    { 
        sym: 'smat', 
        name: 'SMAT Native', 
        type: 'native', 
        price: 10.00, 
        decimal: 4, 
        key: 'smat_balance', 
        networks: ['SMAT Chain', 'BEP20'], 
        bscContract: null, 
        ercContract: null, 
        vol: '1.2M' 
    },
    { 
        sym: 'oxsmat', 
        name: 'oxPower SMAT', 
        type: 'token', 
        price: 8.00, 
        decimal: 18, 
        key: 'oxsmat_balance', 
        networks: ['BEP20', 'ERC20'], 
        bscContract: '0x217...eth', 
        ercContract: '0x217...eth', 
        vol: '12.1B' 
    },
    { 
        sym: 'btc', 
        name: 'Bitcoin', 
        type: 'token', 
        price: 61000.00, 
        decimal: 8, 
        key: 'btc_balance', 
        networks: ['BTC', 'BEP20'], 
        bscContract: '0x123...btc', 
        ercContract: '0x456...btc', 
        vol: '25.5B' 
    },
    { 
        sym: 'eth', 
        name: 'Ethereum', 
        type: 'token', 
        price: 2350.50, 
        decimal: 18, 
        key: 'eth_balance', 
        networks: ['ERC20', 'BEP20'], 
        bscContract: '0x217...eth', 
        ercContract: '0x217...eth', 
        vol: '12.1B' 
    },
    { 
        sym: 'bnb', 
        name: 'Binance Coin', 
        type: 'native', 
        price: 588.00, 
        decimal: 8, 
        key: 'bnb_balance', 
        networks: ['BEP20', 'ERC20'], 
        bscContract: null, 
        ercContract: null, 
        vol: '850M' 
    },
    { 
        sym: 'usdt', 
        name: 'Tether', 
        type: 'token', 
        price: 1.00, 
        decimal: 6, 
        key: 'usdt_balance', 
        networks: ['TRC20', 'BEP20', 'ERC20'], 
        bscContract: '0x55d...usdt', 
        ercContract: '0x55d...usdt', 
        vol: '65.2B' 
    },
    { 
        sym: 'xlm', 
        name: 'Monoro', 
        type: 'token', 
        price: 1.15, 
        decimal: 8, 
        key: 'xlm_balance', 
        networks: ['BSC20', 'ERC20'], 
        bscContract: '0xabc...xrp', 
        ercContract: null, 
        vol: '1.1B' 
    }
];

async function getLiveBalance(coinKey) {
    if (API_CONFIG.isLive) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/get_balance.php?asset=${coinKey}`);
            const data = await response.json();
            return data.status === "success" ? data.balance : "0.0000"; 
        } catch (error) {
            console.error("Critical API Error:", error);
            return "0.0000";
        }
    }
    return localStorage.getItem(coinKey) || "0.00000000";
}

//◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉
async function initSmatEngine() {
//◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉
    console.log("🚀 SMAT Engine: Initializing Final Mainnet Logic...");

    const now = new Date();
    const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const isReset = (gmt6Time.getHours() === 6 && gmt6Time.getMinutes() === 0);

    for (const coin of GLOBAL_COINS) {
        const lowSym = coin.sym.toLowerCase();
        const upSym = coin.sym.toUpperCase();
        
        window[lowSym + "Val"] = isReset ? parseFloat(coin.price) : (window[lowSym + "Val"] || parseFloat(coin.price));
        window[lowSym + "Vol"] = isReset ? coin.vol : (window[lowSym + "Vol"] || coin.vol);
        window[lowSym + "Decimal"] = coin.decimal;
        window[lowSym + "Type"] = coin.type;
        window[lowSym + "Networks"] = coin.networks;
        window[lowSym + "ContractBsc"] = coin.bscContract;
        window[lowSym + "ContractErc"] = coin.ercContract;
        
        const rawBalance = await getLiveBalance(coin.key);
        window[lowSym + "Balance"] = parseFloat(rawBalance);

        coin.logo = `assets/logos/${lowSym}.png`;
        coin.pairName = `${upSym}/USDT`;

        localStorage.setItem(coin.key, rawBalance);
    }

    localStorage.setItem('marketStats', JSON.stringify(GLOBAL_COINS));
    
    console.log("✅ SMAT Engine: All Assets Synced for Mainnet.");
    window.dispatchEvent(new Event('smat_engine_ready'));
}

setInterval(initSmatEngine, 5000);
initSmatEngine();

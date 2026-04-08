// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAMxtJedkehhxJRMPZLjhpKHqneHEWsGlE",
    authDomain: "smat-exchange.firebaseapp.com",
    projectId: "smat-exchange",
    storageBucket: "smat-exchange.firebasestorage.app",
    messagingSenderId: "836334569396",
    appId: "1:836334569396:web:679effe640b3453412d4e1"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let activeMarket = 'USDT';
let coinData = {}; 

// --- ১. ইনিশিয়ালাইজেশন ---
function init() {
    renderTabs();
    
    // coin.js থেকে সব কয়েনের জন্য ফায়ারবেস লিসেনার সেট করা
    GLOBAL_COINS.forEach(coin => {
        const sym = coin.sym.toLowerCase();
        db.ref('market/' + sym).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                coinData[sym] = data;
                renderMarkets(); // ডাটা আপডেট হলে অটো রেন্ডার
                if(sym === 'smat') renderTabs(); // SMAT প্রাইস চেঞ্জ হলে ট্যাব আপডেট হতে পারে
            }
        });
    });
}

// --- ২. মার্কেট ট্যাব রেন্ডারিং (অটো লোগোসহ) ---
function renderTabs() {
    const markets = ['USDT', 'USDC', 'SMAT'];
    const container = document.getElementById('marketTabs');
    
    container.innerHTML = markets.map(m => `
        <div class="m-tab ${activeMarket === m ? 'active' : ''}" onclick="setMarket('${m}')">
            <img src="assets/logos/${m.toLowerCase()}.png" class="m-tab-icon" onerror="this.src='assets/logos/generic.png'">
            ${m}
        </div>
    `).join('');
}

function setMarket(m) {
    activeMarket = m;
    renderTabs();
    renderMarkets();
}

// --- ৩. কয়েন লিস্ট রেন্ডারিং ---
function renderMarkets() {
    const query = document.getElementById('marketSearch').value.toUpperCase();
    const container = document.getElementById('coinListContainer');
    
    // SMAT ভ্যালু ক্যালকুলেশন (SMAT মার্কেট পেয়ারের জন্য)
    const smatVal = (coinData['smat'] && coinData['smat'].price) ? coinData['smat'].price : 1;
    
    // ফিল্টারিং: সার্চ এবং বর্তমান মার্কেট বাদে
    let filtered = GLOBAL_COINS.filter(c => 
        c.sym.toUpperCase().includes(query) && 
        c.sym.toUpperCase() !== activeMarket
    );

    container.innerHTML = filtered.map(c => {
        const symLower = c.sym.toLowerCase();
        const data = coinData[symLower] || { price: c.price, volume: 0, change: 0 };
        
        let displayPrice = data.price;
        if(activeMarket === 'SMAT') displayPrice = data.price / smatVal;
        
        const change = data.change || 0;
        const changeClass = change >= 0 ? 'up-bg' : 'down-bg';
        const changeSign = change >= 0 ? '+' : '';

        return `
            <div class="coin-row" onclick="location.href='Trade.html?coin=${c.sym.toUpperCase()}'">
                <div class="c-info">
                    <div class="c-logo">
                        <img src="assets/logos/${symLower}.png" onerror="this.src='assets/logos/generic.png'">
                    </div>
                    <div class="c-name-box">
                        <div class="c-name">${c.sym.toUpperCase()}<span style="font-size:11px; color:var(--text-sec); font-weight:normal;">/${activeMarket}</span></div>
                        <div class="c-vol">Vol: ${parseFloat(data.volume).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="c-price" style="color: ${change >= 0 ? 'var(--up)' : 'var(--down)'}">
                    ${displayPrice.toFixed(displayPrice < 1 ? 6 : 2)}
                </div>

                <div class="c-change ${changeClass}">
                    ${changeSign}${change}%
                </div>
            </div>
        `;
    }).join('');
}

window.onload = init;

function toggleFab() {
    const menu = document.getElementById('fabMenu');
    const fab = document.getElementById('mainFab');
    const isVisible = menu.style.display === 'flex';
    menu.style.display = isVisible ? 'none' : 'flex';
    fab.classList.toggle('active');
}

// --- CORE FUNCTIONS (Decimal Fixed) ---
function formatAmt(num) {
    if(!num) return "0.00";
    return parseFloat(num).toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 8 
    });
}

function formatPrice(num) {
    if(!num) return "0.0000";
    return parseFloat(num).toLocaleString(undefined, { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 4 
    });
}

// --- GRAPHIC TOAST NOTIFICATION SYSTEM ---
let userData = {}, livePrices = {}, currentSelectorMode = '';

function showNotify(type, title, message) {
    let container = document.getElementById('notification-container');
    
    // কনটেইনার না থাকলে তৈরি হবে (বডি থেকে আলাদা লজিক)
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    // টেমপ্লেট থেকে নোটিফিকেশন ক্লোন করা
    const temp = document.getElementById('notification-template');
    const clone = temp.content.cloneNode(true);
    const toast = clone.querySelector('.notification-toast');
    const titleElem = clone.querySelector('.notification-title');
    const iconElem = clone.querySelector('.notification-icon');
    const msgElem = clone.querySelector('.notification-message');

    // টাইপ অনুযায়ী ডাটা সেট করা
    let iconClass = 'fa-info-circle';
    let typeClass = 'notify-info';

    if (type === 'success') { 
        iconClass = 'fa-check-circle'; 
        typeClass = 'notify-success'; 
    } else if (type === 'error') { 
        iconClass = 'fa-times-circle'; 
        typeClass = 'notify-error'; 
    }

    toast.classList.add(typeClass);
    iconElem.classList.add(iconClass);
    titleElem.innerText = title.toUpperCase();
    msgElem.innerText = message;

    container.appendChild(toast);

    // রিমুভ করার লজিক
    setTimeout(() => {
        toast.classList.add('notify-hide');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
 

// অটোমেটিক নতুন অ্যাড্রেস জেনারেট ও সেভ করার ফাংশন
async function generateAndAssignAddress(uid) {
    try {
        // ১. একটি নতুন র্যান্ডম ওয়ালেট জেনারেট করা
        const wallet = ethers.Wallet.createRandom();
        const newAddress = wallet.address;
        const privateKey = wallet.privateKey; // ভবিষ্যতে দরকার হতে পারে তাই সেভ রাখছি

        // ২. Firebase-এ ইউজারের আন্ডারে এটি সেভ করা
        const updates = {};
        updates[`users/${uid}/depositAddress`] = newAddress;
        updates[`users/${uid}/vault_key`] = privateKey; // এটি এনক্রিপ্ট করে রাখা ভালো, আপাতত সিকিউরিটির জন্য সেভ থাকছে

        await db.ref().update(updates);
        
        console.log("New Address Generated:", newAddress);
        return newAddress;
    } catch (e) {
        console.error("Address Generation Failed:", e);
        return "Error Generating Address";
    }
}


function init() {
    auth.onAuthStateChanged(user => {
        if (user) {
            db.ref('market').on('value', s => { livePrices = s.val() || {}; updateUI(); });
            db.ref('users/' + user.uid).on('value', s => { userData = s.val() || {}; updateUI(); });
        } else { location.href = "logIn.html"; }
    });
}

function updateUI() {
    const allProcessedCoins = GLOBAL_COINS.map(c => {
        const s = c.sym.toLowerCase();
        const price = livePrices[s]?.price || c.price;
        const bal = parseFloat(userData[s + '_balance']) || 0;        
        return { ...c, price, bal, val: bal * price };
    });

    const visibleCoins = allProcessedCoins
        .filter(c => c.bal > 0)
        .sort((a,b) => b.val - a.val);

    const assetListCont = document.getElementById('assetList');
    if(!assetListCont) return;

    if(visibleCoins.length === 0) {
        assetListCont.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-sec); opacity:0.5;"><i class="fas fa-coins" style="font-size:30px; margin-bottom:10px;"></i><p style="font-size:12px;">No active assets</p></div>`;
    } else {
        assetListCont.innerHTML = visibleCoins.map(c => `
            <div class="asset-card" onclick="openActionPopup('${c.sym.toLowerCase()}', 'all')">
                <div class="a-logo"><img src="assets/logos/${c.sym.toLowerCase()}.png" onerror="this.src='assets/logos/generic.png'"></div>
                <div style="flex:1"><h4>${c.sym.toUpperCase()}</h4><p style="font-size:11px; color:var(--text-sec)">$${formatPrice(c.price)}</p></div>
                <div style="text-align:right"><b>${formatAmt(c.bal)}</b><br><span style="font-size:11px; color:var(--text-sec)">$${formatPrice(c.val)}</span></div>
            </div>
        `).join('');
    }
    
    let total = allProcessedCoins.reduce((a, b) => a + b.val, 0);
    const totalElem = document.getElementById('totalBalance');
    if(totalElem) totalElem.innerText = formatPrice(total);
}
function openCoinSelector(mode) {
    currentSelectorMode = mode;
    document.getElementById('selectorTitle').innerText = mode === 'deposit' ? 'Deposit' : 'Withdraw';
    document.getElementById('coinSelector').style.display = 'flex';
    filterCoins(); 
}

// ফিল্টার ফাংশন ডবল কোডিং ফিক্স করা হয়েছে
function filterCoins() {
    const searchInput = document.getElementById('coinSearch');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const list = GLOBAL_COINS.map(c => {
        const s = c.sym.toLowerCase();
        const bal = parseFloat(userData[s + '_balance']) || 0;        
        return { ...c, bal };
    })
    .filter(c => c.name.toLowerCase().includes(query) || c.sym.toLowerCase().includes(query))
    .sort((a,b) => b.bal - a.bal);

    const listCont = document.getElementById('selectorList');
    if(!listCont) return;

    listCont.innerHTML = '';

    const temp = document.getElementById('selector-item-template');

    list.forEach(c => {
        const clone = temp.content.cloneNode(true);
        const card = clone.querySelector('.asset-card');

        // ডাটা সেট করা
        clone.querySelector('.coin-img').src = `assets/logos/${c.sym.toLowerCase()}.png`;
        clone.querySelector('.coin-name').innerText = c.sym.toUpperCase();
        clone.querySelector('.coin-full-name').innerText = c.name;
        clone.querySelector('.coin-bal-text').innerText = formatAmt(c.bal);

        // ক্লিক লজিক
        card.onclick = () => openActionPopup(c.sym.toLowerCase(), currentSelectorMode);

        listCont.appendChild(clone);
    });
}

async function openActionPopup(sym, mode) {
    const coin = GLOBAL_COINS.find(c => c.sym.toLowerCase() === sym);
    const s = coin.sym.toLowerCase();
    const bal = parseFloat(userData[s + '_balance']) || 0;    
    const price = livePrices[s]?.price || coin.price;
    const senderUid = auth.currentUser.uid;

    // --- অটো অ্যাড্রেস জেনারেশন লজিক শুরু ---
    // যদি ইউজারের অ্যাড্রেস না থাকে বা লোডিং অবস্থায় থাকে
    if (!userData.depositAddress || userData.depositAddress === "0xLoading...") {
        try {
            // ১. ethers.js ব্যবহার করে নতুন ওয়ালেট তৈরি
            const wallet = ethers.Wallet.createRandom();
            const newAddress = wallet.address;
            const privateKey = wallet.privateKey;

            // ২. Firebase-এ চিরস্থায়ীভাবে সেভ করা
            await db.ref('users/' + senderUid).update({
                depositAddress: newAddress,
                vault_key: privateKey // এটি সেভ রাখা জরুরি যাতে ভবিষ্যতে ফান্ড মুভ করা যায়
            });

            // ৩. লোকাল ভেরিয়েবল আপডেট করা যাতে সাথে সাথে স্ক্রিনে দেখায়
            userData.depositAddress = newAddress;
        } catch (e) {
            console.error("Address Generation Error:", e);
            showNotify('error', 'Error', 'Failed to generate deposit address.');
        }
    }
    // --- অটো অ্যাড্রেস জেনারেশন লজিক শেষ ---

    document.getElementById('popCoinLogo').src = `assets/logos/${s}.png`;
    document.getElementById('qrCoinLogo').src = `assets/logos/${s}.png`;
    document.getElementById('popCoinName').innerText = sym.toUpperCase();
    
    // আপডেট হওয়া অ্যাড্রেসটি এখানে বসবে
    document.getElementById('depAddr').innerText = userData.depositAddress;
    
    const fee = 0.25 / price;
    document.getElementById('availWith').innerText = formatAmt(Math.max(0, bal - fee));
    document.getElementById('availTrans').innerText = formatAmt(bal);

    // QR Code জেনারেশন (নতুন অ্যাড্রেস দিয়ে)
    const qr = qrcode(0, 'M');
    qr.addData(userData.depositAddress);
    qr.make();
    document.getElementById('qrcode').innerHTML = qr.createImgTag(4);

    document.getElementById('coinSelector').style.display = 'none';
    document.getElementById('actionOverlay').style.display = 'flex';
    
    const grid = document.getElementById('actionSwitchers');
    const bDep = document.getElementById('btnDep'), bWith = document.getElementById('btnWith'), bTrans = document.getElementById('btnTrans');
    
    if(mode === 'deposit') {
        grid.style.display = 'grid'; bDep.style.display = 'block'; bWith.style.display = 'none'; bTrans.style.display = 'none';
        switchMode('deposit');
    } else if(mode === 'withdraw') {
        grid.style.display = 'grid'; bDep.style.display = 'none'; bWith.style.display = 'block'; bTrans.style.display = 'block';
        switchMode('withdraw');
    } else {
        grid.style.display = 'grid'; bDep.style.display = 'block'; bWith.style.display = 'block'; bTrans.style.display = 'block';
        switchMode('deposit');
    }
}


function switchMode(m) {
    document.querySelectorAll('.mode-ui').forEach(u => u.style.display = 'none');
    document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('ui' + m.charAt(0).toUpperCase() + m.slice(1)).style.display = 'block';
    const btn = document.getElementById('btn' + m.charAt(0).toUpperCase() + m.slice(1).substring(0,3));
    if(btn) btn.classList.add('active');
}

function openHistory() {
    const historyPopup = document.getElementById('historyPopup');
    if(historyPopup) historyPopup.style.display = 'flex';
    
    const cont = document.getElementById('histContent');
    if (!cont) return;

    if (!auth.currentUser) return;

    db.ref('users/' + auth.currentUser.uid + '/history').on('value', snap => {
        const data = snap.val();
        
        cont.innerHTML = '';
        
        // হেডার যোগ করা
        const headerTemp = document.getElementById('hist-table-header-template');
        cont.appendChild(headerTemp.content.cloneNode(true));

        if (!data) {
            const emptyTemp = document.getElementById('hist-empty-template');
            cont.appendChild(emptyTemp.content.cloneNode(true));
            return;
        }

        let items = Array.isArray(data) ? data.filter(i => i !== null) : Object.keys(data).map(key => ({ id: key, ...data[key] }));
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const rowTemp = document.getElementById('hist-row-template');

        items.forEach(item => {
            const clone = rowTemp.content.cloneNode(true);
            const row = clone.querySelector('.hist-row');
            const sym = item.coin ? item.coin.toLowerCase() : 'generic';
            const method = (item.method || '').toLowerCase();
            const status = (item.status || '').toLowerCase();
            
            let actionText = 'SUCCESS';
            let actionClass = 'status-success';

            // লজিক চেক
            if (status === 'failed' || status === 'rejected') {
                actionText = status.toUpperCase();
                actionClass = 'status-failed';
            } 
            else if (
                method.includes('spend') || method.includes('out') || 
                method.includes('withdraw') || method.includes('bet') || 
                method.includes('loss')
            ) {
                actionText = 'OUTGOING';
                actionClass = 'status-failed';
            } 
            else if (
                method.includes('win') || method.includes('deposit') || 
                method.includes('reward') || method.includes('mining') || 
                method.includes('swap') || method.includes(' in') || 
                method === 'in'
            ) {
                actionText = 'INCOMING';
                actionClass = 'status-success';
            }

            let timeStr = item.time || new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // ডাটা ইনজেকশন
            clone.querySelector('.small-logo').src = `assets/logos/${sym}.png`;
            clone.querySelector('.coin-name-text').innerText = (item.coin || 'UNT').toUpperCase();
            clone.querySelector('.hist-amount-text').innerText = item.amount;
            clone.querySelector('.hist-method-text').innerText = item.method || 'TX';
            clone.querySelector('.hist-time-text').innerText = timeStr;
            
            const badge = clone.querySelector('.status-badge');
            badge.innerText = actionText;
            badge.classList.add(actionClass);

            row.onclick = () => showFullDetails(item);

            cont.appendChild(clone);
        });
    });
}


// --- PROCESSORS ---
async function processWithdraw() {
    const amt = parseFloat(document.getElementById('withAmt').value);
    const addr = document.getElementById('withAddr').value;
    const s = document.getElementById('popCoinName').innerText.toLowerCase();
    const bal = parseFloat(userData[s + '_balance']) || 0;    
    const price = livePrices[s]?.price || 1, fee = 0.25 / price;

    if(!addr || isNaN(amt) || amt <= 0) return showNotify('error', 'Failed', 'Please enter valid details.');
    if((amt + fee) > bal) return showNotify('error', 'Balance', 'Insufficient balance including fee!');

    try {
        const txId = db.ref(`users/${auth.currentUser.uid}/history`).push().key;
        const data = { method: 'Withdraw', coin: s.toUpperCase(), amount: amt, network: document.getElementById('withNet').value, address: addr, status: 'pending', timestamp: Date.now(), hash: 'Pending...' };
        
        const updates = {};
        updates[`users/${auth.currentUser.uid}/${s}_balance`] = parseFloat((bal - (amt + fee)).toFixed(8));
        updates[`users/${auth.currentUser.uid}/history/${txId}`] = data;
        
        await db.ref().update(updates);
        showNotify('success', 'Submitted', 'Withdrawal request sent successfully!');
        hidePopup();
    } catch (e) {
        showNotify('error', 'Error', 'Transaction failed.');
    }
}

async function processTransfer() {
    const amt = parseFloat(document.getElementById('transAmt').value);
    const target = document.getElementById('transTarget').value.trim();
    const type = document.getElementById('transType').value;
    const s = document.getElementById('popCoinName').innerText.toLowerCase();
    const senderUid = auth.currentUser.uid;
    const senderBal = parseFloat(userData[s + '_balance']) || 0;

    if(!target || isNaN(amt) || amt <= 0) return showNotify('error', 'Failed', 'Please enter valid details.');
    if(amt > senderBal) return showNotify('error', 'Balance', 'Insufficient balance!');

    showNotify('info', 'Searching', 'Verifying recipient...');

    try {
        const snapshot = await db.ref('users').once('value');
        let receiverUid = null;
        let receiverName = "";

        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const user = child.val();
                const inputTarget = target.toLowerCase().trim();
                if (type === 'gmail' && user.email && user.email.toLowerCase() === inputTarget) {
                    receiverUid = child.key; receiverName = user.email;
                } else if (type === 'smatid') {
                    const dbSmatID = user.smatID || user.smatid || user.smatId; 
                    if (dbSmatID && dbSmatID.toString().toLowerCase() === inputTarget) {
                        receiverUid = child.key; receiverName = dbSmatID;
                    }
                }
            });
        }

        if (!receiverUid) return showNotify('error', 'NOT FOUND', 'User not found.');
        if (receiverUid === senderUid) return showNotify('error', 'Invalid', 'Cannot transfer to yourself.');

        showTransferPreview({ amt, coin: s.toUpperCase(), receiverName, receiverUid, senderBal, sym: s });
    } catch (e) { showNotify('error', 'Error', 'Search failed.'); }
}

async function showTransferPreview(data) {
    const overlay = document.getElementById('detailsOverlay');
    const cont = document.getElementById('detailsContent');
    const confirmBtn = overlay.querySelector('.btn-main');
    
    // UI পরিষ্কার করা
    cont.innerHTML = '';
    
    // বাটন রিসেট
    confirmBtn.innerText = "CONFIRM & SEND";
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = "1";
    confirmBtn.style.pointerEvents = "auto";

    // টেমপ্লেট থেকে প্রিভিউ ক্লোন করা
    const temp = document.getElementById('transfer-preview-template');
    const clone = temp.content.cloneNode(true);

    // ডাটা সেট করা
    clone.querySelector('.preview-amount').innerText = `${data.amt} ${data.coin.toUpperCase()}`;
    clone.querySelector('.preview-receiver').innerText = data.receiverName;

    cont.appendChild(clone);

    // ক্লিক হ্যান্ডলার
    confirmBtn.onclick = async () => {
        confirmBtn.innerText = "Processing..."; 
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.6";
        confirmBtn.style.pointerEvents = "none";

        try {
            await executeFinalTransfer(data);
            overlay.style.display = 'none'; 
        } catch (e) {
            console.error("Transfer Error:", e);
            showNotify('error', 'Failed', 'Transaction interrupted.');
            
            confirmBtn.innerText = "CONFIRM & SEND";
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "1";
            confirmBtn.style.pointerEvents = "auto";
        }
    };

    overlay.style.display = 'flex';
}


async function executeFinalTransfer(data) {
    if (!auth.currentUser) return;
    const senderUid = auth.currentUser.uid;
    
    try {
        // নতুন ট্রানজ্যাকশন আইডি জেনারেট
        const txRef = db.ref(`users/${senderUid}/history`).push();
        const txId = txRef.key;
        
        // রিসিভারের বর্তমান ব্যালেন্স চেক করা
        const rxSnap = await db.ref(`users/${data.receiverUid}/${data.sym}_balance`).once('value');
        const currentRxBal = parseFloat(rxSnap.val()) || 0;

        const senderName = (userData && userData.smatID) ? userData.smatID : "User";
        const txHash = 'INT-' + txId.substring(1, 8).toUpperCase();
        const timestamp = Date.now();

        // কমন ডাটা অবজেক্ট
        const histBase = { 
            coin: data.coin, 
            amount: data.amt, 
            status: 'success', 
            timestamp: timestamp, 
            network: 'Internal', 
            hash: txHash,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        const updates = {};
        // ১. সেন্ডারের ব্যালেন্স কমানো
        updates[`users/${senderUid}/${data.sym}_balance`] = parseFloat((data.senderBal - data.amt).toFixed(8));
        // ২. রিসিভারের ব্যালেন্স বাড়ানো
        updates[`users/${data.receiverUid}/${data.sym}_balance`] = parseFloat((currentRxBal + data.amt).toFixed(8));
        // ৩. সেন্ডারের হিস্টোরি
        updates[`users/${senderUid}/history/${txId}`] = { ...histBase, method: 'Transfer Out', address: `To: ${data.receiverName}` };
        // ৪. রিসিভারের হিস্টোরি
        updates[`users/${data.receiverUid}/history/${txId}`] = { ...histBase, method: 'Transfer In', address: `From: ${senderName}` };

        // ডাটাবেস আপডেট (Atomic Update)
        await db.ref().update(updates);
        
        showNotify('success', 'Transfer Success', `Sent ${data.amt} ${data.coin}`);
        
        // ৫. সব পপআপ ওভারলে বন্ধ করা
        hidePopup(); // actionOverlay বন্ধের জন্য
        
    } catch (e) {
        console.error("Execution Error:", e);
        showNotify('error', 'Error', 'Execution failed. Please check connection.');
        throw e; // এই এররটি উপরের catch ব্লকে পাঠাবে যাতে বাটন রিলিজ হয়
    }
}

// --- গ্লোবাল ভেরিয়েবল ---
let lastLoadedTimestamp = null; 
const INITIAL_LIMIT = 24;
const LOAD_MORE_LIMIT = 20;
let currentTxListener = null;

// --- ১. হিস্ট্রি লোড করার মেইন ফাংশন (Pagination সহ) ---
function loadSmatHistory(isLoadMore = false) {
    const limit = isLoadMore ? LOAD_MORE_LIMIT : INITIAL_LIMIT;
    const userId = auth.currentUser.uid;
    let historyRef = db.ref(`users/${userId}/history`).orderByChild('timestamp');

    // Pagination লজিক
    if (isLoadMore && lastLoadedTimestamp) {
        // শেষ লোড হওয়া ডাটার আগের গুলো আনবে
        historyRef = historyRef.endAt(lastLoadedTimestamp - 1).limitToLast(limit);
    } else {
        historyRef = historyRef.limitToLast(limit);
    }

    historyRef.once('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('history-container'); // আপনার লিস্ট কন্টেইনার আইডি
        
        if (!isLoadMore) container.innerHTML = ''; // নতুন করে লোড হলে আগের গুলো মুছে দিবে

        if (!data) {
            if (!isLoadMore) container.innerHTML = '<p class="no-data">No history found</p>';
            document.getElementById('load-more-btn').style.display = 'none';
            return;
        }

        let items = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        items.sort((a, b) => b.timestamp - a.timestamp); // নতুন গুলো উপরে দেখাবে

        // শেষ আইটেমের টাইমস্ট্যাম্প সেভ করে রাখা পরবর্তী লোডের জন্য
        lastLoadedTimestamp = items[items.length - 1].timestamp;

        // UI রেন্ডার (ধরে নিলাম আপনার একটি renderItem ফাংশন আছে)
        items.forEach(item => {
            const row = createHistoryRow(item); // আপনার ডিজাইন করা রো তৈরি ফাংশন
            container.appendChild(row);
        });

        // যদি ডাটা লিমিটের সমান হয়, তবে Show More বাটন দেখাবে
        document.getElementById('load-more-btn').style.display = items.length >= limit ? 'block' : 'none';
    });
}

// --- ২. ৩ মাসের পুরনো ডাটা অটো-ডিলিট লজিক ---
function autoCleanHistory() {
    const userId = auth.currentUser.uid;
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000); 
    const historyRef = db.ref(`users/${userId}/history`);

    historyRef.orderByChild('timestamp').endAt(threeMonthsAgo).once('value', (snapshot) => {
        const oldData = snapshot.val();
        if (oldData) {
            const updates = {};
            Object.keys(oldData).forEach(key => { updates[key] = null; });
            historyRef.update(updates).then(() => {
                console.log("SmatBit: Old history cleaned.");
            });
        }
    });
}

// --- ৩. ট্রানজ্যাকশন ডিটেইলস পপআপ (সংশোধিত) ---
function showFullDetails(item) {
    const overlay = document.getElementById('detailsOverlay');
    const cont = document.getElementById('detailsContent');
    
    // আগের কোনো লিসেনার থাকলে তা বন্ধ করা (মেমোরি সেভ)
    if (currentTxListener) currentTxListener.off();

    const txId = item.id || item.key || (item.hash ? item.hash.replace('INT-', '') : null);
    if (!txId) return;

    const txRef = db.ref(`users/${auth.currentUser.uid}/history/${txId}`);
    currentTxListener = txRef;

    txRef.on('value', (snapshot) => {
        const data = snapshot.val() || item;
        const dt = new Date(data.timestamp);
        const method = (data.method || '').toLowerCase();
        const status = (data.status || 'success').toLowerCase();

        cont.innerHTML = '';
        const temp = document.getElementById('tx-details-template');
        const clone = temp.content.cloneNode(true);

        let mainColor = '#0ecb81'; 
        let displayStatus = 'INCOMING';
        const network = (data.network || '').toUpperCase();
        const currentConfirms = data.confirms || 0; 
        let targetConfirms = (network.includes('BSC') || network.includes('BEP20')) ? 6 : 12;

        if (status === 'failed' || status === 'rejected') {
            mainColor = '#f6465d';
            displayStatus = status.toUpperCase();
        } else if (method.includes('out') || method.includes('withdraw') || method.includes('bet') || method.includes('loss')) {
            mainColor = '#f6465d';
            displayStatus = 'OUTGOING';
        }

        const visualCont = clone.querySelector('.status-visual-cont');
        if (method.includes('withdraw') || status === 'pending' || status === 'processing') {
            if (status === 'pending' || status === 'processing') {
                visualCont.innerHTML = `<div class="big-spinner"></div><h2 style="color:#f0b90b;">PROCESSING</h2>`;
                mainColor = '#f0b90b';
                displayStatus = 'PENDING';
            } else if (status === 'success' || status === 'approved') {
                visualCont.innerHTML = `<i class="fa-solid fa-circle-check big-check" style="color:#0ecb81;"></i><h2 style="color:#0ecb81;">SUCCESS</h2>`;
            } else if (status === 'rejected' || status === 'failed') {
                visualCont.innerHTML = `<i class="fa-solid fa-circle-xmark big-cross" style="color:#f6465d;"></i><h2 style="color:#f6465d;">REJECTED</h2>`;
            }
        }

        const progressBox = clone.querySelector('.confirm-progress-box');
        if ((method.includes('deposit') || method === 'in') && status === 'pending') {
            progressBox.style.display = 'block';
            const percentage = Math.min((currentConfirms / targetConfirms) * 100, 100);
            clone.querySelector('.confirms-text').innerText = `${currentConfirms} / ${targetConfirms}`;
            clone.querySelector('.progress-fill').style.width = `${percentage}%`;
        }

        const statusText = clone.querySelector('.val-status');
        statusText.innerText = displayStatus;
        statusText.style.color = mainColor;

        clone.querySelector('.val-method').innerText = data.method;
        const amtText = clone.querySelector('.val-amount');
        amtText.innerText = `${data.amount} ${data.coin}`;
        amtText.style.color = mainColor;

        clone.querySelector('.val-network').innerText = data.network || 'SmatBit Chain';
        clone.querySelector('.val-address').innerText = data.address || 'Internal Market';
        clone.querySelector('.hash-text-val').innerText = data.hash || txId;
        clone.querySelector('.val-timestamp').innerText = `${dt.toLocaleDateString()} | ${dt.toLocaleTimeString()}`;

        clone.querySelector('.copy-btn').onclick = () => copyHash(data.hash || txId);
        cont.appendChild(clone);
    });
    
    overlay.style.display = 'flex';
}

function hidePopup() { document.getElementById('actionOverlay').style.display = 'none'; }
function closeHistory() { document.getElementById('historyPopup').style.display = 'none'; }
function closeSelector() { document.getElementById('coinSelector').style.display = 'none'; }
function copyValueText(t) { navigator.clipboard.writeText(t); showNotify('success', 'Copied', 'Information copied.'); }
function copyValue(id) { copyValueText(document.getElementById(id).innerText); }

window.onload = init;


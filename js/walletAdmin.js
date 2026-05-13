// ---------- Firebase Configuration ----------------
const firebaseConfig = { 
    apiKey: "AIzaSyAMxtJedkehhxJRMPZLjhpKHqneHEWsGlE", 
    authDomain: "smat-exchange.firebaseapp.com", 
    databaseURL: "https://smat-exchange-default-rtdb.firebaseio.com",
    projectId: "smat-exchange" 
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let activeMainTab = 'pending';
let userFullHistory = [];

// ---------- Authentication ----------------
function tryLogin() {
    const e = document.getElementById('admEmail').value;
    const p = document.getElementById('admPass').value;
    auth.signInWithEmailAndPassword(e, p).catch(() => document.getElementById('admErr').style.display='block');
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadMainData();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }
});

function adminLogout() { auth.signOut(); }

// ---------- Core Dashboard ----------------
function switchMainTab(t) {
    activeMainTab = t;
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    loadMainData();
}

function getExplorer(net, hash) {
    if(!hash) return "#";
    const n = net ? net.toLowerCase() : "";
    if(n.includes('trc') || n.includes('tron')) return `https://tronscan.org/#/transaction/${hash}`;
    if(n.includes('bsc') || n.includes('bep')) return `https://bscscan.com/tx/${hash}`;
    return `https://tronscan.org/#/transaction/${hash}`;
}

function loadMainData() {
    db.ref('users').on('value', snap => {
        const users = snap.val();
        let html = ''; let pCount = 0; let list = [];
        
        for (let uid in users) {
            // ইউজারের ভেতর থেকে 'history' নোডটি চেক করা হচ্ছে
            const hist = users[uid].history;
            if (hist) {
                Object.keys(hist).forEach(tid => {
                    const tx = hist[tid];
                    // মেথড চেক করার সময় Case Sensitivity ফিক্স করা হয়েছে
                    if (tx.method && tx.method.toLowerCase() === 'withdraw') {
                        if (tx.status === 'pending') pCount++;
                        list.push({ uid, tid, email: users[uid].email, ...tx });
                    }
                });
            }
        }

        document.getElementById('pCount').innerText = pCount;
        const filtered = list.filter(x => x.status === activeMainTab).sort((a,b) => b.timestamp - a.timestamp);

        filtered.forEach(tx => {
            const expUrl = getExplorer(tx.network, tx.hash);
            html += `
            <div class="withdraw-card">
                <i class="fas fa-user-shield inspect-trigger" onclick="openInspector('${tx.uid}', '${tx.email}')"></i>
                <div><div class="label">User Email</div><div class="val" style="color:var(--primary)">${tx.email}</div><small style="font-size:8px; opacity:0.6;">${new Date(tx.timestamp).toLocaleString()}</small></div>
                <div><div class="label">Amount</div><div class="val">${tx.amount} ${tx.coin}</div><small style="color:var(--up); font-size:9px;">${tx.network}</small></div>
                <div><div class="label">Address</div><div class="address-box allow-copy"><span class="val" style="font-size:10px; font-family:monospace; opacity:0.8;">${tx.address ? tx.address.substring(0,15) : 'N/A'}...</span><i class="fas fa-copy allow-copy" style="cursor:pointer;color:var(--primary)" onclick="copyAddr('${tx.address}')"></i></div></div>
                <div style="text-align:right">
                    ${tx.status === 'pending' ? `
                        <input type="text" id="h_${tx.tid}" class="hash-input" placeholder="Paste TrxHash">
                        <div class="btn-group"><button class="btn" style="background:var(--up)" onclick="approve('${tx.uid}','${tx.tid}')">APPROVE</button><button class="btn" style="background:var(--down)" onclick="reject('${tx.uid}','${tx.tid}','${tx.coin}',${tx.amount})">REJECT</button></div>
                    ` : `
                        <div class="val" style="color:${tx.status==='success'?'var(--up)':'var(--down)'}">${tx.status.toUpperCase()}</div>
                        ${tx.status==='success' ? `<a href="${expUrl}" target="_blank" class="hash-link"><i class="fas fa-external-link-alt"></i> ${tx.hash}</a>` : ''}
                    `}
                </div>
            </div>`;
        });
        document.getElementById('withdrawList').innerHTML = html || '<div style="text-align:center; padding:50px; color:#848e9c;">NO DATA FOUND</div>';
    });
}


// ---------- Investigation Logics ----------------
async function openInspector(uid, email) {
    document.getElementById('userModal').style.display = 'flex';
    document.getElementById('mUserEmail').innerText = email;
    document.getElementById('investLogs').innerHTML = "Calculating Insights...";
    
    const oneYear = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const uSnap = await db.ref(`users/${uid}`).once('value');
    const uData = uSnap.val();
    
    if(uData) {
        document.getElementById('mReserve').innerHTML = `RESERVE: <span style="color:var(--primary)">${(uData.usdt_balance||0).toFixed(2)} USDT</span> | <span style="color:var(--primary)">${(uData.smat_balance||0).toFixed(2)} SMAT</span>`;
    }

    userFullHistory = [];
    let tin = 0, tout = 0, tprof = 0;
    if(uData && uData.history) {
        userFullHistory = Object.values(uData.history).filter(i => i.timestamp > oneYear).sort((a,b) => b.timestamp - a.timestamp);
        userFullHistory.forEach(i => {
            const a = parseFloat(i.amount) || 0;
            const m = i.method ? i.method.toLowerCase() : "";
            if(m.includes('deposit') || m.includes('airdrop')) tin += a;
            else if(m.includes('withdraw')) tout += Math.abs(a);
            else tprof += a;
        });
    }

    document.getElementById('mIn').innerText = tin.toFixed(2);
    document.getElementById('mOut').innerText = tout.toFixed(2);
    document.getElementById('mProfit').innerText = (tprof >= 0 ? '+' : '') + tprof.toFixed(2);
    document.getElementById('mProfit').style.color = tprof >= 0 ? 'var(--up)' : 'var(--down)';

    filterInv('all');
}

function filterInv(type) {
    document.querySelectorAll('.i-tab').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase().includes(type.toLowerCase()) || (type==='all' && b.innerText==='ALL HISTORY')));
    
    let html = ''; let sTotal = 0;
    const filtered = (type === 'all') ? userFullHistory : userFullHistory.filter(i => i.method && i.method.toLowerCase().includes(type.toLowerCase()));
    
    filtered.forEach(i => {
        const a = parseFloat(i.amount) || 0; sTotal += a;
        html += `<div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); font-size:11px;">
            <div><div style="color:var(--primary); font-weight:900;">${i.method ? i.method.toUpperCase() : 'N/A'}</div><div style="font-size:8px; color:#848e9c;">${new Date(i.timestamp).toLocaleString()}</div></div>
            <div style="text-align:right"><div style="color:${a>=0?'var(--up)':'var(--down)'}; font-weight:900;">${a>=0?'+':''}${a} ${i.coin}</div><div style="font-size:8px; color:#848e9c;">${i.status}</div></div>
        </div>`;
    });

    document.getElementById('sectorSummary').innerHTML = type === 'all' ? "FULL 1-YEAR INSIGHT SUMMARY" : `TOTAL ${type.toUpperCase()}: <span style="color:${sTotal>=0?'var(--up)':'var(--down)'}">${sTotal.toFixed(4)}</span>`;
    document.getElementById('investLogs').innerHTML = html || '<div style="text-align:center; padding:20px; color:#848e9c;">NO SECTOR DATA</div>';
}

function closeModal() { document.getElementById('userModal').style.display = 'none'; }

// ---------- Copy Function ----------------
function copyAddr(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Address Copied!");
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Address Copied!");
    } catch (err) {
        alert("Failed to copy.");
    }
    document.body.removeChild(textArea);
}

// ---------- Action Moduler ----------------
async function approve(uid, tid) {
    const h = document.getElementById('h_'+tid).value;
    if(!h || h.length < 5) return alert("Valid TrxHash is required!");
    await db.ref(`users/${uid}/history/${tid}`).update({ status:'success', hash:h });
    alert("Transaction Approved!");
}

async function reject(uid, tid, coin, amt) {
    if(confirm("Are you sure you want to Reject and Refund?")) {
        try {
            const dynamicKey = coin.toLowerCase() + '_balance';
            const snapshot = await db.ref(`users/${uid}/${dynamicKey}`).once('value');
            const currentBal = parseFloat(snapshot.val()) || 0;
            const newBal = (currentBal + parseFloat(amt)).toFixed(8);

            const updates = {};
            updates[`users/${uid}/${dynamicKey}`] = parseFloat(newBal); 
            updates[`users/${uid}/history/${tid}/status`] = 'failed';
            updates[`users/${uid}/history/${tid}/hash`] = 'REJECTED';

            await db.ref().update(updates);
            alert("Rejected & Refunded to: " + dynamicKey);
        } catch (e) {
            alert("Refund Error!");
        }
    }
}

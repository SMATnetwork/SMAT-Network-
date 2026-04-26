import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let provider, signer, userAddress;
let activeSide = 'pay';
const OWNER_ADDR = "0x065C306aFfe5D507A67568210ca4752089A74945";

// BSC-তে সরাসরি লিকুইডিটি চেক করার জন্য টোকেন ডেটা
const BSC_TOKENS = [
    { symbol: 'BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 }, // WBNB
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { symbol: 'BUSD', address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', decimals: 18 },
    { symbol: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18 }
];

const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const ROUTER_ABI = ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"];

// ১. ওয়ালেট কানেক্ট এবং ব্যালেন্স চেক
async function connect() {
    if (!window.ethereum) return notify("Install MetaMask", "error");
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = accounts[0];
    
    const bal = await provider.getBalance(userAddress);
    document.getElementById('userBal').innerText = ethers.formatEther(bal).slice(0, 6);
    document.getElementById('walletBtn').innerText = userAddress.slice(0, 6) + "...";
    updateButtonStatus();
}

// ২. অরিজিনাল রিয়াল টাইম দাম ক্যালকুলেশন (Direct from Blockchain)
async function getLivePrice() {
    const val = document.getElementById('payInput').value;
    if (!val || val <= 0) return;

    const payToken = BSC_TOKENS.find(t => t.symbol === document.getElementById('payCoin').innerText).address;
    const recToken = BSC_TOKENS.find(t => t.symbol === document.getElementById('receiveCoin').innerText).address;

    try {
        const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_ABI, provider || new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/"));
        const amountIn = ethers.parseEther(val);
        
        // ব্লকচেইন থেকে অরিজিনাল আউটপুট টেনে আনা
        const amounts = await router.getAmountsOut(amountIn, [payToken, recToken]);
        const rawOutput = ethers.formatEther(amounts[1]);
        
        // ০.২৫% প্ল্যাটফর্ম ফি এবং ০.১% স্লিপেজ সমন্বয়
        const finalOutput = rawOutput * (1 - 0.0035); 
        document.getElementById('receiveInput').value = finalOutput.toFixed(6);
        document.getElementById('feeVal').innerText = (val * 0.0025).toFixed(6);
    } catch (e) {
        console.error("Price fetch failed", e);
    }
}

// ৩. ম্যাক্স বাটন লজিক
document.getElementById('maxBtn').onclick = () => {
    const bal = parseFloat(document.getElementById('userBal').innerText);
    const safeMax = bal - (bal * 0.005); // Gas buffer
    document.getElementById('payInput').value = safeMax > 0 ? safeMax.toFixed(6) : 0;
    getLivePrice();
};

// ৪. টোকেন সিলেকশন মডাল
window.toggleTokenModal = (side) => {
    activeSide = side || activeSide;
    const modal = document.getElementById('tokenModal');
    modal.classList.toggle('hidden');
    
    const list = document.getElementById('tokenList');
    list.innerHTML = "";
    BSC_TOKENS.forEach(t => {
        const div = document.createElement('div');
        div.className = "p-4 flex items-center justify-between hover:bg-white/5 rounded-2xl cursor-pointer transition";
        div.innerHTML = `<span class="font-bold">${t.symbol}</span> <span class="text-[10px] text-gray-600">${t.address.slice(0,10)}...</span>`;
        div.onclick = () => {
            document.getElementById(activeSide + 'Coin').innerText = t.symbol;
            toggleTokenModal();
            getLivePrice();
        };
        list.appendChild(div);
    });
};

function updateButtonStatus() {
    const btn = document.getElementById('mainBtn');
    if (!userAddress) {
        btn.innerText = "Connect Wallet";
    } else {
        btn.innerText = "Swap Now";
        btn.className = "w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20";
    }
}

function notify(m, type) {
    Toastify({ text: m, backgroundColor: type === "success" ? "#10b981" : "#ef4444" }).showToast();
}

// ইভেন্ট লিসেনার
document.getElementById('walletBtn').onclick = connect;
document.getElementById('payInput').oninput = getLivePrice;
document.getElementById('mainBtn').onclick = () => {
    if (!userAddress) connect();
    else notify("Transaction Initialized...", "success");
};

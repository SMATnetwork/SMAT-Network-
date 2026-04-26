let provider, signer, userAddress;
let currentModalSide = 'pay';

const TOKENS = [
    { symbol: 'BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', price: 600 },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', price: 1 },
    { symbol: 'ETH', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', price: 3200 }
];

const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const ROUTER_ABI = ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"];

// ১. কানেক্ট ওয়ালেট ফাংশন
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            userAddress = accounts[0];
            
            document.getElementById('walletBtn').innerText = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
            document.getElementById('mainBtn').innerText = "Swap Now";
            document.getElementById('mainBtn').classList.replace('bg-blue-600/20', 'bg-blue-600');
            document.getElementById('mainBtn').classList.replace('text-blue-500', 'text-white');
            
            updateBalance();
        } catch (error) {
            console.error("Connection failed", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// ২. ব্যালেন্স আপডেট
async function updateBalance() {
    if (!userAddress) return;
    const balance = await provider.getBalance(userAddress);
    document.getElementById('userBal').innerText = parseFloat(ethers.formatEther(balance)).toFixed(4);
}

// ৩. রিয়েল টাইম দাম (PancakeSwap Router থেকে)
async function fetchRealPrice() {
    const amount = document.getElementById('payInput').value;
    if (!amount || amount <= 0) return;

    try {
        const tempProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const router = new ethers.Contract(PANCAKE_ROUTER, ROUTER_ABI, tempProvider);
        
        const paySymbol = document.getElementById('payCoin').innerText;
        const recSymbol = document.getElementById('receiveCoin').innerText;
        
        const path = [
            TOKENS.find(t => t.symbol === paySymbol).address,
            TOKENS.find(t => t.symbol === recSymbol).address
        ];

        const amounts = await router.getAmountsOut(ethers.parseEther(amount), path);
        const output = ethers.formatEther(amounts[1]);
        
        // ০.২৫% ফি এবং ০.১% স্লিপেজ বাদ দিয়ে
        const finalValue = output * 0.9965;
        document.getElementById('receiveInput').value = finalValue.toFixed(6);
    } catch (e) {
        console.error("Price fetch error", e);
    }
}

// ৪. ইভেন্ট লিসেনার ফর ইনপুট
document.getElementById('payInput').addEventListener('input', fetchRealPrice);

// ৫. ম্যাক্স বাটন
function setMax() {
    const bal = document.getElementById('userBal').innerText;
    document.getElementById('payInput').value = (bal * 0.99).toFixed(6); // Gas buffer
    fetchRealPrice();
}

// ৬. মডাল হ্যান্ডলিং
function openModal(side) {
    currentModalSide = side;
    const modal = document.getElementById('tokenModal');
    const list = document.getElementById('tokenList');
    modal.style.display = 'flex';
    list.innerHTML = "";
    
    TOKENS.forEach(t => {
        const div = document.createElement('div');
        div.className = "p-4 hover:bg-white/5 rounded-2xl cursor-pointer flex justify-between";
        div.innerHTML = `<span>${t.symbol}</span> <span class="text-xs text-gray-500">${t.price} USD</span>`;
        div.onclick = () => {
            document.getElementById(currentModalSide + 'Coin').innerText = t.symbol;
            closeModal();
            fetchRealPrice();
        };
        list.appendChild(div);
    });
}

function closeModal() {
    document.getElementById('tokenModal').style.display = 'none';
}

async function handleSwap() {
    if (!userAddress) {
        await connectWallet();
    } else {
        alert("Confirming Swap for " + document.getElementById('payInput').value + " " + document.getElementById('payCoin').innerText);
    }
}

// গ্লোবাল এক্সেস দেওয়া যাতে HTML এর onclick কাজ করে
window.connectWallet = connectWallet;
window.setMax = setMax;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleSwap = handleSwap;

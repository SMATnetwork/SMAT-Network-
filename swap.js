let provider, signer, userAddress;
let currentSide = 'pay';

const TOKENS = [
    { symbol: 'BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
    { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955' },
    { symbol: 'CAKE', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' }
];

const ROUTER_ADDR = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const ROUTER_ABI = ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"];

// ১. ওয়ালেট কানেক্ট
async function connect() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        document.getElementById('walletBtn').innerText = userAddress.slice(0, 6) + "...";
        document.getElementById('mainBtn').innerText = "Swap Now";
        document.getElementById('mainBtn').style.backgroundColor = "#2563eb";
        document.getElementById('mainBtn').style.color = "white";
        
        const bal = await provider.getBalance(userAddress);
        document.getElementById('userBal').innerText = parseFloat(ethers.formatEther(bal)).toFixed(4);
    }
}

// ২. রিয়েল টাইম প্রাইস ফেচ
async function getPrice() {
    const val = document.getElementById('payInput').value;
    if (!val || val <= 0) return;

    try {
        const bscProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const router = new ethers.Contract(ROUTER_ADDR, ROUTER_ABI, bscProvider);
        
        const path = [
            TOKENS.find(t => t.symbol === document.getElementById('payCoinSelect').innerText.split(' ')[0]).address,
            TOKENS.find(t => t.symbol === document.getElementById('recCoinSelect').innerText.split(' ')[0]).address
        ];

        const amounts = await router.getAmountsOut(ethers.parseEther(val), path);
        const output = ethers.formatEther(amounts[1]);
        
        document.getElementById('receiveInput').value = (output * 0.9965).toFixed(6); // ০.৩৫% বাদ দিয়ে
        document.getElementById('feeDisplay').innerText = (val * 0.0025).toFixed(6);
    } catch (e) { console.log(e); }
}

// ৩. ম্যাক্স বাটন
document.getElementById('maxBtn').onclick = () => {
    const bal = document.getElementById('userBal').innerText;
    document.getElementById('payInput').value = (bal * 0.98).toFixed(6); // গ্যাস ফি রেখে
    getPrice();
};

// ৪. মডাল লজিক
function openModal(side) {
    currentSide = side;
    const modal = document.getElementById('tokenModal');
    const list = document.getElementById('tokenList');
    modal.style.display = 'flex';
    list.innerHTML = "";
    
    TOKENS.forEach(t => {
        const item = document.createElement('div');
        item.className = "p-4 hover:bg-white/5 rounded-2xl cursor-pointer font-bold";
        item.innerText = t.symbol;
        item.onclick = () => {
            document.getElementById(currentSide === 'pay' ? 'payCoinSelect' : 'recCoinSelect').innerText = t.symbol + " ▾";
            modal.style.display = 'none';
            getPrice();
        };
        list.appendChild(item);
    });
}

// ইভেন্ট লিসেনারস
document.getElementById('walletBtn').onclick = connect;
document.getElementById('payInput').oninput = getPrice;
document.getElementById('payCoinSelect').onclick = () => openModal('pay');
document.getElementById('recCoinSelect').onclick = () => openModal('receive');
document.getElementById('closeModal').onclick = () => document.getElementById('tokenModal').style.display = 'none';
document.getElementById('mainBtn').onclick = () => { if(!userAddress) connect(); else alert("Swap logic triggered!"); };

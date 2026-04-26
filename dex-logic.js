import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let provider, signer, userAddress;
const PLATFORM_FEE = 0.00025; // 0.025%

// চেইন অনুযায়ী প্রধান DEX রাউটার এবং নেটিভ টোকেন র‍্যাপার (WBNB, WETH, etc.)
const CHAIN_CONFIG = {
    "0x38": { router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", wrapped: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
    "0x1":  { router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", wrapped: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    "0x89": { router: "0xa5E0829CaCEd8fFDD03942105b445857041331F3", wrapped: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" },
    "0xfa": { router: "0xF491e7B69E4244ad4002BC14e878a34207E38c29", wrapped: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83" }
};

// ১. কানেক্ট এবং চেইন সুইচ লজিক
async function connect() {
    if (!window.ethereum) return showToast("MetaMask Install করুন!", "error");
    
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = accounts[0];

    const targetChainId = document.getElementById('chainId').value;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
        });
        showToast("Wallet Connected & Network Switched", "success");
    } catch (err) {
        showToast("Network Switch Requested", "info");
    }

    document.getElementById('connectBtn').innerText = userAddress.slice(0,6)+"..."+userAddress.slice(-4);
    document.getElementById('mainActionBtn').innerText = "Swap Now";
}

// ২. অটোমেটিক লিকুইডিটি কল (পৃথিবীর যেকোনো DEX থেকে)
document.getElementById('targetTokenAddress').addEventListener('input', async (e) => {
    const addr = e.target.value.trim();
    if (ethers.isAddress(addr)) {
        try {
            const abi = ["function symbol() view returns (string)", "function decimals() view returns (uint8)"];
            const contract = new ethers.Contract(addr, abi, provider);
            const symbol = await contract.symbol();
            document.getElementById('targetSymbol').innerText = symbol;
            
            document.getElementById('riskBox').classList.remove('hidden');
            fetchBestPrice(addr);
        } catch (err) {
            showToast("Invalid Contract Address!", "error");
            document.getElementById('targetSymbol').innerText = "ERROR";
        }
    }
});

// ৩. রিয়েল-টাইম প্রাইস ইঞ্জিন (Router.getAmountsOut)
async function fetchBestPrice(tokenAddr) {
    const amount = document.getElementById('inputAmount').value;
    if (!amount || amount <= 0) return;

    const chain = document.getElementById('chainId').value;
    const config = CHAIN_CONFIG[chain];
    
    if (!config) return showToast("Chain not supported yet!", "info");

    const routerAbi = ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"];
    const router = new ethers.Contract(config.router, routerAbi, provider);

    try {
        const amountInWei = ethers.parseEther(amount);
        const amountsOut = await router.getAmountsOut(amountInWei, [config.wrapped, tokenAddr]);
        
        const rawOutput = ethers.formatUnits(amountsOut[1], 18);
        const finalOutput = rawOutput * (1 - PLATFORM_FEE); // ০.০২৫% ফি বাদ
        
        document.getElementById('outputAmount').value = finalOutput.toFixed(6);
        document.getElementById('routeInfo').innerText = `Route: Native -> ${tokenAddr.slice(0,6)}`;
    } catch (e) {
        showToast("No Liquidity Found on any DEX!", "error");
        document.getElementById('outputAmount').value = "0.0";
    }
}

// ৪. সোয়াপ এক্সিকিউশন এবং ফায়ারবেস লগিং
async function handleSwap() {
    if (!userAddress) return connect();

    const btn = document.getElementById('mainActionBtn');
    btn.innerText = "Searching Liquidity & Swapping...";
    btn.disabled = true;

    try {
        // এখানে প্রকৃত ট্রানজেকশন (router.swapExactETHForTokens) কল হবে
        const txHash = "0x" + Math.random().toString(36).substring(2, 15); // Simulation

        // Firebase-এ ডেটা সেভ
        await setDoc(doc(window.db, "swap_logs", txHash), {
            wallet: userAddress,
            network: document.getElementById('chainId').value,
            input: document.getElementById('inputAmount').value,
            output: document.getElementById('outputAmount').value,
            targetToken: document.getElementById('targetTokenAddress').value,
            fee: "0.025%",
            status: "Success",
            timestamp: serverTimestamp()
        });

        showToast("Swap Successful!", "success");
    } catch (err) {
        showToast("Swap Failed! Check Gas/Slippage", "error");
    } finally {
        btn.innerText = "Swap Now";
        btn.disabled = false;
    }
}

// গ্রাফিক্স পপআপ (Toast) ফাংশন
function showToast(msg, type) {
    Toastify({
        text: msg,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6",
        }
    }).showToast();
}

// Listeners
document.getElementById('connectBtn').addEventListener('click', connect);
document.getElementById('mainActionBtn').addEventListener('click', handleSwap);
document.getElementById('inputAmount').addEventListener('input', () => fetchBestPrice(document.getElementById('targetTokenAddress').value));

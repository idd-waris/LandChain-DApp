// landchainService.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js";

// --- Configuration ---
const CONTRACT_ADDRESS = "0x64A5932ebad82eDaDc33b757Fe8fEED763c1D97F"; // !!! REPLACE WITH YOUR CONTRACT ADDRESS !!!
const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "plotNumber",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "oldOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "LandOwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "plotNumber",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "LandRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_plotNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_location",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "registerLand",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_plotNumber",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allPlotNumbers",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_plotNumber",
				"type": "string"
			}
		],
		"name": "getLand",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "plotNumber",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isRegistered",
						"type": "bool"
					}
				],
				"internalType": "struct LandChain.Land",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "lands",
		"outputs": [
			{
				"internalType": "string",
				"name": "plotNumber",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider;
let signer;
let contract;
let currentAccount = null;

const ADMIN_ADDRESS = "0x2F3BaF7CE8BAB1F9fC30D22fA00cF492c786AF35".toLowerCase();

export const showToast = (message, type = 'success') => {
    let background = '#4CAF50';
    if (type === 'error') {
        background = '#f44336';
    } else if (type === 'info') {
        background = '#2196F3';
    }
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: background,
            },
            className: type,
        }).showToast();
    } else {
        console.warn('Toastify library not loaded.');
    }
};

export const updateUIBasedOnAccount = (account) => {
    const connectBtn = document.getElementById('connectWalletBtn');
    const disconnectBtn = document.getElementById('disconnectWalletBtn');
    const walletStatus = document.getElementById('walletStatus');
    const adminFeaturesDiv = document.getElementById('adminFeatures');
    const userFeaturesDiv = document.getElementById('userFeatures');

    currentAccount = account;

    if (currentAccount) {
        if (walletStatus) walletStatus.textContent = `Wallet Connected: ${currentAccount.substring(0, 6)}...`;
        if (connectBtn) connectBtn.classList.add('d-none');
        if (disconnectBtn) disconnectBtn.classList.remove('d-none');
        if (adminFeaturesDiv) adminFeaturesDiv.classList.remove('d-none');
        if (userFeaturesDiv) userFeaturesDiv.classList.remove('d-none');
    } else {
        if (walletStatus) walletStatus.textContent = 'Wallet Not Connected';
        if (connectBtn) connectBtn.classList.remove('d-none');
        if (disconnectBtn) disconnectBtn.classList.add('d-none');
        if (adminFeaturesDiv) adminFeaturesDiv.classList.add('d-none');
        if (userFeaturesDiv) userFeaturesDiv.classList.add('d-none');
    }
};

export const init = async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_accounts", []);
            if (accounts.length > 0) {
                signer = await provider.getSigner(accounts[0]);
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                return accounts[0];
            }
        } catch (error) {
            console.error("Error during wallet connection or contract initialization:", error);
        }
    }
    return null;
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length === 0) {
                showToast("Please connect an account to continue.", 'info');
                return null;
            }
            signer = await provider.getSigner(accounts[0]);
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            return accounts[0];
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            showToast("Failed to connect wallet. See console for details.", 'error');
            return null;
        }
    } else {
        showToast("MetaMask not found. Please install the extension.", 'error');
        return null;
    }
};

export const getContract = () => {
    if (!contract) {
        throw new Error("Wallet not connected or contract not initialized.");
    }
    return contract;
};

export const getLand = async (plotId) => {
    if (!contract) throw new Error("Wallet not connected or contract not initialized.");
    try {
        const land = await contract.getLand(plotId);
        return {
            plotNumber: land[0],
            location: land[1],
            owner: land[2],
            isRegistered: land[3]
        };
    } catch (error) {
        console.error("Error getting land details:", error);
        return { isRegistered: false };
    }
};

export const registerLand = async (plotId, location, initialOwner) => {
    if (!contract) throw new Error("Wallet not connected or contract not initialized.");
    try {
        showToast("Registering land... Please confirm in your wallet.", 'info');
        const tx = await contract.registerLand(plotId, location, initialOwner);
        await tx.wait();
        showToast(`Successfully registered land with Plot ID: ${plotId}`, 'success');
    } catch (error) {
        console.error("Error registering land:", error);
        showToast("Failed to register land. See console for details.", 'error');
        throw error;
    }
};

export const transferOwnership = async (plotId, newOwner) => {
    if (!contract) throw new Error("Wallet not connected or contract not initialized.");
    try {
        showToast("Transferring ownership... Please confirm in your wallet.", 'info');
        const tx = await contract.transferOwnership(plotId, newOwner);
        await tx.wait();
        showToast(`Successfully transferred ownership for Plot ID: ${plotId}`, 'success');
    } catch (error) {
        console.error("Error transferring ownership:", error);
        showToast("Failed to transfer ownership. See console for details.", 'error');
        throw error;
    }
};

// NEW: Function to get all registered lands
export const getAllRegisteredLands = async () => {
    try {
        if (!contract) {
            await init();
            if (!contract) return [];
        }

        const landIds = await contract.allPlotNumbers();
        const allLands = [];
        for (const plotId of landIds) {
            const land = await getLand(plotId);
            if (land.isRegistered) { // Only add if it's a valid registered land
                allLands.push(land);
            }
        }
        return allLands;
    } catch (error) {
        console.error("Error fetching all registered lands:", error);
        showToast("Failed to fetch all registered lands.", 'error');
        return [];
    }
};

// NEW: Function to get all transferred lands from events
export const getAllTransferredLands = async () => {
    try {
        if (!contract) {
            await init();
            if (!contract) return [];
        }

        const filter = contract.filters.LandOwnershipTransferred();
        const events = await contract.queryFilter(filter);

        const transferredLands = events.map(event => ({
            plotNumber: event.args.plotNumber,
            previousOwner: event.args.oldOwner,
            newOwner: event.args.newOwner,
            timestamp: new Date(Number(event.args.timestamp) * 1000).toLocaleString()
        }));

        return transferredLands;
    } catch (error) {
        console.error("Error fetching all transferred lands:", error);
        showToast("Failed to fetch all transferred lands.", 'error');
        return [];
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const account = await init();
    updateUIBasedOnAccount(account);

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            updateUIBasedOnAccount(accounts[0] || null);
        });
    }

    const path = window.location.pathname;

    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn && path.includes('index.html')) {
        connectBtn.addEventListener('click', async () => {
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Connecting...';
            const account = await connectWallet();
            if (account) {
                if (account.toLowerCase() === ADMIN_ADDRESS) {
                    window.location.href = "./admin/dashboard.html";
                } else {
                    window.location.href = "./user/dashboard.html";
                }
            } else {
                connectBtn.disabled = false;
                connectBtn.innerHTML = 'Connect Wallet';
            }
        });
    }

    if (path.includes('dashboard.html')) {
        const disconnectBtn = document.getElementById('disconnectWalletBtn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                updateUIBasedOnAccount(null);
                window.location.reload();
            });
        }

        if (path.includes('admin/dashboard.html')) {
            const showRegisterFormBtn = document.getElementById('showRegisterFormBtn');
            if (showRegisterFormBtn) showRegisterFormBtn.addEventListener('click', () => toggleSection('registerLandSection'));
            const showTransferFormBtn = document.getElementById('showTransferFormBtn');
            if (showTransferFormBtn) showTransferFormBtn.addEventListener('click', () => toggleSection('transferOwnershipSection'));
            const showViewLandFormBtn = document.getElementById('showViewLandFormBtn');
            if (showViewLandFormBtn) showViewLandFormBtn.addEventListener('click', () => toggleSection('viewLandSection'));

            const showAllRegisteredBtn = document.getElementById('showAllRegisteredBtn');
            if (showAllRegisteredBtn) showAllRegisteredBtn.addEventListener('click', async () => {
                toggleSection('allRegisteredLandsSection');
                await loadAllRegisteredLands();
            });

            const showAllTransferredBtn = document.getElementById('showAllTransferredBtn');
            if (showAllTransferredBtn) showAllTransferredBtn.addEventListener('click', async () => {
                toggleSection('allTransferredLandsSection');
                await loadAllTransferredLands();
            });


            const registerLandForm = document.getElementById('registerLandForm');
            if (registerLandForm) {
                registerLandForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const submitBtn = e.target.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
                    const plotId = document.getElementById('plotIdInput').value;
                    const location = document.getElementById('locationInput').value;
                    const ownerAddress = document.getElementById('ownerAddressInput').value;
                    try {
                        await registerLand(plotId, location, ownerAddress);
                        document.getElementById('registerLandForm').reset();
                        await loadAllRegisteredLands();
                    } catch (error) {
                        // Error handled by the service function
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Register Land';
                    }
                });
            }

            const transferOwnershipForm = document.getElementById('transferOwnershipForm');
            if (transferOwnershipForm) {
                transferOwnershipForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const submitBtn = e.target.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Transferring...';
                    const plotId = document.getElementById('transferPlotIdInput').value;
                    const newOwnerAddress = document.getElementById('newOwnerAddressInput').value;
                    try {
                        await transferOwnership(plotId, newOwnerAddress);
                        document.getElementById('transferOwnershipForm').reset();
                        await loadAllRegisteredLands();
                        await loadAllTransferredLands();
                    } catch (error) {
                        // Error handled by the service function
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Transfer Ownership';
                    }
                });
            }
        }

        const viewLandForm = document.getElementById('viewLandForm');
        if (viewLandForm) {
            viewLandForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Viewing...';
                const plotId = document.getElementById('viewPlotIdInput').value;
                const outputDiv = document.getElementById('landDetailsOutput');
                if (outputDiv) outputDiv.innerHTML = 'Fetching details...';
                try {
                    const land = await getLand(plotId);
                    if (land && land.isRegistered) {
                        if (outputDiv) {
                            outputDiv.innerHTML = `
                                <h5>Land Details for Plot ${land.plotNumber}</h5>
                                <p><strong>Location:</strong> ${land.location}</p>
                                <p><strong>Current Owner:</strong> ${land.owner}</p>
                                <p><strong>Is Registered:</strong> Yes</p>
                            `;
                        }
                    } else {
                        if (outputDiv) {
                            outputDiv.innerHTML = `<p class="alert alert-warning">Plot ID "${plotId}" not registered.</p>`;
                        }
                    }
                } catch (error) {
                    console.error("Failed to view land:", error);
                    if (outputDiv) {
                        outputDiv.innerHTML = `<p class="alert alert-danger">Failed to retrieve land details. Ensure the Plot ID is correct and the wallet is connected.</p>`;
                    }
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'View Land';
                }
            });
        }
    }
});
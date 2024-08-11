import { ethers } from 'ethers';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed contract address
const contractABI = [
  "function storeHash(string memory fileName, string memory fileHash) public",
  "function getHash(string memory fileName) public view returns (string memory)",
  "function getAllFilenames() public view returns (string[] memory)"
];

let contract = null;

export const initializeContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log('Contract initialized at address:', contract.address);
    } else {
      console.log('Please install MetaMask!');
    }
  };

export const storeHashOnBlockchain = async (fileName, fileHash) => {
    if (!contract) await initializeContract();
    try {
      console.log('Attempting to store hash...');
      
      // Get the provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get the nonce
      const nonce = await provider.getTransactionCount(signer.address);
      
      // Send the transaction with specified gas limit and nonce
      const transaction = await contract.storeHash(fileName, fileHash, {
        gasLimit: 500000,
        maxFeePerGas: ethers.parseUnits("20", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("5", "gwei")
      });
      
      console.log('Transaction sent:', transaction.hash);
      await transaction.wait();
      console.log('Transaction confirmed');
    } catch (error) {
      console.error('Error storing hash:', error);
      throw error;
    }
  };

export const getHashFromBlockchain = async (fileName) => {
  if (!contract) await initializeContract();
  try {
    const hash = await contract.getHash(fileName);
    return hash || "No hash found for this filename";
  } catch (error) {
    console.error('Error getting hash:', error);
    if (error.code === 'BAD_DATA' && error.value === '0x') {
      return "No hash found for this filename";
    }
    throw error;
  }
};

export const getAllFilenamesFromBlockchain = async () => {
  if (!contract) await initializeContract();
  try {
    const filenames = await contract.getAllFilenames();
    return filenames;
  } catch (error) {
    console.error('Error getting all filenames:', error);
    throw error;
  }
};
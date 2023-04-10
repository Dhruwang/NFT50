require("@nomicfoundation/hardhat-toolbox");

// require("dotenv").config();

// const SEPOLIA_URL = process.env.SEPOLIA_URL;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;

// module.exports = {
//   solidity:"0.8.18",
//   networks:{
//     sepolia:{
//       url: SEPOLIA_URL,
//       accounts : [PRIVATE_KEY],
//     },
//   },
// };

module.exports = {
  networks: {
    hardhat: {
      // Uncomment the next line to enable the Hardhat EVM
      // hardfork: 'istanbul',
      chainId: 1337,
      accounts: {
        count: 10,
        initialBalance: '100000000000000000000' // 100 ETH
      }
    }
  },
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

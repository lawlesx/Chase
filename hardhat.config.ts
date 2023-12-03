import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dot from "dotenv";

dot.config();

const { API_URL, PRIVATE_KEY, POLYGONSCAN_KEY } = process.env;

const config: HardhatUserConfig = {
  // solidity: "0.8.19",
  solidity: {
    version: "0.8.19",
    settings: {
       optimizer: {
          enabled: true,
          runs: 200
       }
    }
 },
 defaultNetwork: "hardhat",
 networks: {
    hardhat: {},
    polygonMumbai: {
        url: API_URL,
        accounts: [`0x${PRIVATE_KEY}`]
    }
 },
 etherscan: {
    apiKey: {
       polygonMumbai: POLYGONSCAN_KEY as string
    }
 }
};

export default config;

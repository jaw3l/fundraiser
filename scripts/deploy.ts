import { ethers } from "hardhat";
import { setEnvValue } from "./setEnv";

async function main() {
  // Deploy the contract
  const conractFactory = await ethers.getContractFactory("FundraiserFactory");
  const contract = await conractFactory.deploy();
  await contract.waitForDeployment();

  console.log("DecentralisedGameDatabase contract deployed to:", contract.target);

  // Write the contract address to the .env file
  setEnvValue(true, "CONTRACT_ADDRESS", contract.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

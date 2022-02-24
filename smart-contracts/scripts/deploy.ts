import { ethers } from "hardhat";

async function main() {
  const TokenLiquidatorFactory = await ethers.getContractFactory(
    "TokenLiquidator"
  );
  const TokenLiquidator = await TokenLiquidatorFactory.deploy();
  await TokenLiquidator.deployed();
  console.log("TokenLiquidator address:", TokenLiquidator.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

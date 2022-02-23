import { expect } from "chai";
import { ethers } from "hardhat";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

let TokenLiquidator: any;
let DAIContract: any;
let WETHContract: any;

let person: any;

describe("Token Liquidator", function () {
  before(async () => {
    [person] = await ethers.getSigners();

    const TokenLiquidatorFactory = await ethers.getContractFactory(
      "TokenLiquidator"
    );
    TokenLiquidator = await TokenLiquidatorFactory.deploy();
    await TokenLiquidator.deployed();
    console.log("TokenLiquidator address:", TokenLiquidator.address);

    DAIContract = await ethers.getContractAt("IERC20", DAI_ADDRESS);
    WETHContract = await ethers.getContractAt("IERC20", WETH_ADDRESS);

    console.log(
      "DAI balance before:",
      await DAIContract.balanceOf(person.address)
    );
  });

  it("should get correct DAI balance", async () => {
    const provideLiquidityTxn = await TokenLiquidator.connect(
      person
    ).provideLiquidity({ value: ethers.utils.parseEther("1") });
    await provideLiquidityTxn.wait();
    // console.log(
    //   "DAI balance after:",
    //   await DAIContract.balanceOf(person.address)
    // );
  });
});

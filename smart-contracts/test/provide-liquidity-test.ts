import { ethers, network } from "hardhat";

const TOKEN_A_WHALE = "0x7923ef1b53eb2cbbf8643f835aadd32f9f1dd240";
const TOKEN_A = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const TOKEN_B = "0xeef9f339514298c6a857efcfc1a762af84438dee";

const AMOUNT_IN = ethers.utils.parseEther("10");

let TokenLiquidator: any;
let tokenA: any;
let tokenB: any;

let daiWhaleSigner: any;
let callerSigner: any;

describe("Provide Liquidity", () => {
  before(async () => {
    [callerSigner] = await ethers.getSigners();
    daiWhaleSigner = await ethers.getSigner(TOKEN_A_WHALE);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [TOKEN_A_WHALE],
    });

    tokenA = await ethers.getContractAt("IERC20", TOKEN_A);
    tokenB = await ethers.getContractAt("IERC20", TOKEN_B);

    // Sending caller 10 DAI
    await tokenA
      .connect(daiWhaleSigner)
      .transfer(callerSigner.address, AMOUNT_IN);

    const TokenLiquidatorFactory = await ethers.getContractFactory(
      "TokenLiquidator"
    );
    TokenLiquidator = await TokenLiquidatorFactory.deploy();
    await TokenLiquidator.deployed();
    console.log("TokenLiquidator:", TokenLiquidator.address);
  });

  it("should provide liquidity", async () => {
    const approveDaiTxn = await tokenA
      .connect(callerSigner)
      .approve(TokenLiquidator.address, AMOUNT_IN);
    await approveDaiTxn.wait();

    const pair = await TokenLiquidator.getPairAddress(TOKEN_A, TOKEN_B);
    console.log(
      "LP tokens BEFORE: ",
      await TokenLiquidator.getLiquidity(pair, callerSigner.address)
    );

    const provideLiquidityTxn = await TokenLiquidator.connect(
      callerSigner
    ).provideLiquidity(TOKEN_A, TOKEN_B, AMOUNT_IN);
    await provideLiquidityTxn.wait();

    console.log(
      "LP tokens AFTER: ",
      await TokenLiquidator.getLiquidity(pair, callerSigner.address)
    );
  });
});

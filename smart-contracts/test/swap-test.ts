import { ethers, network } from "hardhat";

const DAI_WHALE = "0x7923ef1b53eb2cbbf8643f835aadd32f9f1dd240";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

const AMOUNT_IN = ethers.utils.parseEther("100");
const AMOUNT_OUT_MIN = 1;
const TOKEN_IN = DAI_ADDRESS;
const TOKEN_OUT = WBTC_ADDRESS;
const TO = DAI_WHALE;

let TokenLiquidator: any;
let tokenIn: any;
let tokenOut: any;

let DAIWhaleSigner: any;

describe("Token Swap", function () {
  before(async () => {
    DAIWhaleSigner = await ethers.getSigner(DAI_WHALE);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    tokenIn = await ethers.getContractAt("IERC20", TOKEN_IN);
    tokenOut = await ethers.getContractAt("IERC20", TOKEN_OUT);

    const TokenLiquidatorFactory = await ethers.getContractFactory(
      "TokenLiquidator"
    );
    TokenLiquidator = await TokenLiquidatorFactory.deploy();
    await TokenLiquidator.deployed();
    console.log("TokenLiquidator:", TokenLiquidator.address);
  });

  it("should swap", async () => {
    console.log("WBTC balance of Whale BEFORE:", await tokenOut.balanceOf(TO));

    const approveDaiTxn = await tokenIn
      .connect(DAIWhaleSigner)
      .approve(TokenLiquidator.address, AMOUNT_IN);
    await approveDaiTxn.wait();

    const swapTxn = await TokenLiquidator.connect(DAIWhaleSigner)._swap(
      TOKEN_IN,
      TOKEN_OUT,
      AMOUNT_IN,
      AMOUNT_OUT_MIN,
      TO
    );
    await swapTxn.wait();

    console.log("WBTC balance of Whale AFTER:", await tokenOut.balanceOf(TO));
  });
});

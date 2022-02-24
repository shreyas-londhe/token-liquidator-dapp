import { ethers, network } from "hardhat";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x7923ef1b53eb2cbbf8643f835aadd32f9f1dd240";
const WETH_WHALE = "0x35d0Ca92152d1fEA18240d6C67C2ADfE0cCA287C";

const TOKEN_A = WETH;
const TOKEN_B = DAI;
const TOKEN_A_AMOUNT = ethers.utils.parseEther("1");
const TOKEN_B_AMOUNT = ethers.utils.parseEther("1");

let TokenLiquidator: any;
let tokenA: any;
let tokenB: any;

let caller: any;
let tokenBSigner: any;
let tokenASigner: any;

describe("Add Liquidity Test", () => {
  before(async () => {
    [caller] = await ethers.getSigners();
    tokenBSigner = await ethers.getSigner(DAI_WHALE);
    tokenASigner = await ethers.getSigner(WETH_WHALE);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WETH_WHALE],
    });

    tokenA = await ethers.getContractAt("IERC20", TOKEN_A);
    tokenB = await ethers.getContractAt("IERC20", TOKEN_B);

    const TokenLiquidatorFactory = await ethers.getContractFactory(
      "TokenLiquidator"
    );
    TokenLiquidator = await TokenLiquidatorFactory.deploy();
    await TokenLiquidator.deployed();

    await tokenA.connect(tokenASigner).transfer(caller.address, TOKEN_A_AMOUNT);
    await tokenB.connect(tokenBSigner).transfer(caller.address, TOKEN_B_AMOUNT);

    await tokenA
      .connect(caller)
      .approve(TokenLiquidator.address, TOKEN_A_AMOUNT);

    await tokenB
      .connect(caller)
      .approve(TokenLiquidator.address, TOKEN_B_AMOUNT);
  });

  it("should add liquidity", async () => {
    const addLiquidityTxn = await TokenLiquidator.connect(caller)._addLiquidity(
      TOKEN_A,
      TOKEN_B,
      TOKEN_A_AMOUNT,
      TOKEN_B_AMOUNT
    );
    await addLiquidityTxn.wait();

    const pairAddress = await TokenLiquidator.getPairAddress(TOKEN_A, TOKEN_B);

    const liquidity = await TokenLiquidator.connect(caller).getLiquidity(
      pairAddress,
      caller.address
    );

    console.log("liquidity:", liquidity);
  });
});

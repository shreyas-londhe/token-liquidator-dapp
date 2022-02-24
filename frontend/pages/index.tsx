import type { NextPage } from 'next'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

import contractAbi from './utils/ContractABI.json'
import ERC20Abi from './utils/ERC20ABI.json'

declare var window: any

const CONTRACT_ADDRESS = '0x6161F3396CA60eF097A1Ce16bebf281919268503'
const DAI = '0xaD6D458402F60fD3Bd25163575031ACDce07538D'
const WETH = '0xc778417E063141139Fce010982780140Aa0cD5Ab'

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [tokenAmount, setTokenAmount] = useState(0)
  const [isApproved, setIsApproved] = useState(false)

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('Make sure you have MetaMask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask -> https://metamask.io/')
        return
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const approveToken = async () => {
    if (!isApproved) {
      try {
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const DAIContract = new ethers.Contract(DAI, ERC20Abi.abi, signer)

          const approveDaiTxn = await DAIContract.approve(
            CONTRACT_ADDRESS,
            tokenAmount
          )
          const tx = await approveDaiTxn.wait()
          if (tx.status === 1) {
            alert(`Approved ${tokenAmount} DAI`)
            setIsApproved(true)
          } else {
            alert('Something went wrong')
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  const addLiquidity = async () => {
    if (isApproved) {
      try {
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const TokenLiquidatorContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            contractAbi.abi,
            signer
          )

          const provideLiquidityTxn =
            await TokenLiquidatorContract.provideLiquidity(
              DAI,
              WETH,
              tokenAmount,
              { gasLimit: 8000000 }
            )
          const tx = await provideLiquidityTxn.wait()

          if (tx.status === 1) {
            const pair = await TokenLiquidatorContract.getPairAddress(DAI, WETH)
            const liquidity = await TokenLiquidatorContract.getLiquidity(
              pair,
              currentAccount
            )
            alert(`Added ${liquidity} LP Tokens`)
            setIsApproved(false)
          } else {
            alert('Something went wrong')
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="p-2 m-2 font-mono text-5xl font-bold">Token Liquidator</h1>

      {!currentAccount && (
        <button
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}

      {currentAccount && (
        <div>
          <div className="flex flex-col items-center justify-center p-2 m-2 ">
            <label className="p-2 mt-2 mb-1" htmlFor="tokenAAmount">
              Amount of DAI to Add to DAI/WETH Pool
            </label>
            <input
              className="p-2 mt-1 mb-2 bg-gray-100 rounded-md"
              type="number"
              name="tokenAAmount"
              id="tokenAAmount"
              onChange={(e) => setTokenAmount(parseInt(e.target.value))}
            />

            <button
              onClick={approveToken}
              disabled={tokenAmount === 0 || isApproved}
              className="px-4 py-2 m-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
            >
              Approve Tokens
            </button>
            <button
              onClick={addLiquidity}
              className="px-4 py-2 m-2 font-bold text-white bg-purple-500 rounded hover:bg-purple-700"
            >
              Add Liquidity
            </button>
          </div>
        </div>
      )}
      <p className="p-2 mt-2 mb-10 font-mono font-medium ">
        Made by{' '}
        <a
          className="text-blue-900 underline"
          href="https://github.com/shryasss"
        >
          @shryasss
        </a>
      </p>
    </div>
  )
}

export default Home

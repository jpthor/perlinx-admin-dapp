import Web3 from 'web3'
import PerlinX from '../artifacts/PerlinXRewards.json'
import Token from '../artifacts/Token.json'
import UniswapPair from '../artifacts/IUniswapV2Pair.json'
import UniswapRouter from '../artifacts/UniswapRouter.json'
import UMA from '../artifacts/UMAEMP.json'
import UmaFactory from '../artifacts/umaFactory.json'

// listedPools -> pools to show, from perlAdmin
// listedTokens -> assets to show, from the pools
// poolsData -> pool info, from Uniswap
// getPoolData -> specific pool info, sorted by address
// tokenData -> token info: ETH, PERL, pool tokens, synthetic tokens
// walletData -> wallet info, balances on wallet
export const ADMIN_ADDR = '0x4d523C380B76386c9e41D7F92456CcE6c712Db87'
export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
export const PERL_ADDR = '0xB7b9568073C9e745acD84eEb30F1c32F74Ba4946'
export const ERC20_ABI = Token.abi
export const PERLX_ADDR = '0x06E0866002260ad6493161949C1f535Cfc88C4dE'
export const PERLX_ABI = PerlinX.abi
export const UNISWAP_PAIR_ABI = UniswapPair.abi
export const UNISWAP_ROUTER_ADDR = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
export const UNISWAP_ROUTER_ABI = UniswapRouter
export const UMA_ABI = UMA
export const UMA_FACTORY_ADDR = '0x0139d00c416e9F40465a95481F4E36422a0A5fcc'
export const UMA_FACTORY_ABI = UmaFactory

export const getWeb3 = () => {
    return new Web3(Web3.givenProvider || "http://localhost:8545")
}

export const getEtherscanURL = () => {
    return "https://kovan.etherscan.io/"
}

export const getAccountArray = async () => {
    var web3 = getWeb3()
    var accounts = await web3.eth.getAccounts()
    return accounts
}

export const getETHBalance = async (acc) => {
    var web3 = getWeb3()
    var bal = await web3.eth.getBalance(acc)
    return bal
}

export const getTokenContract = (address) => {
    var web3 = getWeb3()
    return new web3.eth.Contract(ERC20_ABI, address)
}

export const getUniswapContract = () => {
    var web3 = getWeb3()
    return new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDR)
}

export const getPerlinXContract = () => {
    var web3 = getWeb3()
    return new web3.eth.Contract(PERLX_ABI, PERLX_ADDR)
}

export const getEMPContract = (address) => {
    var web3 = getWeb3()
    return new web3.eth.Contract(UMA_ABI, address)
}

export const getCDPContract = () => {
    var web3 = getWeb3()
    return new web3.eth.Contract(PERLX_ABI, PERLX_ADDR)
}

export const getUmaContract = () => {
    var web3 = getWeb3()
    return new web3.eth.Contract(UMA_FACTORY_ABI, UMA_FACTORY_ADDR)
}

export const getListedPools = async ()  => {
    var web3 = getWeb3()
    var contract = new web3.eth.Contract(PERLX_ABI, PERLX_ADDR)
    var poolCount = await contract.methods.poolCount().call()
    let poolArray =  []
    for(let i = 0; i<poolCount; i++){
        let pool = await contract.methods.arrayPerlinPools(i).call()
        let listed = await contract.methods.poolIsListed(pool).call()
        if(listed){
            poolArray.push(pool)
        }
    }
    console.log({poolArray})
    return poolArray
}

export const getListedTokens = async (poolArray)  => {
    var web3 = getWeb3()
    let tokenArray =  []
    for(let i = 0; i<poolArray.length; i++){
        var contractPool = new web3.eth.Contract(UNISWAP_PAIR_ABI, poolArray[i])
        var token = await contractPool.methods.token0().call()
        if(token === PERL_ADDR){
            token = await contractPool.methods.token1().call()
        }
        tokenArray.push(token)
    }
    console.log({tokenArray})
    return tokenArray
}
export const getListedSynths = async ()  => {
    var web3 = getWeb3()
    var contract = new web3.eth.Contract(PERLX_ABI, PERLX_ADDR)
    let count = await contract.methods.synthCount().call()
    let synthArray =  []
    for(let i = 0; i<count; i++){
        var synth = await contract.methods.arraySynths(i).call()
        synthArray.push(synth)
    }
    console.log({synthArray})
    return synthArray
}

export const getEMP = async (synth)  => {
    var web3 = getWeb3()
    var contract = new web3.eth.Contract(PERLX_ABI, PERLX_ADDR)
    var emp = await contract.methods.mapSynth_EMP(synth).call()
    return emp
}

export const getPoolsData = async (poolArray, tokenArray) => {
    var web3 = getWeb3()
    var contractPerl = new web3.eth.Contract(ERC20_ABI, PERL_ADDR)
    let poolsData =  []
    for(let i = 0; i<poolArray.length; i++){
        var contractPool = new web3.eth.Contract(UNISWAP_PAIR_ABI, poolArray[i])
        // let token = await contractPool.methods.token0().call()
        // if(token === PERL_ADDR){
        //     token = await contractPool.methods.token1().call()
        // }
        var contractToken = new web3.eth.Contract(ERC20_ABI, tokenArray[i])
        let symbol = await contractToken.methods.symbol().call()
        let name = await contractToken.methods.name().call()
        let depth = await contractPerl.methods.balanceOf(poolArray[i]).call() 
        let balance = await contractToken.methods.balanceOf(poolArray[i]).call() 
        let units = await contractPool.methods.totalSupply().call() 
        let poolData = {
            'symbol': symbol,
            'name': name,
            'address': tokenArray[i],
            'addressPool':poolArray[i],
            'price': depth/balance,
            'volume': '230001120000000000000000',
            'depth': depth,
            'balance':balance,
            'txCount': 12,
            'roi': 0.23,
            'units':units,
         }
        poolsData.push(poolData)
    }
    console.log({poolsData})
    return poolsData
}

export const getPoolData = async(address, pools) =>{
    const pool = pools.find((item) => item.address === address)
    return (pool)
}

export const getWalletData = async (poolArray, tokenArray) => {
    var account = await getAccountArray()
    var address = account[0]
    var accountBalance = await getETHBalance(address)
    var tokens = []
    var stakes = []
    var walletData = {
        'address': address,
        'tokens': tokens,
        'stakes': stakes
    }
    tokens.push({
        'symbol':'ETH',
        'name':'Ethereum',
        'balance': accountBalance,
        'address': '0x0000000000000000000000000000000000000000'
    })
    tokens.push({
        'symbol':'PERL',
        'name':'Perlin',
        'balance': await getTokenContract(PERL_ADDR).methods.balanceOf(address).call(),
        'address': PERL_ADDR
    })
    for(var i = 0; i < tokenArray?.length; i++){
        let contract = getTokenContract(tokenArray[i])
        var tokenSymbol = await contract.methods.symbol().call()
        var tokenName = await contract.methods.name().call()
        var tokenBalance = await contract.methods.balanceOf(address).call()
        var tokenAddress = tokenArray[i]
        
        tokens.push({
            'symbol':tokenSymbol,
            'name':tokenName, 
            'balance':tokenBalance,
            'address': tokenAddress })
    }
    for(i = 0; i < poolArray?.length; i++){
        let contract = getTokenContract(poolArray[i])
        tokenSymbol = await contract.methods.symbol().call()
        tokenName = await contract.methods.name().call()
        tokenBalance = await contract.methods.balanceOf(address).call()
        tokenAddress = poolArray[i]
        
        stakes.push({
            'symbol':tokenSymbol,
            'name':tokenName, 
            'balance':tokenBalance,
            'address': tokenAddress })
    }
    console.log(walletData)
    return walletData
}
export const getWalletTokenData = async(address, walletData) => {
    const tokenData = walletData.tokens.find((item) => item.address === address)
    return (tokenData)
}
export const getWalletStakeData = async(address, walletData) => {
    const tokenData = walletData.stakes.find((item) => item.address === address)
    return (tokenData)
}
export const getTokenSymbol = async (address, walletData) => {
    const Token = walletData.tokens.find((item) => item.address === address)
    return (Token.symbol)
}

export const getAllCDPs = async() => {
    let synthArray = await getListedSynths()
    var CDPData = []
    for(var i = 0; i < synthArray.length; i++){
        let emp = await getEMP(synthArray[i])
        var contract = await getEMPContract(emp)
        let position = await contract.methods.positions(ADMIN_ADDR).call()
        let debt = position.tokensOutstanding
        let collateral = position.rawCollateral
         CDPData.push({
             'cdp': i,
             'debt': debt,
             'collateral': collateral,
             'address' : ADMIN_ADDR,
             'canLiquidate': (i%2===0) ? 'UnSafe' : 'Safe'
            })
    }
    // console.log({CDPData})
    return CDPData
}
export const getAccountCDP = async (address) =>{
    const CDPs = await getAllCDPs()
    const cdp = CDPs.find((item) => item.address === address)
    return (cdp)
}
export const getUnSafeCDPs = async() =>{
    // const CDPs = getAllCDPs()
    // const unSafeCDP = CDPs.filter((item) => item.canLiquidate === "true")
    // return (unSafeCDP)
}
export const getSafeCDPs = async() =>{
    // const CDPs = getAllCDPs()
    // const SafeCDP = CDPs.filter((item) => item.canLiquidate === "false")
    // return (SafeCDP)
}

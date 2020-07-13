import React, { useEffect, useState, useContext } from 'react'
import { Context } from '../../context'

import { Tabs, Row, Col, Input } from 'antd'
import { paneStyles, colStyles } from '../components/styles'
import {
    H1, H2, HR, Subtitle, Text, LabelGroup, Button
} from '../components/elements';
import { convertFromWei, convertToWei } from '../../utils'
import { PERL_ADDR, getPerlinXContract, getTokenContract, PERLX_ADDR } from '../../client/web3'

import NewEMP from './EMP'
const { TabPane } = Tabs;

const Admin = () => {

    return (
        <div>
            <H1>Admin Controls</H1>
            <HR />
            <Tabs defaultActiveKey="1">
                <TabPane tab="OVERVIEW" key="1">
                    <Overview />
                </TabPane>
                <TabPane tab="REWARDS" key="2">
                    <Rewards />
                </TabPane>
                <TabPane tab="CURATE POOLS" key="3">
                    <Curate />
                </TabPane>
                <TabPane tab="NEW SYNTH" key="4">
                    <NewEMP />
                </TabPane>
                <TabPane tab="CONFIG" key="5">
                    <Config />
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Admin

const Overview = (props) => {

    const context = useContext(Context)
    const [arrayPools, setArrayPools] = useState([])
    const [arrayPoolBalances, setArrayPoolBalances] = useState([])
    const [arrayPoolListed, setArrayPoolListed] = useState([])
    const [arrayPoolFactor, setArrayPoolFactor] = useState([])
    const [perlBalance, setPerlBalance] = useState(null)
    const [perlinXData, setPerlinXData] = useState({
        "rewards": "",
        "weeks": "",
        "currentWeek": "",
        "poolCount": "",
        "memberCount": "",
        "adminAddr": "",
        "perlinAddr": "",
    })

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getData = async () => {

        let contract = getPerlinXContract()
        //let rewards = await contract.methods.TOTALREWARD().call()
        let weeks = await contract.methods.WEEKS().call()
        let currentWeek = await contract.methods.currentWeek().call()
        let poolCount = await contract.methods.poolCount().call()
        let memberCount = await contract.methods.memberCount().call()
        let adminAddr = await contract.methods.perlinAdmin().call()
        let perlinAddr = await contract.methods.PERL().call()

        let contractPerl = getTokenContract(PERL_ADDR)
        // let contractAddrPX = getContractAddrs(0)
        let rewards = await contractPerl.methods.balanceOf(PERLX_ADDR).call()
        setPerlBalance(rewards)

        let perlinXData = {
            "rewards": convertFromWei(rewards),
            "weeks": weeks,
            "currentWeek": currentWeek,
            "poolCount": poolCount,
            "memberCount": memberCount,
            "adminAddr": adminAddr,
            "perlinAddr": perlinAddr,
        }
        context.setContext({ 'perlinXData': perlinXData })
        setPerlinXData(perlinXData)
        let arrayPools = []
        let arrayPoolBalances = []
        let arrayPoolListed = []
        let arrayPoolFactor = []
        for (let i = 0; i < poolCount; i++) {
            let pool = await contract.methods.arrayPerlinPools(i).call()
            arrayPools.push(pool)
            let contractToken = getTokenContract(pool)
            let balance = await contractToken.methods.balanceOf(PERLX_ADDR).call()
            arrayPoolBalances.push(convertFromWei(balance))
            let listed = await contract.methods.poolIsListed(pool).call()
            arrayPoolListed.push(listed ? "true" : "false")
            let factor = await contract.methods.poolFactor(pool).call()
            arrayPoolFactor.push(factor)
        }
        setArrayPools(arrayPools)
        setArrayPoolBalances(arrayPoolBalances)
        setArrayPoolListed(arrayPoolListed)
        setArrayPoolFactor(arrayPoolFactor)
        context.setContext({ 'arrayPools': arrayPools })
    }

    return (
        <div>
            <Row style={paneStyles}>
                <Col xs={24} style={colStyles}>
                    <Row>
                        <Col xs={4} style={colStyles}>
                            <LabelGroup title={convertFromWei(perlBalance)} label={'REWARDS LEFT'} />
                        </Col>
                        <Col xs={4} style={colStyles}>
                            <LabelGroup title={perlinXData?.weeks} label={'WEEKS'} />
                        </Col>
                        <Col xs={4} style={colStyles}>
                            <LabelGroup title={(perlinXData?.rewards / perlinXData?.weeks).toFixed(2)} label={'WEEKLY REWARDS'} />
                        </Col>
                        <Col xs={4} style={colStyles}>
                            <LabelGroup title={perlinXData?.currentWeek} label={'CURRENT WEEK'} />
                        </Col>
                        <Col xs={4} style={colStyles}>
                            <LabelGroup title={perlinXData?.memberCount} label={'MEMBER COUNT'} />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} lg={8} style={colStyles}>
                            <LabelGroup label={perlinXData?.adminAddr} title={'ADMIN ADDR'} />
                        </Col>
                        <Col xs={24} lg={8} style={colStyles}>
                            <LabelGroup label={perlinXData?.perlinAddr} title={'PERL ADDR'} />
                        </Col>
                        <Col xs={24} lg={8} style={colStyles}>
                            <LabelGroup label={PERLX_ADDR} title={'PERLINX ADDR'} />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} lg={12} style={colStyles}>
                            <H2>APPROVED POOLS ({perlinXData?.poolCount})</H2><br />
                            <Text>{arrayPools[0]}</Text>&nbsp;<Text>({(arrayPoolBalances[0])})</Text>&nbsp;<Text>{arrayPoolListed[0]}</Text>&nbsp;<Text>{arrayPoolFactor[0]}</Text>
                            <br />
                            <Text>{arrayPools[1]}</Text>&nbsp;<Text>({(arrayPoolBalances[1])})</Text>&nbsp;<Text>{arrayPoolListed[1]}</Text>&nbsp;<Text>{arrayPoolFactor[1]}</Text>
                            <br />
                            <Text>{arrayPools[2]}</Text>&nbsp;<Text>({(arrayPoolBalances[2])})</Text>&nbsp;<Text>{arrayPoolListed[2]}</Text>&nbsp;<Text>{arrayPoolFactor[2]}</Text>
                            <br />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

const Rewards = (props) => {

    const context = useContext(Context)
    const [approvalAmt, setApprovalAmt] = useState(null)
    const [perlBalance, setPerlBalance] = useState(null)
    const [reward, setReward] = useState(null)
    const [perlinXData, setPerlinXData] = useState({
        "rewards": "",
        "weeks": "",
        "currentWeek": "",
        "poolCount": "",
        "memberCount": "",
        "adminAddr": "",
        "perlinAddr": "",
    })

    useEffect(() => {
        getData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getData = async () => {

        let contract = getPerlinXContract()
        //let rewards = await contract.methods.TOTALREWARD().call()
        let weeks = await contract.methods.WEEKS().call()
        let currentWeek = await contract.methods.currentWeek().call()
        let poolCount = await contract.methods.poolCount().call()
        let memberCount = await contract.methods.memberCount().call()
        let adminAddr = await contract.methods.perlinAdmin().call()
        let perlinAddr = await contract.methods.PERL().call()

        let contractPerl = getTokenContract(PERL_ADDR)
        // let contractAddrPX = getContractAddrs(0)
        let approvalAmt = await contractPerl.methods.allowance(adminAddr, PERLX_ADDR).call()
        setApprovalAmt(approvalAmt)
        let rewards = await contractPerl.methods.balanceOf(PERLX_ADDR).call()
        setPerlBalance(rewards)

        let perlinXData = {
            "rewards": convertFromWei(rewards),
            "weeks": weeks,
            "currentWeek": currentWeek,
            "poolCount": poolCount,
            "memberCount": memberCount,
            "adminAddr": adminAddr,
            "perlinAddr": perlinAddr,
        }
        context.setContext({ 'perlinXData': perlinXData })
        setPerlinXData(perlinXData)
        let arrayPools = []
        let arrayPoolBalances = []
        let arrayPoolListed = []
        let arrayPoolFactor = []
        for (let i = 0; i < poolCount; i++) {
            let pool = await contract.methods.arrayPerlinPools(i).call()
            arrayPools.push(pool)
            let contractToken = getTokenContract(pool)
            let balance = await contractToken.methods.balanceOf(PERLX_ADDR).call()
            arrayPoolBalances.push(convertFromWei(balance))
            let listed = await contract.methods.poolIsListed(pool).call()
            arrayPoolListed.push(listed ? "true" : "false")
            let factor = await contract.methods.poolFactor(pool).call()
            arrayPoolFactor.push(factor)
        }
        context.setContext({ 'arrayPools': arrayPools })
    }

    const onRewardChange = (e) => {
        setReward(convertToWei(e.target.value))
    }
    const approveAll = async () => {
        // let contractAddrPX = getContractAddrs(0)
        let contractPerl = getTokenContract(PERL_ADDR)
        let totalSupply = await contractPerl.methods.totalSupply().call()
        await contractPerl.methods.approve(PERLX_ADDR, totalSupply).send({ from: context.walletData?.address })
        let approvalAmt = await contractPerl.methods.allowance(perlinXData.adminAddr, PERLX_ADDR).call()
        setApprovalAmt(approvalAmt)
    }
    const addReward = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        console.log(reward)
        await contract.methods.addReward(reward).send({ from: context.walletData?.address, to: PERLX_ADDR })
        getData()
    }
    const removeReward = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.removeReward(reward).send({ from: context.walletData?.address, to: PERLX_ADDR })
        getData()
    }
    const removeAll = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        let contractPerl = getTokenContract(PERL_ADDR)
        let reward = await contractPerl.methods.balanceOf(PERLX_ADDR).call()
        await contract.methods.removeReward(reward).send({ from: context.walletData?.address, to: PERLX_ADDR })
        getData()
    }

    const snapshot = async () => {
        let contract = getPerlinXContract()
        await contract.methods.snapshotPools().send({ from: context.walletData?.address })
        getData()
    }

    return (
        <div>

            <Row style={paneStyles}>
                <Col xs={24} style={colStyles}>
                    <Row>
                        <Col xs={12} style={colStyles}>
                            <Subtitle>Add PERL Reward</Subtitle>
                            <Input placeholder={'enter amount'} onChange={onRewardChange}></Input><br />
                            <Text>Approval: {convertFromWei(approvalAmt)}</Text><br />
                            <Button type={'secondary'} onClick={approveAll}>APPROVE</Button>
                            <Button type={'primary'} onClick={addReward}>ADD REWARD</Button><br />
                            <br />
                            <Subtitle>Remove PERL Reward</Subtitle>
                            <Input placeholder={'enter amount'} onChange={onRewardChange}></Input>
                            <Text>PERL Balance: {convertFromWei(perlBalance)}</Text><br />
                            <Button type="dashed" danger onClick={removeReward}>REMOVE REWARD</Button>
                            <Button type={'danger'} onClick={removeAll}>REMOVE ALL</Button><br />
                        </Col>
                        <Col xs={12} style={colStyles}>
                            <Subtitle>Snapshot weekly rewards</Subtitle><br />
                            <Button type={'primary'} onClick={snapshot}>SNAPSHOT</Button><br />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

const Curate = (props) => {

    const context = useContext(Context)
    const [pool, setPool] = useState(null)
    const [token, setToken] = useState(null)
    const [EMP, setEMP] = useState(null)
    const [factor, setFactor] = useState(100)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onPoolChange = (e) => {
        setPool(e.target.value)
    }
    const onTokenChange = (e) => {
        setToken(e.target.value)
    }
    const onEMPChange = (e) => {
        setEMP(e.target.value)
    }
    const onFactorChange = (e) => {
        setFactor(e.target.value * 10)
    }
    const listPool = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.listPool(pool, token, factor).send({ from: context.walletData?.address, to: PERLX_ADDR })
    }
    const listSynthPool = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.listSynthPool(pool, token, EMP, factor).send({ from: context.walletData?.address, to: PERLX_ADDR })
    }
    const delistPool = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.delistPool(pool).send({ from: context.walletData?.address, to: PERLX_ADDR })
    }

    return (
        <div>

            <Row style={paneStyles}>
                <Col xs={24} style={colStyles}>

                    <Subtitle>List a TOKEN pool (must be listed on UNISWAP V2 first)</Subtitle>
                    <Input placeholder={'enter uniswap exchange address'} onChange={onPoolChange}></Input>
                    <Input placeholder={'enter corresponding non-PERL token address'} onChange={onTokenChange}></Input>
                    <Input placeholder={'enter pool weight (between 0.1 and 10, where 1 == normal)'} onChange={onFactorChange}></Input>
                    <Button type={'primary'} onClick={listPool}>LIST POOL</Button><br />
                    <br />
                    <Subtitle>List a SYNTH pool (must be listed on UNISWAP V2 first)</Subtitle>
                    <Input placeholder={'enter uniswap exchange address'} onChange={onPoolChange}></Input>
                    <Input placeholder={'enter corresponding synth address'} onChange={onTokenChange}></Input>
                    <Input placeholder={'enter EMP address'} onChange={onEMPChange}></Input>
                    <Input placeholder={'enter pool weight (between 0.1 and 10, where 1 == normal)'} onChange={onFactorChange}></Input>
                    <Button type={'primary'} onClick={listSynthPool}>LIST SYNTH POOL</Button><br />
                    <br />
                    <Subtitle>Delist any PERL pool</Subtitle>
                    <Input placeholder={'enter address'} onChange={onPoolChange}></Input>
                    <Button type={'danger'} onClick={delistPool}>DELIST POOL</Button><br />
                </Col>
            </Row>
        </div>
    )
}

const Config = (props) => {

    const context = useContext(Context)
    const [newAdmin, setNewAdmin] = useState(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onAdminChange = (e) => {
        setNewAdmin(e.target.value)
    }
    const addAdmin = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.addAdmin(newAdmin).send({ from: context.walletData?.address, to: PERLX_ADDR })
    }
    const transferAdmin = async () => {
        let contract = getPerlinXContract()
        // let contractAddr = getContractAddrs(0)
        await contract.methods.transferAdmin(newAdmin).send({ from: context.walletData?.address, to: PERLX_ADDR })
    }

    return (
        <div>
            <Row style={paneStyles}>
                <Col xs={24} style={colStyles}>
                    <Row>
                        <Col xs={12} style={colStyles}>
                            <Subtitle>Add Admin</Subtitle>
                            <Input placeholder={'enter new admin'} onChange={onAdminChange}></Input>
                            <Button type={'secondary'} onClick={addAdmin}>ADD ADMIN</Button><br />
                            <br />

                        </Col>
                        <Col xs={12} style={colStyles}>
                            <Subtitle>Transfer Admin Rights</Subtitle>
                            <Input placeholder={'enter address'} onChange={onAdminChange}></Input>
                            <Button type={'danger'} onClick={transferAdmin}>TRANSFER ADMIN</Button><br />
                            <br />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}


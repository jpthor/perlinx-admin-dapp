import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../context'

import Web3 from 'web3'

import { getAddressShort } from '../../utils'
import { Link } from "react-router-dom";
import { Row, Col, Button, Layout, Menu, Drawer } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import WalletDrawer from './WalletDrawer'
import '../../App.css';

import { getListedPools, getListedTokens, getPoolsData, getWalletData } from '../../client/web3'

const { Header } = Layout;

const Headbar = (props) => {

    const context = useContext(Context)
    const [connecting, setConnecting] = useState(false)
    const [connected, setConnected] = useState(false)
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // checkConnected()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.walletData, context.transaction])

    const connectWallet = async () => {
        setConnecting(true)
        window.web3 = new Web3(window.ethereum);
        const accountConnected = (await window.web3.eth.getAccounts())[0];
        if (accountConnected) {
            let poolArray = context.poolArray ? context.poolArray : await getListedPools()
            let tokenArray = context.tokenArray ? context.tokenArray : await getListedTokens(poolArray)
            let poolsData = context.poolsData ? context.poolsData : await getPoolsData(poolArray, tokenArray)
            if (!context.poolsData) {
                context.setContext({ 'poolArray': poolArray })
                context.setContext({ 'tokenArray': tokenArray })
                context.setContext({ 'poolsData': poolsData })
            }

            let walletData = await getWalletData(poolArray, tokenArray)
            context.setContext({ walletData: walletData })
            context.setContext({ connected: true })
            setConnecting(false)
            setConnected(true)
        } else {
            await ethEnabled()
            setConnected(false)
        }
    }

    const ethEnabled = () => {
        console.log('connecting')
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
            return true;
        }
        return false;
    }

    const addr = () => {
        //console.log(context.BASEData)
        return getAddressShort(context.walletData?.address)
    }

    const showDrawer = () => {
        setVisible(true);
    };
    const onClose = () => {
        setVisible(false);
    };

    return (
        <Header>
            <Row>
                <Col xs={20}>
                    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1">
                            <Link to={"/admin"}>ADMIN</Link>
                        </Menu.Item>
                    </Menu>
                </Col>
                <Col xs={4} style={{ textAlign: 'right' }}>
                    {!connected && !connecting &&
                        <Button type="primary" onClick={connectWallet}>CONNECT</Button>
                    }
                    {connecting &&
                        <Button type="primary" icon={<LoadingOutlined />}>CONNECTING</Button>
                    }
                    {connected &&
                        <Button type="primary" icon={<UserOutlined />} onClick={showDrawer}>{addr()}</Button>
                    }
                </Col>
            </Row>
            <Drawer
                title={context.walletData?.address}
                placement="right"
                closable={false}
                onClose={onClose}
                visible={visible}
                width={350}
            >
                <WalletDrawer />
            </Drawer>

        </Header>
    )
}

export default Headbar
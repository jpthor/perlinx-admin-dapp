import React, { useEffect, useContext,useState } from 'react';
import { Context } from '../../context'
//  import { convertFromWei } from '../../utils'
import { Tabs, Table, Row, Col, Button, Divider } from 'antd';
 import { Label, Center } from '../components/elements';
import { CoinRow, CDPDetails } from '../components/common';
import { Link } from 'react-router-dom'
import {getStakeData} from '../../client/web3_old'
import { getWalletData } from '../../client/web3'
import { EditOutlined, PlusCircleOutlined} from '@ant-design/icons';
const { TabPane } = Tabs;

const DrawerContent = (props) => {
    const context = useContext(Context)
    
    useEffect(() => {   
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.transaction])


    function callback(key) {
        console.log(key);
    }

    return (
        <>
            <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="ASSETS" key="1">
                    <AssetTable />
                </TabPane>
                <TabPane tab="STAKES" key="2">
                    <StakeTable />
                </TabPane>
                <TabPane tab="CDPS" key="3">
                    <CDPTable />
                </TabPane>
            </Tabs>
        </>
    );
};

export default DrawerContent

export const AssetTable = () => {

    const context = useContext(Context)
    useEffect(() => {
        // updateWallet()
        // eslint-disable-next-line react-hooks/exhaustive-deps
        console.log(context.walletData)
    }, [context.transaction])
    
    // const updateWallet = async () => {
    //     context.setContext({ wallet: await getWalletData() })
    // }
    const columns = [
        {
            render: (record) => (
                <div>
                    <CoinRow
                            symbol={record.symbol}
                            name={record.name}
                            balance={record.balance}
                            size={32} />
                </div>
            )
        }
    ]

    return (
        <div>
            <Table dataSource={context.walletData.tokens}
                pagination={false}
                showHeader={false}
                columns={columns}
                rowKey="symbol" />
        </div>
    )
}

export const StakeTable = () => {

    const context = useContext(Context)

    useEffect(() => {
        getStakes()
        // console.log(context.stakes)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getStakes = async() => {
        context.setContext({stakes:await getStakeData()})
    }

    const columns = [
        {
            render: (record) => (
                <div>
                    <CoinRow
                            symbol={record.symbol}
                            name={record.name}
                            balance={record.balance}
                            size={32} />
                </div>
            )
        }
    ]

    return (
        <div>
            <Table dataSource={context.walletData.stakes}
                pagination={false}
                showHeader={false}
                columns={columns}
                rowKey="symbol" />
        </div>
    )
}
export const CDPTable = () => {
    const context = useContext(Context)
    const [CDPflag, setCDPFlag] = useState(null)

    useEffect(() => {
        checkCDP()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context.accountCDP])
    
    
    const checkCDP = () => {
        if(context.accountCDP){
            setCDPFlag(true)
        }else{
            setCDPFlag(false)
        }
 
    }
  
    return (
        <div>
            {CDPflag && 
            <Row  >
                <Col span={24}>
                <Divider><Label>Collateral</Label></Divider>
            <CDPDetails
            symbol={"ETH"}
            name={"Ethereum"}
            balance={context.accountCDP?.collateral}
            size={32}
            />
            <br></br>
            <Divider><Label>Debt</Label></Divider>
            
            <CDPDetails
            symbol={"MAI"}
            name={"MAI Token"}
            balance={context.accountCDP?.debt}
            size={32} />
            <Link to={"/asset/manage"}>
            <Center>
                <Button icon={< EditOutlined/>} style={{marginTop: 20}} type="primary"> Manage</Button>
                </Center>
                </Link>
            </Col>

           </Row>
        }
     
        {!CDPflag &&
        <Link to={"/asset/mint"}>
            <Center>
        <Button icon={<PlusCircleOutlined/>}type="primary" >MINT</Button>
        </Center>
        </Link>
        }
        
                
        </div>
    )
}
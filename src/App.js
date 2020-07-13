import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from 'antd';
import './App.css';
import 'antd/dist/antd.css'
import { Colour } from './ui/components/elements'

import Headbar from './ui/layout/Headbar'

import Admin from './ui/pages/Admin'

import { ContextProvider } from './context'

const { Content } = Layout;

const contentStyles = {
	background: Colour().white,
	color: '#000',
	padding:20,
}

const App = () => {
	return (
		<Router>
			<div>
				<ContextProvider>
					<Layout style={{ height: "100vh", background:Colour().offwhite }}>
						<Headbar />
						<Content style={contentStyles}>
							<Switch>
								<Route path="/admin" exact component={Admin} />
							</Switch>
						</Content>
					</Layout>
				</ContextProvider>
			</div>
		</Router>
	);
}

export default App;

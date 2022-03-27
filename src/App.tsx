import React, { useEffect, useState } from 'react';
import { useMoralis } from "react-moralis";
import { isMobile } from 'react-device-detect';
import WalletLinkConnector from './WalletLinkConnector';
import Account from './components/Account/Account';
import TokenPrice from './components/TokenPrice';
import { Layout, Tabs, Spin, Row, Col } from "antd";
import "antd/dist/antd.css";
import NativeBalance from './components/NativeBalance';
import './style.css';
import MyLoader from './MyLoader';
import AuctionRoom from './components/Room/AuctionRoom';
import { CreatorPage } from './components/CreatorPage/CreatorPage';
import { Route, Routes } from 'react-router-dom';
import { getActiveRooms } from './contractutils/executeContractFunction';
import logo from "./assets/logo.png";
const { Header, Footer } = Layout;


const styles = {
	content: {
	  fontFamily: "Roboto, sans-serif",
	  color: "#041836",
	  marginTop: "70px",
	  padding: "10px",
	},
	header: {
	  position: "fixed",
	  zIndex: 1,
	  width: "100%",
	  background: "#fff",
	  display: "flex",
	  justifyContent: "space-between",
	  alignItems: "center",
	  fontFamily: "Roboto, sans-serif",
	  borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
	  padding: "0 10px",
	  boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
	},
	headerRight: {
	  display: "flex",
	  gap: "20px",
	  alignItems: "center",
	  fontSize: "15px",
	  fontWeight: "600",
	},
	spinner: {
		margin: 0,
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)'
	}
  };


function App() {

	const [loading, setLoading] = useState(true);
	const [overlayLoaderActive, setOverlayLoaderActive] = useState(false);

	const [activeAuctionRooms, setActiveAuctionRooms] = useState([]);

	const [intervalId, setIntervalId] = useState(null);

	const CoinbaseWallet = new WalletLinkConnector();

	const { authenticate, isAuthenticated, isAuthenticating, user, account, logout, Moralis, isWeb3Enabled, enableWeb3, isWeb3EnableLoading  } = useMoralis();

	useEffect(() => {
		const connectorId = window.localStorage.getItem("connectorId");
		if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
			//@ts-ignore
			enableWeb3({ provider: connectorId }).then((userObj: any) => {

				setLoading(false)

				getActiveRooms(Moralis).then((res: any[]) => {
					setActiveAuctionRooms(res)
				})
				.catch((err: any) => {
					console.log("error fetching rooms: ", err)
				})

				getCurrentActiveRooms()
				const id = setInterval(() => getCurrentActiveRooms(), 5000)
				setIntervalId(id)
			})
			.catch((err: any) => {
				console.log("error: ", err)
			  	setLoading(false)
			});

		} else {
			setLoading(false)
		}
		
		return () => {
			clearInterval(intervalId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, [isAuthenticated, isWeb3Enabled]);

	const getCurrentActiveRooms = () => {
		getActiveRooms(Moralis).then((res: any[]) => {
			setActiveAuctionRooms(res)
		})
		.catch((err: any) => {
			console.log("error fetching rooms: ", err)
		})
	}

	return (
		<Layout style={{ height: "100vh", maxHeight: "100vh", overflow: "auto" }}>

			{
				loading 
				//@ts-ignore
				? <Spin size="large" style={styles.spinner} />
				: <>
					<MyLoader active={overlayLoaderActive}>

						{/* @ts-ignore */}
						<Header style={styles.header}>
							<Logo />
							<div style={styles.headerRight}>
								<NativeBalance />
								<Account setOverlayLoaderActive={setOverlayLoaderActive} />
							</div>
						</Header>

						<Layout style={styles.content}>

							<Routes>
								<Route path="/" element={<CreatorPage activeAuctionRooms={activeAuctionRooms} setLoading={setOverlayLoaderActive}/>} />
								<Route path={`/:address`} element={<AuctionRoom setLoading={setLoading} />} />
							</Routes>

						</Layout>

					</MyLoader>
				</>
			}
			
		</Layout>
	);
}

export const Logo = () => (
	<div style={{ display: "flex" }}>
		<img width={"50%"} height={"33%"} src={logo} alt={"The Attik"}/>
	</div>
  );

export default App;
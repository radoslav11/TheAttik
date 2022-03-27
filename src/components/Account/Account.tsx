import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "../../helpers/formatters";
import Blockie from "../Blockie";
import { Button, Card, Modal } from "antd";
import { useState } from "react";
import Address from "../Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "../../helpers/networks";
import Text from "antd/lib/typography/Text";
import { connectors } from "./config";
import WalletLinkConnector from "../../WalletLinkConnector";
import WalletLinkConnectorMobile from "../../WalletLinkConnectorMobile";
import { isMobile, isSafari, isMobileSafari } from "react-device-detect";
import { activateInjectedProvider } from "../../InjectedWalletHandler";

const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: "#21BF96",
  },
  connector: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "auto",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "20px 5px",
    cursor: "pointer",
  },
  icon: {
    alignSelf: "center",
    fill: "rgb(40, 13, 95)",
    flexShrink: "0",
    marginBottom: "8px",
    height: "30px",
  },
};

const CoinbaseWalletConnector = new WalletLinkConnector()

function Account(props: any) {

  const { authenticate, isAuthenticated, account, chainId, logout, Moralis } = useMoralis();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const handleMobileClick = (connectorId: string, login: any) => {
    switch (connectorId) {
      case "walletlink":
        window.open(`https://go.cb-w.com/dapp?cb_url=${encodeURIComponent("https://master.dpt78yh95ixsf.amplifyapp.com/")}`);
        // window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent("https://master.dpt78yh95ixsf.amplifyapp.com/")}`
        break;
      case "injected":
        break;
      case "walletconnect":
        handleNativeClick(connectorId, login);
        break;
      default:
        break;
    }
      
  }

  const handleNativeClick = async (connectorId: string, login: any) => {
    try {
      props.setOverlayLoaderActive(true);
      if (connectorId == "walletlink") {
        console.log("WALLET LINK COINBASE")
        await login(Moralis, WalletLinkConnector)
      }
      else {

        if (typeof window.ethereum !== "undefined") {
          let provider = window.ethereum;
          // edge case if MM and CBW are both installed
    
          //@ts-ignore
          if (window.ethereum.providers?.length) {
            //@ts-ignore
            window.ethereum.providers.forEach(async (p) => {
              if (p.isMetaMask) provider = p;
            });
          }
          await provider.request({
            method: "eth_requestAccounts",
            params: [],
          });
        
          await login(Moralis, provider)
        }
      }
      // connectorId == "walletlink" ? await login(Moralis, CoinbaseWalletConnector) : await login(Moralis)

      window.localStorage.setItem("connectorId", connectorId);
      setIsAuthModalVisible(false);
      window.location.reload();
    } catch (e) {
      props.setOverlayLoaderActive(false)
      console.error(e);
    }
  }

  const handleDisconnect = async () => {
    try {
      props.setOverlayLoaderActive(true)

      await CoinbaseWalletConnector.deactivate()
      await logout();
      window.localStorage.removeItem("connectorId");
      setIsModalVisible(false);
      props.setOverlayLoaderActive(false)
    } catch(err: any) {
      console.log("Failed to log out: ", err)
      props.setOverlayLoaderActive(false)
    }
    
  }

  if (!isAuthenticated || !account) {
    return (
      <>
        <div onClick={() => setIsAuthModalVisible(true)}>
          <p style={styles.text}>Authenticate</p>
        </div>
        <Modal
          visible={isAuthModalVisible}
          footer={null}
          onCancel={() => setIsAuthModalVisible(false)}
          bodyStyle={{
            padding: "15px",
            fontSize: "17px",
            fontWeight: "500",
          }}
          style={{ fontSize: "16px", fontWeight: "500" }}
          width="340px"
        >
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "20px",
            }}
          >
            Connect Wallet
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {connectors.map(({ title, icon, connectorId, mobileEnabled, login }, key) => (
              ((isMobile || isMobileSafari) ? mobileEnabled : true) && <div
                //@ts-ignore
                style={styles.connector}
                key={key}
                onClick={
                  (isMobile || isMobileSafari) && !window?.ethereum
                    ? () => handleMobileClick(connectorId, login) 
                    : () => handleNativeClick(connectorId, login)
                  }
              >
                <img src={icon} alt={title} style={styles.icon} />
                <Text style={{ fontSize: "14px" }}>{title}</Text>
              </div>
            ))}
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        <p style={{ marginRight: "5px", ...styles.text }}>
          {getEllipsisTxt(account, 6)}
        </p>
        <Blockie currentWallet scale={3} />
      </div>
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500",
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width="400px"
      >
        Account
        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
          <Address
            avatar="left"
            size={6}
            copyable
            style={{ fontSize: "20px" }}
          />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a
              href={`${getExplorer(chainId)}/address/${account}`}
              target="_blank"
              rel="noreferrer"
            >
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>
        <Button
          size="large"
          type="primary"
          style={{
            width: "100%",
            marginTop: "10px",
            borderRadius: "0.5rem",
            fontSize: "16px",
            fontWeight: "500",
          }}
          onClick={handleDisconnect}
        >
          Disconnect Wallet
        </Button>
      </Modal>
    </>
  );
}

export default Account;

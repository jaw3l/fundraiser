import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header: React.FC = () => {
  const { connect, disconnect, connected } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rainbow Wallet</Text>
      <ConnectButton
        onPress={connected ? disconnect : connect}
        connected={connected}
      />
    </View>
  );
};

export default Header;
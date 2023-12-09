import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Container, Link, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { getXRPBalance, useXRPLClient } from "@nice-xrpl/react-xrpl";
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreateNft from './CreateNft';
import UserList from './UserList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Admin = () => {
  const [value, setValue] = useState(0);
  const [balance, setBalance] = useState<string>();
  const client = useXRPLClient();
  const navigate = useNavigate();

  const loadBalance = async () => {
    const balance: string = await getXRPBalance(client, import.meta.env.VITE_TEST_SRC_WALLET_ADDRESS);
    console.log("balance: ", balance);
    setBalance(balance);
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log("event: ", event);
    setValue(newValue);
  };

  const handleCreatedNft = () => {
    loadBalance();
  }

  return (
    <>
      <AppBar position="fixed" color="secondary">
        <Container maxWidth="xl">
          <Toolbar>
            <Link color="inherit" onClick={() => { navigate("/") }}>
              <StorefrontIcon sx={{ mr: 1 }} />
            </Link>
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontWeight: 500,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              OnlyYou NFT 管理画面
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
            </Box>

            <Box sx={{ flexGrow: 0, mr: 3 }}>
              <Typography>{balance} XRP</Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ width: 900 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="管理タブ">
            <Tab label="NFT作成" {...a11yProps(0)} />
            <Tab label="顧客一覧" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <CreateNft handleCreatedNft={handleCreatedNft} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <UserList />
        </CustomTabPanel>
      </Box>
    </>
  );
}

export default Admin;

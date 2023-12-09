import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AppBar, Avatar, Box, Button, Container, Drawer, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import { getXRPBalance, useXRPLClient } from '@nice-xrpl/react-xrpl';
import PhotoIcon from '@mui/icons-material/Photo';
import { UserRow, getUser } from '../database/client';
import Order from './Order';
import Asset from './Asset';
import Profile from './Profile';

const settings = ["プロフィール", "ログアウト"];

const Customer = () => {
  const [currentUser, setCurrentUser] = useState<UserRow>();
  const [balance, setBalance] = useState<string>("0");
  const [showOrder, setShowOrder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth0();
  const client = useXRPLClient();

  const loadUserInfo = async () => {
    const userInfo = await getUser(user?.email);
    setCurrentUser(userInfo);
    if (userInfo == undefined)
      return;

    console.log("seed: ", userInfo.seed);
    const balance: string = await getXRPBalance(client, userInfo.wallet);
    console.log("balance: ", balance);
    setBalance(balance);
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleClickOrder = () => {
    setShowOrder(!showOrder);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  }

  const handleAccountClick = (selected: string) => {
    switch (selected) {
      case "ログアウト":
        logout({ logoutParams: { returnTo: window.location.origin } });
        break;
      case "プロフィール":
        setShowProfile(true);
        break;
    }
    setAnchorElUser(null);
  };

  const handleAnchorElUserClose = () => {
    setAnchorElUser(null);
  }

  const handleSaveProfile = () => {
    setShowProfile(false);
    loadUserInfo();
  }

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar>
            <PhotoIcon sx={{ mr: 1 }} />
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
              OnlyYou NFT
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
              {(currentUser != null && currentUser.seed != null) ? (
              <Button
                onClick={handleClickOrder}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {showOrder ? "戻る" :"購入"}
              </Button>
              ) : <></>}
            </Box>

            <Box sx={{ flexGrow: 0, mr: 3 }}>
              <Typography>{balance} XRP</Typography>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="アカウントメニュー">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.email} src={user?.picture} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClick={handleAnchorElUserClose}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={() => handleAccountClick(setting)}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        open={showProfile}
        onClose={handleCloseProfile}
      >
        <Profile handleSaveProfile={handleSaveProfile} />
      </Drawer>
      <Box sx={{paddingTop: 7}}>
        {showOrder ? <Order /> : <Asset />}
      </Box>
    </>
  );
}

export default Customer;

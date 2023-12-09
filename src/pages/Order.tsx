import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Button, Card, CardActionArea, CardContent, CardMedia, Dialog, DialogActions, DialogTitle, Typography, DialogContent } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { addOrder, getStockList, StockRow } from '../database/client';

const Order = () => {
  const [stocks, setStocks] = useState<StockRow[] | undefined>([]);
  const [currentStock, setCurrentStock] = useState<StockRow | undefined>();
  const [complete, setComplete] = useState(false);
  const [sending, setSending] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const { user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    const stocks = await getStockList();
    console.log("stocks: ", stocks);
    if (stocks == null)
      return;

    setStocks(stocks);
  }

  const orderNft = async (stock: StockRow | undefined) => {
    if (user == undefined || user.email == undefined)
      return;

    if (stock == undefined)
      return;

    setSending(true);
    try {
      addOrder({ stockid: stock.id, userid: user?.email, tokenname: stock.name, tokenurl: stock.url, tokenprice: stock.price, status: 'buy' });
    } catch (e) {
      alert(e);
    }
    setSending(false);
    setComplete(true);
  }

  const handleCloseComplete = () => {
    setOpenDetailDialog(false);
    setComplete(false);
    navigate("/");
  }

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
  }

  return (
    <>
      <Dialog
        open={complete}
      >
        <DialogTitle>
          完了しました
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseComplete} autoFocus>閉じる</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={sending}
      >
        <DialogTitle>送信中</DialogTitle>
      </Dialog>
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog}>
        <DialogTitle>購入依頼</DialogTitle>
        <DialogContent>
          <Card sx={{ maxWidth: 350 }}>
            <CardMedia
              component="img"
              image={currentStock?.url}
              title={currentStock?.name}
            />
            <CardContent>
              <Typography variant="h6" component="div">
                商品名：{currentStock?.name}
              </Typography>
              <Typography>
                支払いは納品時に行われます
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            component="label"
            onClick={() => { orderNft(currentStock) }}
          >
            購入する
          </Button>
          <Button
            component="label"
            onClick={handleCloseDetailDialog}
          >
            キャンセル
          </Button>
        </DialogActions>
      </Dialog >
      <Grid container spacing={2} sx={{ width: 900 }}>
        {stocks?.map((stock) => (
          <Grid item xs={4}>
            <Card key={stock.id} sx={{ maxWidth: 300 }}>
              <CardMedia
                component="img"
                image={stock.url}
                title={stock.name}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {stock.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stock.price} XRP
                </Typography>
              </CardContent>
              <CardActionArea>
                <Button variant="outlined" sx={{ marginBottom: 3 }} onClick={() => { setCurrentStock(stock); setOpenDetailDialog(true) }}>購入</Button>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default Order;



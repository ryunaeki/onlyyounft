import { Fragment, useEffect, useState } from 'react';
import { CircularProgress, Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, } from '@mui/material';
import { acceptSellOffer, createSellOffer, createWallet, mintToken, useXRPLClient } from '@nice-xrpl/react-xrpl';
import axios from 'axios';
import { OrderRow, getOrderList, getUser, updateOrder } from '../database/client';
import { generateRandomString } from '../utils/randomstring';
// import { Buffer } from 'buffer';

interface IPinataResponse {
    IpfsHash: string,
    PinSize: number,
    Timestamp: string
}

interface CreateNftProps {
    handleCreatedNft: () => void;
}

const CreateNft = ({ handleCreatedNft }: CreateNftProps) => {
    const [order, setOrder] = useState<OrderRow>();
    const [orders, setOrders] = useState<OrderRow[] | null>([]);
    const [file, setFile] = useState<File>();
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [complete, setComplete] = useState(false);
    // const [buffer, setBuffer] = useState<ArrayBuffer>(new ArrayBuffer(0));
    const client = useXRPLClient();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const orders = await getOrderList();
        console.log("orders: ", orders);
        setOrders(orders);
    }

    const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files as FileList;
        const file = files[0];
        setFile(file);
        /*
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
          const res = reader.result as string;
          setBuffer(Buffer.from(res));
        };
        */
    };

    const handleUpload = async () => {
        if (order == undefined)
            return;

        if (file == undefined || file.name == undefined)
            return;

        const user = await getUser(order.userid);
        if (user == undefined)
            return;

        setOpenUploadDialog(false);
        setCreating(true);

        const ext: string | undefined = file.name.split('.').pop();
        const fileName = generateRandomString(16) + '.' + ext;

        const formData = new FormData();
        formData.append('file', file)
        formData.append('pinataMetadata', JSON.stringify({
            name: fileName,
        }));
        formData.append('pinataOptions', JSON.stringify({
            cidVersion: 0,
        }));

        const JWT: string = import.meta.env.VITE_PINATA_JWT;
        let ipfsUrl;
        let httpsUrl;
        try {
            const res = await axios.post<IPinataResponse>("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Authorization': `Bearer ${JWT}`
                }
            });
            console.log(res.data);
            ipfsUrl = 'ipfs://' + res.data.IpfsHash;
            httpsUrl = 'https://ipfs.io/ipfs/' + res.data.IpfsHash;
        } catch (error) {
            console.log(error);
        }

        if (ipfsUrl == undefined || httpsUrl == undefined) {
            setCreating(false);
            return;
        }

        console.log("ipfsUrl: ", ipfsUrl);

        const shopWallet = createWallet(client, import.meta.env.VITE_TEST_SRC_WALLET_SECRET);
        const userWallet = createWallet(client, user.seed);

        const resMint = await mintToken(client, shopWallet, ipfsUrl, 0);
        console.log("mint: ", resMint);

        // @ts-ignore
        const tokenId: string = resMint.result.meta?.nftoken_id;

        const retCreateSell = await createSellOffer(client, shopWallet, tokenId, (order.tokenprice * 1000000).toString(), {
            destination: user.wallet
        });
        console.log("sell: ", retCreateSell);

        // @ts-ignore
        const offerId: string = retCreateSell.result.meta?.offer_id;

        // const retCreateBuy = await createBuyOffer(client, userWallet, import.meta.env.VITE_TEST_SRC_WALLET_ADDRESS, tokenId, '1', {});
        // console.log("buy: ", retCreateBuy);

        const retAcceptSell = await acceptSellOffer(client, userWallet, offerId);
        console.log("accept: ", retAcceptSell);

        order.tokenid = tokenId;
        order.tokenurl = httpsUrl;
        order.status = 'created'

        updateOrder(order);

        setCreating(false);
        setComplete(true);
    };

    const handleCloseUpload = () => {
        setOrder(undefined);
        setOpenUploadDialog(false);
        setOpenDetailDialog(false);
    }

    const handleCloseDetail = () => {
        setOrder(undefined);
        setOpenDetailDialog(false);
    }

    const handleCloseComplete = () => {
        setOpenDetailDialog(false);
        setComplete(false);
        loadOrders();
        handleCreatedNft();
    }

    return (
        <>
            <Dialog open={complete}>
                <DialogTitle>完了しました</DialogTitle>
                <DialogActions>
                    <Grid container alignItems='center' direction='column' sx={{ width: 400 }}>
                        <Grid item xs={12}>
                            <Button onClick={handleCloseComplete} autoFocus>閉じる</Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            <Dialog open={creating}>
                <Grid container alignItems='center' direction='column' sx={{ width: 400 }}>
                    <Grid item xs={12}>
                        <CircularProgress sx={{ margin: 4 }} />
                        <DialogTitle>作成中</DialogTitle>
                    </Grid>
                </Grid>
            </Dialog>
            <Dialog open={openUploadDialog} onClose={handleCloseUpload}>
                <DialogTitle>アップロード</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        アップロードするファイルを選択してください
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Input type="file" onChange={onChangeFile}></Input>
                    <Button
                        component="label"
                        onClick={handleUpload}
                    >
                        送信
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDetailDialog} onClose={handleCloseDetail}>
                <DialogTitle>購入依頼</DialogTitle>
                <DialogContent>
                    <Card key={order?.id} sx={{ maxWidth: 350 }}>
                        <CardMedia
                            component="img"
                            image={order?.tokenurl}
                            title={order?.tokenname}
                        />
                        <CardContent>
                            <Typography variant="h6" component="div">
                                購入者：{order?.userid}
                            </Typography>
                            <Typography variant="h6" component="div">
                                商品名：{order?.tokenname}
                            </Typography>
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Button
                        component="label"
                        onClick={() => { setOpenUploadDialog(true) }}
                    >
                        アップロード
                    </Button>
                </DialogActions>
            </Dialog>
            {orders?.length == 0 ? (<>購入依頼はありません</>) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>購入者</TableCell>
                                <TableCell>商品名</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders?.map((order) => (
                                <Fragment key={order.id}>
                                    {(order.status == 'buy') ? (
                                        <TableRow>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.userid}</TableCell>
                                            <TableCell>{order.tokenname}</TableCell>
                                            <TableCell><Button onClick={() => { setOrder(order); setOpenDetailDialog(true); }}>詳細</Button></TableCell>
                                        </TableRow>
                                    ) : (<></>)}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}

export default CreateNft;

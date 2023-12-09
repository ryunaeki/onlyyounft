import { useEffect, useState } from 'react';
import { OrderRow, getAssetList } from '../database/client';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const Asset = () => {
  const [assets, setAssets] = useState<OrderRow[] | null>([]);
  const { user } = useAuth0();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    const assets = await getAssetList(user?.email);
    console.log("assets: ", assets);
    setAssets(assets);
  }

  return (
    <>
      <Grid container spacing={2} sx={{ width: 900}}>
        {assets?.map((asset) => (
          <Grid item xs={4}>
            <Card key={asset.id} sx={{ maxWidth: 300 }}>
              <CardMedia
                component="img"
                image={asset.tokenurl}
                title={asset.tokenname}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {asset.tokenname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(asset.status == 'buy' ? '作成待ち' : '納品済み')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default Asset;

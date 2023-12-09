import { useEffect, useState } from 'react';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useAuth0 } from '@auth0/auth0-react';
import { addUser, getUser, updateUser, userExists } from '../database/client';

interface FormInput {
  userid: string
  seed: string
  wallet: string
}

interface ProfileProps {
  handleSaveProfile: () => void;
}

const Profile = ({handleSaveProfile} : ProfileProps) => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth0();
  const { register, control, handleSubmit, reset } = useForm<FormInput>();

  useEffect(() => {
    const loadUserInfo = async () => {
      // console.log("email: ", user?.email);
      const userInfo = await getUser(user?.email);

      // defaultValueのリセット
      reset({
        userid: userInfo?.userid,
        seed: userInfo?.seed,
        wallet: userInfo?.wallet
      });

      setLoading(false);
    };
    loadUserInfo();
  }, []);

  const handleSubmitSave: SubmitHandler<FormInput> = async (data) => {
    // console.log("data: ", data);

    if (await userExists(data.userid)) {
      updateUser(data.userid, data.seed, data.wallet);
    } else {
      addUser(data.userid, data.seed, data.wallet);
    }

    handleSaveProfile();
  }

  const validationRules = {
    seed: {
      required: 'シードを入力してください。',
      minLength: { value: 31, message: '31文字で入力してください' }
    },
    wallet: {
      required: 'ウォレットを入力してください。',
      minLength: { value: 34, message: '34文字で入力してください' }
    }
  }

  return (
    <>
      {loading ? (
        <>Loading...</>
      ) : (
      <Container maxWidth="sm" sx={{ pt: 5 }}>
        <Stack spacing={3}>
          <TextField required label="ユーザーID"  {...register('userid')} inputProps={{ readOnly: true }} defaultValue={user?.email} />
          <Controller
            name="wallet"
            control={control}
            rules={validationRules.wallet}
            render={({ field, fieldState }) => (
              <TextField required label="ウォレット"
                {...field}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="seed"
            control={control}
            rules={validationRules.seed}
            render={({ field, fieldState }) => (
              <TextField required label="シード"
                {...field}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(handleSubmitSave)}>
            保存
          </Button>
        </Stack>
      </Container>
      )}
    </>
  )
}

export default Profile;

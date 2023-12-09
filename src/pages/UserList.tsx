import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link } from '@mui/material';
import { getUserList, UserRow } from '../database/client';

function UserList() {
  const [users, setUsers] = useState<UserRow[] | null>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const users = await getUserList();
    setUsers(users);
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ユーザーID</TableCell>
            <TableCell>アカウント作成日</TableCell>
            <TableCell>ウェレット</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.userid}>
              <TableCell>{user.userid}</TableCell>
              <TableCell>{user.created_at}</TableCell>
              <TableCell><Link rel="noopener" target="_blank" href={"https://testnet.xrpl.org/accounts/" + user.wallet}>{user.wallet}</Link></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserList;
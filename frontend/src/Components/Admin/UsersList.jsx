import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'

import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import AdminDataGrid, { IdCell, PersonCell, RowAction } from './AdminDataGrid'
import { errMsg, formatDate, successMsg } from '../Utils/helpers'

const columns = [
    {
        field: 'id',
        headerName: 'User ID',
        flex: 1,
        minWidth: 150,
        renderCell: ({ value }) => <IdCell id={value} label="User" />
    },
    {
        field: 'name',
        headerName: 'Name',
        flex: 1.3,
        minWidth: 170,
        renderCell: ({ row }) => <PersonCell name={row.name} avatar={row.avatar} />
    },
    {
        field: 'email',
        headerName: 'Email',
        flex: 1.5,
        minWidth: 190,
    },
    {
        field: 'role',
        headerName: 'Role',
        type: 'singleSelect',
        valueOptions: ['user', 'admin'],
        width: 100,
        renderCell: ({ value }) => <Chip size="small" label={value} color={value === 'admin' ? 'primary' : 'default'} sx={{ textTransform: 'capitalize' }} />
    },
    {
        field: 'joined',
        headerName: 'Joined',
        type: 'date',
        width: 130,
        valueFormatter: formatDate
    },
    {
        field: 'provider',
        headerName: 'Auth',
        type: 'singleSelect',
        valueOptions: [{ value: 'local', label: 'Email' }, { value: 'google', label: 'Google' }],
        width: 100,
        hideOnSmall: true
    },
]

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [allUsers, setAllUsers] = useState([])

    const listUsers = useCallback(async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, { withCredentials: true })
            setAllUsers(data.users)
            setLoadError(null)
        } catch (error) {
            setLoadError(error.response ? error.response.data.message : error.message)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        listUsers()
    }, [listUsers])

    const retryHandler = () => {
        setLoading(true)
        setLoadError(null)
        listUsers()
    }

    const deleteUser = useCallback(async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, { withCredentials: true })
            if (data.success) {
                successMsg('User deleted successfully')
                listUsers()
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }, [listUsers])

    const deleteUserHandler = useCallback((id) => {
        Swal.fire({
            title: 'Delete User',
            icon: 'warning',
            text: 'Do you want to delete this user?',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser(id)
            }
        })
    }, [deleteUser])

    const renderActions = useCallback((row) => (
        <>
            <RowAction label="Edit" subject={row.name} icon={<EditOutlinedIcon fontSize="small" />} to={`/admin/user/${row.id}`} />
            <RowAction label="Delete" subject={row.name} icon={<DeleteOutlinedIcon fontSize="small" />} color="error" onClick={() => deleteUserHandler(row.id)} />
        </>
    ), [deleteUserHandler])

    const rows = useMemo(() => allUsers.map(user => ({
        id: user._id,
        name: user.name,
        avatar: user.avatar ? user.avatar.url : '',
        email: user.email,
        role: user.role,
        joined: new Date(user.createdAt),
        provider: user.authProvider,
    })), [allUsers])

    return (
        <>
            <MetaData title={'All Users'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    <PageHeader title="All Users" />
                    <AdminDataGrid
                        label="All users"
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        error={loadError}
                        onRetry={retryHandler}
                        empty={{ icon: <PeopleOutlinedIcon />, title: 'No users yet' }}
                        renderActions={renderActions}
                        sortField="joined"
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default UsersList

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import axios from 'axios';
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers';
import { DataGrid, } from '@mui/x-data-grid'

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [allUsers, setAllUsers] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    }

    const listUsers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config)
            setAllUsers(data.users)
            setLoading(false)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const deleteUser = async (id) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, config)
            setIsDeleted(data.success)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        listUsers();
        if (isDeleted) {
            successMsg('User deleted successfully');
            setIsDeleted(false)
        }
    }, [isDeleted])

    const deleteUserHandler = (id) => {
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
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 100,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteUserHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Users</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                    pageSizeOptions={[5, 10, 25]}
                                    disableRowSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default UsersList

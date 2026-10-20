import { useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from 'react-redux'
import { loadUser } from '../../actions/userActions'
import { errMsg, successMsg } from '../Utils/helpers'

const UpdateProfile = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.svg')
    const [loading, setLoading] = useState(false)
    let navigate = useNavigate();
    const dispatch = useDispatch()

    const getProfile = async () => {
        const config = {
            withCredentials: true
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
            setName(data.user.name);
            setEmail(data.user.email);
            setAvatarPreview(data.user.avatar.url)
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    const updateProfile = async (userData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true
        }
        try {
            setLoading(true)
            await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
            setLoading(false)
            successMsg('user updated')
            dispatch(loadUser())
            navigate('/me', { replace: true })
        } catch (error) {
            setLoading(false)
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

    useEffect(() => {
        getProfile()
    }, [])

    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('avatar', avatar);
        updateProfile(formData)
    }

    const onChange = e => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }

        reader.readAsDataURL(e.target.files[0])
    }

    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mt-2 mb-5">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept='image/*'
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile

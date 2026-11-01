import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import { readAsDataURL } from '../Utils/helpers'

const DEFAULT_AVATAR = '/images/default_avatar.svg'

// Avatar picker for a Formik form with an avatar value
const AvatarField = ({ formik, current }) => {
    const [preview, setPreview] = useState(null)

    const changeHandler = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        formik.setFieldTouched('avatar', true, false)
        formik.setFieldValue('avatar', file)
        setPreview(await readAsDataURL(file))
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Avatar src={preview || current || DEFAULT_AVATAR} alt="Avatar Preview" sx={{ width: 56, height: 56 }} />
                <Button variant="outlined" component="label">
                    Choose Avatar
                    <input type="file" name="avatar" hidden accept=".jpg,.jpeg,.png,.webp" onChange={changeHandler} />
                </Button>
            </Box>
            {formik.touched.avatar && formik.errors.avatar && (
                <FormHelperText error>{formik.errors.avatar}</FormHelperText>
            )}
        </>
    )
}

export default AvatarField

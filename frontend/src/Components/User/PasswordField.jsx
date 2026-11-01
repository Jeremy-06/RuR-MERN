import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

// Password input for a Formik form, with a show/hide button
const PasswordField = ({ formik, name, id, label, autoComplete }) => {
    const [visible, setVisible] = useState(false)
    const failed = formik.touched[name] && Boolean(formik.errors[name])

    return (
        <TextField
            id={id}
            label={label}
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
            {...formik.getFieldProps(name)}
            error={failed}
            helperText={failed && formik.errors[name]}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                                aria-pressed={visible}
                                onClick={() => setVisible(!visible)}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </IconButton>
                        </InputAdornment>
                    )
                }
            }}
        />
    )
}

export default PasswordField

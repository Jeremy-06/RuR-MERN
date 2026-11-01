import { useNavigate } from "react-router-dom";
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { countries } from 'countries-list'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import CheckoutLayout from './CheckoutLayout'
import CheckoutSteps from './CheckoutSteps'
import { saveShippingInfo } from '../../actions/cartActions'
import { accentTop } from '../../theme'

const countryNames = Object.values(countries).map(country => country.name).sort((a, b) => a.localeCompare(b))

const shippingSchema = Yup.object({
    address: Yup.string().trim().required('Please enter your address').max(200, 'Address cannot exceed 200 characters'),
    city: Yup.string().trim().required('Please enter your city').max(100, 'City cannot exceed 100 characters'),
    phoneNo: Yup.string().trim().required('Please enter your phone number')
        .matches(/^\+?[\d\s()-]+$/, 'Phone number can only have digits, spaces, ( ) and -')
        .test('digits', 'Phone number must have 7 to 15 digits', value => {
            const digits = (value || '').replace(/\D/g, '').length
            return digits >= 7 && digits <= 15
        }),
    // May letters kasi international ang country list
    postalCode: Yup.string().trim().required('Please enter your postal code')
        .matches(/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/, 'Please enter a valid postal code'),
    country: Yup.string().required('Please select your country').oneOf(countryNames, 'Please select your country'),
})

const Shipping = () => {
    const dispatch = useDispatch()
    const { shippingInfo } = useSelector(state => state.cart)
    let navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            address: shippingInfo.address || '',
            city: shippingInfo.city || '',
            phoneNo: shippingInfo.phoneNo || '',
            postalCode: shippingInfo.postalCode || '',
            country: shippingInfo.country || 'Philippines',
        },
        enableReinitialize: true,
        validationSchema: shippingSchema,
        onSubmit: (values) => {
            dispatch(saveShippingInfo(shippingSchema.cast(values)))
            navigate('/confirm')
        },
    })

    const field = (name) => ({
        id: `shipping_${name}`,
        name,
        value: formik.values[name],
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        error: formik.touched[name] && Boolean(formik.errors[name]),
        helperText: formik.touched[name] && formik.errors[name],
    })

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <CheckoutSteps shipping />
            <PageHeader title="Shipping Info" subtitle="Where should we send your gear?" />

            <CheckoutLayout>
                <Card sx={{ ...accentTop, height: 'auto', p: { xs: 2.5, sm: 4 } }}>
                    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                        <TextField {...field('address')} label="Address" required autoComplete="street-address" sx={{ mt: 0 }} />
                        <TextField {...field('city')} label="City" required autoComplete="address-level2" />
                        <Grid container columnSpacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField {...field('phoneNo')} label="Phone No" required type="tel" autoComplete="tel" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField {...field('postalCode')} label="Postal Code" required autoComplete="postal-code" />
                            </Grid>
                        </Grid>
                        <TextField {...field('country')} label="Country" required select autoComplete="country-name">
                            {countryNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                        </TextField>

                        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }}>Continue</Button>
                    </Box>
                </Card>
            </CheckoutLayout>
        </>
    )
}

export default Shipping

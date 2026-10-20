import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'

import { categories, errMsg, successMsg, isAllowedImage, isAllowedSize, MAX_IMAGES } from '../Utils/helpers'

// Empty number inputs should say "required", not "must be a number"
const emptyToUndefined = (value, originalValue) => originalValue === '' ? undefined : value

const productSchema = Yup.object({
    name: Yup.string().trim().required('Please enter product name').max(100, 'Product name cannot exceed 100 characters'),
    price: Yup.number().transform(emptyToUndefined).typeError('Price must be a number').required('Please enter product price').min(0, 'Product price cannot be negative'),
    description: Yup.string().trim().required('Please enter product description'),
    category: Yup.string().required('Please select category for this product').oneOf(categories, 'Please select correct category for product'),
    stock: Yup.number().transform(emptyToUndefined).typeError('Stock must be a number').required('Please enter product stock').integer('Product stock must be a whole number').min(0, 'Product stock cannot be negative'),
    oldImages: Yup.array(),
    images: Yup.array()
        .max(MAX_IMAGES, `You can upload up to ${MAX_IMAGES} images at a time`)
        .test('fileType', 'Only jpg, jpeg, png and webp images are allowed', files => files.every(isAllowedImage))
        .test('fileSize', 'Each image must be 5MB or smaller', files => files.every(isAllowedSize))
        .test('required', 'Please add at least one product image', function (files) {
            return files.length + this.parent.oldImages.length > 0
        }),
})

const emptyProduct = {
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    oldImages: [],
    images: [],
}

const ProductDialog = ({ open, productId, onClose, onSaved }) => {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(false)

    const isEdit = Boolean(productId)

    useEffect(() => {
        if (!open || !productId) return

        // Load the product being edited
        let ignore = false
        const getProductDetails = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${productId}`)
                if (!ignore) setProduct(data.product)
            } catch (error) {
                errMsg(error.response ? error.response.data.message : error.message)
                onClose()
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        getProductDetails()
        return () => { ignore = true }
    }, [open, productId, onClose])

    const formik = useFormik({
        initialValues: isEdit && product ? {
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
            oldImages: product.images,
            images: [],
        } : emptyProduct,
        enableReinitialize: true,
        validationSchema: productSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.set('name', values.name.trim());
            formData.set('price', values.price);
            formData.set('description', values.description.trim());
            formData.set('category', values.category);
            formData.set('stock', values.stock);
            values.images.forEach(image => formData.append('images', image))

            // Existing images that were removed in the dialog
            if (isEdit) {
                product.images
                    .filter(image => !values.oldImages.some(kept => kept.public_id === image.public_id))
                    .forEach(image => formData.append('removeImages', image.public_id))
            }

            try {
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
                const { data } = isEdit
                    ? await axios.put(`${import.meta.env.VITE_API}/admin/product/${productId}`, formData, config)
                    : await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config)

                if (data.success) {
                    successMsg(isEdit ? 'Product updated successfully' : 'Product created successfully')
                    formik.resetForm({ values: emptyProduct })
                    setProduct(null)
                    onSaved()
                }
            } catch (error) {
                errMsg(error.response ? error.response.data.message : error.message)
            }
        }
    })

    // Previews for newly picked files
    const previews = useMemo(() => formik.values.images.map(file => ({
        file,
        url: URL.createObjectURL(file),
        invalid: !isAllowedImage(file) || !isAllowedSize(file),
    })), [formik.values.images])

    useEffect(() => {
        return () => previews.forEach(preview => URL.revokeObjectURL(preview.url))
    }, [previews])

    const handleClose = () => {
        if (formik.isSubmitting) return
        formik.resetForm({ values: emptyProduct })
        setProduct(null)
        onClose()
    }

    const onImagesChange = (e) => {
        const files = Array.from(e.target.files)
        formik.setFieldTouched('images', true, false)
        formik.setFieldValue('images', [...formik.values.images, ...files])
        // Allow picking the same file again after removing it
        e.target.value = ''
    }

    const removeNewImage = (index) => {
        formik.setFieldTouched('images', true, false)
        formik.setFieldValue('images', formik.values.images.filter((file, i) => i !== index))
    }

    const removeOldImage = (publicId) => {
        formik.setFieldTouched('images', true, false)
        formik.setFieldValue('oldImages', formik.values.oldImages.filter(image => image.public_id !== publicId))
    }

    const fieldError = (field) => ({
        error: formik.touched[field] && Boolean(formik.errors[field]),
        helperText: formik.touched[field] && formik.errors[field],
    })

    const thumbnail = (key, url, alt, onRemove, invalid = false) => (
        <Box key={key} sx={{ position: 'relative', width: 88, height: 88 }}>
            <Box
                component="img"
                src={url}
                alt={alt}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1, border: 2, borderColor: invalid ? 'error.main' : 'divider' }}
            />
            <IconButton
                size="small"
                aria-label={`Remove ${alt}`}
                onClick={onRemove}
                sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'secondary.main', color: '#fff', width: 24, height: 24, '&:hover': { bgcolor: 'secondary.dark' } }}
            >
                <i className="fa fa-times" style={{ fontSize: 12 }}></i>
            </IconButton>
        </Box>
    )

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ typography: 'h4' }}>{isEdit ? 'Update Product' : 'New Product'}</DialogTitle>

            <DialogContent dividers>
                {isEdit && (loading || !product) ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <form id="product-form" noValidate onSubmit={formik.handleSubmit}>
                        <TextField id="name_field" label="Name" {...formik.getFieldProps('name')} {...fieldError('name')} />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField id="price_field" label="Price" type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} {...formik.getFieldProps('price')} {...fieldError('price')} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField id="stock_field" label="Stock" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} {...formik.getFieldProps('stock')} {...fieldError('stock')} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField id="category_field" label="Category" select {...formik.getFieldProps('category')} {...fieldError('category')}>
                                    {categories.map(category => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        <TextField id="description_field" label="Description" multiline minRows={4} {...formik.getFieldProps('description')} {...fieldError('description')} />

                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Images</Typography>
                                <Button variant="outlined" component="label" size="small">
                                    {isEdit ? 'Add Images' : 'Choose Images'}
                                    <input type="file" name="images" hidden multiple accept=".jpg,.jpeg,.png,.webp" onChange={onImagesChange} />
                                </Button>
                                <Typography variant="caption" color="text.secondary">jpg, jpeg, png or webp, up to 5MB each</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                                {formik.values.oldImages.map(image => thumbnail(image.public_id + image.url, image.url, 'existing image', () => removeOldImage(image.public_id)))}
                                {previews.map((preview, index) => thumbnail(preview.url, preview.url, preview.file.name, () => removeNewImage(index), preview.invalid))}
                            </Box>

                            {formik.touched.images && formik.errors.images && (
                                <FormHelperText error>{formik.errors.images}</FormHelperText>
                            )}
                        </Box>
                    </form>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={formik.isSubmitting}>Cancel</Button>
                <Button type="submit" form="product-form" variant="contained" disabled={formik.isSubmitting || (isEdit && !product)}>
                    {formik.isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ProductDialog

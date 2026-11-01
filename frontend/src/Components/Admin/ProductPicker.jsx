import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { isProductId } from '../Utils/helpers'
import useSearchSuggestions, { MAX_LENGTH } from '../Utils/useSearchSuggestions'

const ProductPicker = ({ onSelect }) => {
    const [keyword, setKeyword] = useState('')
    const [open, setOpen] = useState(false)
    const [invalid, setInvalid] = useState(false)

    const text = keyword.trim()
    const { suggestions, ready, loading } = useSearchSuggestions(text)

    const choose = (id) => {
        setKeyword('')
        setOpen(false)
        setInvalid(false)
        onSelect(id)
    }

    const inputHandler = (e, value, reason) => {
        if (reason !== 'input') return
        if (isProductId(value.trim())) {
            choose(value.trim())
            return
        }
        setKeyword(value)
        setInvalid(false)
    }

    // Enter na walang naka-highlight, o yung search button
    const submitHandler = (e) => {
        e.preventDefault()
        setOpen(false)
        setInvalid(text !== '')
    }

    return (
        <Box component="form" role="search" onSubmit={submitHandler} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: 2 }}>
            <Autocomplete
                id="productId_field"
                size="small"
                fullWidth
                options={suggestions.products}
                value={null}
                inputValue={keyword}
                onInputChange={inputHandler}
                onChange={(e, option) => { if (option) choose(option._id) }}
                open={open && ready}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                filterOptions={(items) => items}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option._id}
                loading={loading}
                loadingText="Searching ..."
                noOptionsText={suggestions.error || 'No products found'}
                clearOnBlur={false}
                disableClearable
                forcePopupIcon={false}
                renderOption={({ key, ...props }, option) => (
                    <Box component="li" key={key} {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            component="img"
                            src={option.image || '/images/default_avatar.svg'}
                            alt=""
                            sx={{ width: 44, height: 44, flexShrink: 0, objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{option.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{option.category}</Typography>
                        </Box>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        margin="none"
                        label="Product"
                        placeholder="Type a product name or paste its ID"
                        error={invalid}
                        helperText={invalid ? 'Pick a product from the list, or paste a valid 24-character product ID' : undefined}
                        slotProps={{
                            ...params.slotProps,
                            htmlInput: { ...params.slotProps.htmlInput, maxLength: MAX_LENGTH },
                            input: {
                                ...params.slotProps.input,
                                endAdornment: loading && open ? <CircularProgress size={18} aria-label="Loading suggestions" /> : null
                            }
                        }}
                    />
                )}
            />
            <Button id="search_button" type="submit" variant="contained" sx={{ flexShrink: 0, height: 40 }}>
                Search
            </Button>
        </Box>
    )
}

export default ProductPicker

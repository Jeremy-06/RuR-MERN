import { useMemo, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { formatMoney } from '../Utils/helpers'
import useSearchSuggestions, { MAX_LENGTH } from '../Utils/useSearchSuggestions'

// Wraps the typed text in <mark> wherever it appears in the name
const highlight = (name, text) => {
    const pattern = new RegExp(`(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
    return name.split(pattern).map((part, index) => index % 2 === 1
        ? <Box key={index} component="mark" sx={{ p: 0, bgcolor: 'transparent', color: 'primary.dark', fontWeight: 800 }}>{part}</Box>
        : part)
}

const Search = () => {
    const [keyword, setKeyword] = useState('');
    const [open, setOpen] = useState(false)
    let navigate = useNavigate();

    const text = keyword.trim()
    const { suggestions, ready, loading } = useSearchSuggestions(text)

    const options = useMemo(() => [
        ...suggestions.categories.map(name => ({ type: 'category', name })),
        ...suggestions.products.map(product => ({ type: 'product', ...product })),
    ], [suggestions.categories, suggestions.products])

    const finish = (path) => {
        setKeyword('')
        setOpen(false)
        navigate(path)
    }

    const selectHandler = (e, option) => {
        if (!option) return
        finish(option.type === 'product' ? `/product/${option._id}` : `/?category=${encodeURIComponent(option.name)}`)
    }

    // Enter with no suggestion highlighted, or the search button
    const searchHandler = (e) => {
        e.preventDefault()
        setOpen(false)

        if (text) {
            navigate(`/search/${encodeURIComponent(text)}`)
        } else {
            navigate('/')
        }
    }

    return (
        <Box component="form" role="search" onSubmit={searchHandler}>
            <Autocomplete
                size="small"
                options={options}
                value={null}
                inputValue={keyword}
                onInputChange={(e, value, reason) => { if (reason === 'input') setKeyword(value) }}
                onChange={selectHandler}
                open={open && ready}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                filterOptions={(items) => items}
                groupBy={(option) => option.type === 'category' ? 'Categories' : 'Products'}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.type === 'product' ? option._id : `category-${option.name}`}
                loading={loading}
                loadingText="Searching ..."
                noOptionsText={suggestions.error || 'No products found'}
                clearOnBlur={false}
                disableClearable
                forcePopupIcon={false}
                renderOption={({ key, ...props }, option) => (
                    <Box component="li" key={key} {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {option.type === 'product' ? (
                            <Box
                                component="img"
                                src={option.image || '/images/default_avatar.svg'}
                                alt=""
                                sx={{ width: 44, height: 44, flexShrink: 0, objectFit: 'cover', borderRadius: 1, bgcolor: 'background.default' }}
                            />
                        ) : (
                            <Box sx={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'primary.dark' }}>
                                <CategoryOutlinedIcon />
                            </Box>
                        )}
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{highlight(option.name, text)}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {option.type === 'product' ? option.category : 'Show this category'}
                            </Typography>
                        </Box>
                        {option.type === 'product' && (
                            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>{formatMoney(option.price)}</Typography>
                        )}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        margin="none"
                        placeholder="Search gaming gear ..."
                        slotProps={{
                            ...params.slotProps,
                            htmlInput: { ...params.slotProps.htmlInput, 'aria-label': 'Search products', maxLength: MAX_LENGTH },
                            input: {
                                ...params.slotProps.input,
                                endAdornment: (
                                    <>
                                        {loading && open && <CircularProgress size={18} aria-label="Loading suggestions" sx={{ color: 'rur.muted' }} />}
                                        <IconButton type="submit" size="small" aria-label="Search" sx={{ color: '#fff' }}>
                                            <SearchIcon />
                                        </IconButton>
                                    </>
                                )
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': { bgcolor: 'rur.panel', color: '#fff', pr: '6px !important' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rur.panelBorder' },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rur.muted' },
                            '& input::placeholder': { color: 'rur.muted', opacity: 1 },
                        }}
                    />
                )}
            />
        </Box>
    )
}

export default Search

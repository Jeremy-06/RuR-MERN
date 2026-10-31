import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearSearchSuggestions, getSearchSuggestions } from '../../actions/productActions'

const MIN_LENGTH = 2
const DEBOUNCE = 300
export const MAX_LENGTH = 100

// Loads suggestions for the typed text, debounced, into the searchSuggestions state
const useSearchSuggestions = (text) => {
    const dispatch = useDispatch()
    const suggestions = useSelector(state => state.searchSuggestions)
    const ready = text.length >= MIN_LENGTH

    useEffect(() => {
        if (!ready) {
            dispatch(clearSearchSuggestions())
            return
        }
        const timer = setTimeout(() => dispatch(getSearchSuggestions(text)), DEBOUNCE)
        return () => clearTimeout(timer)
    }, [dispatch, text, ready])

    const loading = ready && (suggestions.keyword !== text || suggestions.loading)

    return { suggestions, ready, loading }
}

export default useSearchSuggestions

import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { scrollPageToTop } from '../Utils/helpers'

const ScrollToTop = () => {
    const { pathname } = useLocation()
    const navigationType = useNavigationType()
    const lastPathname = useRef(pathname)

    // Pathname lang: walang talon pag query string ang nagbago (filters, sort)
    useLayoutEffect(() => {
        if (lastPathname.current === pathname) return
        lastPathname.current = pathname
        // Back/forward: sa browser na ang scroll
        if (navigationType !== 'POP') scrollPageToTop()
    }, [pathname, navigationType])

    return null
}

export default ScrollToTop

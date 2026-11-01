import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DataTable from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'

import MetaData from '../Layout/MetaData'
import PageHeader from '../Layout/PageHeader'
import Sidebar from './SideBar'
import ProductDialog from './ProductDialog'
import Swal from 'sweetalert2'
import { clearErrors, deleteProduct, deleteProducts } from '../../actions/productActions'
import { DELETE_PRODUCT_RESET } from '../../constants/productConstants'
import { errMsg, successMsg } from '../Utils/helpers'
import { PAGE_MIN_HEIGHT } from '../../theme'

// Toast natin ang gamit, hindi alert() ng DataTables
DataTable.ext.errMode = 'none'

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char])

// Parehong paths ng MUI icons sa ibang admin tables
const actionIcon = (path) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="${path}"></path></svg>`
const EDIT_ICON = actionIcon('m14.06 9.02.92.92L5.92 19H5v-.92zM17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z')
const DELETE_ICON = actionIcon('M16 9v10H8V9zm-1.5-6h-5l-1 1H5v2h14V4h-3.5zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z')
const PREVIOUS_ICON = actionIcon('M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z')
const NEXT_ICON = actionIcon('M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z')
const COPY_ICON = actionIcon('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z')

const copyProductId = async (id) => {
    try {
        await navigator.clipboard.writeText(id)
        successMsg('Product ID copied')
    } catch {
        errMsg('Could not copy the ID')
    }
}

const ProductsList = () => {
    const dispatch = useDispatch()
    const { error: createError } = useSelector(state => state.newProduct)
    const { error: productError, isDeleted, deletedIds, message } = useSelector(state => state.product)
    const tableRef = useRef(null)
    const dataTableRef = useRef(null)
    // Hindi nawawala ang selection sa paging, search at sort
    const selectedRef = useRef(new Set())
    const [selectedCount, setSelectedCount] = useState(0)
    const [dialog, setDialog] = useState({ open: false, productId: null })

    const reloadTable = useCallback((resetPaging = false) => {
        if (dataTableRef.current) {
            dataTableRef.current.ajax.reload(null, resetPaging)
        }
    }, [])

    useEffect(() => {
        const tableElement = tableRef.current

        const table = new DataTable(tableElement, {
            serverSide: true,
            processing: true,
            searchDelay: 400,
            pageLength: 10,
            lengthMenu: [10, 25, 50],
            order: [],
            layout: {
                topStart: 'search',
                topEnd: null,
                bottomStart: null,
                bottomEnd: ['pageLength', 'info', { paging: { firstLast: false, numbers: false } }]
            },
            language: {
                search: '',
                searchPlaceholder: 'Search ...',
                lengthMenu: 'Rows per page _MENU_',
                info: '_START_–_END_ of _TOTAL_',
                infoEmpty: '0 of 0',
                infoFiltered: '',
                zeroRecords: 'No matching rows',
                emptyTable: 'No products yet',
                entries: { _: '', 1: '' },
                paginate: { previous: PREVIOUS_ICON, next: NEXT_ICON },
                aria: { paginate: { previous: 'Previous page', next: 'Next page' } }
            },
            ajax: {
                url: `${import.meta.env.VITE_API}/admin/products`,
                xhrFields: {
                    withCredentials: true
                },
                // I-map sa hinahanap ng DataTables
                dataSrc: (json) => {
                    json.recordsTotal = json.productsCount
                    json.recordsFiltered = json.filteredProductsCount
                    return json.products
                }
            },
            columns: [
                {
                    data: '_id',
                    title: '<input type="checkbox" class="dt-check-all" aria-label="Select all products on this page">',
                    orderable: false,
                    searchable: false,
                    className: 'dt-center',
                    width: '40px',
                    render: (id) => `<input type="checkbox" class="dt-row-check" value="${id}" aria-label="Select product"${selectedRef.current.has(id) ? ' checked' : ''}>`
                },
                {
                    data: 'images',
                    title: 'Image',
                    orderable: false,
                    searchable: false,
                    width: '70px',
                    render: (images) => images && images[0]
                        ? `<img src="${escapeHtml(images[0].url)}" alt="" class="dt-thumb">`
                        : '<span class="dt-thumb dt-thumb-empty"></span>'
                },
                {
                    data: '_id',
                    title: 'ID',
                    orderable: false,
                    searchable: false,
                    className: 'dt-id-column dt-nowrap',
                    width: '124px',
                    render: (id) => `
                        <span class="dt-id-text" title="${id}">…${id.slice(-8)}</span>
                        <button type="button" class="dt-action dt-copy-id" data-id="${id}" title="Copy ID" aria-label="Copy product ID ${id}">${COPY_ICON}</button>`
                },
                { data: 'name', title: 'Name', render: DataTable.render.text() },
                { data: 'category', title: 'Category', render: DataTable.render.text() },
                { data: 'price', title: 'Price', className: 'dt-right', render: DataTable.render.number(',', '.', 2, '$') },
                { data: 'stock', title: 'Stock', className: 'dt-right' },
                {
                    data: '_id',
                    title: 'Actions',
                    orderable: false,
                    searchable: false,
                    className: 'dt-nowrap',
                    width: '124px',
                    render: (id) => `
                        <button type="button" class="dt-action dt-edit" data-id="${id}" title="Edit" aria-label="Edit product">${EDIT_ICON}</button>
                        <button type="button" class="dt-action dt-delete" data-id="${id}" title="Delete" aria-label="Delete product">${DELETE_ICON}</button>`
                },
            ],
        })
        dataTableRef.current = table

        const updateSelection = () => setSelectedCount(selectedRef.current.size)

        const syncCheckAll = () => {
            const checkAll = tableElement.querySelector('.dt-check-all')
            const rowChecks = Array.from(tableElement.querySelectorAll('.dt-row-check'))
            const checked = rowChecks.filter(check => check.checked).length
            if (checkAll) {
                checkAll.checked = rowChecks.length > 0 && checked === rowChecks.length
                checkAll.indeterminate = checked > 0 && checked < rowChecks.length
            }
        }

        const deleteProductHandler = (id) => {
            Swal.fire({
                title: 'Delete Product',
                icon: 'warning',
                text: 'Do you want to delete this product?',
                confirmButtonText: 'Delete',
                showCancelButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(deleteProduct(id))
                }
            })
        }

        const onChange = (e) => {
            if (e.target.classList.contains('dt-row-check')) {
                if (e.target.checked) {
                    selectedRef.current.add(e.target.value)
                } else {
                    selectedRef.current.delete(e.target.value)
                }
                syncCheckAll()
                updateSelection()
            }

            if (e.target.classList.contains('dt-check-all')) {
                tableElement.querySelectorAll('.dt-row-check').forEach(check => {
                    check.checked = e.target.checked
                    if (e.target.checked) {
                        selectedRef.current.add(check.value)
                    } else {
                        selectedRef.current.delete(check.value)
                    }
                })
                updateSelection()
            }
        }

        const onClick = (e) => {
            const editButton = e.target.closest('.dt-edit')
            const deleteButton = e.target.closest('.dt-delete')
            const copyButton = e.target.closest('.dt-copy-id')

            if (editButton) {
                setDialog({ open: true, productId: editButton.dataset.id })
            }
            if (deleteButton) {
                deleteProductHandler(deleteButton.dataset.id)
            }
            if (copyButton) {
                copyProductId(copyButton.dataset.id)
            }
        }

        tableElement.addEventListener('change', onChange)
        tableElement.addEventListener('click', onClick)
        table.on('draw', () => {
            syncCheckAll()
            updateSelection()
            // Nabura ang nag-iisang row ng last page, balik sa previous
            if (table.page() > 0 && !tableElement.querySelector('.dt-row-check')) {
                table.page('last').draw('page')
            }
        })
        table.on('dt-error', (e, settings, techNote, message) => {
            const response = settings.jqXHR && settings.jqXHR.responseJSON
            errMsg(response && response.message ? response.message : message)
        })

        return () => {
            tableElement.removeEventListener('change', onChange)
            tableElement.removeEventListener('click', onClick)
            table.destroy()
            dataTableRef.current = null
        }
    }, [dispatch])

    // Bukas pa ang dialog pag pumalya ang save, kaya dito lahat ng error toast
    useEffect(() => {
        const error = createError || productError
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [dispatch, createError, productError])

    useEffect(() => {
        if (isDeleted) {
            successMsg(message)
            deletedIds.forEach(id => selectedRef.current.delete(id))
            dispatch({ type: DELETE_PRODUCT_RESET })
            reloadTable(deletedIds.length > 1)
        }
    }, [dispatch, isDeleted, deletedIds, message, reloadTable])

    const deleteSelectedHandler = () => {
        const ids = Array.from(selectedRef.current)
        Swal.fire({
            title: 'Delete Selected Products',
            icon: 'warning',
            text: `Do you want to delete ${ids.length} selected product(s)? Their images will be removed too.`,
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteProducts(ids))
            }
        })
    }

    const closeDialog = useCallback(() => setDialog({ open: false, productId: null }), [])

    const productSaved = useCallback(() => {
        closeDialog()
        reloadTable()
    }, [closeDialog, reloadTable])

    return (
        <>
            <MetaData title={'All Products'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>

                <Grid size={{ xs: 12, md: 10 }} sx={{ minHeight: PAGE_MIN_HEIGHT }}>
                    <PageHeader
                        title="All Products"
                        actions={(
                            <>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    disabled={selectedCount === 0}
                                    onClick={deleteSelectedHandler}
                                    startIcon={<DeleteOutlinedIcon />}
                                >
                                    Delete selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => setDialog({ open: true, productId: null })}
                                    startIcon={<AddIcon />}
                                >
                                    New Product
                                </Button>
                            </>
                        )}
                    />

                    <Paper className="products-table-card">
                        <table ref={tableRef} className="products-table" style={{ width: '100%' }}></table>
                    </Paper>
                </Grid>
            </Grid>

            <ProductDialog
                open={dialog.open}
                productId={dialog.productId}
                onClose={closeDialog}
                onSaved={productSaved}
            />
        </>
    )
}

export default ProductsList

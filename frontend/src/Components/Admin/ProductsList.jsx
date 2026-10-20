import { useCallback, useEffect, useRef, useState } from 'react'
import DataTable from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import ProductDialog from './ProductDialog'
import axios from 'axios'
import Swal from 'sweetalert2'
import { errMsg, successMsg } from '../Utils/helpers'

// Errors are shown with our toast instead of DataTables' alert()
DataTable.ext.errMode = 'none'

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char])

const ProductsList = () => {
    const tableRef = useRef(null)
    const dataTableRef = useRef(null)
    // Selected ids survive paging, searching and sorting
    const selectedRef = useRef(new Set())
    const [selectedCount, setSelectedCount] = useState(0)
    const [dialog, setDialog] = useState({ open: false, productId: null })

    const reloadTable = (resetPaging = false) => {
        if (dataTableRef.current) {
            dataTableRef.current.ajax.reload(null, resetPaging)
        }
    }

    useEffect(() => {
        const tableElement = tableRef.current

        const table = new DataTable(tableElement, {
            serverSide: true,
            processing: true,
            searchDelay: 400,
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50],
            order: [],
            ajax: {
                url: `${import.meta.env.VITE_API}/admin/products`,
                xhrFields: {
                    withCredentials: true
                },
                // Map the reference response shape to what DataTables reads
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
                    render: (id) => `
                        <button type="button" class="btn btn-primary py-1 px-2 dt-edit" data-id="${id}" aria-label="Edit product"><i class="fa fa-pencil"></i></button>
                        <button type="button" class="btn btn-danger py-1 px-2 ml-2 dt-delete" data-id="${id}" aria-label="Delete product"><i class="fa fa-trash"></i></button>`
                },
            ],
        })
        dataTableRef.current = table

        const updateSelection = () => setSelectedCount(selectedRef.current.size)

        // Header checkbox shows whether every row on this page is selected
        const syncCheckAll = () => {
            const checkAll = tableElement.querySelector('.dt-check-all')
            const rowChecks = Array.from(tableElement.querySelectorAll('.dt-row-check'))
            const checked = rowChecks.filter(check => check.checked).length
            if (checkAll) {
                checkAll.checked = rowChecks.length > 0 && checked === rowChecks.length
                checkAll.indeterminate = checked > 0 && checked < rowChecks.length
            }
        }

        const deleteProduct = async (id) => {
            try {
                const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, { withCredentials: true })
                if (data.success) {
                    successMsg('Product deleted successfully')
                    selectedRef.current.delete(id)
                    updateSelection()
                    table.ajax.reload(null, false)
                }
            } catch (error) {
                errMsg(error.response ? error.response.data.message : error.message)
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
                    deleteProduct(id)
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

            if (editButton) {
                setDialog({ open: true, productId: editButton.dataset.id })
            }
            if (deleteButton) {
                deleteProductHandler(deleteButton.dataset.id)
            }
        }

        tableElement.addEventListener('change', onChange)
        tableElement.addEventListener('click', onClick)
        table.on('draw', syncCheckAll)
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
    }, [])

    const deleteSelected = async (ids) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/products`, {
                data: { ids },
                withCredentials: true
            })
            if (data.success) {
                successMsg(data.message)
                selectedRef.current.clear()
                setSelectedCount(0)
                reloadTable(true)
            }
        } catch (error) {
            errMsg(error.response ? error.response.data.message : error.message)
        }
    }

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
                deleteSelected(ids)
            }
        })
    }

    const closeDialog = useCallback(() => setDialog({ open: false, productId: null }), [])

    const productSaved = () => {
        closeDialog()
        reloadTable()
    }

    return (
        <>
            <MetaData title={'All Products'} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Sidebar />
                </Grid>

                <Grid size={{ xs: 12, md: 10 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, my: 4 }}>
                        <Typography variant="h3" component="h1" sx={{ mr: 'auto' }}>All Products</Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            disabled={selectedCount === 0}
                            onClick={deleteSelectedHandler}
                            startIcon={<i className="fa fa-trash"></i>}
                        >
                            Delete selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setDialog({ open: true, productId: null })}
                            startIcon={<i className="fa fa-plus"></i>}
                        >
                            New Product
                        </Button>
                    </Box>

                    <Paper sx={{ p: 2, overflowX: 'auto' }}>
                        <table ref={tableRef} className="display products-table" style={{ width: '100%' }}></table>
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

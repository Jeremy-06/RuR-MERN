import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
    ColumnsPanelTrigger,
    DataGrid,
    ExportCsv,
    ExportPrint,
    FilterPanelTrigger,
    QuickFilter,
    QuickFilterClear,
    QuickFilterControl,
    Toolbar,
    ToolbarButton,
} from '@mui/x-data-grid'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import ClearIcon from '@mui/icons-material/Clear'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import EmptyState from '../Layout/EmptyState'
import Loader from '../Layout/Loader'
import { errMsg, successMsg } from '../Utils/helpers'

const ROW_HEIGHT = 60
const HEADER_HEIGHT = 52
const ACTIONS_WIDTH = 124
const PAGE_SIZES = [10, 25, 50]
const DEFAULT_AVATAR = '/images/default_avatar.svg'

const TableToolbar = ({ onPanelHost }) => {
    const [exportAnchor, setExportAnchor] = useState(null)
    const closeExport = () => setExportAnchor(null)

    return (
        <>
            <Toolbar>
                <QuickFilter expanded render={(props) => <Box {...props} sx={{ flexGrow: 1, minWidth: 0 }} />}>
                    <QuickFilterControl
                        render={({ ref, ...control }) => (
                            <TextField
                                {...control}
                                inputRef={ref}
                                size="small"
                                margin="none"
                                placeholder="Search ..."
                                aria-label="Search this table"
                                slotProps={{
                                    ...control.slotProps,
                                    input: {
                                        ...control.slotProps?.input,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: control.value ? (
                                            <InputAdornment position="end">
                                                <QuickFilterClear edge="end" size="small" aria-label="Clear search">
                                                    <ClearIcon fontSize="small" />
                                                </QuickFilterClear>
                                            </InputAdornment>
                                        ) : null
                                    }
                                }}
                            />
                        )}
                    />
                </QuickFilter>

                <Tooltip title="Columns">
                    <ColumnsPanelTrigger render={<ToolbarButton />}>
                        <ViewColumnOutlinedIcon fontSize="small" />
                    </ColumnsPanelTrigger>
                </Tooltip>
                <Tooltip title="Filters">
                    <FilterPanelTrigger
                        render={(props, state) => (
                            <ToolbarButton {...props} color="default">
                                <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                    <FilterListIcon fontSize="small" />
                                </Badge>
                            </ToolbarButton>
                        )}
                    />
                </Tooltip>
                <Tooltip title="Export">
                    <ToolbarButton
                        aria-haspopup="menu"
                        aria-expanded={exportAnchor ? 'true' : undefined}
                        onClick={(e) => setExportAnchor(e.currentTarget)}
                    >
                        <FileDownloadOutlinedIcon fontSize="small" />
                    </ToolbarButton>
                </Tooltip>
                <Menu
                    anchorEl={exportAnchor}
                    open={Boolean(exportAnchor)}
                    onClose={closeExport}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <ExportCsv render={<MenuItem />} onClick={closeExport}>Download as CSV</ExportCsv>
                    <ExportPrint render={<MenuItem />} onClick={closeExport}>Print</ExportPrint>
                </Menu>
            </Toolbar>
            <Box ref={onPanelHost} />
        </>
    )
}

// The filter and columns panels sit in the page flow under the toolbar, so they push the
// table down instead of floating over the column headers
const InlinePanel = ({ open, host, id, target, onClose, children, 'aria-label': label, 'aria-labelledby': labelledBy }) => {
    if (!open || !host) return null

    const keyDownHandler = (e) => {
        if (e.key === 'Escape') {
            onClose()
            if (target) target.focus()
        }
    }

    return createPortal(
        <Box
            id={id}
            role="group"
            aria-label={label}
            aria-labelledby={labelledBy}
            onKeyDown={keyDownHandler}
            sx={{
                maxWidth: '100%',
                overflowX: 'auto',
                bgcolor: 'background.default',
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiDataGrid-paper, & .MuiDataGrid-panelWrapper': { maxWidth: '100%', bgcolor: 'transparent' },
                '& .MuiDataGrid-filterForm': { flexWrap: 'wrap', alignItems: 'center', gap: 1 },
                '& .MuiDataGrid-filterForm .MuiFormControl-root': { my: 0 },
            }}
        >
            {children}
        </Box>,
        host
    )
}

const NoMatches = () => <EmptyState flat title="No matching rows" message="Try a different search or filter." />

// Shortened id with the full one in a tooltip and a copy button
export const IdCell = ({ id, label }) => {
    const copyHandler = async () => {
        try {
            await navigator.clipboard.writeText(id)
            successMsg(`${label} ID copied`)
        } catch {
            errMsg('Could not copy the ID')
        }
    }

    return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Tooltip title={id}>
                <Typography component="span" variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>#…{id.slice(-8)}</Typography>
            </Tooltip>
            <Tooltip title="Copy ID">
                <IconButton size="small" aria-label={`Copy ${label} ID ${id}`} onClick={copyHandler}>
                    <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Tooltip>
        </Stack>
    )
}

// Name with smaller text below, optionally with an avatar
export const PersonCell = ({ name, detail, avatar, hideDetail }) => {
    return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            {avatar !== undefined && <Avatar src={avatar || DEFAULT_AVATAR} alt="" sx={{ width: 32, height: 32 }} />}
            <Box sx={{ minWidth: 0, lineHeight: 1.3 }}>
                <Typography variant="body2" noWrap>{name}</Typography>
                {detail && (
                    <Typography variant="caption" color="textSecondary" noWrap component="div" sx={hideDetail && { display: { xs: 'none', md: 'block' } }}>
                        {detail}
                    </Typography>
                )}
            </Box>
        </Stack>
    )
}

export const RowAction = ({ label, subject, icon, color = 'primary', to, onClick }) => {
    const linkProps = to ? { component: Link, to } : {}

    return (
        <Tooltip title={label}>
            <IconButton size="small" color={color} aria-label={`${label} ${subject}`} onClick={onClick} {...linkProps}>
                {icon}
            </IconButton>
        </Tooltip>
    )
}

// Shared table: same toolbar, panels, footer, sizes and states everywhere.
// Columns may set hideOnSmall; renderActions adds the fixed Actions column.
const AdminDataGrid = ({ label, rows, columns, loading, error, onRetry, empty, renderActions, sortField }) => {
    const [panelHost, setPanelHost] = useState(null)
    const [visibility, setVisibility] = useState({})
    const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'))

    const gridColumns = useMemo(() => {
        const list = columns.map(column => column.renderCell ? { display: 'flex', ...column } : column)
        if (!renderActions) return list
        return [...list, {
            field: 'actions',
            headerName: 'Actions',
            width: ACTIONS_WIDTH,
            resizable: false,
            hideable: false,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            disableExport: true,
            display: 'flex',
            renderCell: ({ row }) => <Stack direction="row" sx={{ gap: 0.5 }}>{renderActions(row)}</Stack>
        }]
    }, [columns, renderActions])

    const hiddenOnSmall = useMemo(() => isSmall
        ? Object.fromEntries(columns.filter(column => column.hideOnSmall).map(column => [column.field, false]))
        : {}, [columns, isSmall])

    if (error) {
        return (
            <EmptyState
                icon={<ErrorOutlinedIcon />}
                title="Could not load this table"
                message={error}
                action={onRetry && <Button variant="contained" onClick={onRetry}>Try again</Button>}
            />
        )
    }
    if (rows.length === 0) return loading ? <Loader /> : <EmptyState {...empty} />

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
            <DataGrid
                aria-label={label}
                rows={rows}
                columns={gridColumns}
                loading={loading}
                rowHeight={ROW_HEIGHT}
                columnHeaderHeight={HEADER_HEIGHT}
                pageSizeOptions={PAGE_SIZES}
                initialState={{
                    pagination: { paginationModel: { pageSize: PAGE_SIZES[0] } },
                    sorting: { sortModel: sortField ? [{ field: sortField, sort: 'desc' }] : [] }
                }}
                columnVisibilityModel={{ ...hiddenOnSmall, ...visibility }}
                onColumnVisibilityModelChange={setVisibility}
                disableRowSelectionOnClick
                showToolbar
                slots={{ toolbar: TableToolbar, panel: InlinePanel, noResultsOverlay: NoMatches, noRowsOverlay: NoMatches }}
                slotProps={{
                    toolbar: { onPanelHost: setPanelHost },
                    panel: { host: panelHost },
                    loadingOverlay: { variant: 'linear-progress', noRowsVariant: 'linear-progress' }
                }}
                sx={{
                    '--DataGrid-overlayHeight': '240px',
                    '& .MuiDataGrid-toolbar': { justifyContent: 'flex-start', alignItems: 'center', gap: 0.5, minHeight: 64, px: 2, py: 1.25 },
                    '& .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': { bgcolor: 'background.default' },
                    '& .MuiDataGrid-columnHeaderTitle': { color: 'text.secondary', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
                    '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': { px: 1.5 },
                    '& .MuiDataGrid-cell--flex': { alignItems: 'center' },
                    '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(15, 107, 224, 0.04)' },
                    // Bootstrap gives these <p> tags a bottom margin that pushes them off center
                    '& .MuiTablePagination-toolbar': { alignItems: 'center', minHeight: 52 },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { my: 0, lineHeight: 1.5 },
                    // DataGrid hides the page size on phones
                    '& .MuiTablePagination-root .MuiTablePagination-selectLabel': { display: 'block' },
                    '& .MuiTablePagination-root .MuiTablePagination-input': { display: 'inline-flex', mr: { xs: 1, sm: 4 } },
                }}
            />
        </Box>
    )
}

export default AdminDataGrid

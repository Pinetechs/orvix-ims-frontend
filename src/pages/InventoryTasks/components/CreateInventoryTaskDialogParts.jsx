import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';

export const inventoryDomainCards = [
  {
    value: 'VEHICLE',
    title: 'Vehicle Inventory',
    subtitle: 'VIN based inventory count for vehicle stock and store locations.',
    icon: DirectionsCarFilledRoundedIcon,
    accent: 'primary',
    note: 'Excel import enabled',
  },
  {
    value: 'SPARE_PART',
    title: 'Spare Parts',
    subtitle: 'Warehouse and rack based inventory for parts stock counts.',
    icon: Inventory2RoundedIcon,
    accent: 'warning',
    note: 'Excel import enabled',
  },
  {
    value: 'ASSET',
    title: 'Assets',
    subtitle: 'Fixed asset inventory by branch, department or physical location.',
    icon: WarehouseRoundedIcon,
    accent: 'success',
    note: 'Excel import enabled',
  },
];

export function SummaryItem({ label, value }) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 750, mb: 0.35 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{value || '-'}</Typography>
    </Box>
  );
}

export function ReviewPanel({ title, action, children }) {
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 3,
        borderColor: alpha(theme.palette.primary.main, 0.12),
        bgcolor: 'background.paper',
      })}
    >
      <CardContent sx={{ p: { xs: 1.7, sm: 2 }, '&:last-child': { pb: { xs: 1.7, sm: 2 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export function ImportMetricCard({ icon, label, value, helper }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              flex: '0 0 auto',
            })}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.74rem', fontWeight: 800 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 950, lineHeight: 1.25 }}>{value ?? 0}</Typography>
            {helper && (
              <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }} noWrap>
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ValueChipGroup({ title, values = [], emptyText }) {
  const visibleValues = values.slice(0, 8);
  const hiddenCount = Math.max(values.length - visibleValues.length, 0);

  return (
    <Box>
      <Typography sx={{ fontWeight: 900, mb: 1 }}>{title}</Typography>
      {values.length > 0 ? (
        <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
          {visibleValues.map((value) => (
            <Chip key={value} label={value} size="small" variant="outlined" sx={{ fontWeight: 750 }} />
          ))}
          {hiddenCount > 0 && <Chip label={`+${hiddenCount} more`} size="small" />}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ fontSize: '0.84rem' }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}

export function DialogLoadingState({
  title = 'Loading task workflow',
  description = 'Fetching the latest task state from the backend...',
}) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: 'background.paper',
      })}
    >
      <CardContent sx={{ p: { xs: 2.4, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 950, fontSize: '1rem' }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.86rem', mt: 0.4 }}>
              {description}
            </Typography>
          </Box>
          <LinearProgress sx={{ height: 7, borderRadius: 99 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function StepHeader({ icon, title, description }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.2 }}>
      <Box
        sx={(theme) => ({
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          color: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          flex: '0 0 auto',
        })}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 950 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

export function InventoryDomainCard({ option, selected, disabled, onSelect }) {
  const Icon = option.icon;

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: '100%',
        borderRadius: 3,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.palette[option.accent].main : alpha(theme.palette.divider, 0.85),
        bgcolor: selected ? alpha(theme.palette[option.accent].main, 0.055) : theme.palette.background.paper,
        boxShadow: selected ? `0 18px 35px ${alpha(theme.palette[option.accent].main, 0.14)}` : 'none',
        transition: 'all 160ms ease',
        opacity: disabled ? 0.72 : 1,
      })}
    >
      <CardActionArea disabled={disabled} onClick={() => onSelect(option.value)} sx={{ height: '100%', p: 2.1 }}>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Box
              sx={(theme) => ({
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette[option.accent].main,
                bgcolor: alpha(theme.palette[option.accent].main, 0.12),
              })}
            >
              <Icon />
            </Box>

            {selected && (
              <CheckCircleRoundedIcon
                sx={(theme) => ({
                  color: theme.palette[option.accent].main,
                })}
              />
            )}
          </Stack>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 950, mb: 0.5 }}>{option.title}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
              {option.subtitle}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={option.note}
            sx={(theme) => ({
              alignSelf: 'flex-start',
              fontWeight: 800,
              color: theme.palette[option.accent].dark,
              bgcolor: alpha(theme.palette[option.accent].main, 0.11),
            })}
          />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export const getVehicleImportRowId = (row, index) =>
  row.id ?? row.vehicleInventoryItemId ?? row.vinNo ?? row.vin ?? row.VIN ?? row.darArtId ?? `vehicle-row-${index}`;

export const vehicleImportPreviewColumns = [
  {
    field: 'vinNo',
    headerName: 'VIN',
    minWidth: 185,
    flex: 1.3,
    valueGetter: ({ row }) => row.vinNo || row.vin || row.VIN || row.chassisNo || '-',
  },
  {
    field: 'partNo',
    headerName: 'Part No',
    minWidth: 110,
    flex: 0.75,
    valueGetter: ({ row }) => row.partNo || row.partNumber || '-',
  },
  {
    field: 'make',
    headerName: 'Make',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.make || row.MAKE || '-',
  },
  {
    field: 'modelName',
    headerName: 'Model',
    minWidth: 135,
    flex: 0.95,
    valueGetter: ({ row }) => row.modelName || row.model || row.MODEL || '-',
  },
  {
    field: 'modelYear',
    headerName: 'Year',
    minWidth: 90,
    flex: 0.5,
    valueGetter: ({ row }) => row.modelYear || row.year || row.YEAR || '-',
  },
  {
    field: 'specification',
    headerName: 'Specification',
    minWidth: 180,
    flex: 1.15,
    valueGetter: ({ row }) => row.specification || row.spec || '-',
  },
  {
    field: 'colorNo',
    headerName: 'Color',
    minWidth: 105,
    flex: 0.7,
    valueGetter: ({ row }) => row.colorNo || row.color || row.COLOR || '-',
  },
  {
    field: 'interiorColor',
    headerName: 'Interior',
    minWidth: 110,
    flex: 0.7,
    valueGetter: ({ row }) => row.interiorColor || '-',
  },
  {
    field: 'storeNo',
    headerName: 'Store No',
    minWidth: 105,
    flex: 0.8,
    valueGetter: ({ row }) => row.storeNo || row.stStoreNo || row.ST_STORE_NO || row.storeNumber || '-',
  },
  {
    field: 'location',
    headerName: 'Location',
    minWidth: 160,
    flex: 1,
    valueGetter: ({ row }) => row.locationName || row.location || row.LOCATION || row.storeLocation || '-',
  },
  {
    field: 'stockStatus',
    headerName: 'Stock Status',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.stockStatus || '-',
  },
  {
    field: 'mchStatus',
    headerName: 'MCH Status',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.mchStatus || '-',
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'number',
    minWidth: 80,
    flex: 0.45,
    valueGetter: ({ row }) => row.quantity ?? '-',
  },
  {
    field: 'receiptDate',
    headerName: 'Receipt Date',
    minWidth: 125,
    flex: 0.8,
    valueGetter: ({ row }) => row.receiptDate || '-',
  },
  {
    field: 'darArtId',
    headerName: 'DAR_ART_ID',
    minWidth: 115,
    flex: 0.75,
    valueGetter: ({ row }) => row.darArtId || '-',
  },
];


export const getAssetImportRowId = (row, index) =>
  row.id ?? row.assetInventoryItemId ?? row.barcode ?? row.assetBarcode ?? row.BARCODE ?? `asset-row-${index}`;

export const assetImportPreviewColumns = [
  {
    field: 'barcode',
    headerName: 'Barcode',
    minWidth: 145,
    flex: 0.9,
    valueGetter: ({ row }) => row.barcode || row.assetBarcode || row.BARCODE || '-',
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth: 230,
    flex: 1.45,
    valueGetter: ({ row }) => row.description || row.assetDescription || row.DESCRIPTION || '-',
  },
  {
    field: 'assetCategory',
    headerName: 'Category',
    minWidth: 160,
    flex: 1,
    valueGetter: ({ row }) => row.assetCategory || row.category || row.ASSET_CATEGORY || '-',
  },
  {
    field: 'assetType',
    headerName: 'Type',
    minWidth: 135,
    flex: 0.9,
    valueGetter: ({ row }) => row.assetType || row.type || row.ASSET_TYPE || '-',
  },
  {
    field: 'plannedLocationName',
    headerName: 'Location',
    minWidth: 160,
    flex: 1,
    valueGetter: ({ row }) => row.plannedLocationName || row.locationName || row.location || row.LOCATION || '-',
  },
  {
    field: 'plannedFloorName',
    headerName: 'Floor',
    minWidth: 125,
    flex: 0.75,
    valueGetter: ({ row }) => row.plannedFloorName || row.floorName || row.floor || row.FLOOR || '-',
  },
  {
    field: 'plannedPlaceName',
    headerName: 'Place',
    minWidth: 150,
    flex: 0.9,
    valueGetter: ({ row }) => row.plannedPlaceName || row.placeName || row.place || row.PLACE || '-',
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'number',
    minWidth: 80,
    flex: 0.45,
    valueGetter: ({ row }) => row.quantity ?? row.qty ?? '-',
  },
  {
    field: 'bookValue',
    headerName: 'Book Value',
    type: 'number',
    minWidth: 120,
    flex: 0.75,
    valueGetter: ({ row }) => row.bookValue ?? '-',
  },
  {
    field: 'finalBookValue',
    headerName: 'Final Book Value',
    type: 'number',
    minWidth: 145,
    flex: 0.85,
    valueGetter: ({ row }) => row.finalBookValue ?? '-',
  },
  {
    field: 'assetCondition',
    headerName: 'Condition',
    minWidth: 120,
    flex: 0.75,
    valueGetter: ({ row }) => row.assetCondition || row.status || row.condition || '-',
  },
  {
    field: 'branchCode',
    headerName: 'Branch',
    minWidth: 100,
    flex: 0.6,
    valueGetter: ({ row }) => row.branchCode || row.branch || '-',
  },
  {
    field: 'status',
    headerName: 'Scan Status',
    minWidth: 135,
    flex: 0.8,
    valueGetter: ({ row }) => row.status || row.scanStatus || 'NOT_SCANNED',
  },
];


export const getSparePartImportRowId = (row, index) => {
  const compoundKey = [
    row.itemNo || row.itemNumber || row.ITEM_NO,
    row.branchName || row.branch,
    row.locationCode || row.locationName || row.location,
  ]
    .filter(Boolean)
    .join('-');

  return (row.id ?? row.sparePartInventoryItemId ?? compoundKey) || `spare-part-row-${index}`;
};

export const sparePartImportPreviewColumns = [
  {
    field: 'itemNo',
    headerName: 'Item No',
    minWidth: 160,
    flex: 1,
    valueGetter: ({ row }) => row.itemNo || row.itemNumber || row.ITEM_NO || row.barcode || '-',
  },
  {
    field: 'brandName',
    headerName: 'Brand',
    minWidth: 120,
    flex: 0.8,
    valueGetter: ({ row }) => row.brandName || row.brand || row.BRAND || '-',
  },
  {
    field: 'plannedBranchName',
    headerName: 'Branch',
    minWidth: 150,
    flex: 0.95,
    valueGetter: ({ row }) => row.plannedBranchName || row.branchName || row.branch || row.BRANCH || '-',
  },
  {
    field: 'plannedLocationCode',
    headerName: 'Location / Rack',
    minWidth: 155,
    flex: 1,
    valueGetter: ({ row }) => row.plannedLocationCode || row.plannedLocationName || row.locationCode || row.locationName || row.location || row.LOCATION || '-',
  },
  {
    field: 'qty',
    headerName: 'QTY',
    type: 'number',
    minWidth: 90,
    flex: 0.55,
    valueGetter: ({ row }) => row.qty ?? row.quantity ?? row.QTY ?? '-',
  },
  {
    field: 'stockQty',
    headerName: 'STKQTY',
    type: 'number',
    minWidth: 105,
    flex: 0.65,
    valueGetter: ({ row }) => row.stockQty ?? row.stkQty ?? row.STKQTY ?? '-',
  },
  {
    field: 'frozenQty',
    headerName: 'FZQTY',
    type: 'number',
    minWidth: 95,
    flex: 0.6,
    valueGetter: ({ row }) => row.frozenQty ?? row.fzQty ?? row.FZQTY ?? '-',
  },
  {
    field: 'actualQty',
    headerName: 'Counted',
    type: 'number',
    minWidth: 100,
    flex: 0.65,
    valueGetter: ({ row }) => row.actualQty ?? row.countedQty ?? '-',
  },
  {
    field: 'varianceQty',
    headerName: 'Variance',
    type: 'number',
    minWidth: 105,
    flex: 0.65,
    valueGetter: ({ row }) => row.varianceQty ?? '-',
  },
  {
    field: 'locationStatus',
    headerName: 'Location Status',
    minWidth: 150,
    flex: 0.9,
    valueGetter: ({ row }) => row.locationStatus || '-',
  },
  {
    field: 'quantityStatus',
    headerName: 'Qty Status',
    minWidth: 135,
    flex: 0.8,
    valueGetter: ({ row }) => row.quantityStatus || '-',
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 135,
    flex: 0.8,
    valueGetter: ({ row }) => row.status || row.scanResult || row.inventoryStatus || 'NOT_COUNTED',
  },
];

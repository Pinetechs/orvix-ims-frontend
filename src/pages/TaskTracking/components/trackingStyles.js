import { alpha } from '@mui/material/styles';

export const trackingPanelSx = {
  overflow: 'hidden',
  maxWidth: '100%',
  borderRadius: 1.5,
  boxShadow: '0 2px 10px rgba(1,23,54,.045)',
};

export const trackingToolbarSx = (theme) => ({
  p: { xs: 2, md: 2.5 },
  gap: 2,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#FAFBFD',
});

export const trackingSectionIconSx = (tone = 'primary') => (theme) => ({
  width: 38,
  height: 38,
  borderRadius: 1.5,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  color: `${tone}.main`,
  bgcolor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.075),
});

export const trackingTableSx = (theme) => ({
  '& .MuiTableCell-root': {
    px: 1.7,
    py: 1.35,
    borderColor: alpha(theme.palette.primary.dark, 0.065),
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    py: 1.5,
    bgcolor: '#F7F9FD',
    color: theme.palette.text.secondary,
    fontSize: '0.71rem',
    fontWeight: 950,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.1)}`,
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'background-color 140ms ease',
    '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.012) },
    '&:hover': { bgcolor: `${alpha(theme.palette.primary.main, 0.045)} !important` },
  },
  '& .MuiTableBody-root .MuiTableCell-root': {
    fontSize: '0.82rem',
  },
});

export const trackingPaginationSx = {
  px: 1,
  minHeight: 58,
  borderTop: 1,
  borderColor: 'divider',
  bgcolor: 'rgba(248,250,255,.75)',
};

export const trackingFiltersSx = {
  '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
  '& .MuiInputBase-input': { fontSize: '0.82rem' },
};

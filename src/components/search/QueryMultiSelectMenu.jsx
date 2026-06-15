import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useSearchParams } from 'react-router-dom';

import { parseCsvParam, writeQueryParam } from './queryParamHelpers.js';

function QueryMultiSelectMenu({
  title = 'Select',
  queryParam,
  options = [],
  allLabel = 'All',
  buttonProps,
  resetPage = true,
  pageParam = 'page',
  menuWidth = 360,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const selectedValues = useMemo(() => {
    const raw = searchParams.get(queryParam);
    const values = parseCsvParam(raw);

    const allowedValues = new Set(options.map((option) => String(option.value)));

    return values.filter((value) => allowedValues.has(String(value)));
  }, [searchParams, queryParam, options]);

  const selectedSet = useMemo(() => {
    return new Set(selectedValues.map(String));
  }, [selectedValues]);

  const updateValues = (values) => {
    const next = writeQueryParam(searchParams, queryParam, values, {
      resetPage,
      pageParam,
    });

    setSearchParams(next, { replace: true });
  };

  const toggleValue = (value) => {
    const valueText = String(value);

    if (selectedSet.has(valueText)) {
      updateValues(selectedValues.filter((item) => String(item) !== valueText));
      return;
    }

    updateValues([...selectedValues, valueText]);
  };

  const clearAll = () => {
    updateValues([]);
  };

  return (
    <Box>
      <Badge
        color="primary"
        badgeContent={selectedValues.length}
        invisible={selectedValues.length === 0}
      >
        <Button
          variant="outlined"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          endIcon={open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          {...buttonProps}
        >
          {title}
        </Button>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            width: menuWidth,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 380,
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>
            Select one or more values
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={clearAll}>
          <FormControlLabel
            label={allLabel}
            control={<Checkbox checked={selectedValues.length === 0} />}
          />
        </MenuItem>

        <Divider />

        <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
          {options.map((option) => {
            const checked = selectedSet.has(String(option.value));

            return (
              <MenuItem key={option.value} onClick={() => toggleValue(option.value)}>
                <FormControlLabel
                  label={option.label}
                  control={<Checkbox checked={checked} />}
                />
              </MenuItem>
            );
          })}
        </Box>
      </Menu>
    </Box>
  );
}

export default QueryMultiSelectMenu;
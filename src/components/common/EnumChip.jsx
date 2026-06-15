import React from 'react';
import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

function EnumChip({ value,config = {},fallbackLabel = 'N/A',size = 'small',variant = 'outlined', defaultColor = 'default',sx,}) {
  const item = config[value] || {};

  const label = item.label || value || fallbackLabel;
  const color = item.color || defaultColor;
  const icon = item.icon || undefined;
  const customSx = item.sx || {};

  return (
    <Chip
      size={size}
      label={label}
      color={color}
      icon={icon}
      variant={item.variant || variant}
      sx={(theme) => ({
        fontWeight: 850,
        ...(item.softColor
          ? {
              color: item.softColor,
              bgcolor: alpha(item.softColor, 0.1),
              borderColor: alpha(item.softColor, 0.24),
              '& .MuiChip-icon': {
                color: item.softColor,
              },
            }
          : {}),
        ...(typeof customSx === 'function' ? customSx(theme) : customSx),
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
    />
  );
}

export default EnumChip;
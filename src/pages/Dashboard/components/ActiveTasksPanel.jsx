import React from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';

import EnumChip from '../../../components/common/EnumChip.jsx';
import { INVENTORY_DOMAIN_CHIP_CONFIG, INVENTORY_TASK_STATUS_CHIP_CONFIG } from '../../../constants/enumChipConfigs.jsx';
import { clampPercentage, formatDashboardDateTime, formatDashboardNumber } from '../utils/dashboardFormatters.js';

function ActiveTasksPanel({ tasks = [], onOpenTask, onOpenAllTasks }) {
  const { t, i18n } = useTranslation();
  const number = (value) => formatDashboardNumber(value, i18n.language);
  const domainConfig = Object.fromEntries(
    Object.entries(INVENTORY_DOMAIN_CHIP_CONFIG).map(([key, value]) => [
      key,
      { ...value, label: t(`dashboardPage.domains.names.${key}`) },
    ]),
  );
  const statusConfig = Object.fromEntries(
    Object.entries(INVENTORY_TASK_STATUS_CHIP_CONFIG).map(([key, value]) => [
      key,
      { ...value, label: t(`dashboardPage.statuses.${key}`) },
    ]),
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.2, md: 2.8 }, '&:last-child': { pb: { xs: 2.2, md: 2.8 } } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
              {t('dashboardPage.recentTasks.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.35 }}>
              {t('dashboardPage.recentTasks.subtitle')}
            </Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={onOpenAllTasks}>
            {t('dashboardPage.recentTasks.viewAll')}
          </Button>
        </Stack>

        {tasks.length === 0 ? (
          <Box sx={(theme) => ({ py: 6, textAlign: 'center', borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.035) })}>
            <Typography sx={{ fontWeight: 900 }}>{t('dashboardPage.recentTasks.emptyTitle')}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.5 }}>
              {t('dashboardPage.recentTasks.emptyText')}
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider flexItem />}>
            {tasks.map((task) => {
              const execution = task.execution || {};
              const activity = task.activity || {};
              const progress = clampPercentage(execution.progressPercentage);

              return (
                <Box key={task.taskId} sx={{ py: 1.55 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontWeight: 950 }} noWrap>{task.taskName || task.taskNumber}</Typography>
                        {task.stalled && (
                          <Chip
                            size="small"
                            color="error"
                            variant="outlined"
                            icon={<WarningAmberRoundedIcon />}
                            label={t('dashboardPage.recentTasks.stalled')}
                          />
                        )}
                      </Stack>
                      <Typography color="text.secondary" sx={{ fontSize: '0.76rem', mt: 0.25 }} noWrap>
                        {task.taskNumber} · {task.company?.name || '-'}
                      </Typography>
                      <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 0.85 }}>
                        <EnumChip value={task.domain} config={domainConfig} />
                        <EnumChip value={task.status} config={statusConfig} />
                        {Number(task.attentionCount) > 0 && (
                          <Chip
                            size="small"
                            color="error"
                            variant="outlined"
                            label={t('dashboardPage.recentTasks.issues', { count: number(task.attentionCount) })}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.55 }}>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 900 }}>{progress}%</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                          {number(execution.processedExpected)}/{number(execution.totalExpected)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={(theme) => ({
                          height: 7,
                          borderRadius: 99,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': { borderRadius: 99 },
                        })}
                      />
                      <Stack direction="row" alignItems="center" spacing={0.45} sx={{ mt: 0.7 }}>
                        <ScheduleRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography color="text.secondary" sx={{ fontSize: '0.69rem' }} noWrap>
                          {t('dashboardPage.recentTasks.lastActivity', {
                            value: formatDashboardDateTime(activity.lastActivityAt || task.updatedAt, i18n.language),
                          })}
                        </Typography>
                      </Stack>
                    </Box>

                    <Button size="small" variant="outlined" onClick={() => onOpenTask(task)} sx={{ flexShrink: 0 }}>
                      {t('dashboardPage.recentTasks.open')}
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default ActiveTasksPanel;

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import { DialogLoadingState } from './components/CreateInventoryTaskDialogParts.jsx';
import { useCreateInventoryTaskWizard } from './hooks/create-task/useCreateInventoryTaskWizard.js';

function CreateInventoryTaskDialog({ open, taskId: resumeTaskId = null, onClose }) {
  const wizard = useCreateInventoryTaskWizard({ open, taskId: resumeTaskId, onClose });
  const CurrentStepComponent = wizard.currentStep?.component;

  const closeDisabled = !wizard.canClose || wizard.closeBlocked || wizard.waitingForResumeDetails;
  const backDisabled = wizard.nextLoading || wizard.closeBlocked || !wizard.canBack;
  const primaryDisabled = wizard.nextDisabled || wizard.nextLoading || wizard.waitingForResumeDetails;
  const primaryLabel = wizard.nextLoading ? wizard.nextLoadingLabel || 'Processing...' : wizard.nextLabel;
  const primaryStartIcon = wizard.nextStartIcon;
  const primaryEndIcon = wizard.nextEndIcon || (!wizard.isFinalStep ? <KeyboardArrowRightRoundedIcon /> : null);

  return (
    <Dialog
      open={open}
      onClose={wizard.handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          minHeight: { xs: '100%', sm: 700 },
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
          sx={(theme) => ({
            p: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(
              theme.palette.secondary.main,
              0.08,
            )})`,
          })}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={(theme) => ({
                  width: 50,
                  height: 50,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                })}
              >
                <AssignmentRoundedIcon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 950, lineHeight: 1.2 }} noWrap>
                  {wizard.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                  {wizard.subtitle}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={wizard.handleClose} disabled={closeDisabled}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.012) }}>
          {wizard.waitingForResumeDetails ? (
            <DialogLoadingState />
          ) : (
            <>
              <Stepper activeStep={wizard.activeStep} alternativeLabel sx={{ mb: 3 }}>
                {wizard.steps.map((step) => (
                  <Step key={step.key}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {wizard.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {wizard.error}
                </Alert>
              )}

              <Card
                elevation={0}
                sx={(theme) => ({
                  borderRadius: 3.5,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 18px 45px ${alpha(theme.palette.common.black, 0.045)}`,
                })}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.6 } }}>
                  {CurrentStepComponent ? <CurrentStepComponent wizard={wizard} /> : null}
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.4, justifyContent: 'space-between', bgcolor: 'background.paper' }}>
          <Button onClick={wizard.handleClose} disabled={closeDisabled}>
            Close
          </Button>

          {!wizard.waitingForResumeDetails && (
            <Stack direction="row" spacing={1.2}>
              <Button
                variant="outlined"
                startIcon={<KeyboardArrowLeftRoundedIcon />}
                onClick={wizard.goBack}
                disabled={backDisabled}
              >
                Back
              </Button>

              <Button
                variant="contained"
                startIcon={primaryStartIcon}
                endIcon={primaryEndIcon}
                onClick={wizard.handleNext}
                disabled={primaryDisabled}
              >
                {primaryLabel}
              </Button>
            </Stack>
          )}
        </DialogActions>
    </Dialog>
  );
}

export default CreateInventoryTaskDialog;

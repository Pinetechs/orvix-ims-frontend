import React, { useEffect } from 'react';

import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

export function useDomainNotImplementedStep({ wizard }) {
  useEffect(() => {
    wizard.setStepConfig({
      subtitle: 'This domain is saved as Draft. Its import, review and assignment workflow can be added without changing the dialog shell.',
      canClose: true,
      closeBlocked: false,
      closeConfirmMessage: null,
      nextLabel: 'Save Draft',
      nextDisabled: false,
      nextLoading: false,
      onNext: () => {
        wizard.markFinished();
        wizard.close(true);
      },
      nextStartIcon: React.createElement(SaveRoundedIcon),
    });

    return wizard.resetStepControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.inventoryDomain]);
}

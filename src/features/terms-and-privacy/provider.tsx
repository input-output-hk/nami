import React, { ReactNode } from 'react';
import { TermsAndPrivacyModal } from './ui/TermsAndPrivacyModal';
import { useShowUpdatePrompt } from './hooks';

interface Props {
  children: ReactNode;
}

export const TermsAndPrivacyProvider = ({ children }: Props) => {
  const { showUpdatePrompt, hideUpdatePrompt } = useShowUpdatePrompt();

  if (showUpdatePrompt === undefined) {
    return;
  }

  return showUpdatePrompt ? (
    <TermsAndPrivacyModal onContinue={hideUpdatePrompt} />
  ) : (
    children
  );
};

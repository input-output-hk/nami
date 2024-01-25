import React, { ReactNode } from 'react';
import { TermsAndPrivacyModal } from './ui/TermsAndPrivacyModal';
import { useShowUpdatePrompt } from './hooks';

interface Props {
  children: ReactNode;
}

export const TermsAndPrivacyProvider = ({ children }: Props) => {
  const { shouldShowUpdatePrompt, hideUpdatePrompt } = useShowUpdatePrompt();

  if (shouldShowUpdatePrompt === undefined) {
    return;
  }

  return shouldShowUpdatePrompt ? (
    <TermsAndPrivacyModal onContinue={hideUpdatePrompt} />
  ) : (
    children
  );
};

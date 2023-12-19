export enum ExtensionViews {
  Extended = 'extended',
  Popup = 'popup',
}

export type PostHogMetadata = {
  distinct_id?: string;
  alias_id?: string;
  view: ExtensionViews;
  sent_at_local: string;
  posthog_project_id: number;
  network: 'mainnet' | 'preprod' | 'preview';
};

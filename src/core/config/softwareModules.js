/** Values stored in sessionStorage as `software_module` after login. */
export const SOFTWARE_MODULE_IDS = {
  backoffice: 'backoffice',
  trading: 'trading',
  crm: 'crm',
  hr: 'hr',
  project: 'project',
};

/** Login dropdown options; `available` means full UI is shipped for that module. */
export const SOFTWARE_MODULE_OPTIONS = [
  { value: SOFTWARE_MODULE_IDS.backoffice, label: 'Back office', available: true },
  { value: SOFTWARE_MODULE_IDS.trading, label: 'Trading', available: false },
  { value: SOFTWARE_MODULE_IDS.crm, label: 'CRM', available: false },
  { value: SOFTWARE_MODULE_IDS.hr, label: 'HR', available: false },
  { value: SOFTWARE_MODULE_IDS.project, label: 'Project', available: false },
];

export const DEFAULT_SOFTWARE_MODULE = SOFTWARE_MODULE_IDS.backoffice;

export type ProfileSettingsData = {
  displayName: string;
  email: string;
  address: string;
  zipCode: string;
  signInMethod: string;
  accountCreated: string;
  lastSignIn: string;
};

export type ProfileSettingsInput = {
  address: string;
  zipCode: string;
};

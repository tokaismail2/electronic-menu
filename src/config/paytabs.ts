import paytabs from 'paytabs_pt2';
const paytabsConfig = {
  profile_id: process.env.PAYTABS_PROFILE_ID,
  server_key: process.env.PAYTABS_SERVER_KEY,
  region: process.env.PAYTABS_REGION || 'SAU', // SAU, ARE, OMN, JOR, EGY

  // Environment
  isTest: process.env.NODE_ENV !== 'production',

  // Callback URLs
  callback_url: process.env.PAYTABS_CALLBACK_URL,
  return_url: process.env.PAYTABS_RETURN_URL,
};

export default paytabsConfig;

// Validate PayTabs configuration
export const validatePayTabsConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!paytabsConfig.profile_id) {
    errors.push('PAYTABS_PROFILE_ID is not set in environment variables');
  }

  if (!paytabsConfig.server_key) {
    errors.push('PAYTABS_SERVER_KEY is not set in environment variables');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Check if PayTabs is configured
export const isPayTabsConfigured = (): boolean => {
  return !!(paytabsConfig.profile_id && paytabsConfig.server_key);
};

// PayTabs instance
export const initPayTabs = () => {
  const validation = validatePayTabsConfig();

  if (!validation.valid) {
    console.warn('⚠️  PayTabs configuration incomplete:');
    validation.errors.forEach(error => console.warn(`   - ${error}`));
    console.warn('   PayTabs payment features will be disabled.');
    console.warn('   Please set the required environment variables in your .env file.');
    console.warn('   See ENV_CONFIGURATION.md for more details.');
    return;
  }

  try {
    paytabs.setConfig(
      paytabsConfig.profile_id as string,
      paytabsConfig.server_key as string,
      paytabsConfig.region as string
    );

  } catch (error: any) {
    console.error('❌ Failed to initialize PayTabs:', error.message);
    console.warn('   PayTabs payment features will be disabled.');
  }
};


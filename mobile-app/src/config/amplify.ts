import { Amplify } from 'aws-amplify';

const region = process.env.EXPO_PUBLIC_COGNITO_REGION ?? 'ap-south-1';
const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? 'ap-south-1_6SDlpRoIV';
const userPoolClientId = process.env.EXPO_PUBLIC_COGNITO_APP_CLIENT_ID ?? '73rg2jp451loqmf9ug0jqsb7o6';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      region,
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
    },
  },
};

try {
  Amplify.configure(awsConfig);
} catch (e) {
  console.warn('Amplify configure:', e);
}

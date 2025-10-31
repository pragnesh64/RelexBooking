import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
});

// Attach Post Confirmation trigger using CDK
backend.postConfirmation.resources.lambda.addPermission('CognitoInvoke', {
  principal: 'cognito-idp.amazonaws.com',
  sourceArn: backend.auth.resources.userPool.userPoolArn,
});

backend.auth.resources.cfnUserPool.lambdaConfig = {
  postConfirmation: backend.postConfirmation.resources.lambda.functionArn,
};

export default backend;

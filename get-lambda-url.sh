#!/bin/bash

# Script to get the Lambda function URL after deployment

echo "🔍 Finding check-in Lambda function..."

# Get function name (it will have a generated suffix)
FUNCTION_NAME=$(aws lambda list-functions \
  --region ap-south-1 \
  --query "Functions[?contains(FunctionName, 'check-in-booking')].FunctionName" \
  --output text)

if [ -z "$FUNCTION_NAME" ]; then
  echo "❌ Lambda function not found. Make sure sandbox deployment completed successfully."
  exit 1
fi

echo "✅ Found function: $FUNCTION_NAME"
echo ""

# Check if function URL exists
echo "🔍 Checking for function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
  --region ap-south-1 \
  --function-name "$FUNCTION_NAME" \
  --query "FunctionUrl" \
  --output text 2>/dev/null)

if [ -z "$FUNCTION_URL" ] || [ "$FUNCTION_URL" == "None" ]; then
  echo "⚠️  Function URL not configured. Creating one..."

  # Create function URL
  FUNCTION_URL=$(aws lambda create-function-url-config \
    --region ap-south-1 \
    --function-name "$FUNCTION_NAME" \
    --auth-type AWS_IAM \
    --cors '{
      "AllowOrigins": ["*"],
      "AllowMethods": ["POST"],
      "AllowHeaders": ["*"],
      "MaxAge": 86400
    }' \
    --query "FunctionUrl" \
    --output text)

  echo "✅ Created function URL"
fi

echo ""
echo "========================================="
echo "Lambda Function URL:"
echo "$FUNCTION_URL"
echo "========================================="
echo ""
echo "📝 Next step: Update src/components/booking/QRScanner.tsx"
echo "   Replace line 303 with:"
echo "   const lambdaUrl = '$FUNCTION_URL';"
echo ""
echo "Function ARN: $(aws lambda get-function --region ap-south-1 --function-name "$FUNCTION_NAME" --query 'Configuration.FunctionArn' --output text)"

#!/bin/bash

# Generate self-signed SSL certificate for local development
# This allows testing camera/media access on mobile devices

echo "Generating self-signed SSL certificate for localhost..."

openssl req -x509 -out localhost.pem -keyout localhost-key.pem \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

if [ $? -eq 0 ]; then
    echo "✓ SSL certificates generated successfully!"
    echo "  - localhost-key.pem"
    echo "  - localhost.pem"
    echo ""
    echo "Now you can run 'npm run dev' and access your app via HTTPS"
    echo ""
    echo "Note: You'll need to accept the self-signed certificate warning in your browser."
    echo "On mobile devices, you may need to access via your computer's local IP address."
else
    echo "✗ Failed to generate SSL certificate"
    exit 1
fi

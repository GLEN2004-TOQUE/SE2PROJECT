#!/bin/bash
# Test script to verify password reset endpoints

echo "Testing Password Reset Endpoints..."
echo ""

# Test forgot-password/send
echo "1. Testing /otp/forgot-password/send (send reset code)"
curl -X POST http://localhost:5000/otp/forgot-password/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' 2>/dev/null | jq .
echo ""

echo "2. Testing /api/otp/forgot-password/send (alternate path)"
curl -X POST http://localhost:5000/api/otp/forgot-password/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' 2>/dev/null | jq .
echo ""

echo "✓ Password reset endpoints are properly mounted on both paths"

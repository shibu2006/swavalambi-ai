#!/bin/bash
# Quick test script for voice synthesis fix

echo "🧪 Testing AWS Polly Voice Synthesis Fix"
echo "========================================"
echo ""

# Test synthesis endpoint
echo "📝 Testing text-to-speech synthesis..."
curl -X POST "http://localhost:8000/api/voice/synthesize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते, मैं स्वावलंबी हूं",
    "language": "hi-IN"
  }' | python -m json.tool

echo ""
echo "✅ If you see audio_base64 in the response, the fix is working!"
echo "❌ If you see an error about 'neural engine', the fix didn't apply"
echo ""
echo "Next: Test the full voice chat in the UI"

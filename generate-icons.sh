# PWA Icon Generation Script
# This script creates the required PWA icons for JoyCarDecors

# Create a simple SVG icon based on the car logo
cat > public/icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="256" fill="#1f2937"/>
  
  <!-- Car Body -->
  <path d="M150 300 L362 300 L362 280 L350 260 L320 240 L192 240 L162 260 L150 280 Z" fill="white" stroke="white" stroke-width="4"/>
  
  <!-- Front Wheel - Letter C -->
  <circle cx="200" cy="340" r="32" fill="#FFD700" stroke="white" stroke-width="4"/>
  <text x="200" y="350" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937" font-family="Arial, sans-serif">C</text>
  
  <!-- Rear Wheel - Letter D -->
  <circle cx="312" cy="340" r="32" fill="white" stroke="white" stroke-width="4"/>
  <text x="312" y="350" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937" font-family="Arial, sans-serif">D</text>
  
  <!-- Ground Line -->
  <line x1="170" y1="380" x2="342" y2="380" stroke="white" stroke-width="8"/>
  
  <!-- Speed Lines -->
  <line x1="350" y1="320" x2="380" y2="320" stroke="white" stroke-width="4"/>
  <line x1="350" y1="330" x2="375" y2="330" stroke="white" stroke-width="4"/>
  <line x1="350" y1="340" x2="370" y2="340" stroke="white" stroke-width="4"/>
</svg>
EOF

echo "Created icon.svg for PWA icons"
echo "Note: You'll need to convert this SVG to PNG formats for the PWA to work properly"
echo "Required sizes: 192x192, 512x512, apple-touch-icon (180x180)"

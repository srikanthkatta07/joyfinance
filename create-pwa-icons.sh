#!/bin/bash

# Create PWA Icons for JoyCarDecors
# This script creates placeholder icons - replace with actual car logo images

echo "Creating PWA icons for JoyCarDecors..."

# Create a simple SVG template for the car logo
cat > public/icon-template.svg << 'EOF'
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

# Create 192x192 icon
cat > public/pwa-192x192.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
EOF

# Create 512x512 icon  
cat > public/pwa-512x512.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
EOF

# Create apple touch icon
cat > public/apple-touch-icon.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
EOF

# Create masked icon
cat > public/masked-icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="256" fill="#1f2937"/>
  <path d="M150 300 L362 300 L362 280 L350 260 L320 240 L192 240 L162 260 L150 280 Z" fill="white"/>
  <circle cx="200" cy="340" r="32" fill="#FFD700"/>
  <text x="200" y="350" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937" font-family="Arial">C</text>
  <circle cx="312" cy="340" r="32" fill="white"/>
  <text x="312" y="350" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937" font-family="Arial">D</text>
  <line x1="170" y1="380" x2="342" y2="380" stroke="white" stroke-width="8"/>
</svg>
EOF

echo "PWA icons created successfully!"
echo "Note: The PNG files are placeholders. Replace them with actual car logo images:"
echo "- pwa-192x192.png (192x192 pixels)"
echo "- pwa-512x512.png (512x512 pixels)" 
echo "- apple-touch-icon.png (180x180 pixels)"
echo ""
echo "The SVG template (icon-template.svg) shows the car logo design."
echo "You can use online tools to convert SVG to PNG at the required sizes."

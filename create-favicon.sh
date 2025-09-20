#!/bin/bash

# Create a simple car favicon using ImageMagick
# This creates a 16x16 PNG favicon with a car icon

# Create a temporary SVG file
cat > temp_car.svg << 'SVGEOF'
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Car body -->
  <rect x="3" y="6" width="10" height="4" rx="1" fill="#1f2937"/>
  
  <!-- Car roof -->
  <path d="M5 6 L7 4 L9 4 L11 6" stroke="#1f2937" stroke-width="1" fill="none"/>
  
  <!-- Wheels -->
  <circle cx="5" cy="11" r="1.5" fill="#374151"/>
  <circle cx="11" cy="11" r="1.5" fill="#374151"/>
  
  <!-- Wheel centers -->
  <circle cx="5" cy="11" r="0.8" fill="#6b7280"/>
  <circle cx="11" cy="11" r="0.8" fill="#6b7280"/>
  
  <!-- Headlights -->
  <circle cx="4" cy="8" r="0.5" fill="#fbbf24"/>
  <circle cx="12" cy="8" r="0.5" fill="#fbbf24"/>
  
  <!-- Windshield -->
  <path d="M5.5 6 L7.5 4.5 L8.5 4.5 L10.5 6" fill="#e5e7eb" opacity="0.8"/>
</svg>
SVGEOF

# Convert SVG to PNG favicon
if command -v convert &> /dev/null; then
    convert temp_car.svg -resize 16x16 favicon-16x16.png
    convert temp_car.svg -resize 32x32 favicon-32x32.png
    echo "✅ Created favicon PNG files"
else
    echo "⚠️  ImageMagick not found, using SVG favicon only"
fi

# Clean up
rm -f temp_car.svg

echo "✅ Favicon creation complete!"

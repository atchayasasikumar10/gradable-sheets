# Gradient Backend Setup

## Prerequisites
- Python 3.8+
- pip

## Installation

1. **Create a virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install flask flask-cors opencv-python pytesseract pillow numpy rapidfuzz
```

3. **Install Tesseract OCR**:
   - **Windows**: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - **Mac**: `brew install tesseract`
   - **Linux**: `sudo apt-get install tesseract-ocr`

## Backend Structure

```
backend/
├── app.py              # Main Flask application
├── alignment.py        # OpenCV alignment functions
├── ocr.py             # Tesseract OCR functions
├── evaluation.py      # Fuzzy matching evaluation
└── uploads/           # Temporary upload storage
```

## Example Flask API (app.py)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from alignment import align_image
from ocr import extract_text
from evaluation import evaluate_answers

app = Flask(__name__)
CORS(app)

@app.route('/api/upload-template', methods=['POST'])
def upload_template():
    data = request.json
    image_data = data['image']
    regions = data['regions']
    
    # Save template and regions
    # Return success
    return jsonify({'success': True, 'message': 'Template saved'})

@app.route('/api/align-sheets', methods=['POST'])
def align_sheets():
    images = request.json['images']
    aligned_images = []
    
    for img_data in images:
        # Decode base64 image
        img_bytes = base64.b64decode(img_data.split(',')[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Align using OpenCV
        aligned, accuracy = align_image(img)
        
        # Encode back to base64
        _, buffer = cv2.imencode('.jpg', aligned)
        aligned_b64 = base64.b64encode(buffer).decode()
        
        aligned_images.append({
            'aligned': f'data:image/jpeg;base64,{aligned_b64}',
            'accuracy': accuracy
        })
    
    return jsonify({'results': aligned_images})

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    answer_key = data['answerKey']
    sheets = data['sheets']
    regions = data['regions']
    
    results = []
    for sheet in sheets:
        # Extract answers using OCR
        extracted = extract_text(sheet, regions)
        
        # Evaluate using fuzzy matching
        scores = evaluate_answers(extracted, answer_key)
        results.append(scores)
    
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## Example Alignment Function (alignment.py)

```python
import cv2
import numpy as np

def align_image(image):
    """Align scanned image using edge detection and perspective transform"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return image, 0.0
    
    # Get largest contour (paper boundary)
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Approximate to quadrilateral
    epsilon = 0.02 * cv2.arcLength(largest_contour, True)
    approx = cv2.approxPolyDP(largest_contour, epsilon, True)
    
    if len(approx) == 4:
        # Get perspective transform
        pts = approx.reshape(4, 2)
        rect = order_points(pts)
        
        # Compute dimensions
        (tl, tr, br, bl) = rect
        widthA = np.linalg.norm(br - bl)
        widthB = np.linalg.norm(tr - tl)
        maxWidth = max(int(widthA), int(widthB))
        
        heightA = np.linalg.norm(tr - br)
        heightB = np.linalg.norm(tl - bl)
        maxHeight = max(int(heightA), int(heightB))
        
        # Destination points
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")
        
        # Apply perspective transform
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
        
        # Calculate alignment accuracy
        accuracy = calculate_accuracy(image, warped)
        
        return warped, accuracy
    
    return image, 0.0

def order_points(pts):
    """Order points in tl, tr, br, bl order"""
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def calculate_accuracy(original, aligned):
    """Simple accuracy metric based on image similarity"""
    # Resize for comparison
    h, w = 500, 400
    orig_resized = cv2.resize(original, (w, h))
    aligned_resized = cv2.resize(aligned, (w, h))
    
    # Calculate similarity
    diff = cv2.absdiff(orig_resized, aligned_resized)
    accuracy = 100 - (np.sum(diff) / (h * w * 3))
    return max(0, min(100, accuracy))
```

## Example OCR Function (ocr.py)

```python
import pytesseract
from PIL import Image
import cv2
import numpy as np

def extract_text(image_data, regions):
    """Extract text from marked regions using OCR"""
    # Decode image
    img = decode_image(image_data)
    
    results = []
    for region in regions:
        # Crop region
        x, y, w, h = region['x'], region['y'], region['width'], region['height']
        cropped = img[y:y+h, x:x+w]
        
        # Preprocess for better OCR
        gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Extract text
        text = pytesseract.image_to_string(thresh, config='--psm 6')
        
        results.append({
            'questionNo': region['questionNumber'],
            'text': text.strip()
        })
    
    return results
```

## Example Evaluation Function (evaluation.py)

```python
from rapidfuzz import fuzz

def evaluate_answers(extracted_answers, answer_key):
    """Evaluate extracted answers against answer key"""
    results = []
    
    for answer in extracted_answers:
        question_no = answer['questionNo']
        extracted = normalize_text(answer['text'])
        correct = normalize_text(answer_key.get(str(question_no), ''))
        
        # Calculate similarity
        similarity = fuzz.ratio(extracted, correct)
        
        # Score based on threshold
        is_correct = similarity > 80
        score = 1 if is_correct else 0
        
        results.append({
            'questionNo': question_no,
            'extracted': answer['text'],
            'correct': answer_key.get(str(question_no), ''),
            'similarity': similarity,
            'score': score
        })
    
    return results

def normalize_text(text):
    """Normalize text for comparison"""
    return text.lower().strip().replace(' ', '')
```

## Running the Backend

1. Start Flask server:
```bash
python app.py
```

2. Update frontend API endpoints in the React components to point to `http://localhost:5000`

3. Test with Postman or directly through the UI

## Frontend Integration

Update the React components to make actual API calls instead of using mock data:

```typescript
// Example in UploadSheets.tsx
const processAlignment = async () => {
  const response = await fetch('http://localhost:5000/api/align-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: sheets.map(s => s.originalImage) })
  });
  
  const data = await response.json();
  // Update state with aligned results
};
```

## Production Deployment

For production, consider:
- Using gunicorn for Flask
- Adding authentication
- Implementing rate limiting
- Using cloud storage for images (AWS S3, Google Cloud Storage)
- Deploying to Heroku, AWS, or Google Cloud

## Notes

- OCR accuracy depends on image quality and handwriting clarity
- Tesseract works best with clear, high-contrast images
- Consider training custom Tesseract models for better handwriting recognition
- The fuzzy matching threshold (80%) can be adjusted based on requirements

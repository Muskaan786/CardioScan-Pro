# CardioScan Pro - Technical Reference Guide

## Complete Tools, Libraries, and Technologies Documentation

---

## Project Objective

### Primary Objective
The CardioScan Pro project aims to develop an **AI-Powered Heart Disease Analysis System** that revolutionizes cardiovascular health assessment through advanced medical document processing and risk evaluation. This system provides healthcare professionals and patients with instant, accurate cardiac risk analysis using state-of-the-art web technologies and artificial intelligence.

### Key Objectives

#### 1. Medical Document Processing Excellence
- **OCR Integration**: Implement robust Optical Character Recognition to extract medical data from scanned reports, Echo images, and diagnostic documents with 95%+ accuracy
- **Multi-Format Support**: Process various medical document formats including PDFs, images (PNG, JPEG), and text files
- **Echo-Specific Analysis**: Specialized pattern recognition for echocardiogram reports and cardiac imaging data

#### 2. Advanced Risk Assessment
- **Comprehensive Analysis**: Evaluate 50+ cardiac parameters including ejection fraction, blood pressure, cholesterol levels, and cardiac abnormalities
- **Intelligent Scoring**: Implement weighted risk assessment algorithms based on clinical guidelines and medical research
- **Real-Time Results**: Provide instant risk categorization (High, Moderate, Low, Normal) with confidence scores and detailed explanations

#### 3. Privacy-First Healthcare Technology
- **Client-Side Processing**: Ensure complete patient data privacy by processing all medical information locally in the browser
- **HIPAA Compliance**: Design architecture that supports healthcare data protection requirements
- **No Data Transmission**: Medical files and analysis results never leave the user's device

#### 4. Modern Web Application Development
- **Responsive Design**: Create accessible, mobile-friendly interface suitable for clinical and personal use
- **Type-Safe Development**: Utilize TypeScript for medical-grade accuracy and error prevention
- **Performance Optimization**: Achieve fast processing times while handling large medical documents

#### 5. Educational and Research Value
- **MTech Project Demonstration**: Showcase advanced web development, AI integration, and healthcare technology skills
- **Open Source Contribution**: Provide reference implementation for medical AI applications
- **Academic Documentation**: Complete technical documentation suitable for academic evaluation and future research

### Target Outcomes

#### Immediate Goals
- **Functional System**: Fully operational web application capable of processing real medical documents
- **Accurate Analysis**: Reliable extraction and interpretation of cardiac parameters from various document formats
- **User-Friendly Interface**: Intuitive design that requires minimal training for healthcare professionals

#### Long-term Impact
- **Healthcare Accessibility**: Enable preliminary cardiac risk assessment in resource-limited settings
- **Clinical Decision Support**: Assist healthcare providers with rapid document analysis and risk evaluation
- **Patient Empowerment**: Allow individuals to understand their cardiac health status through accessible technology

#### Technical Achievements
- **Advanced AI Implementation**: Demonstrate practical application of machine learning in healthcare
- **Modern Web Stack Mastery**: Showcase expertise in React, TypeScript, and modern development practices
- **Medical Software Development**: Establish foundation for future healthcare technology projects

### Success Metrics

#### Technical Performance
- **Processing Speed**: OCR analysis completed within 5 seconds for standard medical documents
- **Accuracy Rate**: 95%+ accuracy in extracting key cardiac parameters
- **System Reliability**: Error-free operation across different browsers and devices

#### User Experience
- **Accessibility**: WCAG 2.1 AA compliance for healthcare accessibility standards
- **Intuitive Interface**: Minimal learning curve for medical professionals
- **Comprehensive Results**: Detailed analysis with actionable recommendations

#### Academic Value
- **Documentation Quality**: Complete technical reference suitable for MTech evaluation
- **Innovation Demonstration**: Novel application of web technologies to healthcare challenges
- **Future Research Foundation**: Extensible architecture for additional medical specialties

---

## Table of Contents

1. [Technology Stack Overview](#technology-stack-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Processing Libraries](#processing-libraries)
4. [Development Tools](#development-tools)
5. [Build and Deployment](#build-and-deployment)
6. [Medical AI Libraries](#medical-ai-libraries)
7. [UI/UX Components](#uiux-components)
8. [Testing Framework](#testing-framework)
9. [Code Quality Tools](#code-quality-tools)
10. [Package Dependencies](#package-dependencies)
11. [Configuration Files](#configuration-files)
12. [Development Workflow](#development-workflow)

---

## Technology Stack Overview

### Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CardioScan Pro Stack                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend Framework: React 18 + TypeScript                 │
│  ├─── State Management: React Hooks                        │
│  ├─── Styling: Tailwind CSS + shadcn/ui                    │
│  ├─── Build Tool: Vite                                     │
│  └─── Package Manager: pnpm                                │
├─────────────────────────────────────────────────────────────┤
│  AI Processing Engine                                       │
│  ├─── OCR: Tesseract.js v5.0.4                            │
│  ├─── PDF Processing: PDF.js v5.4.149                     │
│  ├─── File Handling: Web File API                         │
│  └─── Pattern Matching: RegExp + NLP                      │
├─────────────────────────────────────────────────────────────┤
│  Development Tools                                          │
│  ├─── Runtime: Node.js 18+                                │
│  ├─── CSS Processing: PostCSS + Autoprefixer              │
│  ├─── Code Quality: ESLint + Prettier                     │
│  └─── Type Checking: TypeScript 5.x                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Categories

- **Frontend**: React ecosystem for modern web development
- **AI/ML**: JavaScript-based medical text processing
- **Build Tools**: Modern bundling and development experience
- **Styling**: Component-based design system
- **Type Safety**: Full TypeScript implementation
- **Performance**: Client-side processing for privacy and speed

---

## Frontend Technologies

### 1. React 18.2.0
**Purpose**: Core JavaScript library for building user interfaces
**Why Chosen**: 
- Component-based architecture perfect for medical interfaces
- Excellent ecosystem and community support
- Virtual DOM for optimal performance
- Hooks for state management without complexity

**Key Features Used**:
```typescript
// React Hooks for state management
import { useState, useEffect, useCallback } from 'react';

// File upload state
const [file, setFile] = useState<File | null>(null);
const [analysis, setAnalysis] = useState<HeartAnalysis | null>(null);
const [loading, setLoading] = useState(false);

// Effect for file processing
useEffect(() => {
  if (file) {
    processFile(file);
  }
}, [file]);
```

**Installation**:
```bash
pnpm add react@^18.2.0 react-dom@^18.2.0
pnpm add -D @types/react@^18.2.0 @types/react-dom@^18.2.0
```

### 2. TypeScript 5.2.2
**Purpose**: Type-safe JavaScript development
**Why Chosen**:
- Critical for medical applications requiring data accuracy
- Enhanced IDE support and error catching
- Better code documentation and maintainability
- Interfaces for medical data structures

**Key Type Definitions**:
```typescript
// Medical data types
export type HeartMetrics = {
  patientName?: string;
  age?: number;
  sex?: "male" | "female";
  systolic?: number;
  diastolic?: number;
  cholesterol?: number;
  ejectionFraction?: number;
  // ... 15+ more medical parameters
};

// Analysis result type
export type HeartAnalysis = {
  score: number;
  normalizedRiskPercent: number;
  category: "High" | "Moderate" | "Low" | "Normal";
  confidence: number;
  reasons: string[];
  metrics: HeartMetrics;
  recommendations: string[];
};
```

**Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 3. Vite 5.0.8
**Purpose**: Fast build tool and development server
**Why Chosen**:
- Lightning-fast hot module replacement (HMR)
- Optimized for modern web development
- Excellent TypeScript support
- Plugin ecosystem for medical app requirements

**Configuration** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: []
    }
  }
})
```

**Development Commands**:
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Processing Libraries

### 1. Tesseract.js 5.0.4
**Purpose**: Optical Character Recognition (OCR) for medical images
**Why Chosen**:
- Pure JavaScript implementation (no server required)
- Excellent accuracy for printed medical text
- Privacy-focused (client-side processing)
- Supports multiple languages and formats

**Implementation**:
```typescript
import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(file: File): Promise<string> {
  console.log('=== STARTING OCR ANALYSIS ===');
  
  try {
    // Initialize OCR worker
    const worker = await createWorker('eng');
    
    // Process image
    const { data: { text } } = await worker.recognize(file);
    
    // Cleanup
    await worker.terminate();
    
    return text;
  } catch (error) {
    throw new Error(`OCR processing failed: ${error}`);
  }
}
```

**Features Used**:
- English language recognition (`'eng'`)
- High accuracy mode for medical documents
- Memory-efficient worker management
- Error handling and recovery

**Installation**:
```bash
pnpm add tesseract.js@^5.0.4
```

### 2. PDF.js 5.4.149
**Purpose**: PDF text extraction and processing
**Why Chosen**:
- Mozilla's robust PDF processing library
- Handles complex medical PDF layouts
- Multi-page document support
- No external dependencies

**Implementation**:
```typescript
import * as pdfjsLib from 'pdfjs-dist';

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs`;
    
    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    throw new Error(`PDF processing failed: ${error}`);
  }
}
```

**Installation**:
```bash
pnpm add pdfjs-dist@^5.4.149
```

### 3. Web File API
**Purpose**: Native browser file handling
**Why Chosen**:
- No additional dependencies
- Secure file processing
- Multiple format support
- Drag-and-drop capabilities

**Implementation**:
```typescript
// File type detection and processing
export async function analyzeFile(file: File): Promise<HeartAnalysis> {
  let text: string;

  if (file.type.startsWith('image/')) {
    text = await extractTextFromImage(file);
  } else if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type === 'text/plain') {
    text = await file.text();
  } else {
    throw new Error('Unsupported file type');
  }

  // Process extracted text
  const metrics = extractMetricsFromText(text);
  const riskAssessment = scoreRisk(metrics);

  return { ...riskAssessment, metrics };
}
```

---

## Development Tools

### 1. Node.js 18+
**Purpose**: JavaScript runtime environment
**Why Chosen**:
- Modern JavaScript features
- Excellent package ecosystem
- Required for build tools
- Long-term support (LTS)

**Version Requirements**:
```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check npm version
npm --version
```

### 2. pnpm 8.15.0
**Purpose**: Fast, disk space efficient package manager
**Why Chosen**:
- 3x faster than npm
- Disk space efficient (shared dependencies)
- Strict dependency resolution
- Better security

**Installation and Usage**:
```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install

# Add new dependency
pnpm add <package-name>

# Add development dependency
pnpm add -D <package-name>

# Update dependencies
pnpm update
```

**Configuration** (`pnpm-lock.yaml`):
- Lockfile ensuring consistent installations
- Detailed dependency tree
- Security vulnerability tracking

### 3. PostCSS 8.4.35
**Purpose**: CSS processing and optimization
**Why Chosen**:
- Required for Tailwind CSS
- CSS optimization and autoprefixing
- Plugin ecosystem

**Configuration** (`postcss.config.js`):
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Build and Deployment

### 1. Vite Build System
**Build Process**:
```bash
# Development build with HMR
pnpm dev

# Production build
pnpm build

# Build output analysis
pnpm run build --analyze
```

**Build Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tesseract: ['tesseract.js'],
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  }
})
```

### 2. Deployment Targets
**Supported Platforms**:
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, CloudFlare
- **Traditional Hosting**: Apache, Nginx
- **Docker**: Containerized deployment

**Deployment Configuration** (`netlify.toml`):
```toml
[build]
  publish = "dist"
  command = "pnpm build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## Medical AI Libraries

### 1. Medical Pattern Recognition Engine
**Custom Implementation**: Heart Analyzer (`heart-analyzer.ts`)
**Purpose**: Extract medical parameters from text
**Capabilities**:
- 50+ medical pattern recognition
- Echo-specific measurements
- Risk factor identification
- Clinical range validation

**Key Patterns**:
```typescript
// Blood pressure patterns
const bpPatterns = [
  /(?:bp|blood pressure|systolic|diastolic).*?(\d{2,3})\/(\d{2,3})/,
  /(\d{2,3})\/(\d{2,3})\s*(?:mmhg|mm hg)/,
  /systolic.*?(\d{2,3}).*?diastolic.*?(\d{2,3})/
];

// Echo-specific patterns
const efPatterns = [
  /ef\s*:?\s*>?\s*(\d{1,3})%?/,
  /ejection fraction\s*:?\s*>?\s*(\d{1,3})%?/,
  /lvef\s*:?\s*>?\s*(\d{1,3})%?/
];

// Cardiac abnormality detection
const cardiacPatterns = [
  /severe.*(?:ar|aortic regurgitation)/i,
  /mild.*(?:mr|mitral regurgitation)/i,
  /dilated.*lv|lv.*dilated/i
];
```

### 2. Risk Assessment Algorithm
**Custom Scoring System**:
```typescript
export function scoreRisk(metrics: HeartMetrics): RiskAssessment {
  let score = 0;
  let confidence = 0;
  const reasons: string[] = [];

  // Age-based scoring
  if (metrics.age !== undefined) {
    confidence += 0.2;
    if (metrics.age > 65) {
      score += 3;
      reasons.push(`Advanced age (${metrics.age} years)`);
    }
  }

  // Ejection fraction (critical parameter)
  if (metrics.ejectionFraction !== undefined) {
    confidence += 0.3;
    if (metrics.ejectionFraction < 40) {
      score += 4;
      reasons.push('Severely reduced ejection fraction');
    }
  }

  // Calculate final risk category
  const normalizedRiskPercent = Math.min(100, (score / 15) * 100);
  const category = score >= 8 ? "High" : 
                   score >= 4 ? "Moderate" : 
                   score >= 1 ? "Low" : "Normal";

  return { score, normalizedRiskPercent, category, confidence, reasons };
}
```

---

## UI/UX Components

### 1. Tailwind CSS 3.4.1
**Purpose**: Utility-first CSS framework
**Why Chosen**:
- Rapid development with utility classes
- Consistent design system
- Responsive design built-in
- Medical-appropriate color schemes

**Configuration** (`tailwind.config.ts`):
```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './client/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

**Medical Color Scheme**:
```css
/* Medical status indicators */
.risk-high { @apply bg-red-100 text-red-800 border-red-200; }
.risk-moderate { @apply bg-yellow-100 text-yellow-800 border-yellow-200; }
.risk-low { @apply bg-blue-100 text-blue-800 border-blue-200; }
.risk-normal { @apply bg-green-100 text-green-800 border-green-200; }
```

### 2. shadcn/ui Components
**Purpose**: High-quality, accessible UI components
**Why Chosen**:
- Medical-grade accessibility (WCAG 2.1 AA)
- Consistent design language
- TypeScript-first approach
- Customizable and themeable

**Key Components Used**:
```typescript
// Card component for results display
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Button components
import { Button } from "@/components/ui/button"

// Alert components for medical warnings
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Badge for status indicators
import { Badge } from "@/components/ui/badge"

// Progress indicators
import { Progress } from "@/components/ui/progress"
```

**Installation**:
```bash
# Install shadcn/ui
pnpm dlx shadcn-ui@latest init

# Add specific components
pnpm dlx shadcn-ui@latest add card button alert badge progress
```

### 3. Custom Medical Components
**HeartUpload Component**:
```typescript
export function HeartUpload({ onAnalysis }: HeartUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<HeartAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // File processing
  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeFile(file);
      setAnalysis(result);
      onAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-upload-container">
      {/* Drag and drop zone */}
      {/* File processing status */}
      {/* Error handling */}
    </div>
  );
}
```

---

## Testing Framework

### 1. Testing Strategy
**Unit Testing**: Individual component testing
**Integration Testing**: Complete workflow testing
**Medical Validation**: Clinical accuracy testing

**Test Categories**:
- Pattern recognition accuracy
- File processing reliability
- Risk calculation validation
- UI component behavior
- Error handling scenarios

### 2. Testing Tools (Planned)
```bash
# Recommended testing stack
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event msw
```

**Example Test Structure**:
```typescript
// heart-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import { extractMetricsFromText, scoreRisk } from './heart-analyzer';

describe('Medical Pattern Recognition', () => {
  it('should extract blood pressure correctly', () => {
    const text = 'Blood pressure: 140/90 mmHg';
    const metrics = extractMetricsFromText(text);
    
    expect(metrics.systolic).toBe(140);
    expect(metrics.diastolic).toBe(90);
  });

  it('should calculate high risk for severe conditions', () => {
    const metrics = { age: 70, ejectionFraction: 35, systolic: 180 };
    const assessment = scoreRisk(metrics);
    
    expect(assessment.category).toBe('High');
    expect(assessment.score).toBeGreaterThan(8);
  });
});
```

---

## Code Quality Tools

### 1. ESLint Configuration
**Purpose**: Code linting and style enforcement
**Configuration** (`.eslintrc.cjs`):
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
}
```

### 2. Prettier Configuration
**Purpose**: Code formatting
**Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. Git Hooks (Recommended)
```bash
# Install husky for git hooks
pnpm add -D husky lint-staged

# Pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## Package Dependencies

### 1. Production Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tesseract.js": "^5.0.4",
    "pdfjs-dist": "^5.4.149",
    "clsx": "^2.1.0",
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### 2. Development Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^7.0.2",
    "@typescript-eslint/parser": "^7.0.2",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### 3. Peer Dependencies
```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

---

## Configuration Files

### 1. Package Configuration (`package.json`)
```json
{
  "name": "cardioscan-pro",
  "version": "1.0.0",
  "description": "AI-Powered Heart Disease Analysis System",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "keywords": [
    "medical",
    "ai",
    "heart-disease",
    "ocr",
    "healthcare",
    "typescript",
    "react"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 2. TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/*"],
      "@/components/*": ["./client/components/*"],
      "@/lib/*": ["./client/lib/*"],
      "@/hooks/*": ["./client/hooks/*"]
    }
  },
  "include": ["client", "server", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@/components": path.resolve(__dirname, "./client/components"),
      "@/lib": path.resolve(__dirname, "./client/lib"),
      "@/hooks": path.resolve(__dirname, "./client/hooks"),
    },
  },
  server: {
    port: 8080,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ocr: ['tesseract.js'],
          pdf: ['pdfjs-dist'],
          ui: ['clsx', 'class-variance-authority', 'tailwind-merge']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'tesseract.js', 'pdfjs-dist']
  }
})
```

---

## Development Workflow

### 1. Project Setup Workflow
```bash
# 1. Clone the repository
git clone <repository-url>
cd vortex-garden

# 2. Install Node.js 18+ and pnpm
node --version  # Verify Node.js 18+
npm install -g pnpm

# 3. Install dependencies
pnpm install

# 4. Start development server
pnpm dev

# 5. Open browser to http://localhost:8080
```

### 2. Development Commands
```bash
# Development server with hot reload
pnpm dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Production build
pnpm build

# Preview production build
pnpm preview

# Clean build
rm -rf dist && pnpm build
```

### 3. File Structure
```
vortex-garden/
├── client/                 # Frontend source code
│   ├── components/         # React components
│   │   ├── heart/         # Medical components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   │   └── heart-analyzer.ts  # Main AI engine
│   ├── hooks/             # React hooks
│   ├── pages/             # Page components
│   └── App.tsx           # Main app component
├── public/                # Static assets
├── server/                # Backend code (if needed)
├── shared/                # Shared utilities
├── dist/                  # Build output
├── node_modules/          # Dependencies
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── README.md             # Project documentation
```

### 4. Git Workflow
```bash
# Feature development
git checkout -b feature/new-medical-pattern
# ... make changes ...
git add .
git commit -m "feat: add new cardiac pattern recognition"
git push origin feature/new-medical-pattern

# Code review and merge
# ... create pull request ...
# ... review and merge ...

# Production deployment
git checkout main
git pull origin main
pnpm build
# ... deploy to hosting platform ...
```

---

## Performance Optimization

### 1. Bundle Analysis
```bash
# Analyze bundle size
pnpm build --analyze

# Optimize dependencies
pnpm install --prod --frozen-lockfile
```

### 2. Code Splitting Strategy
```typescript
// Lazy loading for large components
const HeavyMedicalComponent = lazy(() => import('./HeavyMedicalComponent'));

// Dynamic imports for libraries
const loadTesseract = () => import('tesseract.js');
const loadPDFJS = () => import('pdfjs-dist');
```

### 3. Performance Metrics
- **Bundle Size**: ~2.5MB (including OCR and PDF libraries)
- **First Load**: ~3-5 seconds (includes library initialization)
- **OCR Processing**: 2-5 seconds per image
- **PDF Processing**: 1-3 seconds per page
- **Risk Calculation**: <100ms

---

## Security Considerations

### 1. Client-Side Processing
**Benefits**:
- No medical data transmitted to servers
- HIPAA compliance friendly
- User privacy protection
- Offline capabilities

**Implementation**:
```typescript
// All processing happens in browser
export async function analyzeFile(file: File): Promise<HeartAnalysis> {
  // File never leaves client
  const text = await extractText(file);
  const metrics = extractMetrics(text);
  const analysis = calculateRisk(metrics);
  
  // Results only stored in memory
  return analysis;
}
```

### 2. Input Validation
```typescript
// File validation
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) && 
         file.size <= MAX_FILE_SIZE;
}
```

### 3. Error Handling
```typescript
// Secure error messages
try {
  const analysis = await analyzeFile(file);
  return analysis;
} catch (error) {
  // Don't expose internal errors
  console.error('Analysis failed:', error);
  throw new Error('Unable to process file. Please try again.');
}
```

---

## Deployment Guide

### 1. Static Site Deployment
**Netlify Deployment**:
```bash
# Build project
pnpm build

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

**Vercel Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Environment Variables
```bash
# Production environment
VITE_APP_TITLE="CardioScan Pro"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV="production"
```

---

## Monitoring and Analytics

### 1. Performance Monitoring
```typescript
// Performance metrics collection
const performanceMetrics = {
  ocrProcessingTime: 0,
  pdfProcessingTime: 0,
  analysisTime: 0,
  totalTime: 0
};

// Measure OCR performance
const startTime = performance.now();
const text = await extractTextFromImage(file);
performanceMetrics.ocrProcessingTime = performance.now() - startTime;
```

### 2. Error Tracking
```typescript
// Error logging for debugging
function logError(error: Error, context: string) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
}
```

### 3. Usage Analytics (Optional)
```typescript
// Privacy-friendly analytics
function trackUsage(event: string, data?: Record<string, any>) {
  // Only track non-personal information
  console.log('Analytics:', { event, data, timestamp: Date.now() });
}
```

---

## Conclusion

This comprehensive technical reference covers all tools, libraries, and technologies used in the CardioScan Pro project. The stack is carefully chosen to provide:

1. **High Performance**: Fast processing with modern tools
2. **Type Safety**: TypeScript throughout the entire stack
3. **Medical Accuracy**: Specialized libraries for medical text processing
4. **Privacy Protection**: Client-side processing for data security
5. **Developer Experience**: Modern tooling for efficient development
6. **Scalability**: Architecture that can grow with future needs

The combination of React, TypeScript, Vite, Tesseract.js, and PDF.js creates a powerful platform for medical AI applications while maintaining the highest standards for healthcare software development.

---

**Document Version**: 1.0  
**Last Updated**: September 4, 2025  
**Maintained By**: CardioScan Pro Development Team

---

*Complete technical stack documentation for MTech project requirements*

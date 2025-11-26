# Triage Engine Visual Documentation

This document contains Mermaid diagrams visualizing the CardioScan Pro Triage Engine architecture and workflows.

## System Architecture Overview

```mermaid
graph TB
    subgraph "File Upload Layer"
        A[User Uploads File]
        B[PDF/Image/Text]
    end
    
    subgraph "OCR/Extraction Layer"
        C[Tesseract.js OCR]
        D[PDF.js Text Extraction]
        E[Text File Reader]
    end
    
    subgraph "Parsing Layer"
        F[extractMetricsFromText]
        G[Pattern Matching]
        H[Medical NLP]
    end
    
    subgraph "Triage Engine Core"
        I[composeAnalysis]
        J[scoreRisk]
        K[categorize]
        L[estimateConfidence]
        M[getTriage]
        N[generateRecommendations]
    end
    
    subgraph "UI Presentation Layer"
        O[RiskScore Component]
        P[TriageDisplay Component]
        Q[RecommendationsList]
        R[ConfidenceIndicator]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    C --> F
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
    I --> N
    J --> O
    K --> O
    M --> P
    N --> Q
    L --> R
    
    style I fill:#4CAF50,stroke:#2E7D32,color:#fff
    style A fill:#2196F3,stroke:#1565C0,color:#fff
    style O fill:#FF9800,stroke:#E65100,color:#fff
```

## Complete Analysis Pipeline

```mermaid
flowchart TD
    Start([Medical Document Upload]) --> FileType{File Type?}
    
    FileType -->|PDF| PDF[PDF.js Extraction]
    FileType -->|Image| OCR[Tesseract.js OCR]
    FileType -->|Text| TXT[Direct Text Read]
    
    PDF --> Parse[Extract Metrics from Text]
    OCR --> Parse
    TXT --> Parse
    
    Parse --> Metrics[HeartMetrics Object<br/>15+ Parameters]
    
    Metrics --> Validate{Validate<br/>Metrics}
    
    Validate -->|Invalid| Error[Return Errors<br/>& Warnings]
    Validate -->|Valid| Score[Score Risk<br/>15 Factors Weighted]
    
    Score --> ScoringResult[Risk Score<br/>0-15 Points]
    
    ScoringResult --> Normalize[Normalize to<br/>Percentage]
    
    Normalize --> Category{Categorize<br/>Risk}
    
    Category -->|≥80%| High[HIGH RISK<br/>Red Alert]
    Category -->|50-79%| Moderate[MODERATE RISK<br/>Yellow Alert]
    Category -->|20-49%| Low[LOW RISK<br/>Blue Alert]
    Category -->|<20%| Normal[NORMAL<br/>Green Status]
    
    High --> Triage[Determine Triage<br/>14 Priority Levels]
    Moderate --> Triage
    Low --> Triage
    Normal --> Triage
    
    Triage --> Priority{Priority<br/>Assessment}
    
    Priority -->|Critical| Immediate[IMMEDIATE<br/>Call 911]
    Priority -->|Urgent| Hours[URGENT<br/>Within Hours]
    Priority -->|Semi-Urgent| Days[SEMI-URGENT<br/>Within Days]
    Priority -->|Non-Urgent| Weeks[NON-URGENT<br/>Schedule Appointment]
    
    Immediate --> Confidence[Estimate Confidence<br/>Multi-dimensional]
    Hours --> Confidence
    Days --> Confidence
    Weeks --> Confidence
    
    Confidence --> Recs[Generate<br/>Recommendations<br/>9 Categories]
    
    Recs --> Analysis[Complete<br/>HeartAnalysis<br/>Object]
    
    Analysis --> UI[Render UI<br/>Components]
    
    UI --> Display([User Views<br/>Risk Assessment])
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style High fill:#f44336,stroke:#c62828,color:#fff
    style Moderate fill:#ff9800,stroke:#e65100,color:#fff
    style Low fill:#2196f3,stroke:#1565c0,color:#fff
    style Normal fill:#4caf50,stroke:#2e7d32,color:#fff
    style Immediate fill:#d32f2f,stroke:#b71c1c,color:#fff
    style Display fill:#9c27b0,stroke:#6a1b9a,color:#fff
```

## Risk Scoring Algorithm

```mermaid
graph LR
    subgraph "Input Metrics"
        M1[Age]
        M2[Ejection Fraction]
        M3[Blood Pressure]
        M4[PASP]
        M5[Cholesterol]
        M6[LDL/HDL]
        M7[Blood Sugar]
        M8[BMI]
        M9[Diabetes]
        M10[Smoking]
        M11[Family History]
        M12[Heart Rate]
        M13[ECG Results]
        M14[Exercise Capacity]
        M15[Previous MI]
    end
    
    subgraph "Weighted Scoring"
        W1[Weight: 3.0]
        W2[Weight: 5.0]
        W3[Weight: 3.0]
        W4[Weight: 4.0]
        W5[Weight: 2.0]
        W6[Weight: 2.5]
        W7[Weight: 2.5]
        W8[Weight: 1.5]
        W9[Weight: 3.0]
        W10[Weight: 3.0]
        W11[Weight: 1.5]
        W12[Weight: 1.0]
        W13[Weight: 2.0]
        W14[Weight: 2.0]
        W15[Weight: 4.0]
    end
    
    subgraph "Score Calculation"
        Sum[Weighted Sum<br/>Max: 15.0]
        Normalize[Normalize to %<br/>Min: 5%, Max: 100%]
    end
    
    M1 --> W1
    M2 --> W2
    M3 --> W3
    M4 --> W4
    M5 --> W5
    M6 --> W6
    M7 --> W7
    M8 --> W8
    M9 --> W9
    M10 --> W10
    M11 --> W11
    M12 --> W12
    M13 --> W13
    M14 --> W14
    M15 --> W15
    
    W1 --> Sum
    W2 --> Sum
    W3 --> Sum
    W4 --> Sum
    W5 --> Sum
    W6 --> Sum
    W7 --> Sum
    W8 --> Sum
    W9 --> Sum
    W10 --> Sum
    W11 --> Sum
    W12 --> Sum
    W13 --> Sum
    W14 --> Sum
    W15 --> Sum
    
    Sum --> Normalize
    Normalize --> Result[Risk Percentage]
    
    style M2 fill:#f44336,stroke:#c62828,color:#fff
    style W2 fill:#f44336,stroke:#c62828,color:#fff
    style M4 fill:#ff5722,stroke:#d84315,color:#fff
    style W4 fill:#ff5722,stroke:#d84315,color:#fff
    style Result fill:#4CAF50,stroke:#2E7D32,color:#fff
```

## Triage Decision Tree

```mermaid
graph TD
    Start([Start Triage<br/>Assessment]) --> Check1{EF < 35%?}
    
    Check1 -->|Yes| T1[LEVEL 1<br/>CRITICAL HEART FAILURE<br/>IMMEDIATE<br/>Activate Emergency]
    Check1 -->|No| Check2{BP ≥ 180/110?}
    
    Check2 -->|Yes| T2[LEVEL 2<br/>HYPERTENSIVE CRISIS<br/>IMMEDIATE<br/>ER Within 1 Hour]
    Check2 -->|No| Check3{PASP ≥ 60?}
    
    Check3 -->|Yes| T3[LEVEL 3<br/>SEVERE PULMONARY HTN<br/>URGENT<br/>Cardiology Within 24h]
    Check3 -->|No| Check4{Risk ≥ 85%?}
    
    Check4 -->|Yes| T4[LEVEL 4<br/>VERY HIGH RISK<br/>URGENT<br/>Cardiology Within 48h]
    Check4 -->|No| Check5{EF 35-40%?}
    
    Check5 -->|Yes| T5[LEVEL 5<br/>MODERATE HEART FAILURE<br/>URGENT<br/>Cardiology This Week]
    Check5 -->|No| Check6{BP 160-179 OR<br/>Dia 100-109?}
    
    Check6 -->|Yes| T6[LEVEL 6<br/>STAGE 2 HYPERTENSION<br/>SEMI-URGENT<br/>Primary Care 3-5 Days]
    Check6 -->|No| Check7{Risk 70-84%?}
    
    Check7 -->|Yes| T7[LEVEL 7<br/>HIGH RISK<br/>SEMI-URGENT<br/>Cardiology 1-2 Weeks]
    Check7 -->|No| Check8{Multiple Risk<br/>Factors?}
    
    Check8 -->|Yes| T8[LEVEL 8<br/>MODERATE RISK<br/>SEMI-URGENT<br/>Follow-up 2-4 Weeks]
    Check8 -->|No| Check9{EF 40-50%?}
    
    Check9 -->|Yes| T9[LEVEL 9<br/>MILD DYSFUNCTION<br/>NON-URGENT<br/>Schedule Within Month]
    Check9 -->|No| Check10{BP 140-159 OR<br/>Dia 90-99?}
    
    Check10 -->|Yes| T10[LEVEL 10<br/>STAGE 1 HYPERTENSION<br/>NON-URGENT<br/>Schedule Within Month]
    Check10 -->|No| Check11{Risk 35-69%?}
    
    Check11 -->|Yes| T11[LEVEL 11<br/>MODERATE RISK<br/>NON-URGENT<br/>Routine Follow-up]
    Check11 -->|No| Check12{Any Risk<br/>Factors?}
    
    Check12 -->|Yes| T12[LEVEL 12<br/>LOW RISK<br/>NON-URGENT<br/>Annual Screening]
    Check12 -->|No| Check13{Age > 40?}
    
    Check13 -->|Yes| T13[LEVEL 13<br/>PREVENTIVE CARE<br/>NON-URGENT<br/>Baseline Screening]
    Check13 -->|No| T14[LEVEL 14<br/>LOW RISK<br/>NON-URGENT<br/>Continue Healthy Habits]
    
    style T1 fill:#b71c1c,stroke:#7f0000,color:#fff
    style T2 fill:#c62828,stroke:#8e0000,color:#fff
    style T3 fill:#d32f2f,stroke:#9a0007,color:#fff
    style T4 fill:#e53935,stroke:#ab000d,color:#fff
    style T5 fill:#f44336,stroke:#ba000d,color:#fff
    style T6 fill:#ff5722,stroke:#bf360c,color:#fff
    style T7 fill:#ff6f00,stroke:#c43e00,color:#fff
    style T8 fill:#ff9800,stroke:#c66900,color:#fff
    style T9 fill:#ffa726,stroke:#c77800,color:#fff
    style T10 fill:#ffb74d,stroke:#c88719,color:#fff
    style T11 fill:#2196f3,stroke:#0d47a1,color:#fff
    style T12 fill:#4caf50,stroke:#1b5e20,color:#fff
    style T13 fill:#66bb6a,stroke:#2e7d32,color:#fff
    style T14 fill:#81c784,stroke:#388e3c,color:#fff
```

## Risk Categorization Flow

```mermaid
flowchart LR
    Score[Risk Score<br/>Percentage] --> Category{Categorize}
    
    Category -->|≥ 80%| High[HIGH RISK]
    Category -->|50-79%| Moderate[MODERATE RISK]
    Category -->|20-49%| Low[LOW RISK]
    Category -->|< 20%| Normal[NORMAL]
    
    High --> Meta1[Color: Red<br/>Icon: AlertTriangle<br/>Timeline: Immediate]
    Moderate --> Meta2[Color: Yellow<br/>Icon: Info<br/>Timeline: 2-4 Weeks]
    Low --> Meta3[Color: Blue<br/>Icon: Activity<br/>Timeline: 3-6 Months]
    Normal --> Meta4[Color: Green<br/>Icon: CheckCircle<br/>Timeline: Annual]
    
    Meta1 --> Action1[Immediate Medical<br/>Attention Required]
    Meta2 --> Action2[Schedule<br/>Follow-up Soon]
    Meta3 --> Action3[Continue<br/>Monitoring]
    Meta4 --> Action4[Maintain<br/>Healthy Lifestyle]
    
    style High fill:#f44336,stroke:#c62828,color:#fff
    style Moderate fill:#ff9800,stroke:#e65100,color:#fff
    style Low fill:#2196f3,stroke:#1565c0,color:#fff
    style Normal fill:#4caf50,stroke:#2e7d32,color:#fff
    style Action1 fill:#d32f2f,stroke:#b71c1c,color:#fff
```

## Confidence Estimation Algorithm

```mermaid
graph TD
    Metrics[Input Metrics] --> Count[Count Non-null<br/>Parameters]
    
    Count --> Completeness[Data Completeness<br/>Weight: 50%]
    
    Metrics --> KeyCheck{Check Key<br/>Markers}
    
    KeyCheck --> EF[Has EF?<br/>+30%]
    KeyCheck --> BP[Has BP?<br/>+20%]
    KeyCheck --> PASP[Has PASP?<br/>+20%]
    KeyCheck --> Labs[Has Labs?<br/>+15%]
    
    EF --> KeyScore[Key Marker Score<br/>Weight: 30%]
    BP --> KeyScore
    PASP --> KeyScore
    Labs --> KeyScore
    
    Metrics --> Context{Clinical<br/>Context?}
    
    Context -->|Has Critical Values| Crit[Criticality Bonus<br/>Weight: 15%]
    Context -->|Multiple Abnormal| Crit
    
    Metrics --> Consistency[Score Consistency<br/>Check<br/>Weight: 5%]
    
    Completeness --> Formula[Confidence =<br/>0.5×Completeness +<br/>0.3×KeyMarkers +<br/>0.15×Criticality +<br/>0.05×Consistency]
    KeyScore --> Formula
    Crit --> Formula
    Consistency --> Formula
    
    Formula --> Result{Final<br/>Confidence}
    
    Result -->|≥ 70%| High[HIGH CONFIDENCE<br/>Green<br/>Reliable Assessment]
    Result -->|40-69%| Medium[MEDIUM CONFIDENCE<br/>Yellow<br/>Fair Assessment]
    Result -->|< 40%| Low[LOW CONFIDENCE<br/>Red<br/>More Data Needed]
    
    style High fill:#4caf50,stroke:#2e7d32,color:#fff
    style Medium fill:#ff9800,stroke:#e65100,color:#fff
    style Low fill:#f44336,stroke:#c62828,color:#fff
    style Formula fill:#2196f3,stroke:#1565c0,color:#fff
```

## Recommendations Generation Flow

```mermaid
flowchart TD
    Start([Generate<br/>Recommendations]) --> Init[Initialize Empty<br/>Recommendation List]
    
    Init --> Check1{Triage<br/>Priority?}
    
    Check1 -->|IMMEDIATE| Urgent[Add Immediate Care<br/>Recommendations]
    Check1 -->|URGENT| Semi[Add Urgent Care<br/>Recommendations]
    Check1 -->|SEMI-URGENT| Routine[Add Semi-urgent<br/>Recommendations]
    Check1 -->|NON-URGENT| Prev[Add Preventive<br/>Recommendations]
    
    Urgent --> Cat1[Category:<br/>Immediate Care]
    Semi --> Cat2[Category:<br/>Monitoring]
    Routine --> Cat3[Category:<br/>Follow-up]
    Prev --> Cat4[Category:<br/>Preventive]
    
    Cat1 --> Check2{Check<br/>Risk Factors}
    Cat2 --> Check2
    Cat3 --> Check2
    Cat4 --> Check2
    
    Check2 -->|High BP| BP[Add BP Management<br/>Recommendations]
    Check2 -->|Low EF| EF[Add Heart Failure<br/>Management]
    Check2 -->|High Cholesterol| Chol[Add Lipid Management<br/>Recommendations]
    Check2 -->|Diabetes| DM[Add Diabetes<br/>Management]
    Check2 -->|Smoker| Smoke[Add Smoking<br/>Cessation]
    
    BP --> Lifestyle[Add Lifestyle<br/>Modifications]
    EF --> Lifestyle
    Chol --> Lifestyle
    DM --> Lifestyle
    Smoke --> Lifestyle
    
    Lifestyle --> Meds{Medications<br/>Needed?}
    
    Meds -->|Yes| AddMeds[Add Medication<br/>Recommendations]
    Meds -->|No| Mental[Add Mental Health<br/>Support]
    
    AddMeds --> Mental
    Mental --> Family[Add Family<br/>Counseling]
    Family --> Emergency[Add Emergency<br/>Preparedness]
    
    Emergency --> Prioritize[Sort by Priority<br/>Urgent > High > Medium > Low]
    
    Prioritize --> Disclaimer[Add Medical<br/>Disclaimer]
    
    Disclaimer --> Output([Return Recommendations<br/>Object])
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Output fill:#9c27b0,stroke:#6a1b9a,color:#fff
    style Urgent fill:#f44336,stroke:#c62828,color:#fff
    style Disclaimer fill:#ff9800,stroke:#e65100,color:#fff
```

## Component Interaction Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant Upload as HeartUpload
    participant Analyzer as heart-analyzer.ts
    participant Engine as Triage Engine
    participant Result as RiskResult
    participant UI as Triage Components
    
    U->>Upload: Uploads Medical File
    Upload->>Analyzer: analyzeFile(file)
    
    alt PDF File
        Analyzer->>Analyzer: extractTextFromPDF()
    else Image File
        Analyzer->>Analyzer: extractTextFromImage()
    else Text File
        Analyzer->>Analyzer: file.text()
    end
    
    Analyzer->>Analyzer: extractMetricsFromText(text)
    Analyzer->>Engine: composeAnalysis(metrics)
    
    Engine->>Engine: validateMetrics(metrics)
    Engine->>Engine: scoreRisk(metrics)
    Engine->>Engine: categorizeRisk(score)
    Engine->>Engine: estimateConfidence(metrics, score)
    Engine->>Engine: getTriageRecommendation(metrics)
    Engine->>Engine: generateRecommendations(metrics)
    
    Engine-->>Analyzer: HeartAnalysis Object
    Analyzer-->>Upload: Complete Analysis
    Upload->>Result: Display Results
    
    Result->>UI: Render RiskScore
    Result->>UI: Render TriageDisplay
    Result->>UI: Render RecommendationsList
    Result->>UI: Render ConfidenceIndicator
    
    UI-->>U: Display Complete Assessment
    
    Note over U,UI: User can now view comprehensive<br/>cardiac risk analysis with triage<br/>recommendations and confidence metrics
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        A1[PDF File]
        A2[Image File]
        A3[Text File]
    end
    
    subgraph "Extraction Layer"
        B1[PDF.js]
        B2[Tesseract.js]
        B3[File Reader]
    end
    
    subgraph "Processing Layer"
        C[Raw Text]
        D[Pattern Matching]
        E[HeartMetrics Object]
    end
    
    subgraph "Analysis Layer"
        F[Risk Scoring]
        G[Categorization]
        H[Confidence]
        I[Triage]
        J[Recommendations]
    end
    
    subgraph "Output Layer"
        K[HeartAnalysis Object]
        L[JSON Export]
        M[UI Components]
    end
    
    A1 --> B1 --> C
    A2 --> B2 --> C
    A3 --> B3 --> C
    
    C --> D --> E
    
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L
    K --> M
    
    style E fill:#4CAF50,stroke:#2E7D32,color:#fff
    style K fill:#2196F3,stroke:#1565C0,color:#fff
    style M fill:#FF9800,stroke:#E65100,color:#fff
```

## Medical Guidelines Integration

```mermaid
mindmap
  root((Triage Engine<br/>Medical Standards))
    AHA Guidelines
      Cardiovascular Risk Assessment
      Blood Pressure Classification
      Heart Failure Staging
    ESC Guidelines
      Pulmonary Hypertension
      Valvular Heart Disease
      Risk Stratification
    ACC/AHA
      BP Management 2017
      Heart Failure 2022
      Lipid Guidelines
    NCEP ATP III
      Cholesterol Targets
      LDL Goals
      HDL Targets
    Framingham
      Risk Score
      10-Year CVD Risk
      Population Data
```

## Testing Coverage Map

```mermaid
graph TD
    subgraph "Unit Tests"
        T1[scoreRisk.test.ts<br/>7 Test Cases]
        T2[categorize.test.ts<br/>8 Test Cases]
        T3[confidence.test.ts<br/>Coming Soon]
        T4[triage.test.ts<br/>Coming Soon]
    end
    
    subgraph "Integration Tests"
        T5[composeAnalysis.test.ts<br/>10+ Test Cases]
        T6[validation.test.ts<br/>Coming Soon]
        T7[comparison.test.ts<br/>Coming Soon]
    end
    
    subgraph "Component Tests"
        T8[TriageDisplay.test.tsx<br/>Coming Soon]
        T9[RiskScore.test.tsx<br/>Coming Soon]
        T10[RecommendationsList.test.tsx<br/>Coming Soon]
    end
    
    subgraph "E2E Tests"
        T11[Complete Workflow<br/>Coming Soon]
        T12[Error Scenarios<br/>Coming Soon]
    end
    
    T1 --> T5
    T2 --> T5
    T3 --> T5
    T4 --> T5
    
    T5 --> T11
    T8 --> T11
    T9 --> T11
    T10 --> T11
    
    style T1 fill:#4caf50,stroke:#2e7d32,color:#fff
    style T2 fill:#4caf50,stroke:#2e7d32,color:#fff
    style T5 fill:#4caf50,stroke:#2e7d32,color:#fff
    style T11 fill:#ff9800,stroke:#e65100,color:#fff
```

---

## How to View These Diagrams

### In VS Code
1. Install the **Markdown Preview Mermaid Support** extension
2. Open this file and press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux)
3. The diagrams will render interactively

### Online
1. Copy any diagram code block
2. Visit https://mermaid.live/
3. Paste and view/edit the diagram

### In Documentation
These diagrams are automatically rendered in:
- GitHub README files
- GitLab wikis
- Most modern documentation platforms

---

**Legend:**
- 🔴 Red: Critical/High Priority
- 🟡 Yellow: Moderate/Warning
- 🔵 Blue: Low Risk/Info
- 🟢 Green: Normal/Success
- 🟣 Purple: Output/Results

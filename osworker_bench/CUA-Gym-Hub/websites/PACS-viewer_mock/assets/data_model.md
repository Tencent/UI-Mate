# XACS Viewer Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Types

### 1. Patient

Represents a patient whose imaging studies are stored in the system.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"PAT-001"` | Unique patient identifier |
| `name` | `string` | `"SMITH^JOHN^A"` | Patient name in DICOM format (Last^First^Middle) |
| `displayName` | `string` | `"Smith, John A."` | Human-readable display name |
| `mrn` | `string` | `"MRN-2847561"` | Medical Record Number |
| `dateOfBirth` | `string` | `"1958-03-15"` | ISO date of birth |
| `sex` | `string` | `"M"` | Patient sex: "M", "F", or "O" |
| `age` | `string` | `"67Y"` | Age at time of study |

### 2. Study

A radiology study (exam) for a patient, containing one or more series.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"STU-001"` | Unique study ID |
| `studyInstanceUID` | `string` | `"1.2.840.113619.2.55.3.604..."` | DICOM Study Instance UID |
| `patientId` | `string` | `"PAT-001"` | Reference to Patient |
| `studyDate` | `string` | `"2024-11-15"` | Date of study |
| `studyTime` | `string` | `"09:33:16"` | Time of study |
| `studyDescription` | `string` | `"CT ABDOMEN AND PELVIS W CONTRAST"` | Study description |
| `accessionNumber` | `string` | `"ACC-74177"` | Accession number |
| `institution` | `string` | `"Mercy General Hospital"` | Performing institution |
| `referringPhysician` | `string` | `"Dr. Robert Martinez"` | Referring physician name |
| `modalities` | `string[]` | `["CT"]` | List of modalities in this study |
| `numberOfSeries` | `number` | `4` | Number of series |
| `numberOfInstances` | `number` | `295` | Total number of images |
| `status` | `string` | `"read"` | Study status: "unread", "read", "in_progress", "reported" |

### 3. Series

A series of images within a study, typically representing one acquisition/sequence.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"SER-001"` | Unique series ID |
| `seriesInstanceUID` | `string` | `"1.2.840.113619.2.55.3.604..."` | DICOM Series Instance UID |
| `studyId` | `string` | `"STU-001"` | Reference to Study |
| `seriesNumber` | `number` | `6` | Series number within study |
| `seriesDescription` | `string` | `"Neck 1.0 B31s"` | Description of series |
| `modality` | `string` | `"CT"` | Imaging modality: "CT", "MR", "US", "XR", "MG", "NM", "PT" |
| `numberOfInstances` | `number` | `295` | Number of images in series |
| `thumbnailType` | `string` | `"ct_axial_head"` | Key for generating simulated thumbnail (see §Image Generation) |
| `bodyPart` | `string` | `"NECK"` | Body part examined |
| `sliceThickness` | `number` | `1.0` | Slice thickness in mm |
| `pixelSpacing` | `number[]` | `[0.488, 0.488]` | Pixel spacing in mm |
| `rows` | `number` | `512` | Image height in pixels |
| `columns` | `number` | `512` | Image width in pixels |
| `windowCenter` | `number` | `70` | Default window center (level) |
| `windowWidth` | `number` | `410` | Default window width |
| `isTracked` | `boolean` | `false` | Whether measurement tracking is enabled for this series |

### 4. Instance (Image)

An individual image (slice) within a series. In the mock, we don't store actual pixel data — instead we generate simulated images procedurally.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"IMG-001-082"` | Unique instance ID |
| `sopInstanceUID` | `string` | `"1.2.840.113619..."` | DICOM SOP Instance UID |
| `seriesId` | `string` | `"SER-001"` | Reference to Series |
| `instanceNumber` | `number` | `82` | Instance number (1-based) |
| `imagePositionPatient` | `number[]` | `[-124.5, -174.5, -42.0]` | Image position in patient coordinates |
| `sliceLocation` | `number` | `-42.0` | Slice location in mm |

> **Note:** In the mock, we do NOT store hundreds of actual instance records. Instead, `numberOfInstances` on the Series defines how many slices exist, and the viewer generates simulated images procedurally based on `seriesId + instanceNumber`. We only create a few representative Instance records for state tracking purposes.

### 5. Measurement

An annotation/measurement placed on an image.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"MEAS-001"` | Unique measurement ID |
| `type` | `string` | `"length"` | Type: "length", "bidirectional", "ellipse", "angle", "annotation" |
| `label` | `string` | `"Lymph Node"` | User-editable label |
| `studyId` | `string` | `"STU-001"` | Study this measurement belongs to |
| `seriesId` | `string` | `"SER-001"` | Series this measurement belongs to |
| `instanceNumber` | `number` | `82` | Slice number where measurement is placed |
| `points` | `object[]` | `[{x:245, y:180}, {x:310, y:220}]` | Normalized coordinates (0-1 range) of measurement points |
| `value` | `number` | `24.4` | Primary measurement value (mm, degrees, or mm²) |
| `secondaryValue` | `number \| null` | `16.4` | Secondary value (for bidirectional: perpendicular diameter) |
| `unit` | `string` | `"mm"` | Unit: "mm", "mm²", "°", or "" for annotation |
| `text` | `string \| null` | `"Suspicious lesion"` | Text content (for annotation type) |
| `huMean` | `number \| null` | `45.2` | Mean Hounsfield Unit value (for ellipse ROI) |
| `huStd` | `number \| null` | `12.8` | Std deviation of HU (for ellipse ROI) |
| `color` | `string` | `"#ffeb3b"` | Display color of measurement |
| `isTarget` | `boolean` | `true` | Whether this is a RECIST target lesion |
| `targetCategory` | `string \| null` | `"target"` | "target", "non-target", or null |
| `createdAt` | `string` | `"2024-11-15T09:45:00Z"` | Timestamp of creation |
| `createdBy` | `string` | `"Dr. Sarah Chen"` | Who created the measurement |

### 6. ViewportState

The current state of each viewport in the layout.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"VP-0"` | Viewport identifier (based on grid position) |
| `seriesId` | `string \| null` | `"SER-001"` | Currently displayed series |
| `currentInstanceNumber` | `number` | `82` | Current slice being viewed |
| `windowCenter` | `number` | `70` | Current window center |
| `windowWidth` | `number` | `410` | Current window width |
| `zoom` | `number` | `1.0` | Zoom factor (1.0 = fit to viewport) |
| `panX` | `number` | `0` | Pan offset X in pixels |
| `panY` | `number` | `0` | Pan offset Y in pixels |
| `rotation` | `number` | `0` | Rotation in degrees (0, 90, 180, 270) |
| `flipH` | `boolean` | `false` | Horizontal flip |
| `flipV` | `boolean` | `false` | Vertical flip |
| `invert` | `boolean` | `false` | Color inversion |
| `isActive` | `boolean` | `true` | Whether this viewport is currently active/focused |

### 7. ToolState

Global tool selection and configuration.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `activeTool` | `string` | `"windowLevel"` | Currently selected tool: "windowLevel", "pan", "zoom", "length", "bidirectional", "ellipse", "angle", "annotation", "magnify", "probe" |
| `activeLeftClick` | `string` | `"windowLevel"` | Left mouse button tool |
| `activeRightClick` | `string` | `"zoom"` | Right mouse button tool |
| `activeMiddleClick` | `string` | `"pan"` | Middle mouse button tool |
| `windowLevelPreset` | `string \| null` | `"softTissue"` | Active W/L preset name or null for custom |

### 8. AppSettings

User preferences and application settings.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `language` | `string` | `"en"` | UI language |
| `layoutColumns` | `number` | `1` | Viewport grid columns |
| `layoutRows` | `number` | `1` | Viewport grid rows |
| `showOverlays` | `boolean` | `true` | Show DICOM text overlays |
| `showOrientationMarkers` | `boolean` | `true` | Show A/P/R/L markers |
| `interpolation` | `string` | `"bilinear"` | Image interpolation method |
| `cineFrameRate` | `number` | `24` | Cine playback frame rate |
| `currentUser` | `string` | `"Dr. Sarah Chen"` | Logged-in user name |
| `currentUserRole` | `string` | `"radiologist"` | User role |

---

## Relationships

```
Patient (1) ──── (many) Study
Study (1)   ──── (many) Series
Series (1)  ──── (many) Instance (virtual, generated from numberOfInstances)
Series (1)  ──── (many) Measurement
Study (1)   ──── (many) Measurement (through Series)
ViewportState ── references → Series (via seriesId)
```

---

## Window/Level Presets

Standard CT window/level presets for realistic behavior:

| Preset Name | Window Width | Window Center | Use Case |
|-------------|-------------|---------------|----------|
| `softTissue` | 400 | 40 | General soft tissue |
| `lung` | 1500 | -600 | Lung/air |
| `bone` | 2000 | 300 | Bone structures |
| `brain` | 80 | 40 | Brain parenchyma |
| `abdomen` | 350 | 50 | Abdominal organs |
| `liver` | 150 | 30 | Liver detail |
| `mediastinum` | 350 | 50 | Chest mediastinum |
| `stroke` | 8 | 32 | Acute stroke detection |

---

## Simulated Image Generation Strategy

Since we cannot include real DICOM images, the mock generates realistic-looking medical images using HTML5 Canvas:

1. **Base pattern**: Each series type (CT head, CT chest, MRI brain, X-ray chest, etc.) has a procedural generator that draws anatomically-suggestive shapes (circles for organs, curves for bones, noise for tissue texture).
2. **Slice variation**: As `instanceNumber` changes, the pattern subtly shifts (sizes, positions) to simulate scrolling through a volume.
3. **Window/Level**: Canvas pixel values are mapped through a window/level function: `displayValue = ((pixelValue - (WL - WW/2)) / WW) * 255`, clamped to [0, 255].
4. **Grayscale rendering**: Images are rendered in grayscale by default; invert swaps black/white.

### Thumbnail Types for Series Generators

| `thumbnailType` | Description |
|-----------------|-------------|
| `ct_axial_head` | CT head axial slices (brain, skull) |
| `ct_axial_chest` | CT chest axial (lungs, mediastinum) |
| `ct_axial_abdomen` | CT abdomen axial (liver, kidneys) |
| `ct_coronal_chest` | CT chest coronal view |
| `mr_axial_brain` | MRI brain T1/T2 axial |
| `mr_sagittal_brain` | MRI brain sagittal |
| `mr_coronal_brain` | MRI brain coronal |
| `xr_chest_pa` | Chest X-ray PA view |
| `xr_chest_lateral` | Chest X-ray lateral |
| `us_abdomen` | Ultrasound abdomen |

---

## `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    // Current user (pre-logged-in)
    currentUser: {
      name: "Dr. Sarah Chen",
      role: "radiologist",
      institution: "Mercy General Hospital"
    },

    // Application settings
    settings: {
      language: "en",
      layoutColumns: 1,
      layoutRows: 1,
      showOverlays: true,
      showOrientationMarkers: true,
      interpolation: "bilinear",
      cineFrameRate: 24
    },

    // Patients (6 patients for realistic worklist)
    patients: {
      "PAT-001": { id: "PAT-001", name: "SMITH^JOHN^A", displayName: "Smith, John A.", mrn: "MRN-2847561", dateOfBirth: "1958-03-15", sex: "M", age: "67Y" },
      "PAT-002": { id: "PAT-002", name: "JOHNSON^MARIA^L", displayName: "Johnson, Maria L.", mrn: "MRN-1935284", dateOfBirth: "1972-08-22", sex: "F", age: "52Y" },
      "PAT-003": { id: "PAT-003", name: "WILLIAMS^ROBERT^J", displayName: "Williams, Robert J.", mrn: "MRN-4028173", dateOfBirth: "1945-11-03", sex: "M", age: "79Y" },
      "PAT-004": { id: "PAT-004", name: "BROWN^EMILY^R", displayName: "Brown, Emily R.", mrn: "MRN-7261940", dateOfBirth: "1989-06-17", sex: "F", age: "35Y" },
      "PAT-005": { id: "PAT-005", name: "DAVIS^MICHAEL^S", displayName: "Davis, Michael S.", mrn: "MRN-5183926", dateOfBirth: "1963-01-28", sex: "M", age: "61Y" },
      "PAT-006": { id: "PAT-006", name: "GARCIA^ANA^M", displayName: "Garcia, Ana M.", mrn: "MRN-3947215", dateOfBirth: "1980-12-09", sex: "F", age: "44Y" }
    },

    // Studies (8 studies across 6 patients, various modalities)
    studies: {
      "STU-001": {
        id: "STU-001", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.810",
        patientId: "PAT-001", studyDate: "2024-11-15", studyTime: "09:33:16",
        studyDescription: "CT ABDOMEN AND PELVIS W CONTRAST",
        accessionNumber: "ACC-74177", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Robert Martinez",
        modalities: ["CT"], numberOfSeries: 4, numberOfInstances: 842,
        status: "unread"
      },
      "STU-002": {
        id: "STU-002", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.811",
        patientId: "PAT-002", studyDate: "2024-11-14", studyTime: "14:22:08",
        studyDescription: "MRI BRAIN W AND WO CONTRAST",
        accessionNumber: "ACC-70211", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Jennifer Walsh",
        modalities: ["MR"], numberOfSeries: 6, numberOfInstances: 456,
        status: "read"
      },
      "STU-003": {
        id: "STU-003", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.812",
        patientId: "PAT-003", studyDate: "2024-11-15", studyTime: "07:15:42",
        studyDescription: "CT CHEST W CONTRAST",
        accessionNumber: "ACC-71023", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Thomas Lee",
        modalities: ["CT"], numberOfSeries: 3, numberOfInstances: 620,
        status: "in_progress"
      },
      "STU-004": {
        id: "STU-004", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.813",
        patientId: "PAT-004", studyDate: "2024-11-13", studyTime: "11:45:33",
        studyDescription: "XR CHEST PA AND LATERAL",
        accessionNumber: "ACC-68542", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Amanda Foster",
        modalities: ["CR"], numberOfSeries: 2, numberOfInstances: 2,
        status: "reported"
      },
      "STU-005": {
        id: "STU-005", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.814",
        patientId: "PAT-005", studyDate: "2024-11-15", studyTime: "08:10:55",
        studyDescription: "CT HEAD WO CONTRAST",
        accessionNumber: "ACC-73891", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Kevin Park",
        modalities: ["CT"], numberOfSeries: 2, numberOfInstances: 295,
        status: "unread"
      },
      "STU-006": {
        id: "STU-006", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.815",
        patientId: "PAT-006", studyDate: "2024-11-12", studyTime: "16:30:21",
        studyDescription: "US ABDOMEN COMPLETE",
        accessionNumber: "ACC-67198", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Lisa Nguyen",
        modalities: ["US"], numberOfSeries: 3, numberOfInstances: 48,
        status: "read"
      },
      "STU-007": {
        id: "STU-007", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.816",
        patientId: "PAT-001", studyDate: "2024-08-20", studyTime: "10:15:00",
        studyDescription: "CT ABDOMEN AND PELVIS W CONTRAST",
        accessionNumber: "ACC-58423", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Robert Martinez",
        modalities: ["CT"], numberOfSeries: 3, numberOfInstances: 780,
        status: "reported"
      },
      "STU-008": {
        id: "STU-008", studyInstanceUID: "1.2.840.113619.2.55.3.604688119.992.1416340160.817",
        patientId: "PAT-005", studyDate: "2024-11-10", studyTime: "13:45:30",
        studyDescription: "MRI BRAIN W AND WO CONTRAST",
        accessionNumber: "ACC-66340", institution: "Mercy General Hospital",
        referringPhysician: "Dr. Kevin Park",
        modalities: ["MR"], numberOfSeries: 5, numberOfInstances: 380,
        status: "reported"
      }
    },

    // Series (detailed for each study)
    series: {
      // STU-001: CT Abdomen (4 series)
      "SER-001": { id: "SER-001", seriesInstanceUID: "1.2.840.113619.2.55.3.001", studyId: "STU-001", seriesNumber: 1, seriesDescription: "Scout", modality: "CT", numberOfInstances: 2, thumbnailType: "xr_chest_pa", bodyPart: "ABDOMEN", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-002": { id: "SER-002", seriesInstanceUID: "1.2.840.113619.2.55.3.002", studyId: "STU-001", seriesNumber: 2, seriesDescription: "Axial 2.0mm", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 2.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: true },
      "SER-003": { id: "SER-003", seriesInstanceUID: "1.2.840.113619.2.55.3.003", studyId: "STU-001", seriesNumber: 3, seriesDescription: "Body 5.0 CE", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: true },
      "SER-004": { id: "SER-004", seriesInstanceUID: "1.2.840.113619.2.55.3.004", studyId: "STU-001", seriesNumber: 4, seriesDescription: "Body 4.0 CE", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_coronal_chest", bodyPart: "ABDOMEN", sliceThickness: 4.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },

      // STU-002: MRI Brain (6 series)
      "SER-005": { id: "SER-005", seriesInstanceUID: "1.2.840.113619.2.55.3.005", studyId: "STU-002", seriesNumber: 1, seriesDescription: "T1W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-006": { id: "SER-006", seriesInstanceUID: "1.2.840.113619.2.55.3.006", studyId: "STU-002", seriesNumber: 2, seriesDescription: "T2W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 800, windowWidth: 1600, isTracked: false },
      "SER-007": { id: "SER-007", seriesInstanceUID: "1.2.840.113619.2.55.3.007", studyId: "STU-002", seriesNumber: 3, seriesDescription: "FLAIR Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 700, windowWidth: 1400, isTracked: true },
      "SER-008": { id: "SER-008", seriesInstanceUID: "1.2.840.113619.2.55.3.008", studyId: "STU-002", seriesNumber: 4, seriesDescription: "T1W Sagittal", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_sagittal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-009": { id: "SER-009", seriesInstanceUID: "1.2.840.113619.2.55.3.009", studyId: "STU-002", seriesNumber: 5, seriesDescription: "T1W Coronal Post-Contrast", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_coronal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-010": { id: "SER-010", seriesInstanceUID: "1.2.840.113619.2.55.3.010", studyId: "STU-002", seriesNumber: 6, seriesDescription: "DWI b1000", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [1.0, 1.0], rows: 128, columns: 128, windowCenter: 500, windowWidth: 1000, isTracked: false },

      // STU-003: CT Chest (3 series)
      "SER-011": { id: "SER-011", seriesInstanceUID: "1.2.840.113619.2.55.3.011", studyId: "STU-003", seriesNumber: 1, seriesDescription: "Scout AP", modality: "CT", numberOfInstances: 1, thumbnailType: "xr_chest_pa", bodyPart: "CHEST", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-012": { id: "SER-012", seriesInstanceUID: "1.2.840.113619.2.55.3.012", studyId: "STU-003", seriesNumber: 2, seriesDescription: "Axial 1.0 B31s", modality: "CT", numberOfInstances: 310, thumbnailType: "ct_axial_chest", bodyPart: "CHEST", sliceThickness: 1.0, pixelSpacing: [0.7, 0.7], rows: 512, columns: 512, windowCenter: -600, windowWidth: 1500, isTracked: false },
      "SER-013": { id: "SER-013", seriesInstanceUID: "1.2.840.113619.2.55.3.013", studyId: "STU-003", seriesNumber: 3, seriesDescription: "Axial 5.0 Mediastinum", modality: "CT", numberOfInstances: 62, thumbnailType: "ct_axial_chest", bodyPart: "CHEST", sliceThickness: 5.0, pixelSpacing: [0.7, 0.7], rows: 512, columns: 512, windowCenter: 50, windowWidth: 350, isTracked: false },

      // STU-004: Chest X-Ray (2 series)
      "SER-014": { id: "SER-014", seriesInstanceUID: "1.2.840.113619.2.55.3.014", studyId: "STU-004", seriesNumber: 1, seriesDescription: "PA", modality: "CR", numberOfInstances: 1, thumbnailType: "xr_chest_pa", bodyPart: "CHEST", sliceThickness: null, pixelSpacing: [0.139, 0.139], rows: 3072, columns: 2560, windowCenter: 2048, windowWidth: 4096, isTracked: false },
      "SER-015": { id: "SER-015", seriesInstanceUID: "1.2.840.113619.2.55.3.015", studyId: "STU-004", seriesNumber: 2, seriesDescription: "Lateral", modality: "CR", numberOfInstances: 1, thumbnailType: "xr_chest_lateral", bodyPart: "CHEST", sliceThickness: null, pixelSpacing: [0.139, 0.139], rows: 3072, columns: 2560, windowCenter: 2048, windowWidth: 4096, isTracked: false },

      // STU-005: CT Head (2 series)
      "SER-016": { id: "SER-016", seriesInstanceUID: "1.2.840.113619.2.55.3.016", studyId: "STU-005", seriesNumber: 1, seriesDescription: "Axial 5.0", modality: "CT", numberOfInstances: 30, thumbnailType: "ct_axial_head", bodyPart: "HEAD", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 80, isTracked: false },
      "SER-017": { id: "SER-017", seriesInstanceUID: "1.2.840.113619.2.55.3.017", studyId: "STU-005", seriesNumber: 2, seriesDescription: "Axial 1.0 Bone", modality: "CT", numberOfInstances: 265, thumbnailType: "ct_axial_head", bodyPart: "HEAD", sliceThickness: 1.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 300, windowWidth: 2000, isTracked: false },

      // STU-006: Ultrasound (3 series)
      "SER-018": { id: "SER-018", seriesInstanceUID: "1.2.840.113619.2.55.3.018", studyId: "STU-006", seriesNumber: 1, seriesDescription: "Liver", modality: "US", numberOfInstances: 18, thumbnailType: "us_abdomen", bodyPart: "LIVER", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },
      "SER-019": { id: "SER-019", seriesInstanceUID: "1.2.840.113619.2.55.3.019", studyId: "STU-006", seriesNumber: 2, seriesDescription: "Gallbladder", modality: "US", numberOfInstances: 12, thumbnailType: "us_abdomen", bodyPart: "GALLBLADDER", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },
      "SER-020": { id: "SER-020", seriesInstanceUID: "1.2.840.113619.2.55.3.020", studyId: "STU-006", seriesNumber: 3, seriesDescription: "Right Kidney", modality: "US", numberOfInstances: 18, thumbnailType: "us_abdomen", bodyPart: "KIDNEY", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },

      // STU-007: Prior CT Abdomen for PAT-001 (3 series)
      "SER-021": { id: "SER-021", seriesInstanceUID: "1.2.840.113619.2.55.3.021", studyId: "STU-007", seriesNumber: 1, seriesDescription: "Scout", modality: "CT", numberOfInstances: 2, thumbnailType: "xr_chest_pa", bodyPart: "ABDOMEN", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-022": { id: "SER-022", seriesInstanceUID: "1.2.840.113619.2.55.3.022", studyId: "STU-007", seriesNumber: 2, seriesDescription: "Axial 2.0mm", modality: "CT", numberOfInstances: 390, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 2.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-023": { id: "SER-023", seriesInstanceUID: "1.2.840.113619.2.55.3.023", studyId: "STU-007", seriesNumber: 3, seriesDescription: "Body 5.0 CE", modality: "CT", numberOfInstances: 388, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },

      // STU-008: MRI Brain for PAT-005 (5 series)
      "SER-024": { id: "SER-024", seriesInstanceUID: "1.2.840.113619.2.55.3.024", studyId: "STU-008", seriesNumber: 1, seriesDescription: "T1W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-025": { id: "SER-025", seriesInstanceUID: "1.2.840.113619.2.55.3.025", studyId: "STU-008", seriesNumber: 2, seriesDescription: "T2W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 800, windowWidth: 1600, isTracked: false },
      "SER-026": { id: "SER-026", seriesInstanceUID: "1.2.840.113619.2.55.3.026", studyId: "STU-008", seriesNumber: 3, seriesDescription: "FLAIR Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 700, windowWidth: 1400, isTracked: false },
      "SER-027": { id: "SER-027", seriesInstanceUID: "1.2.840.113619.2.55.3.027", studyId: "STU-008", seriesNumber: 4, seriesDescription: "T1W Sagittal", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_sagittal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-028": { id: "SER-028", seriesInstanceUID: "1.2.840.113619.2.55.3.028", studyId: "STU-008", seriesNumber: 5, seriesDescription: "DWI b1000", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [1.0, 1.0], rows: 128, columns: 128, windowCenter: 500, windowWidth: 1000, isTracked: false }
    },

    // Pre-existing measurements (on STU-001 for training)
    measurements: {
      "MEAS-001": { id: "MEAS-001", type: "bidirectional", label: "Lymph Node", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 45, points: [{x:0.42, y:0.38}, {x:0.47, y:0.42}, {x:0.44, y:0.36}, {x:0.45, y:0.44}], value: 24.4, secondaryValue: 16.4, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:45:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-002": { id: "MEAS-002", type: "bidirectional", label: "Lymph Node", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 62, points: [{x:0.55, y:0.45}, {x:0.60, y:0.49}, {x:0.57, y:0.43}, {x:0.58, y:0.51}], value: 23.9, secondaryValue: 17.0, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:48:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-003": { id: "MEAS-003", type: "bidirectional", label: "Spleen", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 78, points: [{x:0.70, y:0.35}, {x:0.73, y:0.38}, {x:0.71, y:0.33}, {x:0.72, y:0.40}], value: 13.3, secondaryValue: 11.0, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:52:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-004": { id: "MEAS-004", type: "length", label: "Reference", studyId: "STU-001", seriesId: "SER-002", instanceNumber: 120, points: [{x:0.30, y:0.50}, {x:0.50, y:0.50}], value: 48.8, secondaryValue: null, unit: "mm", text: null, huMean: null, huStd: null, color: "#05d8e6", isTarget: false, targetCategory: null, createdAt: "2024-11-15T09:55:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-005": { id: "MEAS-005", type: "ellipse", label: "Liver lesion", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 90, points: [{x:0.35, y:0.45}, {x:0.40, y:0.50}], value: 156.2, secondaryValue: null, unit: "mm²", text: null, huMean: 45.2, huStd: 12.8, color: "#05d8e6", isTarget: false, targetCategory: "non-target", createdAt: "2024-11-15T10:00:00Z", createdBy: "Dr. Sarah Chen" }
    },

    // Viewport state (default: single viewport)
    viewports: {
      "VP-0": { id: "VP-0", seriesId: null, currentInstanceNumber: 1, windowCenter: 40, windowWidth: 400, zoom: 1.0, panX: 0, panY: 0, rotation: 0, flipH: false, flipV: false, invert: false, isActive: true }
    },

    // Tool state
    toolState: {
      activeTool: "windowLevel",
      activeLeftClick: "windowLevel",
      activeRightClick: "zoom",
      activeMiddleClick: "pan",
      windowLevelPreset: "softTissue"
    },

    // UI state
    uiState: {
      currentView: "studyList",     // "studyList" or "viewer"
      activeStudyId: null,           // Currently opened study ID
      leftPanelOpen: true,
      rightPanelOpen: true,
      leftPanelTab: "primary",       // "primary", "recent", "all"
      cineIsPlaying: false,
      cineFrameRate: 24,
      showPreferencesDialog: false,
      studyListFilters: {
        patientName: "",
        mrn: "",
        studyDate: "",
        description: "",
        modality: "",
        accession: ""
      },
      studyListSort: { field: "studyDate", direction: "desc" },
      studyListPage: 1,
      studyListPageSize: 25
    }
  };
}
```

---

## Training Scenarios Covered by Seed Data

1. **Worklist navigation**: 8 studies across 6 patients with mixed modalities (CT, MR, CR, US) and statuses
2. **Multi-series study**: STU-001 has 4 series for series switching practice
3. **Measurement creation**: 5 pre-existing measurements on STU-001 for measurement panel interaction
4. **Prior study comparison**: PAT-001 has both STU-001 (current) and STU-007 (prior) for comparison workflow
5. **Target tracking**: Measurements include target and non-target lesions for RECIST tracking
6. **Various modalities**: CT (head, chest, abdomen), MR (brain multi-sequence), CR (chest X-ray), US (abdomen) for W/L preset practice
7. **Study status workflow**: Studies in "unread", "read", "in_progress", "reported" states

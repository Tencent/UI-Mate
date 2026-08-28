const STORAGE_KEY = 'pacs_viewer_state';

export function createInitialData() {
  return {
    currentUser: {
      name: "Dr. Sarah Chen",
      role: "radiologist",
      institution: "Mercy General Hospital"
    },
    settings: {
      language: "en",
      layoutColumns: 1,
      layoutRows: 1,
      showOverlays: true,
      showOrientationMarkers: true,
      interpolation: "bilinear",
      cineFrameRate: 24
    },
    patients: {
      "PAT-001": { id: "PAT-001", name: "SMITH^JOHN^A", displayName: "Smith, John A.", mrn: "MRN-2847561", dateOfBirth: "1958-03-15", sex: "M", age: "67Y" },
      "PAT-002": { id: "PAT-002", name: "JOHNSON^MARIA^L", displayName: "Johnson, Maria L.", mrn: "MRN-1935284", dateOfBirth: "1972-08-22", sex: "F", age: "52Y" },
      "PAT-003": { id: "PAT-003", name: "WILLIAMS^ROBERT^J", displayName: "Williams, Robert J.", mrn: "MRN-4028173", dateOfBirth: "1945-11-03", sex: "M", age: "79Y" },
      "PAT-004": { id: "PAT-004", name: "BROWN^EMILY^R", displayName: "Brown, Emily R.", mrn: "MRN-7261940", dateOfBirth: "1989-06-17", sex: "F", age: "35Y" },
      "PAT-005": { id: "PAT-005", name: "DAVIS^MICHAEL^S", displayName: "Davis, Michael S.", mrn: "MRN-5183926", dateOfBirth: "1963-01-28", sex: "M", age: "61Y" },
      "PAT-006": { id: "PAT-006", name: "GARCIA^ANA^M", displayName: "Garcia, Ana M.", mrn: "MRN-3947215", dateOfBirth: "1980-12-09", sex: "F", age: "44Y" }
    },
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
    series: {
      "SER-001": { id: "SER-001", seriesInstanceUID: "1.2.840.113619.2.55.3.001", studyId: "STU-001", seriesNumber: 1, seriesDescription: "Scout", modality: "CT", numberOfInstances: 2, thumbnailType: "xr_chest_pa", bodyPart: "ABDOMEN", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-002": { id: "SER-002", seriesInstanceUID: "1.2.840.113619.2.55.3.002", studyId: "STU-001", seriesNumber: 2, seriesDescription: "Axial 2.0mm", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 2.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: true },
      "SER-003": { id: "SER-003", seriesInstanceUID: "1.2.840.113619.2.55.3.003", studyId: "STU-001", seriesNumber: 3, seriesDescription: "Body 5.0 CE", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: true },
      "SER-004": { id: "SER-004", seriesInstanceUID: "1.2.840.113619.2.55.3.004", studyId: "STU-001", seriesNumber: 4, seriesDescription: "Body 4.0 CE", modality: "CT", numberOfInstances: 280, thumbnailType: "ct_coronal_chest", bodyPart: "ABDOMEN", sliceThickness: 4.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },

      "SER-005": { id: "SER-005", seriesInstanceUID: "1.2.840.113619.2.55.3.005", studyId: "STU-002", seriesNumber: 1, seriesDescription: "T1W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-006": { id: "SER-006", seriesInstanceUID: "1.2.840.113619.2.55.3.006", studyId: "STU-002", seriesNumber: 2, seriesDescription: "T2W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 800, windowWidth: 1600, isTracked: false },
      "SER-007": { id: "SER-007", seriesInstanceUID: "1.2.840.113619.2.55.3.007", studyId: "STU-002", seriesNumber: 3, seriesDescription: "FLAIR Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 700, windowWidth: 1400, isTracked: true },
      "SER-008": { id: "SER-008", seriesInstanceUID: "1.2.840.113619.2.55.3.008", studyId: "STU-002", seriesNumber: 4, seriesDescription: "T1W Sagittal", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_sagittal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-009": { id: "SER-009", seriesInstanceUID: "1.2.840.113619.2.55.3.009", studyId: "STU-002", seriesNumber: 5, seriesDescription: "T1W Coronal Post-Contrast", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_coronal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-010": { id: "SER-010", seriesInstanceUID: "1.2.840.113619.2.55.3.010", studyId: "STU-002", seriesNumber: 6, seriesDescription: "DWI b1000", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [1.0, 1.0], rows: 128, columns: 128, windowCenter: 500, windowWidth: 1000, isTracked: false },

      "SER-011": { id: "SER-011", seriesInstanceUID: "1.2.840.113619.2.55.3.011", studyId: "STU-003", seriesNumber: 1, seriesDescription: "Scout AP", modality: "CT", numberOfInstances: 1, thumbnailType: "xr_chest_pa", bodyPart: "CHEST", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-012": { id: "SER-012", seriesInstanceUID: "1.2.840.113619.2.55.3.012", studyId: "STU-003", seriesNumber: 2, seriesDescription: "Axial 1.0 B31s", modality: "CT", numberOfInstances: 310, thumbnailType: "ct_axial_chest", bodyPart: "CHEST", sliceThickness: 1.0, pixelSpacing: [0.7, 0.7], rows: 512, columns: 512, windowCenter: -600, windowWidth: 1500, isTracked: false },
      "SER-013": { id: "SER-013", seriesInstanceUID: "1.2.840.113619.2.55.3.013", studyId: "STU-003", seriesNumber: 3, seriesDescription: "Axial 5.0 Mediastinum", modality: "CT", numberOfInstances: 62, thumbnailType: "ct_axial_chest", bodyPart: "CHEST", sliceThickness: 5.0, pixelSpacing: [0.7, 0.7], rows: 512, columns: 512, windowCenter: 50, windowWidth: 350, isTracked: false },

      "SER-014": { id: "SER-014", seriesInstanceUID: "1.2.840.113619.2.55.3.014", studyId: "STU-004", seriesNumber: 1, seriesDescription: "PA", modality: "CR", numberOfInstances: 1, thumbnailType: "xr_chest_pa", bodyPart: "CHEST", sliceThickness: null, pixelSpacing: [0.139, 0.139], rows: 3072, columns: 2560, windowCenter: 2048, windowWidth: 4096, isTracked: false },
      "SER-015": { id: "SER-015", seriesInstanceUID: "1.2.840.113619.2.55.3.015", studyId: "STU-004", seriesNumber: 2, seriesDescription: "Lateral", modality: "CR", numberOfInstances: 1, thumbnailType: "xr_chest_lateral", bodyPart: "CHEST", sliceThickness: null, pixelSpacing: [0.139, 0.139], rows: 3072, columns: 2560, windowCenter: 2048, windowWidth: 4096, isTracked: false },

      "SER-016": { id: "SER-016", seriesInstanceUID: "1.2.840.113619.2.55.3.016", studyId: "STU-005", seriesNumber: 1, seriesDescription: "Axial 5.0", modality: "CT", numberOfInstances: 30, thumbnailType: "ct_axial_head", bodyPart: "HEAD", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 80, isTracked: false },
      "SER-017": { id: "SER-017", seriesInstanceUID: "1.2.840.113619.2.55.3.017", studyId: "STU-005", seriesNumber: 2, seriesDescription: "Axial 1.0 Bone", modality: "CT", numberOfInstances: 265, thumbnailType: "ct_axial_head", bodyPart: "HEAD", sliceThickness: 1.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 300, windowWidth: 2000, isTracked: false },

      "SER-018": { id: "SER-018", seriesInstanceUID: "1.2.840.113619.2.55.3.018", studyId: "STU-006", seriesNumber: 1, seriesDescription: "Liver", modality: "US", numberOfInstances: 18, thumbnailType: "us_abdomen", bodyPart: "LIVER", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },
      "SER-019": { id: "SER-019", seriesInstanceUID: "1.2.840.113619.2.55.3.019", studyId: "STU-006", seriesNumber: 2, seriesDescription: "Gallbladder", modality: "US", numberOfInstances: 12, thumbnailType: "us_abdomen", bodyPart: "GALLBLADDER", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },
      "SER-020": { id: "SER-020", seriesInstanceUID: "1.2.840.113619.2.55.3.020", studyId: "STU-006", seriesNumber: 3, seriesDescription: "Right Kidney", modality: "US", numberOfInstances: 18, thumbnailType: "us_abdomen", bodyPart: "KIDNEY", sliceThickness: null, pixelSpacing: [0.3, 0.3], rows: 480, columns: 640, windowCenter: 128, windowWidth: 256, isTracked: false },

      "SER-021": { id: "SER-021", seriesInstanceUID: "1.2.840.113619.2.55.3.021", studyId: "STU-007", seriesNumber: 1, seriesDescription: "Scout", modality: "CT", numberOfInstances: 2, thumbnailType: "xr_chest_pa", bodyPart: "ABDOMEN", sliceThickness: 10.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-022": { id: "SER-022", seriesInstanceUID: "1.2.840.113619.2.55.3.022", studyId: "STU-007", seriesNumber: 2, seriesDescription: "Axial 2.0mm", modality: "CT", numberOfInstances: 390, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 2.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },
      "SER-023": { id: "SER-023", seriesInstanceUID: "1.2.840.113619.2.55.3.023", studyId: "STU-007", seriesNumber: 3, seriesDescription: "Body 5.0 CE", modality: "CT", numberOfInstances: 388, thumbnailType: "ct_axial_abdomen", bodyPart: "ABDOMEN", sliceThickness: 5.0, pixelSpacing: [0.488, 0.488], rows: 512, columns: 512, windowCenter: 40, windowWidth: 400, isTracked: false },

      "SER-024": { id: "SER-024", seriesInstanceUID: "1.2.840.113619.2.55.3.024", studyId: "STU-008", seriesNumber: 1, seriesDescription: "T1W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-025": { id: "SER-025", seriesInstanceUID: "1.2.840.113619.2.55.3.025", studyId: "STU-008", seriesNumber: 2, seriesDescription: "T2W Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 800, windowWidth: 1600, isTracked: false },
      "SER-026": { id: "SER-026", seriesInstanceUID: "1.2.840.113619.2.55.3.026", studyId: "STU-008", seriesNumber: 3, seriesDescription: "FLAIR Axial", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 700, windowWidth: 1400, isTracked: false },
      "SER-027": { id: "SER-027", seriesInstanceUID: "1.2.840.113619.2.55.3.027", studyId: "STU-008", seriesNumber: 4, seriesDescription: "T1W Sagittal", modality: "MR", numberOfInstances: 20, thumbnailType: "mr_sagittal_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [0.5, 0.5], rows: 256, columns: 256, windowCenter: 600, windowWidth: 1200, isTracked: false },
      "SER-028": { id: "SER-028", seriesInstanceUID: "1.2.840.113619.2.55.3.028", studyId: "STU-008", seriesNumber: 5, seriesDescription: "DWI b1000", modality: "MR", numberOfInstances: 22, thumbnailType: "mr_axial_brain", bodyPart: "BRAIN", sliceThickness: 5.0, pixelSpacing: [1.0, 1.0], rows: 128, columns: 128, windowCenter: 500, windowWidth: 1000, isTracked: false }
    },
    measurements: {
      "MEAS-001": { id: "MEAS-001", type: "bidirectional", label: "Lymph Node", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 45, points: [{x:0.42, y:0.38}, {x:0.47, y:0.42}, {x:0.44, y:0.36}, {x:0.45, y:0.44}], value: 24.4, secondaryValue: 16.4, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:45:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-002": { id: "MEAS-002", type: "bidirectional", label: "Lymph Node", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 62, points: [{x:0.55, y:0.45}, {x:0.60, y:0.49}, {x:0.57, y:0.43}, {x:0.58, y:0.51}], value: 23.9, secondaryValue: 17.0, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:48:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-003": { id: "MEAS-003", type: "bidirectional", label: "Spleen", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 78, points: [{x:0.70, y:0.35}, {x:0.73, y:0.38}, {x:0.71, y:0.33}, {x:0.72, y:0.40}], value: 13.3, secondaryValue: 11.0, unit: "mm", text: null, huMean: null, huStd: null, color: "#ffeb3b", isTarget: true, targetCategory: "target", createdAt: "2024-11-15T09:52:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-004": { id: "MEAS-004", type: "length", label: "Reference", studyId: "STU-001", seriesId: "SER-002", instanceNumber: 120, points: [{x:0.30, y:0.50}, {x:0.50, y:0.50}], value: 48.8, secondaryValue: null, unit: "mm", text: null, huMean: null, huStd: null, color: "#05d8e6", isTarget: false, targetCategory: null, createdAt: "2024-11-15T09:55:00Z", createdBy: "Dr. Sarah Chen" },
      "MEAS-005": { id: "MEAS-005", type: "ellipse", label: "Liver lesion", studyId: "STU-001", seriesId: "SER-003", instanceNumber: 90, points: [{x:0.35, y:0.45}, {x:0.40, y:0.50}], value: 156.2, secondaryValue: null, unit: "mm\u00B2", text: null, huMean: 45.2, huStd: 12.8, color: "#05d8e6", isTarget: false, targetCategory: "non-target", createdAt: "2024-11-15T10:00:00Z", createdBy: "Dr. Sarah Chen" }
    },
    viewports: {
      "VP-0": { id: "VP-0", seriesId: null, currentInstanceNumber: 1, windowCenter: 40, windowWidth: 400, zoom: 1.0, panX: 0, panY: 0, rotation: 0, flipH: false, flipV: false, invert: false, isActive: true }
    },
    toolState: {
      activeTool: "windowLevel",
      activeLeftClick: "windowLevel",
      activeRightClick: "zoom",
      activeMiddleClick: "pan",
      windowLevelPreset: "softTissue"
    },
    uiState: {
      currentView: "studyList",
      activeStudyId: null,
      leftPanelOpen: true,
      rightPanelOpen: true,
      leftPanelTab: "primary",
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

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return createInitialData();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
}

export function computeStateDiff(initial, current) {
  const diff = {};

  // Measurement changes
  const measDiff = {};
  const allMeasIds = new Set([
    ...Object.keys(initial.measurements || {}),
    ...Object.keys(current.measurements || {})
  ]);
  for (const id of allMeasIds) {
    const a = initial.measurements?.[id];
    const b = current.measurements?.[id];
    if (!a && b) {
      measDiff[id] = { status: 'added', value: b };
    } else if (a && !b) {
      measDiff[id] = { status: 'deleted', value: a };
    } else if (JSON.stringify(a) !== JSON.stringify(b)) {
      measDiff[id] = { status: 'modified', from: a, to: b };
    }
  }
  if (Object.keys(measDiff).length > 0) diff.measurements = measDiff;

  // Study status changes
  const studyDiff = {};
  for (const id of Object.keys(current.studies || {})) {
    const a = initial.studies?.[id];
    const b = current.studies?.[id];
    if (a && b && a.status !== b.status) {
      studyDiff[id] = { status: { from: a.status, to: b.status } };
    }
  }
  if (Object.keys(studyDiff).length > 0) diff.studies = studyDiff;

  // Viewport changes
  if (JSON.stringify(initial.viewports) !== JSON.stringify(current.viewports)) {
    diff.viewports = { from: initial.viewports, to: current.viewports };
  }

  // Tool state changes
  if (JSON.stringify(initial.toolState) !== JSON.stringify(current.toolState)) {
    diff.toolState = { from: initial.toolState, to: current.toolState };
  }

  // UI state changes
  if (JSON.stringify(initial.uiState) !== JSON.stringify(current.uiState)) {
    diff.uiState = { from: initial.uiState, to: current.uiState };
  }

  // Settings changes
  if (JSON.stringify(initial.settings) !== JSON.stringify(current.settings)) {
    diff.settings = { from: initial.settings, to: current.settings };
  }

  // Series tracking changes
  const seriesDiff = {};
  for (const id of Object.keys(current.series || {})) {
    const a = initial.series?.[id];
    const b = current.series?.[id];
    if (a && b && a.isTracked !== b.isTracked) {
      seriesDiff[id] = { isTracked: { from: a.isTracked, to: b.isTracked } };
    }
  }
  if (Object.keys(seriesDiff).length > 0) diff.series = seriesDiff;

  return diff;
}

export const WINDOW_LEVEL_PRESETS = {
  softTissue: { name: 'Soft Tissue', ww: 400, wc: 40 },
  lung: { name: 'Lung', ww: 1500, wc: -600 },
  bone: { name: 'Bone', ww: 2000, wc: 300 },
  brain: { name: 'Brain', ww: 80, wc: 40 },
  abdomen: { name: 'Abdomen', ww: 350, wc: 50 },
  liver: { name: 'Liver', ww: 150, wc: 30 },
  mediastinum: { name: 'Mediastinum', ww: 350, wc: 50 },
  stroke: { name: 'Stroke', ww: 8, wc: 32 }
};

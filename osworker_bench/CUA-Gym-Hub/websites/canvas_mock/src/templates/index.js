import { v4 as uuidv4 } from 'uuid';

export const TEMPLATES = {
  blank: {
    name: "Blank Canvas",
    canvas: { width: 1200, height: 800, backgroundColor: "#ffffff" },
    objects: []
  },
  resume: {
    name: "Resume Template",
    canvas: { width: 794, height: 1123, backgroundColor: "#ffffff" },
    objects: [
      {
        type: "rect",
        left: 0, top: 0, width: 794, height: 150,
        fill: "#2c3e50",
        selectable: false,
        id: uuidv4()
      },
      {
        type: "text",
        text: "JOHN DOE",
        left: 50, top: 40,
        fontSize: 40, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff",
        id: uuidv4()
      },
      {
        type: "text",
        text: "Software Engineer",
        left: 50, top: 90,
        fontSize: 20, fontFamily: "Arial", fill: "#ecf0f1",
        id: uuidv4()
      },
      {
        type: "image",
        src: "https://picsum.photos/100/100",
        left: 650, top: 25,
        width: 100, height: 100,
        id: uuidv4()
      },
      {
        type: "text",
        text: "EXPERIENCE",
        left: 50, top: 200,
        fontSize: 24, fontWeight: "bold", fill: "#2c3e50",
        id: uuidv4()
      },
      {
        type: "line",
        x1: 50, y1: 235, x2: 744, y2: 235,
        stroke: "#3498db", strokeWidth: 2,
        left: 50, top: 235,
        id: uuidv4()
      },
      {
        type: "text",
        text: "Senior Developer | Tech Corp | 2020 - Present\n• Led frontend team\n• Implemented React architecture",
        left: 50, top: 250,
        fontSize: 14, lineHeight: 1.5,
        id: uuidv4()
      }
    ]
  },
  ppt: {
    name: "Presentation Slide",
    canvas: { width: 1280, height: 720, backgroundColor: "#f5f5f5" },
    objects: [
      {
        type: "text",
        text: "Project Overview",
        left: 100, top: 50,
        fontSize: 48, fontWeight: "bold", fill: "#2c3e50",
        id: uuidv4()
      },
      {
        type: "text",
        text: "Q4 2025 Strategy",
        left: 100, top: 120,
        fontSize: 24, fill: "#7f8c8d",
        id: uuidv4()
      },
      {
        type: "rect",
        left: 100, top: 200, width: 500, height: 400,
        fill: "#ffffff", stroke: "#bdc3c7", strokeWidth: 1,
        id: uuidv4()
      },
      {
        type: "text",
        text: "• Key Metric 1\n• Key Metric 2\n• Key Metric 3",
        left: 120, top: 220,
        fontSize: 20, lineHeight: 2,
        id: uuidv4()
      },
      {
        type: "image",
        src: "https://picsum.photos/400/300",
        left: 650, top: 200,
        width: 400, height: 300,
        id: uuidv4()
      }
    ]
  },
  social_media: {
    name: "Social Media Post",
    canvas: { width: 1080, height: 1080, backgroundColor: "#ffffff" },
    objects: [
      {
        type: "image",
        src: "https://picsum.photos/1080/1080",
        left: 0, top: 0,
        width: 1080, height: 1080,
        opacity: 0.8,
        selectable: false,
        id: uuidv4()
      },
      {
        type: "rect",
        left: 140, top: 340, width: 800, height: 400,
        fill: "rgba(255,255,255,0.9)",
        rx: 20, ry: 20,
        id: uuidv4()
      },
      {
        type: "text",
        text: "NEW ARRIVAL",
        left: 540, top: 450,
        fontSize: 80, fontWeight: "bold", fontFamily: "Helvetica",
        originX: "center",
        fill: "#000000",
        id: uuidv4()
      },
      {
        type: "text",
        text: "Shop Now",
        left: 540, top: 600,
        fontSize: 40, fill: "#e74c3c",
        originX: "center",
        id: uuidv4()
      }
    ]
  }
};
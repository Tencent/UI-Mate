import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

// Sticky note color map
export const STICKY_COLORS = {
  white: '#ffffff',
  light_yellow: '#fff9b1',
  yellow: '#f5d128',
  orange: '#ff9d48',
  lime: '#d5f692',
  yellow_green: '#c9df56',
  green: '#7bc86c',
  cyan: '#67c6c0',
  light_pink: '#f5c8d0',
  pink: '#e481a8',
  violet: '#be88c7',
  red: '#ea6162',
  light_blue: '#b5c4e3',
  sky_blue: '#97d5f2',
  blue: '#6fa0e3',
  black: '#1a1a1a',
};

export function createInitialData() {
  return {
    currentUser: {
      id: 'user_1',
      name: 'Alex Morgan',
      email: 'alex.morgan@company.com',
      avatarUrl: null,
      initials: 'AM',
      color: '#4262ff',
      role: 'owner',
      teamId: 'team_1',
    },
    team: {
      id: 'team_1',
      name: 'My Team',
      memberCount: 4,
      members: [
        { id: 'user_1', name: 'Alex Morgan', initials: 'AM', avatarUrl: null },
        { id: 'user_2', name: 'Jordan Lee', initials: 'JL', avatarUrl: null },
        { id: 'user_3', name: 'Sam Chen', initials: 'SC', avatarUrl: null },
        { id: 'user_4', name: 'Taylor Kim', initials: 'TK', avatarUrl: null },
      ],
    },
    projects: [
      { id: 'project_1', name: 'Q1 Planning', teamId: 'team_1', boardIds: ['board_1', 'board_2'], createdAt: '2025-01-15T10:00:00Z' },
      { id: 'project_2', name: 'Product Design', teamId: 'team_1', boardIds: ['board_3'], createdAt: '2025-01-20T10:00:00Z' },
      { id: 'project_3', name: 'Engineering', teamId: 'team_1', boardIds: ['board_4'], createdAt: '2025-02-01T10:00:00Z' },
    ],
    boards: [
      {
        id: 'board_1',
        name: 'Sprint Retrospective',
        description: 'Team retro for Sprint 23',
        projectId: 'project_1',
        teamId: 'team_1',
        createdBy: 'user_1',
        createdAt: '2025-02-01T09:00:00Z',
        modifiedAt: '2025-02-15T14:30:00Z',
        starred: true,
        thumbnailColor: '#7bc86c',
        viewedAt: '2025-02-15T14:30:00Z',
      },
      {
        id: 'board_2',
        name: 'Product Roadmap 2025',
        description: 'Q1-Q4 product roadmap',
        projectId: 'project_1',
        teamId: 'team_1',
        createdBy: 'user_1',
        createdAt: '2025-01-20T10:00:00Z',
        modifiedAt: '2025-02-10T11:00:00Z',
        starred: false,
        thumbnailColor: '#4262ff',
        viewedAt: '2025-02-10T11:00:00Z',
      },
      {
        id: 'board_3',
        name: 'User Flow Diagrams',
        description: 'User flows for v2 redesign',
        projectId: 'project_2',
        teamId: 'team_1',
        createdBy: 'user_2',
        createdAt: '2025-01-25T09:00:00Z',
        modifiedAt: '2025-02-12T16:00:00Z',
        starred: false,
        thumbnailColor: '#ff9d48',
        viewedAt: '2025-02-12T16:00:00Z',
      },
      {
        id: 'board_4',
        name: 'Architecture Overview',
        description: 'System architecture diagram',
        projectId: 'project_3',
        teamId: 'team_1',
        createdBy: 'user_1',
        createdAt: '2025-02-05T09:00:00Z',
        modifiedAt: '2025-02-14T10:00:00Z',
        starred: true,
        thumbnailColor: '#be88c7',
        viewedAt: '2025-02-14T10:00:00Z',
      },
      {
        id: 'board_5',
        name: 'Brainstorming Session',
        description: 'Open brainstorming for new features',
        projectId: null,
        teamId: 'team_1',
        createdBy: 'user_3',
        createdAt: '2025-02-08T14:00:00Z',
        modifiedAt: '2025-02-13T09:00:00Z',
        starred: false,
        thumbnailColor: '#fff9b1',
        viewedAt: '2025-02-13T09:00:00Z',
      },
    ],
    boardItems: {
      board_1: [
        // Frame: What went well
        { id: 'frame_1', type: 'frame', boardId: 'board_1', title: 'What went well', x: 400, y: 400, width: 600, height: 500, rotation: 0, parentId: null, locked: false, zIndex: 1, style: { fillColor: '#f0fff0' }, childrenIds: ['sn_1', 'sn_2', 'sn_3'], showContent: true, createdBy: 'user_1', createdAt: '2025-02-01T09:10:00Z', modifiedAt: '2025-02-01T09:10:00Z' },
        // Sticky notes in "What went well"
        { id: 'sn_1', type: 'sticky_note', boardId: 'board_1', content: 'Great sprint velocity', x: 200, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_1', locked: false, zIndex: 10, shape: 'square', style: { fillColor: 'green', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: ['tag_2'], createdBy: 'user_1', createdAt: '2025-02-01T09:15:00Z', modifiedAt: '2025-02-01T09:15:00Z' },
        { id: 'sn_2', type: 'sticky_note', boardId: 'board_1', content: 'Good code review process', x: 470, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_1', locked: false, zIndex: 11, shape: 'square', style: { fillColor: 'green', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_2', createdAt: '2025-02-01T09:16:00Z', modifiedAt: '2025-02-01T09:16:00Z' },
        { id: 'sn_3', type: 'sticky_note', boardId: 'board_1', content: 'Team collaboration improved', x: 200, y: 500, width: 199, height: 199, rotation: 0, parentId: 'frame_1', locked: false, zIndex: 12, shape: 'square', style: { fillColor: 'light_yellow', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_3', createdAt: '2025-02-01T09:17:00Z', modifiedAt: '2025-02-01T09:17:00Z' },
        // Frame: Improvements needed
        { id: 'frame_2', type: 'frame', boardId: 'board_1', title: 'Improvements needed', x: 1100, y: 400, width: 600, height: 500, rotation: 0, parentId: null, locked: false, zIndex: 2, style: { fillColor: '#fff8f0' }, childrenIds: ['sn_4', 'sn_5', 'sn_6'], showContent: true, createdBy: 'user_1', createdAt: '2025-02-01T09:10:00Z', modifiedAt: '2025-02-01T09:10:00Z' },
        { id: 'sn_4', type: 'sticky_note', boardId: 'board_1', content: 'Documentation gaps', x: 900, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_2', locked: false, zIndex: 13, shape: 'square', style: { fillColor: 'orange', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: ['tag_1'], createdBy: 'user_1', createdAt: '2025-02-01T09:20:00Z', modifiedAt: '2025-02-01T09:20:00Z' },
        { id: 'sn_5', type: 'sticky_note', boardId: 'board_1', content: 'Flaky CI pipeline', x: 1170, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_2', locked: false, zIndex: 14, shape: 'square', style: { fillColor: 'red', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: ['tag_1', 'tag_3'], createdBy: 'user_2', createdAt: '2025-02-01T09:21:00Z', modifiedAt: '2025-02-01T09:21:00Z' },
        { id: 'sn_6', type: 'sticky_note', boardId: 'board_1', content: 'Need more automated tests', x: 900, y: 500, width: 199, height: 199, rotation: 0, parentId: 'frame_2', locked: false, zIndex: 15, shape: 'square', style: { fillColor: 'orange', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_3', createdAt: '2025-02-01T09:22:00Z', modifiedAt: '2025-02-01T09:22:00Z' },
        // Frame: Action items
        { id: 'frame_3', type: 'frame', boardId: 'board_1', title: 'Action items', x: 1800, y: 400, width: 600, height: 500, rotation: 0, parentId: null, locked: false, zIndex: 3, style: { fillColor: '#f0f0ff' }, childrenIds: ['sn_7', 'sn_8'], showContent: true, createdBy: 'user_1', createdAt: '2025-02-01T09:10:00Z', modifiedAt: '2025-02-01T09:10:00Z' },
        { id: 'sn_7', type: 'sticky_note', boardId: 'board_1', content: 'Set up documentation day', x: 1600, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_3', locked: false, zIndex: 16, shape: 'square', style: { fillColor: 'light_blue', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: ['tag_2'], createdBy: 'user_1', createdAt: '2025-02-01T09:25:00Z', modifiedAt: '2025-02-01T09:25:00Z' },
        { id: 'sn_8', type: 'sticky_note', boardId: 'board_1', content: 'Fix CI pipeline this sprint', x: 1870, y: 250, width: 199, height: 199, rotation: 0, parentId: 'frame_3', locked: false, zIndex: 17, shape: 'square', style: { fillColor: 'light_blue', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_4', createdAt: '2025-02-01T09:26:00Z', modifiedAt: '2025-02-01T09:26:00Z' },
        // Title text
        { id: 'text_1', type: 'text', boardId: 'board_1', content: 'Sprint 23 Retrospective', x: 1100, y: 80, width: 400, height: 50, rotation: 0, parentId: null, locked: false, zIndex: 20, style: { fillColor: 'transparent', fontFamily: 'arial', fontSize: 36, color: '#1a1a1a', textAlign: 'center', bold: true, italic: false, underline: false, strikethrough: false }, createdBy: 'user_1', createdAt: '2025-02-01T09:05:00Z', modifiedAt: '2025-02-01T09:05:00Z' },
        // Connector between frame_2 and frame_3
        { id: 'conn_1', type: 'connector', boardId: 'board_1', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 5, start: { itemId: 'frame_2', position: { x: 1.0, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'frame_3', position: { x: 0.0, y: 0.5 }, snapTo: 'left' }, shape: 'elbowed', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [{ content: 'leads to', position: 0.5, textAlignVertical: 'middle' }], createdBy: 'user_1', createdAt: '2025-02-01T09:30:00Z', modifiedAt: '2025-02-01T09:30:00Z' },
      ],
      board_2: [
        // Title
        { id: 'text_rm2', type: 'text', boardId: 'board_2', content: 'Product Roadmap 2025', x: 800, y: 60, width: 480, height: 56, rotation: 0, parentId: null, locked: false, zIndex: 20, style: { fillColor: 'transparent', fontFamily: 'arial', fontSize: 36, color: '#050038', textAlign: 'center', bold: true, italic: false, underline: false, strikethrough: false }, createdBy: 'user_1', createdAt: '2025-01-20T10:05:00Z', modifiedAt: '2025-01-20T10:05:00Z' },
        // Frame: Q1
        { id: 'frame_q1', type: 'frame', boardId: 'board_2', title: 'Q1 — Jan-Mar', x: 300, y: 350, width: 560, height: 420, rotation: 0, parentId: null, locked: false, zIndex: 1, style: { fillColor: '#e8f5e9' }, childrenIds: ['rm_sn_1', 'rm_sn_2', 'rm_sn_3'], showContent: true, createdBy: 'user_1', createdAt: '2025-01-20T10:10:00Z', modifiedAt: '2025-01-20T10:10:00Z' },
        { id: 'rm_sn_1', type: 'sticky_note', boardId: 'board_2', content: 'User authentication redesign', x: 100, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q1', locked: false, zIndex: 10, shape: 'square', style: { fillColor: 'lime', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_1', createdAt: '2025-01-20T10:15:00Z', modifiedAt: '2025-01-20T10:15:00Z' },
        { id: 'rm_sn_2', type: 'sticky_note', boardId: 'board_2', content: 'Mobile app v2 launch', x: 370, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q1', locked: false, zIndex: 11, shape: 'square', style: { fillColor: 'green', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_2', createdAt: '2025-01-20T10:16:00Z', modifiedAt: '2025-01-20T10:16:00Z' },
        { id: 'rm_sn_3', type: 'sticky_note', boardId: 'board_2', content: 'API rate limiting', x: 100, y: 500, width: 199, height: 199, rotation: 0, parentId: 'frame_q1', locked: false, zIndex: 12, shape: 'square', style: { fillColor: 'cyan', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_3', createdAt: '2025-01-20T10:17:00Z', modifiedAt: '2025-01-20T10:17:00Z' },
        // Frame: Q2
        { id: 'frame_q2', type: 'frame', boardId: 'board_2', title: 'Q2 — Apr-Jun', x: 980, y: 350, width: 560, height: 420, rotation: 0, parentId: null, locked: false, zIndex: 2, style: { fillColor: '#fff8e1' }, childrenIds: ['rm_sn_4', 'rm_sn_5'], showContent: true, createdBy: 'user_1', createdAt: '2025-01-20T10:20:00Z', modifiedAt: '2025-01-20T10:20:00Z' },
        { id: 'rm_sn_4', type: 'sticky_note', boardId: 'board_2', content: 'Analytics dashboard v3', x: 780, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q2', locked: false, zIndex: 13, shape: 'square', style: { fillColor: 'yellow', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_1', createdAt: '2025-01-20T10:21:00Z', modifiedAt: '2025-01-20T10:21:00Z' },
        { id: 'rm_sn_5', type: 'sticky_note', boardId: 'board_2', content: 'Third-party integrations', x: 1050, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q2', locked: false, zIndex: 14, shape: 'square', style: { fillColor: 'orange', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_2', createdAt: '2025-01-20T10:22:00Z', modifiedAt: '2025-01-20T10:22:00Z' },
        // Frame: Q3/Q4
        { id: 'frame_q34', type: 'frame', boardId: 'board_2', title: 'Q3-Q4 — Jul-Dec', x: 1660, y: 350, width: 560, height: 420, rotation: 0, parentId: null, locked: false, zIndex: 3, style: { fillColor: '#fce4ec' }, childrenIds: ['rm_sn_6', 'rm_sn_7'], showContent: true, createdBy: 'user_1', createdAt: '2025-01-20T10:25:00Z', modifiedAt: '2025-01-20T10:25:00Z' },
        { id: 'rm_sn_6', type: 'sticky_note', boardId: 'board_2', content: 'AI feature rollout', x: 1460, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q34', locked: false, zIndex: 15, shape: 'square', style: { fillColor: 'violet', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_1', createdAt: '2025-01-20T10:26:00Z', modifiedAt: '2025-01-20T10:26:00Z' },
        { id: 'rm_sn_7', type: 'sticky_note', boardId: 'board_2', content: 'Enterprise tier launch', x: 1730, y: 300, width: 199, height: 199, rotation: 0, parentId: 'frame_q34', locked: false, zIndex: 16, shape: 'square', style: { fillColor: 'pink', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_2', createdAt: '2025-01-20T10:27:00Z', modifiedAt: '2025-01-20T10:27:00Z' },
      ],
      board_3: [
        { id: 'shape_flow_1', type: 'shape', boardId: 'board_3', shapeType: 'round_rectangle', content: 'Landing Page', x: 200, y: 200, width: 160, height: 80, rotation: 0, parentId: null, locked: false, zIndex: 1, style: { fillColor: '#e3f2fd', fillOpacity: 1, borderColor: '#1976d2', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_2', createdAt: '2025-01-25T09:10:00Z', modifiedAt: '2025-01-25T09:10:00Z' },
        { id: 'shape_flow_2', type: 'shape', boardId: 'board_3', shapeType: 'round_rectangle', content: 'Sign Up', x: 450, y: 200, width: 160, height: 80, rotation: 0, parentId: null, locked: false, zIndex: 2, style: { fillColor: '#e8f5e9', fillOpacity: 1, borderColor: '#2e7d32', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_2', createdAt: '2025-01-25T09:15:00Z', modifiedAt: '2025-01-25T09:15:00Z' },
        { id: 'shape_flow_3', type: 'shape', boardId: 'board_3', shapeType: 'round_rectangle', content: 'Dashboard', x: 700, y: 200, width: 160, height: 80, rotation: 0, parentId: null, locked: false, zIndex: 3, style: { fillColor: '#fff3e0', fillOpacity: 1, borderColor: '#e65100', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_2', createdAt: '2025-01-25T09:20:00Z', modifiedAt: '2025-01-25T09:20:00Z' },
      ],
      board_4: [
        { id: 'shape_1', type: 'shape', boardId: 'board_4', shapeType: 'round_rectangle', content: 'Frontend\n(React)', x: 200, y: 200, width: 180, height: 100, rotation: 0, parentId: null, locked: false, zIndex: 1, style: { fillColor: '#e3f2fd', fillOpacity: 1, borderColor: '#1976d2', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_1', createdAt: '2025-02-05T09:10:00Z', modifiedAt: '2025-02-05T09:10:00Z' },
        { id: 'shape_2', type: 'shape', boardId: 'board_4', shapeType: 'round_rectangle', content: 'API Gateway', x: 500, y: 200, width: 180, height: 100, rotation: 0, parentId: null, locked: false, zIndex: 2, style: { fillColor: '#fff3e0', fillOpacity: 1, borderColor: '#e65100', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_1', createdAt: '2025-02-05T09:15:00Z', modifiedAt: '2025-02-05T09:15:00Z' },
        { id: 'shape_3', type: 'shape', boardId: 'board_4', shapeType: 'round_rectangle', content: 'Auth Service', x: 800, y: 100, width: 180, height: 100, rotation: 0, parentId: null, locked: false, zIndex: 3, style: { fillColor: '#fce4ec', fillOpacity: 1, borderColor: '#c62828', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_1', createdAt: '2025-02-05T09:20:00Z', modifiedAt: '2025-02-05T09:20:00Z' },
        { id: 'shape_4', type: 'shape', boardId: 'board_4', shapeType: 'round_rectangle', content: 'User Service', x: 800, y: 300, width: 180, height: 100, rotation: 0, parentId: null, locked: false, zIndex: 4, style: { fillColor: '#e8f5e9', fillOpacity: 1, borderColor: '#2e7d32', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_1', createdAt: '2025-02-05T09:25:00Z', modifiedAt: '2025-02-05T09:25:00Z' },
        { id: 'shape_5', type: 'shape', boardId: 'board_4', shapeType: 'round_rectangle', content: 'PostgreSQL', x: 1100, y: 200, width: 150, height: 120, rotation: 0, parentId: null, locked: false, zIndex: 5, style: { fillColor: '#f3e5f5', fillOpacity: 1, borderColor: '#7b1fa2', borderWidth: 2, borderStyle: 'normal', borderOpacity: 1, fontFamily: 'arial', fontSize: 14, color: '#1a1a1a', textAlign: 'center', textAlignVertical: 'middle' }, createdBy: 'user_1', createdAt: '2025-02-05T09:30:00Z', modifiedAt: '2025-02-05T09:30:00Z' },
        { id: 'conn_2', type: 'connector', boardId: 'board_4', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 10, start: { itemId: 'shape_1', position: { x: 1, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'shape_2', position: { x: 0, y: 0.5 }, snapTo: 'left' }, shape: 'straight', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [], createdBy: 'user_1', createdAt: '2025-02-05T09:35:00Z', modifiedAt: '2025-02-05T09:35:00Z' },
        { id: 'conn_3', type: 'connector', boardId: 'board_4', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 11, start: { itemId: 'shape_2', position: { x: 1, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'shape_3', position: { x: 0, y: 0.5 }, snapTo: 'left' }, shape: 'elbowed', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [{ content: '/auth/*', position: 0.5, textAlignVertical: 'middle' }], createdBy: 'user_1', createdAt: '2025-02-05T09:36:00Z', modifiedAt: '2025-02-05T09:36:00Z' },
        { id: 'conn_4', type: 'connector', boardId: 'board_4', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 12, start: { itemId: 'shape_2', position: { x: 1, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'shape_4', position: { x: 0, y: 0.5 }, snapTo: 'left' }, shape: 'elbowed', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'normal', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [{ content: '/users/*', position: 0.5, textAlignVertical: 'middle' }], createdBy: 'user_1', createdAt: '2025-02-05T09:37:00Z', modifiedAt: '2025-02-05T09:37:00Z' },
        { id: 'conn_5', type: 'connector', boardId: 'board_4', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 13, start: { itemId: 'shape_3', position: { x: 1, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'shape_5', position: { x: 0, y: 0.5 }, snapTo: 'left' }, shape: 'straight', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'dashed', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [], createdBy: 'user_1', createdAt: '2025-02-05T09:38:00Z', modifiedAt: '2025-02-05T09:38:00Z' },
        { id: 'conn_6', type: 'connector', boardId: 'board_4', x: 0, y: 0, width: 0, height: 0, rotation: 0, parentId: null, locked: false, zIndex: 14, start: { itemId: 'shape_4', position: { x: 1, y: 0.5 }, snapTo: 'right' }, end: { itemId: 'shape_5', position: { x: 0, y: 0.5 }, snapTo: 'left' }, shape: 'straight', style: { strokeColor: '#000000', strokeWidth: 2, strokeStyle: 'dashed', startStrokeCap: 'none', endStrokeCap: 'stealth' }, captions: [], createdBy: 'user_1', createdAt: '2025-02-05T09:39:00Z', modifiedAt: '2025-02-05T09:39:00Z' },
        { id: 'text_arch', type: 'text', boardId: 'board_4', content: 'System Architecture', x: 600, y: 20, width: 400, height: 50, rotation: 0, parentId: null, locked: false, zIndex: 20, style: { fillColor: 'transparent', fontFamily: 'arial', fontSize: 36, color: '#1a1a1a', textAlign: 'center', bold: true, italic: false, underline: false, strikethrough: false }, createdBy: 'user_1', createdAt: '2025-02-05T09:05:00Z', modifiedAt: '2025-02-05T09:05:00Z' },
      ],
      board_5: [
        { id: 'sn_b5_1', type: 'sticky_note', boardId: 'board_5', content: 'Mobile app redesign', x: 150, y: 150, width: 199, height: 199, rotation: -2, parentId: null, locked: false, zIndex: 1, shape: 'square', style: { fillColor: 'light_yellow', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_3', createdAt: '2025-02-08T14:05:00Z', modifiedAt: '2025-02-08T14:05:00Z' },
        { id: 'sn_b5_2', type: 'sticky_note', boardId: 'board_5', content: 'AI-powered search', x: 400, y: 120, width: 199, height: 199, rotation: 1, parentId: null, locked: false, zIndex: 2, shape: 'square', style: { fillColor: 'sky_blue', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_1', createdAt: '2025-02-08T14:10:00Z', modifiedAt: '2025-02-08T14:10:00Z' },
        { id: 'sn_b5_3', type: 'sticky_note', boardId: 'board_5', content: 'Dark mode support', x: 650, y: 180, width: 199, height: 199, rotation: -1, parentId: null, locked: false, zIndex: 3, shape: 'square', style: { fillColor: 'violet', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_2', createdAt: '2025-02-08T14:15:00Z', modifiedAt: '2025-02-08T14:15:00Z' },
        { id: 'sn_b5_4', type: 'sticky_note', boardId: 'board_5', content: 'Performance optimization', x: 250, y: 400, width: 199, height: 199, rotation: 2, parentId: null, locked: false, zIndex: 4, shape: 'square', style: { fillColor: 'lime', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_4', createdAt: '2025-02-08T14:20:00Z', modifiedAt: '2025-02-08T14:20:00Z' },
        { id: 'sn_b5_5', type: 'sticky_note', boardId: 'board_5', content: 'User onboarding flow', x: 520, y: 380, width: 199, height: 199, rotation: -1.5, parentId: null, locked: false, zIndex: 5, shape: 'square', style: { fillColor: 'pink', textAlign: 'center', textAlignVertical: 'middle', fontSize: 'auto' }, tagIds: [], createdBy: 'user_1', createdAt: '2025-02-08T14:25:00Z', modifiedAt: '2025-02-08T14:25:00Z' },
      ],
    },
    comments: {
      board_1: [
        {
          id: 'comment_1',
          boardId: 'board_1',
          x: 750,
          y: 350,
          resolved: false,
          threads: [
            { id: 'tm_1', authorId: 'user_2', authorName: 'Jordan Lee', content: 'Can we prioritize the CI fixes?', createdAt: '2025-02-10T11:00:00Z' },
            { id: 'tm_2', authorId: 'user_1', authorName: 'Alex Morgan', content: 'Agreed, marking as top priority.', createdAt: '2025-02-10T11:05:00Z' },
          ],
        },
      ],
    },
    tags: {
      board_1: [
        { id: 'tag_1', boardId: 'board_1', title: 'High Priority', color: 'red' },
        { id: 'tag_2', boardId: 'board_1', title: 'Quick Win', color: 'green' },
        { id: 'tag_3', boardId: 'board_1', title: 'Blocked', color: 'yellow' },
      ],
    },
  };
}

// --- Session helpers ---
const BASE_STORAGE_KEY = 'miro_mock_data';
const BASE_INITIAL_KEY = 'miro_mock_initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
}

export async function fetchCustomState(sid = null) {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    console.warn('No custom state available:', e);
  }
  return null;
}

let _syncTimer = null;

export function saveState(state, sid = null) {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
}

export function getSavedInitialState(sid = null) {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const k in custom) {
    if (custom[k] !== null && custom[k] !== undefined) {
      if (typeof custom[k] === 'object' && !Array.isArray(custom[k]) && typeof defaults[k] === 'object' && !Array.isArray(defaults[k])) {
        result[k] = deepMergeWithDefaults(defaults[k], custom[k]);
      } else {
        result[k] = custom[k];
      }
    }
  }
  return result;
}

export function initializeData(sid = null, customState = null) {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const defaults = createInitialData();
    const data = { ...defaults, ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
}

export { initialKey, storageKey };

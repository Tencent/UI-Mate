const BASE_KEY = 'openreviewState'
const BASE_INITIAL_KEY = 'openreviewInitialState'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('openreview_sid', sid)
    return sid
  }
  return sessionStorage.getItem('openreview_sid') || null
}

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`)
    if (!res.ok) return null
    const data = await res.json()
    // Server returns {stored_state, has_custom_state, sid} — extract the actual state
    if (data && data.has_custom_state && data.stored_state) {
      return data.stored_state
    }
    return null
  } catch {
    return null
  }
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const initializeData = (sid = null, customState = null) => {
  const sKey = storageKey(sid)
  const iKey = initialKey(sid)

  if (customState) {
    const defaultData = createInitialData()
    const merged = { ...defaultData, ...customState }
    localStorage.setItem(sKey, JSON.stringify(merged))
    localStorage.setItem(iKey, JSON.stringify(merged))
    return merged
  }

  const existing = localStorage.getItem(sKey)
  if (existing) {
    return JSON.parse(existing)
  }

  const defaultData = createInitialData()
  localStorage.setItem(sKey, JSON.stringify(defaultData))
  localStorage.setItem(iKey, JSON.stringify(defaultData))
  return defaultData
}

let _syncTimer = null

export const saveState = (state, sid = null) => {
  const sKey = storageKey(sid)
  localStorage.setItem(sKey, JSON.stringify(state))
  if (sid) {
    clearTimeout(_syncTimer)
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {})
    }, 300)
  }
}

export const getInitialState = (sid = null) => {
  const iKey = initialKey(sid)
  const stored = localStorage.getItem(iKey)
  return stored ? JSON.parse(stored) : null
}

function deepMerge(target, source) {
  if (source === null || source === undefined) return target
  if (typeof source !== 'object' || Array.isArray(source)) return source
  if (typeof target !== 'object' || Array.isArray(target)) return source
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue
    if (Array.isArray(source[key])) {
      result[key] = source[key]
    } else if (typeof source[key] === 'object') {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export function createInitialData() {
  const venueId = 'NeurIPS.cc/2025/Conference'
  const shortPhrase = 'NeurIPS 2025'

  // Profiles
  const profiles = {
    '~Sarah_Chen1': {
      id: '~Sarah_Chen1',
      active: true,
      content: {
        names: [{ fullname: 'Sarah Chen', first: 'Sarah', middle: '', last: 'Chen', preferred: true, username: '~Sarah_Chen1' }],
        emails: ['sarah.chen@stanford.edu'],
        preferredEmail: 'sarah.chen@stanford.edu',
        emailsConfirmed: ['sarah.chen@stanford.edu'],
        history: [{ position: 'Associate Professor', institution: { name: 'Stanford University', domain: 'stanford.edu' }, start: 2019, end: null }],
        expertise: [{ keywords: ['deep learning', 'natural language processing', 'transformer architectures'], start: 2015, end: null }],
        homepage: 'https://sarahchen.stanford.edu',
        dblp: 'https://dblp.org/pid/00/0001',
      },
    },
    '~Michael_Torres1': {
      id: '~Michael_Torres1',
      active: true,
      content: {
        names: [{ fullname: 'Michael Torres', first: 'Michael', middle: '', last: 'Torres', preferred: true, username: '~Michael_Torres1' }],
        emails: ['mtorres@mit.edu'],
        preferredEmail: 'mtorres@mit.edu',
        emailsConfirmed: ['mtorres@mit.edu'],
        history: [{ position: 'Professor', institution: { name: 'MIT CSAIL', domain: 'mit.edu' }, start: 2016, end: null }],
        expertise: [{ keywords: ['reinforcement learning', 'robotics', 'multi-agent systems'], start: 2012, end: null }],
        homepage: 'https://mtorres.csail.mit.edu',
        dblp: 'https://dblp.org/pid/00/0002',
      },
    },
    '~Priya_Sharma1': {
      id: '~Priya_Sharma1',
      active: true,
      content: {
        names: [{ fullname: 'Priya Sharma', first: 'Priya', middle: '', last: 'Sharma', preferred: true, username: '~Priya_Sharma1' }],
        emails: ['psharma@berkeley.edu'],
        preferredEmail: 'psharma@berkeley.edu',
        emailsConfirmed: ['psharma@berkeley.edu'],
        history: [{ position: 'Assistant Professor', institution: { name: 'UC Berkeley', domain: 'berkeley.edu' }, start: 2020, end: null }],
        expertise: [{ keywords: ['computer vision', 'generative models', 'diffusion models'], start: 2016, end: null }],
        homepage: 'https://psharma.berkeley.edu',
        dblp: 'https://dblp.org/pid/00/0003',
      },
    },
    '~James_Liu1': {
      id: '~James_Liu1',
      active: true,
      content: {
        names: [{ fullname: 'James Liu', first: 'James', middle: '', last: 'Liu', preferred: true, username: '~James_Liu1' }],
        emails: ['jliu@cmu.edu'],
        preferredEmail: 'jliu@cmu.edu',
        emailsConfirmed: ['jliu@cmu.edu'],
        history: [{ position: 'Associate Professor', institution: { name: 'Carnegie Mellon University', domain: 'cmu.edu' }, start: 2018, end: null }],
        expertise: [{ keywords: ['optimization', 'machine learning theory', 'convex optimization'], start: 2014, end: null }],
        homepage: 'https://jliu.cmu.edu',
        dblp: 'https://dblp.org/pid/00/0004',
      },
    },
    '~Elena_Popov1': {
      id: '~Elena_Popov1',
      active: true,
      content: {
        names: [{ fullname: 'Elena Popov', first: 'Elena', middle: '', last: 'Popov', preferred: true, username: '~Elena_Popov1' }],
        emails: ['epopov@ethz.ch'],
        preferredEmail: 'epopov@ethz.ch',
        emailsConfirmed: ['epopov@ethz.ch'],
        history: [{ position: 'Senior Researcher', institution: { name: 'ETH Zurich', domain: 'ethz.ch' }, start: 2017, end: null }],
        expertise: [{ keywords: ['graph neural networks', 'molecular modeling', 'geometric deep learning'], start: 2013, end: null }],
        homepage: 'https://epopov.ethz.ch',
        dblp: 'https://dblp.org/pid/00/0005',
      },
    },
    '~David_Kim1': {
      id: '~David_Kim1',
      active: true,
      content: {
        names: [{ fullname: 'David Kim', first: 'David', middle: '', last: 'Kim', preferred: true, username: '~David_Kim1' }],
        emails: ['dkim@google.com'],
        preferredEmail: 'dkim@google.com',
        emailsConfirmed: ['dkim@google.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Google DeepMind', domain: 'google.com' }, start: 2019, end: null }],
        expertise: [{ keywords: ['large language models', 'RLHF', 'alignment'], start: 2017, end: null }],
        homepage: 'https://dkim.deepmind.com',
        dblp: 'https://dblp.org/pid/00/0006',
      },
    },
    '~Aisha_Patel1': {
      id: '~Aisha_Patel1',
      active: true,
      content: {
        names: [{ fullname: 'Aisha Patel', first: 'Aisha', middle: '', last: 'Patel', preferred: true, username: '~Aisha_Patel1' }],
        emails: ['apatel@meta.com'],
        preferredEmail: 'apatel@meta.com',
        emailsConfirmed: ['apatel@meta.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Meta AI Research', domain: 'meta.com' }, start: 2020, end: null }],
        expertise: [{ keywords: ['self-supervised learning', 'representation learning', 'multimodal learning'], start: 2016, end: null }],
        homepage: 'https://apatel.meta.com',
        dblp: 'https://dblp.org/pid/00/0007',
      },
    },
    '~Robert_Zhang1': {
      id: '~Robert_Zhang1',
      active: true,
      content: {
        names: [{ fullname: 'Robert Zhang', first: 'Robert', middle: '', last: 'Zhang', preferred: true, username: '~Robert_Zhang1' }],
        emails: ['rzhang@openai.com'],
        preferredEmail: 'rzhang@openai.com',
        emailsConfirmed: ['rzhang@openai.com'],
        history: [{ position: 'Senior Research Scientist', institution: { name: 'OpenAI', domain: 'openai.com' }, start: 2018, end: null }],
        expertise: [{ keywords: ['program synthesis', 'neural architecture search', 'scalable systems'], start: 2014, end: null }],
        homepage: 'https://rzhang.openai.com',
        dblp: 'https://dblp.org/pid/00/0008',
      },
    },
    '~Wei_Zhang1': {
      id: '~Wei_Zhang1',
      active: true,
      content: {
        names: [{ fullname: 'Wei Zhang', first: 'Wei', middle: '', last: 'Zhang', preferred: true, username: '~Wei_Zhang1' }],
        emails: ['wzhang@google.com'],
        preferredEmail: 'wzhang@google.com',
        emailsConfirmed: ['wzhang@google.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Google DeepMind', domain: 'google.com' }, start: 2020, end: null }],
        expertise: [{ keywords: ['language models', 'scaling laws'], start: 2018, end: null }],
      },
    },
    '~Tomas_Nguyen1': {
      id: '~Tomas_Nguyen1',
      active: true,
      content: {
        names: [{ fullname: 'Tomas Nguyen', first: 'Tomas', middle: '', last: 'Nguyen', preferred: true, username: '~Tomas_Nguyen1' }],
        emails: ['tnguyen@google.com'],
        preferredEmail: 'tnguyen@google.com',
        emailsConfirmed: ['tnguyen@google.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Google Research', domain: 'google.com' }, start: 2021, end: null }],
        expertise: [{ keywords: ['mixture of experts', 'efficient training'], start: 2019, end: null }],
      },
    },
    '~Jun_Tanaka1': {
      id: '~Jun_Tanaka1',
      active: true,
      content: {
        names: [{ fullname: 'Jun Tanaka', first: 'Jun', middle: '', last: 'Tanaka', preferred: true, username: '~Jun_Tanaka1' }],
        emails: ['jtanaka@meta.com'],
        preferredEmail: 'jtanaka@meta.com',
        emailsConfirmed: ['jtanaka@meta.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Meta AI Research', domain: 'meta.com' }, start: 2021, end: null }],
        expertise: [{ keywords: ['self-supervised learning', 'computer vision'], start: 2018, end: null }],
      },
    },
    '~Lena_Muller1': {
      id: '~Lena_Muller1',
      active: true,
      content: {
        names: [{ fullname: 'Lena Muller', first: 'Lena', middle: '', last: 'Muller', preferred: true, username: '~Lena_Muller1' }],
        emails: ['lmuller@ethz.ch'],
        preferredEmail: 'lmuller@ethz.ch',
        emailsConfirmed: ['lmuller@ethz.ch'],
        history: [{ position: 'PhD Student', institution: { name: 'ETH Zurich', domain: 'ethz.ch' }, start: 2022, end: null }],
        expertise: [{ keywords: ['protein structure', 'geometric deep learning'], start: 2020, end: null }],
      },
    },
    '~Raj_Krishnan1': {
      id: '~Raj_Krishnan1',
      active: true,
      content: {
        names: [{ fullname: 'Raj Krishnan', first: 'Raj', middle: '', last: 'Krishnan', preferred: true, username: '~Raj_Krishnan1' }],
        emails: ['rkrishnan@stanford.edu'],
        preferredEmail: 'rkrishnan@stanford.edu',
        emailsConfirmed: ['rkrishnan@stanford.edu'],
        history: [{ position: 'Postdoc', institution: { name: 'Stanford University', domain: 'stanford.edu' }, start: 2023, end: null }],
        expertise: [{ keywords: ['flow matching', 'protein modeling'], start: 2020, end: null }],
      },
    },
    '~Sophie_Bernard1': {
      id: '~Sophie_Bernard1',
      active: true,
      content: {
        names: [{ fullname: 'Sophie Bernard', first: 'Sophie', middle: '', last: 'Bernard', preferred: true, username: '~Sophie_Bernard1' }],
        emails: ['sbernard@inria.fr'],
        preferredEmail: 'sbernard@inria.fr',
        emailsConfirmed: ['sbernard@inria.fr'],
        history: [{ position: 'Researcher', institution: { name: 'INRIA', domain: 'inria.fr' }, start: 2019, end: null }],
        expertise: [{ keywords: ['generative models', 'SE(3) equivariance'], start: 2017, end: null }],
      },
    },
    '~Yuki_Sato1': {
      id: '~Yuki_Sato1',
      active: true,
      content: {
        names: [{ fullname: 'Yuki Sato', first: 'Yuki', middle: '', last: 'Sato', preferred: true, username: '~Yuki_Sato1' }],
        emails: ['ysato@anthropic.com'],
        preferredEmail: 'ysato@anthropic.com',
        emailsConfirmed: ['ysato@anthropic.com'],
        history: [{ position: 'Research Scientist', institution: { name: 'Anthropic', domain: 'anthropic.com' }, start: 2022, end: null }],
        expertise: [{ keywords: ['RLHF', 'reward models', 'alignment'], start: 2020, end: null }],
      },
    },
    '~Carlos_Rivera1': {
      id: '~Carlos_Rivera1',
      active: true,
      content: {
        names: [{ fullname: 'Carlos Rivera', first: 'Carlos', middle: '', last: 'Rivera', preferred: true, username: '~Carlos_Rivera1' }],
        emails: ['crivera@uw.edu'],
        preferredEmail: 'crivera@uw.edu',
        emailsConfirmed: ['crivera@uw.edu'],
        history: [{ position: 'Assistant Professor', institution: { name: 'University of Washington', domain: 'uw.edu' }, start: 2021, end: null }],
        expertise: [{ keywords: ['attention mechanisms', 'efficient transformers'], start: 2018, end: null }],
      },
    },
    '~Nadia_Aliev1': {
      id: '~Nadia_Aliev1',
      active: true,
      content: {
        names: [{ fullname: 'Nadia Aliev', first: 'Nadia', middle: '', last: 'Aliev', preferred: true, username: '~Nadia_Aliev1' }],
        emails: ['naliev@tsinghua.edu.cn'],
        preferredEmail: 'naliev@tsinghua.edu.cn',
        emailsConfirmed: ['naliev@tsinghua.edu.cn'],
        history: [{ position: 'Associate Professor', institution: { name: 'Tsinghua University', domain: 'tsinghua.edu.cn' }, start: 2018, end: null }],
        expertise: [{ keywords: ['sparse attention', 'long context', 'transformers'], start: 2016, end: null }],
      },
    },
  }

  // Groups
  const groups = {
    host: { id: 'host', members: [venueId], readers: ['everyone'], writers: [], signatories: [], domain: null, cdate: 1700000000000, ddate: null },
    active_venues: { id: 'active_venues', members: [venueId], readers: ['everyone'], writers: [], signatories: [], domain: null, cdate: 1700000000000, ddate: null },
    [venueId]: {
      id: venueId,
      members: [],
      readers: ['everyone'],
      writers: [venueId],
      signatories: [venueId],
      web: '',
      domain: venueId,
      cdate: 1700000000000,
      ddate: null,
    },
    [`${venueId}/Program_Chairs`]: {
      id: `${venueId}/Program_Chairs`,
      members: ['~Robert_Zhang1'],
      readers: ['everyone'],
      writers: [venueId],
      signatories: [`${venueId}/Program_Chairs`],
      domain: venueId,
      cdate: 1700000000000,
      ddate: null,
    },
    [`${venueId}/Area_Chairs`]: {
      id: `${venueId}/Area_Chairs`,
      members: ['~Sarah_Chen1', '~Michael_Torres1'],
      readers: ['everyone'],
      writers: [venueId],
      signatories: [`${venueId}/Area_Chairs`],
      domain: venueId,
      cdate: 1700000000000,
      ddate: null,
    },
    [`${venueId}/Reviewers`]: {
      id: `${venueId}/Reviewers`,
      members: ['~Priya_Sharma1', '~James_Liu1', '~Elena_Popov1'],
      readers: ['everyone'],
      writers: [venueId],
      signatories: [`${venueId}/Reviewers`],
      domain: venueId,
      cdate: 1700000000000,
      ddate: null,
    },
    // Paper-specific reviewer groups
    [`${venueId}/Submission1/Reviewers`]: { id: `${venueId}/Submission1/Reviewers`, members: ['~Priya_Sharma1', '~James_Liu1', '~Elena_Popov1'], readers: [venueId, `${venueId}/Submission1/Area_Chairs`], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission2/Reviewers`]: { id: `${venueId}/Submission2/Reviewers`, members: ['~Priya_Sharma1', '~Elena_Popov1'], readers: [venueId, `${venueId}/Submission2/Area_Chairs`], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission3/Reviewers`]: { id: `${venueId}/Submission3/Reviewers`, members: ['~James_Liu1', '~Elena_Popov1'], readers: [venueId, `${venueId}/Submission3/Area_Chairs`], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission4/Reviewers`]: { id: `${venueId}/Submission4/Reviewers`, members: ['~Priya_Sharma1'], readers: [venueId, `${venueId}/Submission4/Area_Chairs`], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission5/Reviewers`]: { id: `${venueId}/Submission5/Reviewers`, members: ['~James_Liu1', '~Elena_Popov1'], readers: [venueId, `${venueId}/Submission5/Area_Chairs`], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    // Paper-specific AC groups
    [`${venueId}/Submission1/Area_Chairs`]: { id: `${venueId}/Submission1/Area_Chairs`, members: ['~Sarah_Chen1'], readers: [venueId], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission2/Area_Chairs`]: { id: `${venueId}/Submission2/Area_Chairs`, members: ['~Sarah_Chen1'], readers: [venueId], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission3/Area_Chairs`]: { id: `${venueId}/Submission3/Area_Chairs`, members: ['~Michael_Torres1'], readers: [venueId], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission4/Area_Chairs`]: { id: `${venueId}/Submission4/Area_Chairs`, members: ['~Michael_Torres1'], readers: [venueId], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission5/Area_Chairs`]: { id: `${venueId}/Submission5/Area_Chairs`, members: ['~Sarah_Chen1'], readers: [venueId], writers: [venueId], signatories: [], domain: venueId, cdate: 1700000000000, ddate: null },
    // Anonymous reviewer groups
    [`${venueId}/Submission1/Reviewer_hX7q`]: { id: `${venueId}/Submission1/Reviewer_hX7q`, members: ['~Priya_Sharma1'], readers: [venueId, `${venueId}/Submission1/Area_Chairs`], writers: [venueId], signatories: [`${venueId}/Submission1/Reviewer_hX7q`], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission1/Reviewer_kM3p`]: { id: `${venueId}/Submission1/Reviewer_kM3p`, members: ['~James_Liu1'], readers: [venueId, `${venueId}/Submission1/Area_Chairs`], writers: [venueId], signatories: [`${venueId}/Submission1/Reviewer_kM3p`], domain: venueId, cdate: 1700000000000, ddate: null },
    [`${venueId}/Submission1/Reviewer_nR2t`]: { id: `${venueId}/Submission1/Reviewer_nR2t`, members: ['~Elena_Popov1'], readers: [venueId, `${venueId}/Submission1/Area_Chairs`], writers: [venueId], signatories: [`${venueId}/Submission1/Reviewer_nR2t`], domain: venueId, cdate: 1700000000000, ddate: null },
  }

  const now = Date.now()
  const day = 86400000

  // Notes (submissions) in v2 format
  const notes = {
    'noteId1': {
      id: 'noteId1',
      forum: 'noteId1',
      invitations: [`${venueId}/-/Submission`],
      domain: venueId,
      number: 1,
      cdate: now - 60 * day,
      tcdate: now - 60 * day,
      mdate: now - 55 * day,
      tmdate: now - 55 * day,
      ddate: null,
      pdate: now - 58 * day,
      odate: null,
      replyto: null,
      signatures: ['~David_Kim1'],
      readers: ['everyone'],
      writers: [venueId, '~David_Kim1'],
      nonreaders: [],
      license: 'CC BY 4.0',
      content: {
        title: { value: 'Scaling Laws for Sparse Mixture-of-Experts Language Models' },
        authors: { value: ['David Kim', 'Wei Zhang', 'Tomas Nguyen'] },
        authorids: { value: ['~David_Kim1', '~Wei_Zhang1', '~Tomas_Nguyen1'] },
        abstract: { value: 'We investigate the scaling properties of Sparse Mixture-of-Experts (SMoE) language models across a wide range of model sizes, expert counts, and training compute budgets. Our study reveals novel scaling laws that characterize how SMoE models improve with scale, demonstrating that expert specialization emerges predictably as a function of total parameters and active parameters per token. We train over 200 SMoE variants ranging from 100M to 50B total parameters and find that SMoE models achieve comparable performance to dense models at roughly 3-4x less compute, with diminishing returns beyond 128 experts. We provide practical guidelines for optimal expert count selection given a compute budget and derive theoretical bounds on the routing efficiency of top-k gating mechanisms.' },
        keywords: { value: ['mixture of experts', 'scaling laws', 'language models', 'sparse models', 'efficiency'] },
        TLDR: { value: 'We derive scaling laws for Sparse Mixture-of-Experts models showing they match dense model performance at 3-4x less compute.' },
        pdf: { value: '/pdf/noteId1' },
        venue: { value: shortPhrase },
        venueid: { value: `${venueId}/Submission` },
        _bibtex: { value: '@inproceedings{kim2025scaling,\n  title={Scaling Laws for Sparse Mixture-of-Experts Language Models},\n  author={Kim, David and Zhang, Wei and Nguyen, Tomas},\n  booktitle={NeurIPS},\n  year={2025}\n}' },
      },
      details: {
        writable: false,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'authors', fieldName: 'authors' },
          { name: 'authorids', fieldName: 'authorids' },
          { name: 'abstract', fieldName: 'abstract' },
          { name: 'keywords', fieldName: 'keywords' },
          { name: 'TLDR', fieldName: 'TLDR' },
          { name: 'pdf', fieldName: 'pdf' },
        ],
        replyCount: 3,
      },
    },
    'noteId2': {
      id: 'noteId2',
      forum: 'noteId2',
      invitations: [`${venueId}/-/Submission`],
      domain: venueId,
      number: 2,
      cdate: now - 59 * day,
      tcdate: now - 59 * day,
      mdate: now - 54 * day,
      tmdate: now - 54 * day,
      ddate: null,
      pdate: now - 57 * day,
      odate: null,
      replyto: null,
      signatures: ['~Aisha_Patel1'],
      readers: ['everyone'],
      writers: [venueId, '~Aisha_Patel1'],
      nonreaders: [],
      license: 'CC BY 4.0',
      content: {
        title: { value: 'Self-Supervised Visual Representation Learning via Multi-Scale Masked Autoencoders' },
        authors: { value: ['Aisha Patel', 'Jun Tanaka'] },
        authorids: { value: ['~Aisha_Patel1', '~Jun_Tanaka1'] },
        abstract: { value: 'We present Multi-Scale Masked Autoencoders (MS-MAE), a self-supervised pre-training framework that extends masked image modeling to operate simultaneously across multiple spatial scales. Unlike standard MAE which masks and reconstructs patches at a single resolution, MS-MAE employs a hierarchical masking strategy where the model must predict masked regions at fine, medium, and coarse granularities. This multi-scale objective encourages the learned representations to capture both local texture details and global semantic structure. We demonstrate that MS-MAE significantly outperforms single-scale MAE on ImageNet-1K linear probing (+2.3%) and fine-tuning (+1.1%), with particularly strong gains on dense prediction tasks including object detection (+1.8 AP on COCO) and semantic segmentation (+2.5 mIoU on ADE20K).' },
        keywords: { value: ['self-supervised learning', 'masked autoencoders', 'visual representation learning', 'multi-scale', 'computer vision'] },
        TLDR: { value: 'Multi-scale masked autoencoders that reconstruct at multiple spatial granularities learn better visual representations.' },
        pdf: { value: '/pdf/noteId2' },
        venue: { value: shortPhrase },
        venueid: { value: `${venueId}/Submission` },
        _bibtex: { value: '@inproceedings{patel2025msmae,\n  title={Self-Supervised Visual Representation Learning via Multi-Scale Masked Autoencoders},\n  author={Patel, Aisha and Tanaka, Jun},\n  booktitle={NeurIPS},\n  year={2025}\n}' },
      },
      details: { writable: false, presentation: [], replyCount: 0 },
    },
    'noteId3': {
      id: 'noteId3',
      forum: 'noteId3',
      invitations: [`${venueId}/-/Submission`],
      domain: venueId,
      number: 3,
      cdate: now - 58 * day,
      tcdate: now - 58 * day,
      mdate: now - 53 * day,
      tmdate: now - 53 * day,
      ddate: null,
      pdate: now - 56 * day,
      odate: null,
      replyto: null,
      signatures: ['~Lena_Muller1'],
      readers: ['everyone'],
      writers: [venueId, '~Lena_Muller1'],
      nonreaders: [],
      license: 'CC BY 4.0',
      content: {
        title: { value: 'Geometric Flow Matching for Protein Structure Prediction' },
        authors: { value: ['Lena Muller', 'Raj Krishnan', 'Sophie Bernard'] },
        authorids: { value: ['~Lena_Muller1', '~Raj_Krishnan1', '~Sophie_Bernard1'] },
        abstract: { value: 'We introduce Geometric Flow Matching (GFM), a novel generative framework for protein structure prediction that models the transformation from random 3D coordinates to native protein conformations using continuous normalizing flows on SE(3). Unlike diffusion-based approaches that require many denoising steps, GFM learns a direct flow field on the Riemannian manifold of rigid body transformations, enabling single-step structure generation at inference time. Our method achieves competitive accuracy with AlphaFold2 on CASP15 targets (GDT-TS: 78.3 vs 82.1) while being 50x faster at inference. Additionally, GFM naturally captures conformational flexibility by sampling multiple structures, providing uncertainty estimates that correlate well with prediction error.' },
        keywords: { value: ['protein structure prediction', 'flow matching', 'geometric deep learning', 'SE(3) equivariance', 'generative models'] },
        TLDR: { value: 'Flow matching on SE(3) manifolds enables fast single-step protein structure prediction competitive with AlphaFold2.' },
        pdf: { value: '/pdf/noteId3' },
        venue: { value: shortPhrase },
        venueid: { value: `${venueId}/Submission` },
        _bibtex: { value: '@inproceedings{muller2025gfm,\n  title={Geometric Flow Matching for Protein Structure Prediction},\n  author={Muller, Lena and Krishnan, Raj and Bernard, Sophie},\n  booktitle={NeurIPS},\n  year={2025}\n}' },
      },
      details: { writable: false, presentation: [], replyCount: 0 },
    },
    'noteId4': {
      id: 'noteId4',
      forum: 'noteId4',
      invitations: [`${venueId}/-/Submission`],
      domain: venueId,
      number: 4,
      cdate: now - 57 * day,
      tcdate: now - 57 * day,
      mdate: now - 52 * day,
      tmdate: now - 52 * day,
      ddate: null,
      pdate: now - 55 * day,
      odate: null,
      replyto: null,
      signatures: ['~David_Kim1'],
      readers: ['everyone'],
      writers: [venueId, '~David_Kim1'],
      nonreaders: [],
      license: 'CC BY 4.0',
      content: {
        title: { value: 'Reward Model Ensembles for Robust RLHF Alignment' },
        authors: { value: ['David Kim', 'Yuki Sato'] },
        authorids: { value: ['~David_Kim1', '~Yuki_Sato1'] },
        abstract: { value: 'Reinforcement Learning from Human Feedback (RLHF) is sensitive to reward model inaccuracies and reward hacking. We propose Reward Ensemble RLHF (RE-RLHF), a framework that trains diverse reward model ensembles and uses their disagreement to detect and mitigate reward hacking during policy optimization. Our approach trains K reward models with different architectures and data subsets, then uses the minimum reward across the ensemble as a conservative training signal. We further introduce an uncertainty-aware PPO variant that reduces gradient updates when ensemble disagreement is high. Experiments on Anthropic-HH and OpenAssistant datasets show that RE-RLHF reduces reward hacking by 67% while maintaining 95% of the alignment improvement, and produces more robust policies under distribution shift.' },
        keywords: { value: ['RLHF', 'reward models', 'alignment', 'reward hacking', 'ensemble methods'] },
        TLDR: { value: 'Ensembles of diverse reward models with conservative aggregation reduce reward hacking in RLHF by 67%.' },
        pdf: { value: '/pdf/noteId4' },
        venue: { value: shortPhrase },
        venueid: { value: `${venueId}/Submission` },
        _bibtex: { value: '@inproceedings{kim2025reward,\n  title={Reward Model Ensembles for Robust RLHF Alignment},\n  author={Kim, David and Sato, Yuki},\n  booktitle={NeurIPS},\n  year={2025}\n}' },
      },
      details: { writable: false, presentation: [], replyCount: 0 },
    },
    'noteId5': {
      id: 'noteId5',
      forum: 'noteId5',
      invitations: [`${venueId}/-/Submission`],
      domain: venueId,
      number: 5,
      cdate: now - 56 * day,
      tcdate: now - 56 * day,
      mdate: now - 51 * day,
      tmdate: now - 51 * day,
      ddate: null,
      pdate: now - 54 * day,
      odate: null,
      replyto: null,
      signatures: ['~Carlos_Rivera1'],
      readers: ['everyone'],
      writers: [venueId, '~Carlos_Rivera1'],
      nonreaders: [],
      license: 'CC BY 4.0',
      content: {
        title: { value: 'Efficient Attention via Learned Sparse Patterns for Long-Context Transformers' },
        authors: { value: ['Carlos Rivera', 'Nadia Aliev', 'Aisha Patel'] },
        authorids: { value: ['~Carlos_Rivera1', '~Nadia_Aliev1', '~Aisha_Patel1'] },
        abstract: { value: 'We propose Learned Sparse Attention (LSA), a method that dynamically predicts attention sparsity patterns conditioned on the input, enabling efficient processing of long sequences without fixed sparse patterns or approximations. LSA uses a lightweight predictor network to generate a binary mask over the attention matrix, selecting only the most relevant key-value pairs for each query. The predictor is trained jointly with the transformer using a straight-through estimator and a sparsity regularization term. On the SCROLLS and LongBench benchmarks, LSA matches full attention quality while reducing attention computation by 85% for 32K context lengths. Unlike FlashAttention which optimizes the hardware implementation, LSA reduces the algorithmic complexity, and the two approaches can be combined for further speedups.' },
        keywords: { value: ['attention mechanism', 'long context', 'sparse attention', 'efficiency', 'transformers'] },
        TLDR: { value: 'Learned dynamic sparse attention patterns reduce computation by 85% while matching full attention quality on long-context benchmarks.' },
        pdf: { value: '/pdf/noteId5' },
        venue: { value: shortPhrase },
        venueid: { value: `${venueId}/Submission` },
        _bibtex: { value: '@inproceedings{rivera2025lsa,\n  title={Efficient Attention via Learned Sparse Patterns for Long-Context Transformers},\n  author={Rivera, Carlos and Aliev, Nadia and Patel, Aisha},\n  booktitle={NeurIPS},\n  year={2025}\n}' },
      },
      details: { writable: false, presentation: [], replyCount: 0 },
    },
  }

  // Reviews (also notes in v2 format)
  const reviews = {
    'reviewId1': {
      id: 'reviewId1',
      forum: 'noteId1',
      invitations: [`${venueId}/Submission1/-/Official_Review`],
      domain: venueId,
      number: 1,
      cdate: now - 45 * day,
      tcdate: now - 45 * day,
      mdate: now - 45 * day,
      tmdate: now - 45 * day,
      ddate: null,
      pdate: null,
      odate: null,
      replyto: 'noteId1',
      signatures: [`${venueId}/Submission1/Reviewer_hX7q`],
      readers: [`${venueId}/Program_Chairs`, `${venueId}/Submission1/Area_Chairs`, `${venueId}/Submission1/Reviewers`],
      writers: [venueId, `${venueId}/Submission1/Reviewer_hX7q`],
      nonreaders: [],
      license: null,
      content: {
        title: { value: 'Thorough empirical study with useful practical guidelines' },
        review: { value: 'This paper presents a comprehensive empirical study on scaling laws for Sparse Mixture-of-Experts language models. The experimental setup is thorough, covering a wide range of model sizes and expert configurations. The derived scaling laws are well-motivated and the practical guidelines for choosing expert counts are immediately useful for practitioners.\n\nThe paper is well-written and the analysis is rigorous. The theoretical bounds on routing efficiency, while not the main contribution, add useful formal grounding to the empirical observations.' },
        rating: { value: '7: Accept' },
        confidence: { value: '4: High' },
        soundness: { value: '3 good' },
        presentation: { value: '4 excellent' },
        contribution: { value: '3 good' },
        strengths: { value: '1. Exceptionally comprehensive experimental sweep across model sizes and expert counts\n2. Practical guidelines that can directly inform architecture decisions\n3. Clear writing and well-organized presentation\n4. Theoretical analysis of routing efficiency complements empirical findings\n5. Open-source training code and model checkpoints' },
        weaknesses: { value: '1. Limited analysis of expert specialization patterns -- what are the experts learning?\n2. All experiments use a single tokenizer and data mixture; generalization unclear\n3. The theoretical bounds in Section 5 are somewhat loose and could be tightened\n4. Missing comparison with recent parameter-efficient methods like LoRA adapters' },
        questions: { value: 'How sensitive are the scaling laws to the choice of training data distribution? Have you observed different patterns with code-heavy vs text-heavy data?' },
        limitations: { value: 'The authors acknowledge the computational cost of the study but do not discuss environmental impact. The scaling laws are derived for autoregressive LMs only.' },
      },
      details: {
        writable: false,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'review', fieldName: 'review', markdown: true },
          { name: 'rating', fieldName: 'rating' },
          { name: 'confidence', fieldName: 'confidence' },
          { name: 'soundness', fieldName: 'soundness' },
          { name: 'presentation', fieldName: 'presentation' },
          { name: 'contribution', fieldName: 'contribution' },
          { name: 'strengths', fieldName: 'strengths', markdown: true },
          { name: 'weaknesses', fieldName: 'weaknesses', markdown: true },
          { name: 'questions', fieldName: 'questions', markdown: true },
          { name: 'limitations', fieldName: 'limitations', markdown: true },
        ],
        signatures: [{ id: `${venueId}/Submission1/Reviewer_hX7q`, members: ['~Priya_Sharma1'], readers: [`${venueId}/Submission1/Area_Chairs`] }],
      },
    },
    'reviewId2': {
      id: 'reviewId2',
      forum: 'noteId1',
      invitations: [`${venueId}/Submission1/-/Official_Review`],
      domain: venueId,
      number: 2,
      cdate: now - 44 * day,
      tcdate: now - 44 * day,
      mdate: now - 44 * day,
      tmdate: now - 44 * day,
      ddate: null,
      pdate: null,
      odate: null,
      replyto: 'noteId1',
      signatures: [`${venueId}/Submission1/Reviewer_kM3p`],
      readers: [`${venueId}/Program_Chairs`, `${venueId}/Submission1/Area_Chairs`, `${venueId}/Submission1/Reviewers`],
      writers: [venueId, `${venueId}/Submission1/Reviewer_kM3p`],
      nonreaders: [],
      license: null,
      content: {
        title: { value: 'Useful empirical results but limited novelty' },
        review: { value: 'The paper conducts a large-scale empirical study of scaling properties for MoE models. While the results are useful, the technical novelty is limited. The observation that MoE models are more compute-efficient than dense counterparts is well-established, and this paper primarily quantifies this relationship more precisely.\n\nThe theoretical section (Section 5) feels disconnected from the empirical work and the bounds are too loose to provide meaningful guidance.' },
        rating: { value: '5: Borderline' },
        confidence: { value: '3: Medium' },
        soundness: { value: '3 good' },
        presentation: { value: '3 good' },
        contribution: { value: '2 fair' },
        strengths: { value: '1. Large-scale empirical study with significant compute investment\n2. Practical guidelines in Table 3 are useful\n3. Good experimental methodology with proper baselines' },
        weaknesses: { value: '1. Limited technical novelty -- primarily an empirical characterization\n2. Theoretical bounds are loose and disconnect from experiments\n3. No analysis of downstream task performance, only perplexity\n4. Missing comparison with Switch Transformer and GShard variants\n5. The scaling laws may not generalize beyond the specific architecture choices made' },
        questions: { value: 'Can you provide downstream evaluation on standard benchmarks? How do the scaling laws change with different routing mechanisms (e.g., hash routing)?' },
        limitations: { value: 'The study only covers autoregressive language models. Extension to encoder-decoder or vision models is unclear.' },
      },
      details: {
        writable: false,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'review', fieldName: 'review', markdown: true },
          { name: 'rating', fieldName: 'rating' },
          { name: 'confidence', fieldName: 'confidence' },
          { name: 'soundness', fieldName: 'soundness' },
          { name: 'presentation', fieldName: 'presentation' },
          { name: 'contribution', fieldName: 'contribution' },
          { name: 'strengths', fieldName: 'strengths', markdown: true },
          { name: 'weaknesses', fieldName: 'weaknesses', markdown: true },
          { name: 'questions', fieldName: 'questions', markdown: true },
          { name: 'limitations', fieldName: 'limitations', markdown: true },
        ],
        signatures: [{ id: `${venueId}/Submission1/Reviewer_kM3p`, members: ['~James_Liu1'], readers: [`${venueId}/Submission1/Area_Chairs`] }],
      },
    },
    'commentId1': {
      id: 'commentId1',
      forum: 'noteId1',
      invitations: [`${venueId}/Submission1/-/Official_Comment`],
      domain: venueId,
      number: 3,
      cdate: now - 43 * day,
      tcdate: now - 43 * day,
      mdate: now - 43 * day,
      tmdate: now - 43 * day,
      ddate: null,
      pdate: null,
      odate: null,
      replyto: 'noteId1',
      signatures: [`${venueId}/Submission1/Area_Chairs`],
      readers: ['everyone'],
      writers: [venueId, `${venueId}/Submission1/Area_Chairs`],
      nonreaders: [],
      license: null,
      content: {
        title: { value: 'Reminder for Reviewer 3' },
        comment: { value: 'I would like to remind Reviewer 3 that reviews are due by September 20th. Please submit your review at your earliest convenience.' },
      },
      details: {
        writable: false,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'comment', fieldName: 'comment', markdown: true },
        ],
        signatures: [{ id: `${venueId}/Submission1/Area_Chairs`, members: ['~Sarah_Chen1'], readers: [venueId] }],
      },
    },
  }

  // Edges
  const edges = [
    // Assignment edges (reviewer -> paper)
    { id: 'edge_asgn_1', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId1', tail: '~Priya_Sharma1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_2', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId1', tail: '~James_Liu1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_3', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId1', tail: '~Elena_Popov1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_4', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId2', tail: '~Priya_Sharma1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_5', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId2', tail: '~Elena_Popov1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_6', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId3', tail: '~James_Liu1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_7', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId3', tail: '~Elena_Popov1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_8', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId4', tail: '~Priya_Sharma1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_9', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId5', tail: '~James_Liu1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_asgn_10', invitation: `${venueId}/Reviewers/-/Assignment`, head: 'noteId5', tail: '~Elena_Popov1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    // AC assignment edges
    { id: 'edge_ac_1', invitation: `${venueId}/Area_Chairs/-/Assignment`, head: 'noteId1', tail: '~Sarah_Chen1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_ac_2', invitation: `${venueId}/Area_Chairs/-/Assignment`, head: 'noteId2', tail: '~Sarah_Chen1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_ac_3', invitation: `${venueId}/Area_Chairs/-/Assignment`, head: 'noteId3', tail: '~Michael_Torres1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_ac_4', invitation: `${venueId}/Area_Chairs/-/Assignment`, head: 'noteId4', tail: '~Michael_Torres1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    { id: 'edge_ac_5', invitation: `${venueId}/Area_Chairs/-/Assignment`, head: 'noteId5', tail: '~Sarah_Chen1', label: null, weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 50 * day, tcdate: now - 50 * day, mdate: now - 50 * day, tmdate: now - 50 * day, ddate: null },
    // Affinity score edges
    { id: 'edge_aff_1', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId1', tail: '~Priya_Sharma1', weight: 0.82, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_2', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId1', tail: '~James_Liu1', weight: 0.71, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_3', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId1', tail: '~Elena_Popov1', weight: 0.65, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_4', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId2', tail: '~Priya_Sharma1', weight: 0.88, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_5', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId2', tail: '~James_Liu1', weight: 0.45, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_6', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId2', tail: '~Elena_Popov1', weight: 0.55, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_7', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId3', tail: '~Priya_Sharma1', weight: 0.40, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_8', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId3', tail: '~James_Liu1', weight: 0.60, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_9', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId3', tail: '~Elena_Popov1', weight: 0.91, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_10', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId4', tail: '~Priya_Sharma1', weight: 0.74, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_11', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId4', tail: '~James_Liu1', weight: 0.50, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_12', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId4', tail: '~Elena_Popov1', weight: 0.62, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_13', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId5', tail: '~Priya_Sharma1', weight: 0.58, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_14', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId5', tail: '~James_Liu1', weight: 0.77, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_aff_15', invitation: `${venueId}/Reviewers/-/Affinity_Score`, head: 'noteId5', tail: '~Elena_Popov1', weight: 0.63, label: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    // Bid edges
    { id: 'edge_bid_1', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId1', tail: '~Priya_Sharma1', label: 'High', weight: null, readers: [venueId], writers: ['~Priya_Sharma1'], nonreaders: [], signatures: ['~Priya_Sharma1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_2', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId1', tail: '~James_Liu1', label: 'Neutral', weight: null, readers: [venueId], writers: ['~James_Liu1'], nonreaders: [], signatures: ['~James_Liu1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_3', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId1', tail: '~Elena_Popov1', label: 'High', weight: null, readers: [venueId], writers: ['~Elena_Popov1'], nonreaders: [], signatures: ['~Elena_Popov1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_4', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId2', tail: '~Priya_Sharma1', label: 'Very High', weight: null, readers: [venueId], writers: ['~Priya_Sharma1'], nonreaders: [], signatures: ['~Priya_Sharma1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_5', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId2', tail: '~Elena_Popov1', label: 'Neutral', weight: null, readers: [venueId], writers: ['~Elena_Popov1'], nonreaders: [], signatures: ['~Elena_Popov1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_6', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId3', tail: '~James_Liu1', label: 'Neutral', weight: null, readers: [venueId], writers: ['~James_Liu1'], nonreaders: [], signatures: ['~James_Liu1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_7', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId3', tail: '~Elena_Popov1', label: 'Very High', weight: null, readers: [venueId], writers: ['~Elena_Popov1'], nonreaders: [], signatures: ['~Elena_Popov1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_8', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId4', tail: '~Priya_Sharma1', label: 'High', weight: null, readers: [venueId], writers: ['~Priya_Sharma1'], nonreaders: [], signatures: ['~Priya_Sharma1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_9', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId5', tail: '~James_Liu1', label: 'High', weight: null, readers: [venueId], writers: ['~James_Liu1'], nonreaders: [], signatures: ['~James_Liu1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    { id: 'edge_bid_10', invitation: `${venueId}/Reviewers/-/Bid`, head: 'noteId5', tail: '~Elena_Popov1', label: 'Neutral', weight: null, readers: [venueId], writers: ['~Elena_Popov1'], nonreaders: [], signatures: ['~Elena_Popov1'], cdate: now - 52 * day, tcdate: now - 52 * day, mdate: now - 52 * day, tmdate: now - 52 * day, ddate: null },
    // Conflict edges
    { id: 'edge_conf_1', invitation: `${venueId}/Reviewers/-/Conflict`, head: 'noteId1', tail: '~Priya_Sharma1', label: 'co-author in last 3 years', weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
    { id: 'edge_conf_2', invitation: `${venueId}/Reviewers/-/Conflict`, head: 'noteId4', tail: '~James_Liu1', label: 'same institution', weight: null, readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId], cdate: now - 55 * day, tcdate: now - 55 * day, mdate: now - 55 * day, tmdate: now - 55 * day, ddate: null },
  ]

  // Invitations
  const invitations = {
    [`${venueId}/-/Submission`]: {
      id: `${venueId}/-/Submission`,
      domain: venueId,
      cdate: now - 90 * day,
      duedate: now - 60 * day,
      expdate: now - 59 * day,
      edit: {
        note: {
          id: { param: { withInvitation: `${venueId}/-/Submission` } },
          content: {
            title: { value: { param: { type: 'string', regex: '.{1,250}' } } },
            authors: { value: { param: { type: 'string[]' } } },
            abstract: { value: { param: { type: 'string', maxLength: 5000 } } },
            pdf: { value: { param: { type: 'file', extensions: ['pdf'] } } },
          },
        },
      },
    },
    [`${venueId}/Submission1/-/Official_Review`]: {
      id: `${venueId}/Submission1/-/Official_Review`,
      domain: venueId,
      cdate: now - 50 * day,
      duedate: now + 10 * day,
      expdate: now + 15 * day,
      edit: {
        note: {
          replyto: { param: { withForum: 'noteId1' } },
          content: {
            review: { value: { param: { type: 'string', minLength: 1 } } },
            rating: { value: { param: { type: 'string', enum: ['1: Strong Reject', '3: Reject', '5: Borderline', '7: Accept', '8: Strong Accept', '10: Award'] } } },
            confidence: { value: { param: { type: 'string', enum: ['1: Low', '2: Medium', '3: High', '4: Very High'] } } },
          },
        },
      },
      details: { repliesAvailable: true, writable: true },
      replyForumViews: [
        { id: 'all', label: 'All', filter: '', sort: 'date-desc', expandedInvitations: [], layout: 'default' },
      ],
    },
    [`${venueId}/Submission1/-/Official_Comment`]: {
      id: `${venueId}/Submission1/-/Official_Comment`,
      domain: venueId,
      cdate: now - 50 * day,
      duedate: now + 30 * day,
      expdate: now + 35 * day,
      edit: {
        note: {
          replyto: { param: { withForum: 'noteId1' } },
          content: {
            title: { value: { param: { type: 'string' } } },
            comment: { value: { param: { type: 'string', minLength: 1 } } },
          },
        },
      },
      details: { repliesAvailable: true, writable: true },
    },
    [`${venueId}/Reviewers/-/Assignment`]: {
      id: `${venueId}/Reviewers/-/Assignment`,
      domain: venueId,
      cdate: now - 55 * day,
      edge: {
        head: { type: 'note', query: { invitation: `${venueId}/-/Submission` } },
        tail: { type: 'profile', query: { group: `${venueId}/Reviewers` } },
        readers: [venueId],
        writers: [venueId],
        signatures: [venueId],
      },
      details: { writable: true },
    },
    [`${venueId}/Reviewers/-/Affinity_Score`]: {
      id: `${venueId}/Reviewers/-/Affinity_Score`,
      domain: venueId,
      cdate: now - 55 * day,
      edge: {
        head: { type: 'note', query: { invitation: `${venueId}/-/Submission` } },
        tail: { type: 'profile', query: { group: `${venueId}/Reviewers` } },
        weight: { param: { type: 'float' } },
        readers: [venueId],
        writers: [venueId],
        signatures: [venueId],
      },
      details: { writable: false },
    },
    [`${venueId}/Reviewers/-/Bid`]: {
      id: `${venueId}/Reviewers/-/Bid`,
      domain: venueId,
      cdate: now - 55 * day,
      edge: {
        head: { type: 'note', query: { invitation: `${venueId}/-/Submission` } },
        tail: { type: 'profile', query: { group: `${venueId}/Reviewers` } },
        label: { param: { enum: ['Very High', 'High', 'Neutral', 'Low', 'Very Low'] } },
        readers: [venueId],
        writers: [venueId],
        signatures: [venueId],
      },
      details: { writable: false },
    },
    [`${venueId}/Reviewers/-/Conflict`]: {
      id: `${venueId}/Reviewers/-/Conflict`,
      domain: venueId,
      cdate: now - 55 * day,
      edge: {
        head: { type: 'note', query: { invitation: `${venueId}/-/Submission` } },
        tail: { type: 'profile', query: { group: `${venueId}/Reviewers` } },
        label: { param: { type: 'string' } },
        readers: [venueId],
        writers: [venueId],
        signatures: [venueId],
      },
      details: { writable: false },
    },
  }

  // Venue config
  const venue = {
    id: venueId,
    shortPhrase: shortPhrase,
    fullName: 'The Thirty-Ninth Annual Conference on Neural Information Processing Systems',
    website: 'https://neurips.cc/Conferences/2025',
    submissionName: 'Submission',
    officialReviewName: 'Official_Review',
    officialMetaReviewName: 'Meta_Review',
    reviewerName: 'Reviewers',
    areaChairName: 'Area_Chairs',
    reviewRatingName: 'rating',
    metaReviewRecommendationName: 'recommendation',
    deadline: '2025-08-01T23:59:00Z',
    dates: {
      submission: '2025-08-01',
      review: '2025-09-01',
      decision: '2025-10-15',
    },
  }

  // Current user profile ID
  const user = {
    id: '~Sarah_Chen1',
    role: 'area_chair',
  }

  return {
    user,
    venue,
    profiles,
    groups,
    notes,
    reviews,
    edges,
    invitations,
    edgeBrowserConfig: {
      maxPapersPerReviewer: 5,
      minReviewersPerPaper: 3,
    },
  }
}

// Helper to get profile display info from a profile object
export function getProfileDisplayInfo(profile) {
  if (!profile || !profile.content) return { name: 'Unknown', email: '', title: '', expertise: [] }
  const name = profile.content.names?.[0] || {}
  const hist = profile.content.history?.[0] || {}
  const inst = hist.institution || {}
  return {
    name: name.fullname || profile.id,
    email: profile.content.preferredEmail || profile.content.emails?.[0] || '',
    title: hist.position ? `${hist.position} at ${inst.name || ''}${inst.domain ? ` (${inst.domain})` : ''}` : '',
    expertise: (profile.content.expertise || []).flatMap(e => e.keywords || []),
  }
}

// Helper to get note title from v2 note
export function getNoteTitle(note) {
  return note?.content?.title?.value || 'Untitled'
}

// Helper to get note authors from v2 note
export function getNoteAuthors(note) {
  return note?.content?.authors?.value || []
}

// Helper to get note author IDs from v2 note
export function getNoteAuthorIds(note) {
  return note?.content?.authorids?.value || []
}

// Pretty-print an invitation or group ID
export function prettyId(id) {
  if (!id) return ''
  // Remove common suffixes and convert separators
  return id
    .replace(/\.cc\//, ' ')
    .replace(/\/-\//g, ' ')
    .replace(/\//g, ' ')
    .replace(/_/g, ' ')
    .trim()
}

// Get the last part of an invitation ID (e.g., "Official_Review" from "Venue.cc/2024/Conference/Submission1/-/Official_Review")
export function getInvitationShortName(invitationId) {
  if (!invitationId) return ''
  const parts = invitationId.split('/')
  const last = parts[parts.length - 1]
  return last.replace(/_/g, ' ')
}

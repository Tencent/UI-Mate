import { useState } from 'react';
import { X, Megaphone, MousePointer, MessageSquare, Filter, Smartphone, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './CreateCampaignModal.css';

const OBJECTIVES = [
  { key: 'awareness', label: 'Awareness', icon: Megaphone, color: '#9360F7', description: 'Show your ads to people most likely to remember them.', goodFor: ['Brand awareness', 'Reach', 'Video views'] },
  { key: 'traffic', label: 'Traffic', icon: MousePointer, color: '#0866FF', description: 'Send people to a destination on or off Facebook.', goodFor: ['Link clicks', 'Landing page views', 'Messenger conversations'] },
  { key: 'engagement', label: 'Engagement', icon: MessageSquare, color: '#2ABBA7', description: 'Get more messages, video views, post engagement, Page likes, or event responses.', goodFor: ['Comments', 'Shares', 'Post interactions'] },
  { key: 'leads', label: 'Leads', icon: Filter, color: '#FB724B', description: 'Collect leads for your business or brand.', goodFor: ['Instant forms', 'Messenger leads', 'Phone calls'] },
  { key: 'app_promotion', label: 'App promotion', icon: Smartphone, color: '#45BD62', description: 'Find new people to install your app and continue using it.', goodFor: ['App installs', 'App events'] },
  { key: 'sales', label: 'Sales', icon: ShoppingBag, color: '#0866FF', description: 'Find people likely to purchase your product or service.', goodFor: ['Conversions', 'Catalog sales', 'Messenger sales'] },
];

const BID_STRATEGIES = [
  { key: 'lowest_cost', label: 'Lowest cost' },
  { key: 'cost_cap', label: 'Cost cap' },
  { key: 'bid_cap', label: 'Bid cap' },
  { key: 'target_cost', label: 'Target cost' },
];

const SPECIAL_CATEGORIES = ['Housing', 'Credit', 'Employment', 'Social Issues'];
const CTAS = ['shop_now', 'learn_more', 'sign_up', 'book_now', 'contact_us', 'download', 'get_offer', 'get_quote'];
const CTA_LABELS = { shop_now: 'Shop Now', learn_more: 'Learn More', sign_up: 'Sign Up', book_now: 'Book Now', contact_us: 'Contact Us', download: 'Download', get_offer: 'Get Offer', get_quote: 'Get Quote' };

const MOCK_MEDIA = [
  'https://picsum.photos/seed/media1/300/300',
  'https://picsum.photos/seed/media2/300/300',
  'https://picsum.photos/seed/media3/300/300',
  'https://picsum.photos/seed/media4/300/300',
  'https://picsum.photos/seed/media5/300/300',
  'https://picsum.photos/seed/media6/300/300',
];

export default function CreateCampaignModal({ onClose, onSuccess }) {
  const { createCampaign, createAdSet, createAd, createCreative, state } = useApp();
  const [activeTab, setActiveTab] = useState('new_campaign');
  const [step, setStep] = useState(1);
  const [selectedObj, setSelectedObj] = useState(null);

  // Step 2: campaign settings
  const [campaignName, setCampaignName] = useState('');
  const [specialCats, setSpecialCats] = useState([]);
  const [cboEnabled, setCboEnabled] = useState(false);
  const [budgetType, setBudgetType] = useState('daily');
  const [budgetAmount, setBudgetAmount] = useState(50);
  const [bidStrategy, setBidStrategy] = useState('lowest_cost');

  // "Add to existing campaign" tab state
  const [existingCampId, setExistingCampId] = useState('');
  const [existingAdSetName, setExistingAdSetName] = useState('');

  // Step 3: ad set settings
  const [adSetName, setAdSetName] = useState('');
  const [adBudgetType, setAdBudgetType] = useState('daily');
  const [adBudgetAmount, setAdBudgetAmount] = useState(25);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState('all');
  const [locationInput, setLocationInput] = useState('United States');
  const [placementType, setPlacementType] = useState('advantage_plus');

  // Step 4: ad settings
  const [adName, setAdName] = useState('');
  const [adFormat, setAdFormat] = useState('single_image');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cta, setCta] = useState('shop_now');

  function handleContinue() {
    if (step === 1 && selectedObj) {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setCampaignName(`${selectedObj.charAt(0).toUpperCase() + selectedObj.slice(1)} campaign - ${today}`);
      setStep(2);
    } else if (step === 2) {
      setAdSetName(`${locationInput} ${ageMin}-${ageMax} ${gender}`);
      setStep(3);
    } else if (step === 3) {
      setAdName(`${campaignName} - Ad`);
      setStep(4);
    }
  }

  function handlePublish() {
    const now = new Date().toISOString();
    const campId = `camp_${Date.now()}`;
    const adSetId = `adset_${Date.now()}`;
    const adId = `ad_${Date.now()}`;
    const crId = `cr_${Date.now()}`;

    createCampaign({
      id: campId,
      name: campaignName,
      status: 'active',
      objective: selectedObj,
      buyingType: 'auction',
      budgetOptimization: cboEnabled,
      dailyBudget: cboEnabled && budgetType === 'daily' ? parseFloat(budgetAmount) : null,
      lifetimeBudget: cboEnabled && budgetType === 'lifetime' ? parseFloat(budgetAmount) : null,
      bidStrategy,
      specialAdCategories: specialCats,
      createdAt: now, updatedAt: now,
      startDate: now, endDate: null,
      results: 0, reach: 0, impressions: 0, clicks: 0,
      ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0, frequency: 0, roas: 0,
      deliveryStatus: 'in_review'
    });

    createAdSet({
      id: adSetId, campaignId: campId,
      name: adSetName,
      status: 'active',
      dailyBudget: !cboEnabled && adBudgetType === 'daily' ? parseFloat(adBudgetAmount) : null,
      lifetimeBudget: !cboEnabled && adBudgetType === 'lifetime' ? parseFloat(adBudgetAmount) : null,
      startDate: now, endDate: null,
      optimizationGoal: 'conversions',
      billingEvent: 'impressions', bidAmount: null,
      targeting: {
        locations: [{ type: 'country', name: locationInput, code: 'US' }],
        ageMin: parseInt(ageMin), ageMax: parseInt(ageMax),
        genders: [gender],
        detailedTargeting: { interests: [], behaviors: [], demographics: [] },
        customAudiences: [], lookalikeAudiences: [], excludedAudiences: []
      },
      placements: { type: placementType, platforms: ['facebook', 'instagram'] },
      results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0,
      costPerResult: 0, amountSpent: 0, frequency: 0,
      deliveryStatus: 'in_review'
    });

    createAd({
      id: adId, adSetId, campaignId: campId,
      name: adName, status: 'active', creativeId: crId,
      results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0,
      costPerResult: 0, amountSpent: 0, frequency: 0,
      deliveryStatus: 'in_review', reviewStatus: 'pending', reviewFeedback: null
    });

    createCreative({
      id: crId,
      adId,
      format: adFormat,
      mediaUrl: selectedMedia,
      primaryText,
      headline,
      description,
      cta,
      createdAt: now
    });

    onSuccess();
  }

  function toggleSpecialCat(cat) {
    setSpecialCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  const ageOptions = Array.from({ length: 48 }, (_, i) => 18 + i);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container">
        {/* Modal header */}
        <div className="modal-header">
          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === 'new_campaign' ? 'modal-tab--active' : ''}`}
              onClick={() => setActiveTab('new_campaign')}
            >New campaign</button>
            <button
              className={`modal-tab ${activeTab === 'existing' ? 'modal-tab--active' : ''}`}
              onClick={() => setActiveTab('existing')}
            >New ad set or ad</button>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Existing campaign tab */}
          {activeTab === 'existing' && (
            <div className="form-step">
              <div className="form-section-title">Add to existing campaign</div>
              <div className="field-group">
                <label className="field-label">Select campaign</label>
                <select className="field-select" value={existingCampId} onChange={e => setExistingCampId(e.target.value)}>
                  <option value="">Choose a campaign...</option>
                  {state.campaigns.filter(c => c.status !== 'deleted').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">New ad set name</label>
                <input
                  className="field-input"
                  value={existingAdSetName}
                  onChange={e => setExistingAdSetName(e.target.value)}
                  placeholder="Enter ad set name"
                />
              </div>
            </div>
          )}

          {/* New campaign tab steps */}
          {activeTab === 'new_campaign' && (
          <>
          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="modal-step">
              <div className="modal-step-left">
                <div className="field-group">
                  <label className="field-label">Buying type</label>
                  <select className="field-select">
                    <option>Auction</option>
                  </select>
                </div>
                <div className="objectives-section">
                  <div className="section-title">Choose a campaign objective</div>
                  <div className="objectives-list">
                    {OBJECTIVES.map(obj => {
                      const Icon = obj.icon;
                      return (
                        <label
                          key={obj.key}
                          className={`objective-option ${selectedObj === obj.key ? 'objective-option--selected' : ''}`}
                          onClick={() => setSelectedObj(obj.key)}
                        >
                          <input
                            type="radio"
                            name="objective"
                            value={obj.key}
                            checked={selectedObj === obj.key}
                            onChange={() => setSelectedObj(obj.key)}
                            style={{ display: 'none' }}
                          />
                          <span className="obj-radio">{selectedObj === obj.key ? '●' : '○'}</span>
                          <span className="obj-icon" style={{ color: obj.color }}>
                            <Icon size={22} />
                          </span>
                          <span className="obj-label">{obj.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-step-right">
                {selectedObj && (() => {
                  const obj = OBJECTIVES.find(o => o.key === selectedObj);
                  const Icon = obj.icon;
                  return (
                    <div className="objective-detail">
                      <div className="obj-detail-icon" style={{ color: obj.color }}>
                        <Icon size={48} />
                      </div>
                      <div className="obj-detail-name">{obj.label}</div>
                      <div className="obj-detail-desc">{obj.description}</div>
                      <div className="obj-detail-good">
                        <div className="obj-detail-good-label">Good for:</div>
                        {obj.goodFor.map(g => (
                          <span key={g} className="obj-good-tag">{g}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Step 2: Campaign settings */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-section-title">Campaign settings</div>
              <div className="field-group">
                <label className="field-label">Campaign name</label>
                <input className="field-input" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Special ad categories</label>
                <div className="checkbox-group">
                  {SPECIAL_CATEGORIES.map(cat => (
                    <label key={cat} className="checkbox-option">
                      <input type="checkbox" checked={specialCats.includes(cat)} onChange={() => toggleSpecialCat(cat)} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label className="field-label field-label--toggle">
                  <span>Campaign budget optimization</span>
                  <button
                    className={`toggle-btn ${cboEnabled ? 'toggle-btn--on' : ''}`}
                    onClick={() => setCboEnabled(v => !v)}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </label>
                {cboEnabled && (
                  <div className="sub-fields">
                    <div className="radio-group">
                      <label><input type="radio" value="daily" checked={budgetType === 'daily'} onChange={() => setBudgetType('daily')} /> Daily budget</label>
                      <label><input type="radio" value="lifetime" checked={budgetType === 'lifetime'} onChange={() => setBudgetType('lifetime')} /> Lifetime budget</label>
                    </div>
                    <div className="amount-input">
                      <span>$</span>
                      <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} min="1" />
                    </div>
                  </div>
                )}
              </div>
              <div className="field-group">
                <label className="field-label">Bid strategy</label>
                <select className="field-select" value={bidStrategy} onChange={e => setBidStrategy(e.target.value)}>
                  {BID_STRATEGIES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Ad Set settings */}
          {step === 3 && (
            <div className="form-step">
              <div className="form-section-title">Ad set settings</div>
              <div className="field-group">
                <label className="field-label">Ad set name</label>
                <input className="field-input" value={adSetName} onChange={e => setAdSetName(e.target.value)} />
              </div>
              <div className="form-sub-section">
                <div className="sub-section-title">Budget & Schedule</div>
                <div className="radio-group">
                  <label><input type="radio" value="daily" checked={adBudgetType === 'daily'} onChange={() => setAdBudgetType('daily')} /> Daily budget</label>
                  <label><input type="radio" value="lifetime" checked={adBudgetType === 'lifetime'} onChange={() => setAdBudgetType('lifetime')} /> Lifetime budget</label>
                </div>
                <div className="amount-input">
                  <span>$</span>
                  <input type="number" value={adBudgetAmount} onChange={e => setAdBudgetAmount(e.target.value)} min="1" />
                </div>
              </div>
              <div className="form-sub-section">
                <div className="sub-section-title">Audience</div>
                <div className="field-group">
                  <label className="field-label">Location</label>
                  <input className="field-input" value={locationInput} onChange={e => setLocationInput(e.target.value)} placeholder="Add countries, cities..." />
                </div>
                <div className="age-row">
                  <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Age min</label>
                    <select className="field-select" value={ageMin} onChange={e => setAgeMin(e.target.value)}>
                      {ageOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="field-group" style={{ flex: 1 }}>
                    <label className="field-label">Age max</label>
                    <select className="field-select" value={ageMax} onChange={e => setAgeMax(e.target.value)}>
                      {[...ageOptions, '65+'].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Gender</label>
                  <div className="radio-group radio-group--row">
                    {['all', 'male', 'female'].map(g => (
                      <label key={g}><input type="radio" value={g} checked={gender === g} onChange={() => setGender(g)} /> {g.charAt(0).toUpperCase() + g.slice(1)}</label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-sub-section">
                <div className="sub-section-title">Placements</div>
                <div className="radio-group">
                  <label>
                    <input type="radio" value="advantage_plus" checked={placementType === 'advantage_plus'} onChange={() => setPlacementType('advantage_plus')} />
                    Advantage+ placements (recommended)
                  </label>
                  <label>
                    <input type="radio" value="manual" checked={placementType === 'manual'} onChange={() => setPlacementType('manual')} />
                    Manual placements
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Ad settings */}
          {step === 4 && (
            <div className="form-step form-step--wide">
              <div className="ad-form-layout">
                <div className="ad-form-left">
                  <div className="form-section-title">Ad settings</div>
                  <div className="field-group">
                    <label className="field-label">Ad name</label>
                    <input className="field-input" value={adName} onChange={e => setAdName(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Format</label>
                    <div className="radio-group radio-group--row">
                      {['single_image', 'carousel', 'collection'].map(f => (
                        <label key={f}>
                          <input type="radio" value={f} checked={adFormat === f} onChange={() => setAdFormat(f)} />
                          {f.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Media</label>
                    <button className="btn-outline" onClick={() => setShowMediaLib(true)}>Add Media</button>
                    {selectedMedia && (
                      <img src={selectedMedia} alt="Selected" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                    )}
                    {showMediaLib && (
                      <div className="media-library">
                        <div className="media-library-title">Select Media</div>
                        <div className="media-library-grid">
                          {MOCK_MEDIA.map(url => (
                            <img
                              key={url}
                              src={url}
                              alt="media"
                              className={`media-thumb ${selectedMedia === url ? 'media-thumb--selected' : ''}`}
                              onClick={() => { setSelectedMedia(url); setShowMediaLib(false); }}
                            />
                          ))}
                        </div>
                        <button className="btn-outline btn-sm" onClick={() => setShowMediaLib(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Primary text <span className="field-hint">(125 chars)</span></label>
                    <textarea className="field-textarea" maxLength={125} value={primaryText} onChange={e => setPrimaryText(e.target.value)} rows={3} />
                    <div className="char-count">{primaryText.length}/125</div>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Headline <span className="field-hint">(40 chars)</span></label>
                    <input className="field-input" maxLength={40} value={headline} onChange={e => setHeadline(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Description <span className="field-hint">(optional, 30 chars)</span></label>
                    <input className="field-input" maxLength={30} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Website URL</label>
                    <input className="field-input" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Call to action</label>
                    <select className="field-select" value={cta} onChange={e => setCta(e.target.value)}>
                      {CTAS.map(c => <option key={c} value={c}>{CTA_LABELS[c]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="ad-preview">
                  <div className="ad-preview-title">Ad Preview</div>
                  <div className="ad-preview-card">
                    <div className="ad-preview-header">
                      <div className="ad-preview-avatar">{(state.account.name || 'A').charAt(0)}</div>
                      <div>
                        <div className="ad-preview-account">{state.account.businessName || 'Acme Corp'}</div>
                        <div className="ad-preview-sponsored">Sponsored</div>
                      </div>
                    </div>
                    <div className="ad-preview-text">{primaryText || 'Your ad primary text will appear here.'}</div>
                    {selectedMedia && (
                      <img src={selectedMedia} alt="ad" className="ad-preview-image" />
                    )}
                    {!selectedMedia && <div className="ad-preview-placeholder">Add media above</div>}
                    <div className="ad-preview-footer">
                      <div>
                        <div className="ad-preview-headline">{headline || 'Your headline'}</div>
                        <div className="ad-preview-desc">{description || ''}</div>
                      </div>
                      <button className="ad-preview-cta">{CTA_LABELS[cta]}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* Modal footer */}
        <div className="modal-footer">
          {activeTab === 'existing' ? (
            <>
              <div style={{ flex: 1 }} />
              <button className="btn-outline" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!existingCampId || !existingAdSetName.trim()}
                onClick={() => {
                  const now = new Date().toISOString();
                  createAdSet({
                    id: `adset_${Date.now()}`,
                    campaignId: existingCampId,
                    name: existingAdSetName.trim(),
                    status: 'active',
                    dailyBudget: 25,
                    lifetimeBudget: null,
                    startDate: now, endDate: null,
                    optimizationGoal: 'conversions',
                    billingEvent: 'impressions', bidAmount: null,
                    targeting: { locations: [], ageMin: 18, ageMax: 65, genders: ['all'], detailedTargeting: { interests: [], behaviors: [], demographics: [] }, customAudiences: [], lookalikeAudiences: [], excludedAudiences: [] },
                    placements: { type: 'advantage_plus', platforms: ['facebook', 'instagram'] },
                    results: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0,
                    costPerResult: 0, amountSpent: 0, frequency: 0,
                    deliveryStatus: 'in_review',
                    bidStrategy: 'lowest_cost',
                    createdAt: now, updatedAt: now
                  });
                  onSuccess();
                }}
              >Continue</button>
            </>
          ) : (
            <>
              {step > 1 && (
                <button className="btn-outline" onClick={() => setStep(s => s - 1)}>Back</button>
              )}
              <div style={{ flex: 1 }} />
              <div className="step-indicator">
                {[1, 2, 3, 4].map(s => (
                  <span key={s} className={`step-dot ${step === s ? 'step-dot--active' : step > s ? 'step-dot--done' : ''}`} />
                ))}
              </div>
              {step < 4 ? (
                <button
                  className="btn-primary"
                  disabled={step === 1 && !selectedObj}
                  onClick={handleContinue}
                >
                  Continue
                </button>
              ) : (
                <button className="btn-primary" onClick={handlePublish}>Publish</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

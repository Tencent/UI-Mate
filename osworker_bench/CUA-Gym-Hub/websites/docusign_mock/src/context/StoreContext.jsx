import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getDefaultState,
  getSessionId,
  fetchCustomState,
  saveState,
  getSavedInitialState,
  initializeData
} from '../lib/dataManager';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        setLoading(false);
      });
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  // Persist to session-specific localStorage on change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // --- Audit Log ---
  const addAuditLog = (action, details, envelopeId = null) => {
    const log = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      details,
      envelopeId
    };
    setState(prev => ({ ...prev, auditLog: [log, ...prev.auditLog] }));
  };

  // --- Envelope Actions ---
  const createEnvelope = (envelopeData) => {
    const newEnvelope = {
      id: uuidv4(),
      subject: envelopeData.subject || envelopeData.name || 'Untitled Envelope',
      message: envelopeData.message || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentAt: null,
      completedAt: null,
      voidedAt: null,
      declinedAt: null,
      lastActivityAt: new Date().toISOString(),
      expiresAt: null,
      senderId: 'user_1',
      folderId: null,
      templateId: envelopeData.templateId || null,
      reminderEnabled: false,
      reminderDays: 3,
      reminderFrequency: 2,
      documents: envelopeData.documents || [
        {
          id: uuidv4(),
          name: envelopeData.name || 'Document.pdf',
          pageCount: 1,
          order: 1,
          fileUrl: envelopeData.url || `https://picsum.photos/seed/${Date.now()}/800/1100`,
          fileType: 'pdf'
        }
      ],
      recipients: envelopeData.recipients || [],
      fields: envelopeData.fields || [],
      history: [
        {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          action: 'created',
          actorName: 'Sarah Chen',
          actorEmail: 'sarah.chen@acmecorp.com',
          details: 'Envelope created'
        }
      ]
    };
    setState(prev => ({
      ...prev,
      envelopes: [...prev.envelopes, newEnvelope]
    }));
    addAuditLog('CREATE_ENVELOPE', `Created envelope: ${newEnvelope.subject}`, newEnvelope.id);
    return newEnvelope.id;
  };

  const updateEnvelope = (id, updates) => {
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env =>
        env.id === id ? { ...env, ...updates, lastActivityAt: new Date().toISOString() } : env
      )
    }));
  };

  const sendEnvelope = (id) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env => {
        if (env.id !== id) return env;
        const expiresAt = env.expiresAt || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...env,
          status: 'sent',
          sentAt: now,
          lastActivityAt: now,
          expiresAt,
          recipients: env.recipients.map(r => ({
            ...r,
            status: r.status === 'created' ? 'sent' : r.status
          })),
          history: [
            ...env.history,
            {
              id: uuidv4(),
              timestamp: now,
              action: 'sent',
              actorName: 'Sarah Chen',
              actorEmail: 'sarah.chen@acmecorp.com',
              details: `Envelope sent to ${env.recipients.length} recipient(s)`
            }
          ]
        };
      })
    }));
    addAuditLog('SEND_ENVELOPE', `Sent envelope ${id}`, id);
  };

  const signEnvelope = (envelopeId, recipientId, fieldValues) => {
    const now = new Date().toISOString();
    setState(prev => {
      const envelopes = prev.envelopes.map(env => {
        if (env.id !== envelopeId) return env;

        const updatedFields = env.fields.map(field => {
          if (field.recipientId === recipientId && fieldValues[field.id] !== undefined) {
            return { ...field, value: fieldValues[field.id] };
          }
          return field;
        });

        const updatedRecipients = env.recipients.map(rec => {
          if (rec.id === recipientId) {
            return { ...rec, status: 'signed', signedAt: now };
          }
          return rec;
        });

        const signers = updatedRecipients.filter(r => r.role === 'signer');
        const allSigned = signers.every(r => r.status === 'signed');

        const newHistory = [
          ...env.history,
          {
            id: uuidv4(),
            timestamp: now,
            action: 'signed',
            actorName: updatedRecipients.find(r => r.id === recipientId)?.name || 'Unknown',
            actorEmail: updatedRecipients.find(r => r.id === recipientId)?.email || '',
            details: `${updatedRecipients.find(r => r.id === recipientId)?.name || 'Recipient'} signed the document`
          }
        ];

        if (allSigned) {
          newHistory.push({
            id: uuidv4(),
            timestamp: now,
            action: 'completed',
            actorName: 'System',
            actorEmail: '',
            details: 'All recipients have completed signing'
          });
        }

        return {
          ...env,
          fields: updatedFields,
          recipients: updatedRecipients,
          status: allSigned ? 'completed' : 'signed',
          completedAt: allSigned ? now : null,
          lastActivityAt: now,
          history: newHistory
        };
      });

      return { ...prev, envelopes };
    });
    addAuditLog('SIGN_ENVELOPE', `Recipient ${recipientId} signed envelope ${envelopeId}`, envelopeId);
  };

  const deleteEnvelope = (id) => {
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.filter(e => e.id !== id)
    }));
    addAuditLog('DELETE_ENVELOPE', `Deleted envelope ${id}`, id);
  };

  const voidEnvelope = (id, reason) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env => {
        if (env.id !== id) return env;
        return {
          ...env,
          status: 'voided',
          voidedAt: now,
          lastActivityAt: now,
          history: [
            ...env.history,
            {
              id: uuidv4(),
              timestamp: now,
              action: 'voided',
              actorName: 'Sarah Chen',
              actorEmail: 'sarah.chen@acmecorp.com',
              details: `Envelope voided: ${reason}`
            }
          ]
        };
      })
    }));
    addAuditLog('VOID_ENVELOPE', `Voided envelope ${id}: ${reason}`, id);
  };

  const declineEnvelope = (envId, recipientId, reason) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env => {
        if (env.id !== envId) return env;
        const recipientName = env.recipients.find(r => r.id === recipientId)?.name || 'Recipient';
        return {
          ...env,
          status: 'declined',
          declinedAt: now,
          lastActivityAt: now,
          recipients: env.recipients.map(r =>
            r.id === recipientId
              ? { ...r, status: 'declined', declinedAt: now, declineReason: reason }
              : r
          ),
          history: [
            ...env.history,
            {
              id: uuidv4(),
              timestamp: now,
              action: 'declined',
              actorName: recipientName,
              actorEmail: env.recipients.find(r => r.id === recipientId)?.email || '',
              details: `${recipientName} declined: ${reason}`
            }
          ]
        };
      })
    }));
    addAuditLog('DECLINE_ENVELOPE', `Envelope ${envId} declined by recipient ${recipientId}`, envId);
  };

  const correctEnvelope = (id, updates) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env => {
        if (env.id !== id) return env;
        return {
          ...env,
          ...updates,
          lastActivityAt: now,
          history: [
            ...env.history,
            {
              id: uuidv4(),
              timestamp: now,
              action: 'corrected',
              actorName: 'Sarah Chen',
              actorEmail: 'sarah.chen@acmecorp.com',
              details: 'Envelope corrected - recipients updated'
            }
          ]
        };
      })
    }));
    addAuditLog('CORRECT_ENVELOPE', `Corrected envelope ${id}`, id);
  };

  const resendEnvelope = (id) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env => {
        if (env.id !== id) return env;
        return {
          ...env,
          lastActivityAt: now,
          history: [
            ...env.history,
            {
              id: uuidv4(),
              timestamp: now,
              action: 'resent',
              actorName: 'Sarah Chen',
              actorEmail: 'sarah.chen@acmecorp.com',
              details: 'Envelope resent to pending recipients'
            }
          ]
        };
      })
    }));
    addAuditLog('RESEND_ENVELOPE', `Resent envelope ${id}`, id);
  };

  const createFromTemplate = (templateId, recipients) => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return null;

    const now = new Date().toISOString();
    const newId = uuidv4();

    // Map template roles to actual recipients
    const recipientMap = {};
    const newRecipients = template.roles.map((role, idx) => {
      const provided = recipients && recipients[idx];
      const recId = uuidv4();
      recipientMap[role.id] = recId;
      return {
        id: recId,
        name: provided?.name || role.name,
        email: provided?.email || '',
        role: role.role,
        routingOrder: role.routingOrder,
        status: 'created',
        signedAt: null,
        viewedAt: null,
        deliveredAt: null,
        declinedAt: null,
        declineReason: null
      };
    });

    // Clone template documents with new IDs
    const docMap = {};
    const newDocs = template.documents.map(doc => {
      const newDocId = uuidv4();
      docMap[doc.id] = newDocId;
      return { ...doc, id: newDocId };
    });

    // Clone fields, mapping roleId to recipientId
    const newFields = template.fields.map(field => ({
      ...field,
      id: uuidv4(),
      recipientId: recipientMap[field.roleId] || field.roleId,
      documentId: docMap[field.documentId] || field.documentId,
      value: '',
      readOnly: false,
      fontSize: field.fontSize || 14,
      fontColor: field.fontColor || '#000000'
    }));

    const newEnvelope = {
      id: newId,
      subject: `${template.name} - Draft`,
      message: '',
      status: 'draft',
      createdAt: now,
      sentAt: null,
      completedAt: null,
      voidedAt: null,
      declinedAt: null,
      lastActivityAt: now,
      expiresAt: null,
      senderId: 'user_1',
      folderId: null,
      templateId: templateId,
      reminderEnabled: false,
      reminderDays: 3,
      reminderFrequency: 2,
      documents: newDocs,
      recipients: newRecipients,
      fields: newFields,
      history: [
        {
          id: uuidv4(),
          timestamp: now,
          action: 'created',
          actorName: 'Sarah Chen',
          actorEmail: 'sarah.chen@acmecorp.com',
          details: `Envelope created from template '${template.name}'`
        }
      ]
    };

    // Update template usage
    setState(prev => ({
      ...prev,
      envelopes: [...prev.envelopes, newEnvelope],
      templates: prev.templates.map(t =>
        t.id === templateId
          ? { ...t, lastUsedAt: now, usageCount: t.usageCount + 1 }
          : t
      )
    }));

    addAuditLog('CREATE_FROM_TEMPLATE', `Created envelope from template '${template.name}'`, newId);
    return newId;
  };

  // --- Template Actions ---
  const createTemplate = (templateData) => {
    const newTemplate = {
      id: uuidv4(),
      name: templateData.name || 'Untitled Template',
      description: templateData.description || '',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      usageCount: 0,
      ownerId: 'user_1',
      shared: templateData.shared || false,
      documents: templateData.documents || [],
      roles: templateData.roles || [],
      fields: templateData.fields || []
    };
    setState(prev => ({
      ...prev,
      templates: [...prev.templates, newTemplate]
    }));
    addAuditLog('CREATE_TEMPLATE', `Created template: ${newTemplate.name}`);
    return newTemplate.id;
  };

  const deleteTemplate = (id) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id)
    }));
    addAuditLog('DELETE_TEMPLATE', `Deleted template ${id}`);
  };

  const updateTemplate = (id, updates) => {
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    }));
    addAuditLog('UPDATE_TEMPLATE', `Updated template ${id}`);
  };

  // --- Folder Actions ---
  const moveToFolder = (envId, folderId) => {
    setState(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(env =>
        env.id === envId ? { ...env, folderId } : env
      )
    }));
    addAuditLog('MOVE_ENVELOPE', `Moved envelope ${envId} to folder ${folderId}`, envId);
  };

  const createFolder = (name) => {
    const newFolder = {
      id: uuidv4(),
      name,
      parentFolder: null,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));
    addAuditLog('CREATE_FOLDER', `Created folder: ${name}`);
    return newFolder.id;
  };

  const deleteFolder = (id) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== id),
      // Move envelopes from deleted folder back to no-folder
      envelopes: prev.envelopes.map(env =>
        env.folderId === id ? { ...env, folderId: null } : env
      )
    }));
    addAuditLog('DELETE_FOLDER', `Deleted folder ${id}`);
  };

  const updateFolder = (id, updates) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
    addAuditLog('UPDATE_FOLDER', `Updated folder ${id}`);
  };

  // --- Contact Actions ---
  const addContact = (contact) => {
    const newContact = {
      id: uuidv4(),
      name: contact.name,
      email: contact.email,
      company: contact.company || null,
      title: contact.title || null
    };
    setState(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
    addAuditLog('ADD_CONTACT', `Added contact: ${newContact.name}`);
    return newContact.id;
  };

  const deleteContact = (id) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id)
    }));
    addAuditLog('DELETE_CONTACT', `Deleted contact ${id}`);
  };

  // --- User Actions ---
  const updateUser = (updates) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }));
    addAuditLog('UPDATE_USER', 'Updated user profile');
  };

  // Get initial state for /go endpoint
  const initialState = getSavedInitialState(sidRef.current) || getDefaultState();

  if (loading || !state) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <StoreContext.Provider value={{
      state,
      initialState,
      createEnvelope,
      updateEnvelope,
      sendEnvelope,
      signEnvelope,
      deleteEnvelope,
      voidEnvelope,
      declineEnvelope,
      correctEnvelope,
      resendEnvelope,
      createFromTemplate,
      createTemplate,
      deleteTemplate,
      updateTemplate,
      moveToFolder,
      createFolder,
      deleteFolder,
      updateFolder,
      addContact,
      deleteContact,
      updateUser
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

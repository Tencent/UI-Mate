import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './PassengersPage.css';

const EMPTY_PASSENGER = {
  name: '',
  idType: '身份证',
  idNumber: '',
  phone: '',
  passengerType: '成人',
  seatPreference: '无偏好',
  isDefault: false,
};

function maskId(idNumber) {
  if (!idNumber) return '';
  return idNumber.replace(/(\d{6})\d+(\d{4})/, '$1****$2');
}

export default function PassengersPage() {
  const { state, updateState, showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = add new, or passenger id
  const [form, setForm] = useState(EMPTY_PASSENGER);
  const [errors, setErrors] = useState({});

  const openAdd = () => {
    setForm(EMPTY_PASSENGER);
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditing(p.id);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_PASSENGER);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = '请输入姓名';
    if (!form.idNumber.trim()) errs.idNumber = '请输入证件号码';
    if (form.idType === '身份证' && !/^\d{17}[\dXx]$/.test(form.idNumber)) {
      errs.idNumber = '身份证号码格式不正确（18位数字）';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editing) {
      updateState((prev) => ({
        ...prev,
        passengers: prev.passengers.map((p) => p.id === editing ? { ...form, id: editing } : p),
      }));
      showToast('乘客信息已更新', 'success');
    } else {
      const newId = `psg_${Date.now()}`;
      updateState((prev) => ({
        ...prev,
        passengers: [...prev.passengers, { ...form, id: newId }],
      }));
      showToast('乘车人已添加', 'success');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (!window.confirm('确认删除该乘车人？')) return;
    updateState((prev) => ({
      ...prev,
      passengers: prev.passengers.filter((p) => p.id !== id),
    }));
    showToast('乘车人已删除', 'info');
  };

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="passengers-page">
      <Header activePage="tickets" />
      <div className="passengers-content container">
        <div className="passengers-card">
          <div className="passengers-header">
            <h2 className="passengers-title">乘车人管理</h2>
            <button className="add-btn" onClick={openAdd}>+ 添加乘车人</button>
          </div>

          {state.passengers.length === 0 ? (
            <div className="passengers-empty">
              <div>暂无乘车人信息</div>
              <button className="add-btn-lg" onClick={openAdd}>添加乘车人</button>
            </div>
          ) : (
            <table className="passengers-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>姓名</th>
                  <th>证件类型</th>
                  <th>证件号码</th>
                  <th>旅客类型</th>
                  <th>手机号</th>
                  <th>座位偏好</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {state.passengers.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>
                      <span className="psg-name">{p.name}</span>
                      {p.isDefault && <span className="default-tag">默认</span>}
                    </td>
                    <td>{p.idType}</td>
                    <td>{maskId(p.idNumber)}</td>
                    <td>
                      <span className={`type-tag type-${p.passengerType}`}>{p.passengerType}</span>
                    </td>
                    <td>{p.phone || '--'}</td>
                    <td>{p.seatPreference || '无偏好'}</td>
                    <td>
                      <button className="edit-btn" onClick={() => openEdit(p)}>编辑</button>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="passenger-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editing ? '编辑乘车人' : '添加乘车人'}</h3>

            <div className="form-field">
              <label>姓名 <span className="required">*</span></label>
              <input className={`field-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="请输入姓名" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label>证件类型 <span className="required">*</span></label>
              <select className="field-select" value={form.idType} onChange={(e) => setField('idType', e.target.value)}>
                <option>身份证</option>
                <option>护照</option>
                <option>港澳通行证</option>
                <option>台湾通行证</option>
              </select>
            </div>

            <div className="form-field">
              <label>证件号码 <span className="required">*</span></label>
              <input className={`field-input ${errors.idNumber ? 'error' : ''}`} value={form.idNumber} onChange={(e) => setField('idNumber', e.target.value)} placeholder="请输入证件号码" />
              {errors.idNumber && <span className="field-error">{errors.idNumber}</span>}
            </div>

            <div className="form-field">
              <label>旅客类型</label>
              <select className="field-select" value={form.passengerType} onChange={(e) => setField('passengerType', e.target.value)}>
                <option>成人</option>
                <option>学生</option>
                <option>儿童</option>
              </select>
            </div>

            <div className="form-field">
              <label>手机号</label>
              <input className="field-input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="请输入手机号" />
            </div>

            <div className="form-field">
              <label>座位偏好</label>
              <select className="field-select" value={form.seatPreference} onChange={(e) => setField('seatPreference', e.target.value)}>
                <option>窗口</option>
                <option>过道</option>
                <option>无偏好</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>保存</button>
              <button className="cancel-btn" onClick={closeModal}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

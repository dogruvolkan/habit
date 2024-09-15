import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import '../styles/HabitFormModal.css';

interface HabitFormModalProps {
  onSave: (habit: Habit) => void;
  onClose: () => void;
  habit?: Habit;  // Eğer düzenleniyorsa, bu prop gelecek
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({ onSave, onClose, habit }) => {
  const [title, setTitle] = useState(habit ? habit.title : '');
  const [description, setDescription] = useState(habit ? habit.description : '');
  const [startDate, setStartDate] = useState(habit ? habit.startDate : '');
  const [duration, setDuration] = useState(habit ? habit.duration : 0);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description);
      setStartDate(habit.startDate);
      setDuration(habit.duration);
    }
  }, [habit]);  // Eğer modal tekrar açılırsa, habit değişikliklerini dikkate al

  const handleSave = () => {
    const newHabit: Habit = {
      id: habit ? habit.id : Math.random().toString(), // Eğer düzenleme ise aynı id'yi kullan
      title,
      description,
      startDate,
      duration,
      dailyLogs: habit ? habit.dailyLogs : [] // Düzenleme ise önceki logları koru
    };
    onSave(newHabit);
    onClose(); // Modalı kapat
  };

  return (
    <div className="modal">
      <div className='modalContent'>
    <h3>{habit ? 'Düzenle' : 'Ekle'}</h3>
    <label className='label'>
      Başlık:
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık"
      />
    </label>
    <label className='label'>
      Açıklama:
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Açıklama"
      />
    </label>
    <label className='label' htmlFor="date" >
      Başlangıç Tarihi:
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        id="date"
      />
    </label>
    <label className='label'>
      Süre (gün):
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        placeholder="Süre"
      />
    </label>
    <div className='btnsContainer'>
    <button className="save" onClick={handleSave}>{habit ? 'Kaydet' : 'Ekle'}</button>
    <button className="close" onClick={onClose}>İptal</button>
    </div>
    </div>
  </div>
  );
};

export default HabitFormModal;

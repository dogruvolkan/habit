import React, { useState, useEffect } from "react";
import { Habit } from "../types";
import "../styles/HabitDetail.css";
interface HabitDetailProps {
  habit: Habit;
  onBack: () => void;
}

interface DailyLog {
  day: number;
  checked: boolean;
  hoursWorked: number;
  date: string;
}

const HabitDetail: React.FC<HabitDetailProps> = ({ habit, onBack }) => {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [workedHours, setWorkedHours] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alışkanlık verilerini localStorage'dan çek
  useEffect(() => {
    const storedLogs = localStorage.getItem(`dailyLogs-${habit.id}`);
    if (storedLogs) {
      setDailyLogs(JSON.parse(storedLogs));
    } else {
      // Eğer localStorage'da yoksa, boş loglarla başla
      const logs = Array.from({ length: habit.duration }, (_, i) => {
        const date = new Date(habit.startDate);
        date.setDate(date.getDate() + i);
        return {
          day: i + 1,
          date: date.toISOString().split('T')[0],
          checked: false,
          hoursWorked: 0,
        };
      });
      setDailyLogs(logs);
    }
  }, [habit.id, habit.duration, habit.startDate]);

  // Verileri localStorage'a kaydet
  useEffect(() => {
    if (dailyLogs.length > 0) {
      localStorage.setItem(`dailyLogs-${habit.id}`, JSON.stringify(dailyLogs));
    }
  }, [dailyLogs, habit.id]);

  // Gün checkbox'ına tıklanınca yapılan işlemler
  const toggleCheckbox = (day: number) => {
    setDailyLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.day === day ? { ...log, checked: !log.checked } : log
      )
    );
  };

  // Hours Worked modalını açma
  const openModal = (day: number) => {
    const log = dailyLogs.find((log) => log.day === day);
    if (log) {
      setSelectedDay(day);
      setWorkedHours(log.hoursWorked);
      setIsModalOpen(true);
    }
  };

  // Modal'da saatleri kaydetme
  const saveWorkedHours = () => {
    setDailyLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.day === selectedDay ? { ...log, hoursWorked: workedHours } : log
      )
    );
    setIsModalOpen(false);
  };

  // Gün ekleme işlevi
  const addDay = () => {
    const newDayIndex = dailyLogs.length + 1;
    const date = new Date(habit.startDate);
    date.setDate(date.getDate() + dailyLogs.length);
    const newDay = {
      day: newDayIndex,
      date: date.toISOString().split('T')[0],
      checked: false,
      hoursWorked: 0,
    };
    setDailyLogs([...dailyLogs, newDay]);
  };

  // Haftaları oluşturma (7 günlük bölünmüş kartlar)
  const weeks = [];
  for (let i = 0; i < Math.ceil(dailyLogs.length / 7); i++) {
    weeks.push(dailyLogs.slice(i * 7, i * 7 + 7));
  }
  return (
    <div className="detail-container">
      <div className="header">
        <button className="backBtn" onClick={onBack}>
          Geri
        </button>
        <h2>{habit.title}</h2>
      </div>
      <div className="sub-content">
        <p>{habit.description}</p>
        <p><span>Başlangıç Tarihi: </span>{habit.startDate}</p>
        <p><span>Kaç gün sürecek:</span> {habit.duration} gün</p>
        <button className="add-day-btn" onClick={addDay}>Gün Ekle</button>
      </div>

      {weeks.map((week, index) => (
        <div className="week-container" key={index}>
          <h3 className="week-header">{index + 1}. Hafta</h3>
          <div className="card-container">
            {week.map((log) => (
              <div
                key={log.day}
                className={`card ${log.checked ? "checked" : ""}`}
              >
                <p>{log.day}. Gün ({log.date})</p>
                <p>
                  {log.hoursWorked > 0 ? (
                    log.hoursWorked + " saat çalışıldı"
                  ) : (
                    <button onClick={() => openModal(log.day)}>
                      Saat Ekle
                    </button>
                  )}
                </p>
                <input
                className="checkbox"
                  type="checkbox"
                  checked={log.checked}
                  onChange={() => toggleCheckbox(log.day)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className="modal">
          <h3>Gün {selectedDay} - Çalışılan Saat</h3>
          <input
            type="number"
            value={workedHours}
            onChange={(e) => setWorkedHours(Number(e.target.value))}
            placeholder="Çalışılan saat"
          />
        <div className="btnsContainer">
        <button className="save" onClick={saveWorkedHours}>
            Kaydet
          </button>
          <button className="close" onClick={() => setIsModalOpen(false)}>
            İptal
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitDetail;

import React, { useState, useEffect } from "react";
import { Habit } from "../types";
import "../styles/HabitDetail.css";

interface HabitDetailProps {
  habit: Habit;
  onBack: () => void;
}

interface DailyLog {
  day: number;
  status: "Yapıldı" | "Yapılmadı" | "Eksik";
  hoursWorked: number;
  date: string;
  workedTopic: string;
}

const HabitDetail: React.FC<HabitDetailProps> = ({ habit, onBack }) => {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [workedHours, setWorkedHours] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workedTopics, setWorkedTopics] = useState<string>("");

  // Alışkanlık verilerini localStorage'dan çek
  useEffect(() => {
    const storedLogs = localStorage.getItem(`dailyLogs-${habit.id}`);
    if (storedLogs) {
      setDailyLogs(JSON.parse(storedLogs));
    } else {
      // Eğer localStorage'da yoksa, boş loglarla başla
      const logs: DailyLog[] = Array.from({ length: habit.duration }, (_, i) => {
        const date = new Date(habit.startDate);
        date.setDate(date.getDate() + i);
        return {
          day: i + 1,
          date: date.toISOString().split("T")[0],
          status: "Eksik" as "Yapıldı" | "Yapılmadı" | "Eksik", // Varsayılan olarak "Eksik"
          hoursWorked: 0,
          workedTopic: "",
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

  // Status değiştirme işlemi (Yapıldı, Yapılmadı, Eksik)
  const handleStatusChange = (day: number, newStatus: "Yapıldı" | "Yapılmadı" | "Eksik") => {
    setDailyLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.day === day ? { ...log, status: newStatus } : log
      )
    );
  };

  // Hours Worked modalını açma
  const openModal = (day: number) => {
    const log = dailyLogs.find((log) => log.day === day);
    if (log) {
      setSelectedDay(day);
      setWorkedHours(log.hoursWorked);
      setWorkedTopics(log.workedTopic);
      setIsModalOpen(true);
    }
  };

  // Modal'da saatleri kaydetme
  const saveWorkedDetails = () => {
    setDailyLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.day === selectedDay
          ? { ...log, hoursWorked: workedHours, workedTopic: workedTopics } // Konuyu da kaydet
          : log
      )
    );
    setIsModalOpen(false);
  };

  // Gün ekleme işlevi
  const addDay = () => {
    const newDayIndex = dailyLogs.length + 1;
    const date = new Date(habit.startDate);
    date.setDate(date.getDate() + dailyLogs.length);
    const newDay: DailyLog = {
      day: newDayIndex,
      date: date.toISOString().split("T")[0],
      status: "Eksik", // Varsayılan olarak "Eksik"
      hoursWorked: 0,
      workedTopic: "",
    };
    setDailyLogs([...dailyLogs, newDay]);
  };

  // Gün silme işlevi
  const deleteDay = (day: number) => {
    const updatedLogs = dailyLogs.filter((log) => log.day !== day);
    const reorderedLogs = updatedLogs.map((log, index) => ({
      ...log,
      day: index + 1, // Gün sırasını yeniden düzenliyoruz
    }));
    setDailyLogs(reorderedLogs);
  };

  // Haftaları oluşturma (7 günlük bölünmüş kartlar)
  const weeks = [];
  for (let i = 0; i < Math.ceil(dailyLogs.length / 7); i++) {
    weeks.push(dailyLogs.slice(i * 7, i * 7 + 7));
  }

    // Handler to mark weekdays as "Yapılmadı"
    const markWeekdaysNotCompleted = (weekIndex: number) => {
      const updatedLogs = dailyLogs.map((log) => {
        const weekStart = weekIndex * 7;
        const weekEnd = weekStart + 7;
        const currentWeek = dailyLogs.slice(weekStart, weekEnd);
        const currentLogIndex = currentWeek.findIndex((wLog) => wLog.day === log.day);
        if (currentLogIndex !== -1 && currentLogIndex < 5) { // Monday to Friday (0-4)
          return { ...log, status: "Yapılmadı" as "Yapıldı" | "Yapılmadı" | "Eksik" };
        }
        return log;
      });
      setDailyLogs(updatedLogs);
    };
  
    // Handler to mark weekends as "Yapılmadı"
    const markWeekendsNotCompleted = (weekIndex: number) => {
      const updatedLogs = dailyLogs.map((log) => {
        const weekStart = weekIndex * 7;
        const weekEnd = weekStart + 7;
        const currentWeek = dailyLogs.slice(weekStart, weekEnd);
        const currentLogIndex = currentWeek.findIndex((wLog) => wLog.day === log.day);
        if (currentLogIndex !== -1 && currentLogIndex >= 5 && currentLogIndex < 7) { // Saturday and Sunday (5-6)
          return { ...log, status: "Yapılmadı" as "Yapıldı" | "Yapılmadı" | "Eksik" };
        }
        return log;
      });
      setDailyLogs(updatedLogs);
    };
  
    // Handler to mark the entire week as "Yapılmadı"
    const markEntireWeekNotCompleted = (weekIndex: number) => {
      const updatedLogs = dailyLogs.map((log) => {
        const weekStart = weekIndex * 7;
        const weekEnd = weekStart + 7;
        const currentWeek = dailyLogs.slice(weekStart, weekEnd);
        if (currentWeek.some((wLog) => wLog.day === log.day)) {
          return { ...log, status: "Yapılmadı" as "Yapıldı" | "Yapılmadı" | "Eksik" };
        }
        return log;
      });
      setDailyLogs(updatedLogs);
    };

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
        <p>
          <span>Başlangıç Tarihi: </span>
          {habit.startDate}
        </p>
        <p>
          <span>Kaç gün sürecek: </span> {habit.duration} gün
        </p>
        <p>
          <span>Kaç gün yapıldı: </span>
          {dailyLogs.filter((log) => log.status === "Yapıldı").length} gün
        </p>
        <p>
          <span>Kaç gün yapılmadı: </span>
          {dailyLogs.filter((log) => log.status === "Yapılmadı").length} gün
        </p>
        <p>
          <span>Kaç gün Kaldı: </span>
          {dailyLogs.filter((log) => log.status === "Eksik").length} gün
        </p>
        <button className="add-day-btn" onClick={addDay}>
          Gün Ekle
        </button>
      </div>

      {weeks.map((week, index) => (
        <div className="week-container" key={index}>
          <h3 className="week-header">{index + 1}. Hafta</h3>
          <div className="week-buttons">
              <button
                className="week-btn"
                onClick={() => markWeekdaysNotCompleted(index)}
              >
                Hafta İçi Tamamlanmadı
              </button>
              <button
                className="week-btn"
                onClick={() => markWeekendsNotCompleted(index)}
              >
                Hafta Sonu Tamamlanmadı
              </button>
              <button
                className="week-btn"
                onClick={() => markEntireWeekNotCompleted(index)}
              >
                Hafta Tamamlanmadı
              </button>
            </div>
          <div className="card-container">
            {week.map((log) => (
              <div
                key={log.day}
                className={`card ${log.status === "Yapıldı" ? "checked" : log.status === "Yapılmadı" ? "not-checked": ""}`}
              >
                <div className="card-header">
                  <p>
                    {log.day}. Gün ({log.date})
                  </p>
                  <button
                    className="delete-day-btn"
                    onClick={() => deleteDay(log.day)}
                  >
                    ❌
                  </button>
                </div>

                <div className="status-container">
                  <label htmlFor={`status-${log.day}`}>Durum: </label>
                  {log.status !== "Eksik" ? (log.status) :
                 
                  <select
                    className="status-select"
                    id={`status-${log.day}`}
                    value={log.status}
                    onChange={(e) =>
                      handleStatusChange(log.day, e.target.value as "Yapıldı" | "Yapılmadı" | "Eksik")
                    }
                  >
                    <option value="Yapıldı">Yapıldı</option>
                    <option value="Yapılmadı">Yapılmadı</option>
                    <option value="Eksik">Eksik</option>
                  </select>   }
                </div>

                <p>
                  {log.hoursWorked ? (
                   
                    log.workedTopic && (
                      <p className="topic-text">
                        <span className="hover-text"> {log.hoursWorked === -1 ? "hiç" : log.hoursWorked} {log.hoursWorked > 4 ? "dakika" : "saat"}  {log.hoursWorked > 0 ? "çalışıldı" : "çalışılmadı"}</span>
                        <span className="hidden-text">{log.workedTopic}</span>
                      </p>
                    )
                  ) : (
                    <button onClick={() => openModal(log.day)}>Detay Gir</button>
                  )}
                </p>

            
               
              </div>
            ))}
          </div>
        
        </div>
      ))}
        {isModalOpen && (
        <div className="modal">
          <h3>Gün {selectedDay} - Çalışma Detayları </h3>
          <input
            type="number"
            value={workedHours}
            onChange={(e) => setWorkedHours(Number(e.target.value))}
            placeholder="Çalışılan saat"
          />
          <input
            type="text"
            value={workedTopics}
            onChange={(e) => setWorkedTopics(e.target.value)}
            placeholder="Çalışılan konu"
          />
          <div className="btnsContainer">
            <button className="save" onClick={saveWorkedDetails}>
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
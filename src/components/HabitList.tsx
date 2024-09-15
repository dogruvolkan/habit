import  { useState, useEffect } from "react";
import { Habit } from "../types";
import HabitFormModal from "./HabitFormModal";
import "../styles/HabitList.css";
interface Props {
  onSelectHabit: (habit: Habit) => void;
}

export const HabitList = (props: Props) => {
  const { onSelectHabit } = props;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // LocalStorage'dan alışkanlıkları yükle
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");

    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits);
        if (Array.isArray(parsedHabits)) {
          setHabits(parsedHabits); // Eğer data varsa ve düzgün formatta ise state'e yükle
        } else {
          console.error("Veri biçimi hatalı");
        }
      } catch (error) {
        console.error("Veri okunurken hata oluştu:", error);
      }
    }
  }, []); // Bu effect sadece bileşen ilk yüklendiğinde çalışır.

  // Alışkanlıklar her değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem("habits", JSON.stringify(habits)); // Alışkanlıklar güncellenince localStorage'a yaz
    }
  }, [habits]); // habits array'i her değiştiğinde bu effect çalışacak

  const handleSaveHabit = (habit: Habit) => {
    if (selectedHabit) {
      // Alışkanlık düzenleme
      setHabits(habits.map((h) => (h.id === habit.id ? habit : h)));
    } else {
      // Yeni alışkanlık ekleme
      setHabits([...habits, habit]);
    }
    setSelectedHabit(null);
  };

  const handleDeleteHabit = (id: string) => {
    const confiremed = window.confirm(
      "Bu alışkanlığı silmek istediğinize emin misiniz?"
    );
    if (!confiremed) {
      return;
    }
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsModalOpen(true); // Modalı açalım
  };

  const handleToggleCompleted = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <div className="container">
      <h1>Alışkanlıklarım ({habits.length})</h1>
      <button className="addBtn" onClick={() => setIsModalOpen(true)}>
        Alışkanlık Ekle
      </button>
      {isModalOpen && (
        <HabitFormModal
          habit={selectedHabit!}
          onSave={handleSaveHabit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <div className="subContainer">
        {habits.map((habit) => (
          <div key={habit.id} className={`habitCard ${habit.completed ? "checked" : ""}`}>
            <h3>{habit.title}</h3>
            <div className="btnContainer">
              <button
                className="editBtn"
                onClick={() => handleEditHabit(habit)}
              >
                Düzenle
              </button>
              <button
                className="deleteBtn"
                onClick={() => handleDeleteHabit(habit.id)}
              >
                Sil
              </button>
              <button
                className="detailBtn"
                onClick={() => onSelectHabit(habit)}
              >
                Detay
              </button>
            </div>
            <input
              className="completedCheckbox"
              type="checkbox"
              checked={habit.completed}
              onChange={() => handleToggleCompleted(habit.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitList;

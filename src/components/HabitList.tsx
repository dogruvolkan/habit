import { useState, useEffect } from "react";
import { Habit } from "../types";
import HabitFormModal from "./HabitFormModal";
import "../styles/HabitList.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Props {
  onSelectHabit: (habit: Habit) => void;
}

export const HabitList = (props: Props) => {
  const { onSelectHabit } = props;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");

    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits);
        if (Array.isArray(parsedHabits)) {
          setHabits(parsedHabits);
        } else {
          console.error("Invalid data format");
        }
      } catch (error) {
        console.error("Error reading data:", error);
      }
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }, [habits]);

  const handleSaveHabit = (habit: Habit) => {
    if (selectedHabit) {
      setHabits(habits.map((h) => (h.id === habit.id ? habit : h)));
    } else {
      setHabits([...habits, habit]);
    }
    setSelectedHabit(null);
  };

  const handleDeleteHabit = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this habit?"
    );
    if (!confirmed) {
      return;
    }
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsModalOpen(true);
  };

  const handleToggleCompleted = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  // Drag and Drop Handlers
  const moveHabit = (dragIndex: number, hoverIndex: number) => {
    const dragHabit = habits[dragIndex];
    const newHabits = [...habits];
    newHabits.splice(dragIndex, 1);
    newHabits.splice(hoverIndex, 0, dragHabit);
    setHabits(newHabits);
  };

  const HabitCard = ({ habit, index }: { habit: Habit; index: number }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "HABIT",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "HABIT",
      hover(item: { index: number }) {
        if (item.index !== index) {
          moveHabit(item.index, index);
          item.index = index; // Update the index after moving
        }
      },
    });

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={`habitCard ${habit.completed ? "checked" : ""}`}
        style={{ opacity: isDragging ? 0.5 : 1 }} // Visual indication of drag
      >
        <h3>{habit.title}</h3>
        <div className="btnContainer">
          <button className="editBtn" onClick={() => handleEditHabit(habit)}>
            Düzenle
          </button>
          <button className="deleteBtn" onClick={() => handleDeleteHabit(habit.id)}>
            Sil
          </button>
          <button className="detailBtn" onClick={() => onSelectHabit(habit)}>
            Detay
          </button>
          <input
            className="completedCheckbox"
            type="checkbox"
            checked={habit.completed}
            onChange={() => handleToggleCompleted(habit.id)}
          />
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
          {habits.map((habit, index) => (
            <HabitCard key={habit.id} habit={habit} index={index} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default HabitList;

import React, { useState } from 'react';
import HabitList from './components/HabitList';
import HabitDetail from './components/HabitDetail';
import { Habit } from './types';

const App: React.FC = () => {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  return (
    <div>
      {selectedHabit ? (
        <HabitDetail habit={selectedHabit} onBack={() => setSelectedHabit(null)} />
      ) : (
        <HabitList onSelectHabit={setSelectedHabit} />
      )}
    </div>
  );
};

export default App;

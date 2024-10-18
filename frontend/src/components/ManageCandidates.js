import React, { useState } from 'react';

const ManageCandidates = () => {
  // В реальном приложении эти данные будут загружаться из API
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Анна Смирнова', position: 'Frontend Developer', status: 'На рассмотрении' },
    { id: 2, name: 'Петр Иванов', position: 'Backend Developer', status: 'Интервью назначено' },
    { id: 3, name: 'Мария Козлова', position: 'UX Designer', status: 'Отклонено' },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, status: newStatus } : candidate
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Управление кандидатами</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Имя</th>
              <th className="py-3 px-6 text-left">Позиция</th>
              <th className="py-3 px-6 text-left">Статус</th>
              <th className="py-3 px-6 text-center">Действия</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{candidate.name}</td>
                <td className="py-3 px-6 text-left">{candidate.position}</td>
                <td className="py-3 px-6 text-left">{candidate.status}</td>
                <td className="py-3 px-6 text-center">
                  <button 
                    onClick={() => handleStatusChange(candidate.id, 'Интервью назначено')}
                    className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Назначить интервью
                  </button>
                  <button 
                    onClick={() => handleStatusChange(candidate.id, 'Отклонено')}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Отклонить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCandidates;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const WorkerDashboard = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }
  
        const response = await fetch('http://localhost:3000/worker', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        setWorker(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchWorkerData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!worker) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Личный кабинет работника</h2>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="text-xl font-semibold mb-2">{worker.name}</h3>
        <p>Email: {worker.email}</p>
        <p>Сфера деятельности: {worker.field}</p>
        <p>Поданных заявок: {worker.appliedJobs}</p>
      </div>
      <div className="flex flex-col space-y-2">
        <Link to="/job-search">
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Поиск вакансий
          </button>
        </Link>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Редактировать профиль
        </button>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Мои заявки
        </button>
      </div>
    </div>
  );
};

export default WorkerDashboard;
import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
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

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id; // Adjust this line based on your token's structure

        const response = await axios.get(`http://localhost:3000/worker/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWorker(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, []);

  const handleSignContract = async (contractId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role; // Adjust this line based on your token's structure

      await axios.post(`http://localhost:3000/contracts/${contractId}/sign`, { role }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWorker({
        ...worker,
        contracts: worker.contracts.map(contract =>
          contract.id === contractId ? { ...contract, status: 'Подписан', employeeSigned: true } : contract
        ),
      });
      alert('Контракт подписан.');
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Ошибка при подписании контракта.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="worker-dashboard">
      <h2>Worker Dashboard</h2>
      {worker ? (
        <div>
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
          {worker.resume && (
            <p>
              Resume: <a href={`http://localhost:3000/${worker.resume}`} target="_blank" rel="noopener noreferrer">Download</a>
            </p>
          )}
          <h3>Contracts</h3>
          {worker.contracts.length > 0 ? (
            <div>
              {worker.contracts.map(contract => (
                <div key={contract.id} className="contract">
                  <p>Contract ID: {contract.id}</p>
                  <p>Status: {contract.status}</p>
                  <p>Employer Signed: {contract.employerSigned ? 'Yes' : 'No'}</p>
                  <p>Employee Signed: {contract.employeeSigned ? 'Yes' : 'No'}</p>
                  {contract.contractFile && (
                    <p>
                      Contract File: <a href={`http://localhost:3000/${contract.contractFile}`} target="_blank" rel="noopener noreferrer">Download</a>
                    </p>
                  )}
                  {!contract.employeeSigned && (
                    <button
                      onClick={() => handleSignContract(contract.id)}
                      className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Sign Contract
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No contracts available</div>
          )}
        </div>
      ) : (
        <div>No worker data available</div>
      )}
    </div>
  );
};

export default WorkerDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Web3 from 'web3';

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [contract, setContract] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
        if (!token) {
          console.error('No token found');
          return;
        }

        const decodedToken = jwtDecode(token);
        const name = decodedToken.name; // Adjust this line based on your token's structure

        if (!name) {
          console.error('No company information found in token');
          return;
        }

        const response = await axios.get('http://localhost:3000/candidates', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            name,
          },
        });
        setCandidates(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts');
        const web3 = new Web3('http://localhost:8545'); // Connect to Ganache
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        console.log('Accounts:', accounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchCandidates();
    fetchAccounts();
  }, [setCandidates]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.put(`http://localhost:3000/candidates/${id}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCandidates(candidates.map(candidate => 
        candidate.id === id ? { ...candidate, status: newStatus } : candidate
      ));
    } catch (error) {
      console.error('Error updating candidate status:', error);
      alert('Ошибка при обновлении статуса кандидата.');
    }
  };

  const handleOfferContract = async (candidateId) => {
    try {
      const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
      if (!token) {
        console.error('No token found');
        return;
      }

      const formData = new FormData();
      formData.append('candidateId', candidateId);
      formData.append('employeeAddress', employeeAddress); // Add employee address
      console.log(candidateId);
      console.log(formData);
      formData.append('contractFile', contractFile);
      console.log(contractFile);
      console.log(formData);

      const response = await axios.post(`http://localhost:3000/contracts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setContract(response.data);
      alert('Контракт предложен.');
    } catch (error) {
      console.error('Error offering contract:', error);
      alert('Ошибка при предложении контракта.');
    }
  };

  const handleSignContract = async (contractId) => {
    try {
      const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role; // Adjust this line based on your token's structure

      const response = await axios.post(`http://localhost:3000/contracts/${contractId}/sign`, { role}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setContract(response.data);
      alert('Контракт подписан.');
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Ошибка при подписании контракта.');
    }
  };

  const handleFileChange = (e) => {
    setContractFile(e.target.files[0]);
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
      if (!token) {
        console.error('No token found');
        return;
      }

      const updatedCandidates = candidates.filter(candidate => candidate.status === 'Отклонено');

      if (updatedCandidates.length === 0) {
        alert('No declined candidates to remove.');
        return;
      }

      await axios.delete('http://localhost:3000/candidates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          status: 'Отклонено',
        },
      });

      //setCandidates(candidates.filter(candidate => candidate.status !== 'Отклонено'));
      alert('Отклоненные кандидаты удалены.');
    } catch (error) {
      console.error('Error applying changes:', error);
      alert('Ошибка при применении изменений.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Управление кандидатами</h2>
      <button
        onClick={handleApply}
        className="mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Применить изменения
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Имя</th>
              <th className="py-3 px-6 text-left">Должность</th>
              <th className="py-3 px-6 text-left">Статус</th>
              <th className="py-3 px-6 text-left">Резюме</th>
              <th className="py-3 px-6 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{candidate.name}</td>
                <td className="py-3 px-6 text-left">{candidate.position}</td>
                <td className="py-3 px-6 text-left">{candidate.status}</td>
                <td className="py-3 px-6 text-left">
                  {candidate.resume ? (
                    <a href={`http://localhost:3000/${candidate.resume}`} target="_blank" rel="noopener noreferrer">
                      Скачать резюме
                    </a>
                  ) : (
                    'Нет резюме'
                  )}
                </td>
                <td className="py-3 px-6 text-left">
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="На рассмотрении">На рассмотрении</option>
                    <option value="Интервью назначено">Интервью назначено</option>
                    <option value="Отклонено">Отклонено</option>
                  </select>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="mt-2" />
                  <button
                    onClick={() => handleOfferContract(candidate.id)}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Предложить контракт
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {contract && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Контракт</h3>
          <p>ID контракта: {contract.id}</p>
          <p>Статус: {contract.status}</p>
          <a href={`http://localhost:3000/${contract.contractFile}`} target="_blank" rel="noopener noreferrer">
            Скачать контракт
          </a>
          <button
            onClick={() => handleSignContract(contract.id)}
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Подписать контракт
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
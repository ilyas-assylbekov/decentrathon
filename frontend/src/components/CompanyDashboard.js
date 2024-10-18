import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CompanyDashboard = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }
  
        const response = await fetch('http://localhost:3000/company', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        setCompany(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCompanyData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Панель управления компании</h2>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
        <p>Email: {company.email}</p>
        <p>Сфера деятельности: {company.field}</p>
        <p>Активных вакансий: {company.activeJobs}</p>
      </div>
      <div className="flex flex-col space-y-2">
        <Link to="/create-job">
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Создать новую вакансию
          </button>
        </Link>
        <Link to="/manage-candidates">
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Управление кандидатами
          </button>
        </Link>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Редактировать профиль компании
        </button>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Просмотр активных вакансий
        </button>
      </div>
    </div>
  );
};

export default CompanyDashboard;
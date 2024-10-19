import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState(null);

  const handleSearch = async () => {
    try {
      console.log('Fetching all jobs');
      const response = await axios.get('http://localhost:3000/all-postings');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const applyForJob = async (job) => {
    try {
      const token = localStorage.getItem('accessToken'); // Adjust this line based on where you store the token
      if (!token) {
        alert('Вы не авторизованы.');
        return;
      }

      const decodedToken = jwtDecode(token);
      const name = decodedToken.name; // Adjust this line based on your token's structure

      if (!name) {
        alert('Не удалось получить имя пользователя.');
        return;
      }

      console.log(resume);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('position', job.title);
      formData.append('company', job.company);
      formData.append('resume', resume);
      formData.append('userId', decodedToken.id);

      await axios.post('http://localhost:3000/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Заявка отправлена!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Ошибка при отправке заявки.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Поиск вакансий</h2>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Поиск вакансий"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow mr-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Поиск
        </button>
      </div>
      <div>
        <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
        {jobs.map((job) => (
          <div key={job.id} className="border p-4 mb-4 rounded">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <p>Компания: {job.company}</p>
            <p>Зарплата: {job.salary}</p>
            <button
              onClick={() => applyForJob(job)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Подать заявку
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobSearch;
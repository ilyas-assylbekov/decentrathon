import React, { useState } from 'react';
import axios from 'axios';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);

  const handleSearch = async () => {
    try {
      console.log('Searching for jobs:', searchTerm);
      const response = await axios.get('http://localhost:3000/all-postings'); // Change t /search when LLM and add { searchTerm }
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching for jobs:', error);
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
        {jobs.map((job) => (
          <div key={job.id} className="border p-4 mb-4 rounded">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <p>Компания: {job.company}</p>
            <p>Зарплата: {job.salary}</p>
            <button
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
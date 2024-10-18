import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8">Добро пожаловать в HR Ledger</h1>
      <p className="mb-8 text-xl">
        Платформа для поиска работы и сотрудников на основе блокчейн технологий
      </p>
      <div className="space-y-4">
        <button 
          onClick={() => onNavigate('Register')} 
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600 transition duration-300"
        >
          Регистрация
        </button>
        <button 
          onClick={() => onNavigate('Login')} 
          className="bg-green-500 text-white py-2 px-4 rounded w-full hover:bg-green-600 transition duration-300"
        >
          Вход
        </button>
      </div>
    </div>
  );
};

export default HomePage;
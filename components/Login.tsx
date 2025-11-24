import React, { useState } from 'react';
import { Grade, User } from '../types';
import { GRADES } from '../constants';
import { Card } from './Card';
import { LightbulbIcon } from './Icons';

interface LoginProps {
  onLogin: (user: User) => void;
  onGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGuest }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  // FIX: Changed initial grade from 8 to 9 to match the `Grade` type.
  const [grade, setGrade] = useState<Grade>(9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && school.trim()) {
      onLogin({ name, email, school, grade, communityDisplayName: name });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-100 to-blue-200 p-4">
      <Card className="max-w-md w-full animate__animated animate__fadeInUp">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-cyan-500 p-3 rounded-xl mb-4">
                <LightbulbIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Chào mừng đến LearnTogether</h1>
            <p className="text-gray-600 mt-2">Vui lòng điền thông tin để bắt đầu hành trình học tập của bạn.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên của bạn</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700">Trường học</label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Trường THCS ABC"
            />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Khối</label>
            <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
                {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105"
          >
            Bắt đầu học
          </button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={onGuest} className="text-sm text-gray-600 hover:text-cyan-700 hover:underline">
                Tiếp tục với tư cách khách
            </button>
        </div>
      </Card>
    </div>
  );
};
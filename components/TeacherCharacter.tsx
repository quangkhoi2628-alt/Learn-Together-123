import React from 'react';

const teacherImage = "/teacher.jpg";

export const TeacherCharacter = ({ className, isAnimating = false }: { className?: string, isAnimating?: boolean }) => {
  return (
    <img 
        src={teacherImage} 
        alt="Gia sư AI" 
        className={`${className || ''} object-contain ${isAnimating ? 'talking-char' : 'floating-char'}`}
        onError={(e) => {
            e.currentTarget.onerror = null; 
            // Fallback nếu ảnh không tải được để tránh vỡ layout
            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/6569/6569264.png";
        }}
    />
  );
};
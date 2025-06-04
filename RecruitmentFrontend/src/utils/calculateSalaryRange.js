// src/utils/calculateSalaryRange.js

export const calculateSalaryRange = (salaryMin, salaryMax) => {
  // Nếu có cả hai mức lương min và max, trả về dải lương
  if (salaryMin && salaryMax) {
    return `${salaryMin} - ${salaryMax} USD`;
  }
  
  // Nếu chỉ có mức lương min, trả về mức lương min
  if (salaryMin) {
    return `${salaryMin} USD and above`;
  }
  
  // Nếu chỉ có mức lương max, trả về mức lương max
  if (salaryMax) {
    return `Up to ${salaryMax} USD`;
  }
  
  return 'Salary not specified';
};

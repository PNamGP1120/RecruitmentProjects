// src/components/JobList.js
import React from 'react';
import JobCard from './JobCard'; // Nhớ import JobCard

const JobList = ({ jobs }) => {
  return (
    <div>
      <h1>Danh sách công việc</h1>
      <div className="job-list">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobList;

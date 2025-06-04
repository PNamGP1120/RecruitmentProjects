// src/components/JobCard.js
import React from 'react';

const JobCard = ({ job }) => {
  const { title, description, requirements, location, salary_min, salary_max, job_type, status, recruiter_profile } = job;
  const { company_name, company_website, industry, address } = recruiter_profile;

  return (
    <div className="job-card">
      <h2>{title}</h2>
      <p><strong>Company: </strong>{company_name} ({industry})</p>
      <p><strong>Location: </strong>{location}</p>
      <p><strong>Job Type: </strong>{job_type}</p>
      <p><strong>Salary: </strong>{salary_min} - {salary_max} USD</p>
      <p><strong>Description: </strong>{description}</p>
      <p><strong>Requirements: </strong>{requirements}</p>
      <p><strong>Status: </strong>{status}</p>
      <a href={company_website} target="_blank" rel="noopener noreferrer">Visit Company Website</a>
    </div>
  );
};

export default JobCard;

import { useState, useEffect } from 'react';
import { JiraIssue } from './useJiraIssue';

const API_BASE = import.meta.env.VITE_JIRA_API_BASE_URL || 'http://localhost:4000';

export const useAllJiraIssues = () => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/jira/issues/list`); 
      if (!res.ok) throw new Error('Error al obtener la lista de Jira');
      const data = await res.json();
      setIssues(data);
    } catch (err: any) {
      console.log('Error fetching my Jira issues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return { issues, loading, error, refresh: fetchIssues };
};
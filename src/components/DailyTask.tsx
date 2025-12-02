import { CheckCircle, ClipboardCopy, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { db } from '../db/dexieDB'

const JIRA_BASE = 'https://winsytemsintl.atlassian.net/browse/'

interface DailyTaskProps {
  task: any
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onToggle: (id: number, completed: boolean) => void
}

export default function DailyTask({ task, onEdit, onDelete, onToggle }: DailyTaskProps) {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const copyTaskName = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const extractJiraKey = (name: string): string | null => {
    const match = name.match(/^(WIGOS-\d{4,6})/i)
    return match ? match[1] : null
  }

  const jiraKey = extractJiraKey(task.name)
  const jiraUrl = jiraKey ? `${JIRA_BASE}${jiraKey}` : null

  return (
    <div className="relative flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg transition hover:shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <p
              className="font-medium text-lg truncate max-w-[300px] cursor-help"
              title={task.name}
            >
              {task.name}
            </p>
            {showTooltip && task.description && (
              <div className="absolute left-0 mt-1 w-64 bg-black text-white text-xs p-2 rounded shadow-lg z-50">
                {task.description}
              </div>
            )}
          </div>

          <button
            onClick={() => copyTaskName(task.name)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Copiar nombre de tarea"
          >
            <ClipboardCopy
              size={16}
              className={copied ? 'text-green-500' : 'text-gray-400'}
            />
          </button>

          {jiraUrl && (
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir ticket en Jira"
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <ExternalLink size={16} className="text-blue-500 hover:text-blue-400" />
            </a>
          )}
          {copied && <span className="text-green-500 text-xs ml-1">Copiado!</span>}
        </div>

        <p className="text-sm text-gray-500 truncate">{task.hours}h — {task.date}</p>
      </div>

      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={() => onToggle(task.id!, task.completed)}
          className={`p-2 rounded ${task.completed
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700'
            }`}
        >
          <CheckCircle size={18} />
        </button>
        <button
          onClick={() => onEdit(task.id!)}
          className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(task.id!)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

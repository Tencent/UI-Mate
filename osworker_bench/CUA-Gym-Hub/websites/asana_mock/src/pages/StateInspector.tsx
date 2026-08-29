
import { useApp } from '../context/AppContext';

export default function StateInspector() {
  const { state, initialState } = useApp();

  const calculateDiff = (initial: any, current: any): any => {
    const diff: any = {};

    if (initial.tasks.length !== current.tasks.length) {
      diff.tasks = {
        initial_count: initial.tasks.length,
        current_count: current.tasks.length,
        added: current.tasks.filter((t: any) =>
          !initial.tasks.find((it: any) => it.taskId === t.taskId)
        ),
        modified: current.tasks.filter((t: any) => {
          const initialTask = initial.tasks.find((it: any) => it.taskId === t.taskId);
          return initialTask && JSON.stringify(initialTask) !== JSON.stringify(t);
        })
      };
    }

    if (initial.projects.length !== current.projects.length) {
      diff.projects = {
        initial_count: initial.projects.length,
        current_count: current.projects.length
      };
    }

    const modifiedTasks = current.tasks.filter((t: any) => {
      const initialTask = initial.tasks.find((it: any) => it.taskId === t.taskId);
      return initialTask && JSON.stringify(initialTask) !== JSON.stringify(t);
    });

    if (modifiedTasks.length > 0) {
      diff.modified_tasks = modifiedTasks;
    }

    return diff;
  };

  const responseData = {
    initial_state: {
      user: initialState.currentUser,
      teams: initialState.teams,
      projects: initialState.projects,
      tasks: initialState.tasks,
      comments: initialState.comments,
      portfolios: initialState.portfolios,
      goals: initialState.goals,
      notifications: initialState.notifications
    },
    current_state: {
      user: state.currentUser,
      teams: state.teams,
      projects: state.projects,
      tasks: state.tasks,
      comments: state.comments,
      portfolios: state.portfolios,
      goals: state.goals,
      notifications: state.notifications
    },
    state_diff: calculateDiff(initialState, state)
  };

  return (
    <pre style={{
      padding: '20px',
      backgroundColor: '#1f1f1f',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflow: 'auto',
      height: '100vh'
    }}>
      {JSON.stringify(responseData, null, 2)}
    </pre>
  );
}
  
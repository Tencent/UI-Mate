
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Teams.css';

export default function Teams() {
  const { teamId } = useParams();
  const { state } = useApp();

  const team = state.teams.find(t => t.teamId === teamId);

  if (!team) {
    return <div className="teams-page">Team not found</div>;
  }

  const teamProjects = state.projects.filter(p => p.teamId === teamId);
  const teamMembers = state.users.filter(u => team.memberIds.includes(u.userId));

  return (
    <div className="teams-page">
      <div className="team-header">
        <h1>{team.name}</h1>
        <button className="add-member-btn">Add Member</button>
      </div>

      <p className="team-description">{team.description}</p>

      <div className="team-sections">
        <section className="team-section">
          <h2>Projects ({teamProjects.length})</h2>
          <div className="team-projects-grid">
            {teamProjects.map(project => (
              <div key={project.projectId} className="team-project-card">
                <div className="team-project-icon" style={{ backgroundColor: project.color }}>
                  <img src={project.icon} alt="" />
                </div>
                <h3>{project.name}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <h2>Members ({teamMembers.length})</h2>
          <div className="team-members-list">
            {teamMembers.map(member => (
              <div key={member.userId} className="team-member-card">
                <img src={member.avatar} alt={member.name} />
                <div>
                  <div className="member-name">{member.name}</div>
                  <div className="member-title">{member.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
  
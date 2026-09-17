export default function SubjectPicker({ subjects, onSelect }) {
  return (
    <div className="panel">
      <div className="panel-title">Choose a subject</div>
      <div className="subject-row">
        {subjects.map((subject) => (
          <button
            key={subject}
            className="subject-btn"
            onClick={() => onSelect(subject)}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

const StaticAnalysis = ({ data }) => {
  const renderObject = (obj) => {
    return Object.keys(obj).map((key) => {
      const value = obj[key];
      if (Array.isArray(value)) {
        return (
          <div key={key}>
            <strong>{key}:</strong>
            <ul>
              {value.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        return (
          <div key={key}>
            <strong>{key}:</strong>
            <div style={{ paddingLeft: '20px' }}>
              {renderObject(value)}
            </div>
          </div>
        );
      } else {
        return (
          <div key={key}>
            <strong>{key}:</strong> {String(value)}
          </div>
        );
      }
    });
  };

  return <div>{renderObject(data)}</div>;
};

export default StaticAnalysis;

// Usage
// import AppInfo from './AppInfo';

// const data = { /* your data object here */ };

// function App() {
//   return (
//     <div className="App">
//       <AppInfo data={data} />
//     </div>
//   );
// }

// export default App;

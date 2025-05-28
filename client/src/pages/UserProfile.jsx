import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState(' ');
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    console.log('render');
  }, [counter]);

  return (
    <div>
      <input onChange={(e) => setUser(e.target.value)} />
      <hr />
      <button
        onClick={() => {
          alert('Nuevo usuario ' + user);
        }}
      >
        Save
      </button>
      <hr />
      <h1>
        <strong>Counter: </strong> {counter}
      </h1>
      <button
        onClick={() => {
          setCounter(counter + 1);
        }}
      >
        Incrementar
      </button>
      <hr />
      <button
        onClick={() => {
          setCounter(0);
        }}
      >
        <strong>Reiniciar</strong>
      </button>
    </div>
  );
}

export default UserProfile;

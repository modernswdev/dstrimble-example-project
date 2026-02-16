// Minimal React-like UI without build tools
(function(){
  function h(tag, props, ...children){
    const el = document.createElement(tag);
    for (const k in props){
      if (k.startsWith('on') && typeof props[k] === 'function'){
        el.addEventListener(k.slice(2).toLowerCase(), props[k]);
      } else if (k === 'style' && typeof props[k] === 'object'){
        Object.assign(el.style, props[k]);
      } else {
        el.setAttribute(k, props[k]);
      }
    }
    children.flat().forEach(c => {
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function render(root, app){
    root.innerHTML = '';
    root.appendChild(app);
  }

  function Login({onLogin}){
    const username = document.createElement('input');
    username.placeholder = 'username';
    const password = document.createElement('input');
    password.placeholder = 'password';
    password.type = 'password';
    const btn = document.createElement('button');
    btn.textContent = 'Login';
    btn.addEventListener('click', async () => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: username.value, password: password.value })
      });
      if (res.ok) onLogin(); else alert('login failed');
    });
    return h('div', {}, username, password, btn);
  }

  function Dashboard({onLogout, user}){
    const p = h('p', {}, 'Hello ' + user.username);
    const btn = h('button', { onClick: onLogout }, 'Logout');
    return h('div', {}, p, btn);
  }

  async function App(){
    const root = document.getElementById('root');
    async function check(){
      const res = await fetch('/api/me');
      if (res.ok){
        const user = await res.json();
        render(root, Dashboard({ onLogout: async () => { await fetch('/api/logout', { method: 'POST' }); check(); }, user }));
      } else {
        render(root, Login({ onLogin: check }));
      }
    }
    check();
  }

  App();
})();

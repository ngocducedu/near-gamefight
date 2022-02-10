import 'regenerator-runtime/runtime'
import React from 'react'
import { useEffect, useState } from 'react'
import { login, logout } from './utils'
import './global.css'
import Content from './Content'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [show, getShow] = useState(false)
  const [hero, setHero] = useState()
  const [heroDelete, setHeroDelete] = useState()
  const [heroLvl, setHeroLvl] = useState()
  const [edithero, setEdithero] = useState({id: '', name: ''})
  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  const addHero = () => {
    if (window.walletConnection.isSignedIn()) {
          
        // window.contract is set by initContract in index.js
          window.contract.create_hero({name: hero})

    }
    
    setHero('')
  }

  const deleteHero = () => {
    if (window.walletConnection.isSignedIn()) {
          
        // window.contract is set by initContract in index.js
          window.contract.delete_hero({id: parseInt(heroDelete)})

    }
    
    setHeroDelete('')
  }


  const lvlHero = () => {
    if (window.walletConnection.isSignedIn()) {
          
        // window.contract is set by initContract in index.js
          window.contract.lvlup_hero({id: parseInt(heroLvl)})

    }
    
    setHeroLvl('')
  }
  const handleEditSubmit = (event) => {
    if (window.walletConnection.isSignedIn()) {
            
        // window.contract is set by initContract in index.js
          window.contract.edit_hero({id: parseInt(edithero.id), name: edithero.name})

    }

    setEdithero({id: '', name: ''})
    event.preventDefault();
  }

  const handleInputChange = (event) => {
    const target = event.target;
    const value =  target.value;
    const name = target.name;

    setEdithero(pre => {
      return {...pre, [name]: value}
    })
    event.preventDefault();
  }

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to GameFight!!!!</h1>
        <img src='https://i.ytimg.com/vi/XZ1JbB8yniM/maxresdefault.jpg' style={{ alignItem: 'center', height: '15em', width: '15em' }}/>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Login</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '1px solid var(--secondary)'
            }}
          >
          

          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!
        </h1>
        <button onClick={() => getShow(!show)}>Show All Hero</button> 
        
        <button onClick={addHero}>Add Hero</button>
        <input 
          value={hero}
          onChange={e => setHero(e.target.value)}
          placeholder="Enter name of hero"
        />
        
        <form onSubmit={handleEditSubmit}>
        <label>
          Id Hero:
          <input
            name="id"
            value={edithero.id}
            onChange={handleInputChange} 
            />
        </label>
        <br />
        <label>
          Name Hero:
          <input
            name="name"
            value={edithero.name}
            onChange={handleInputChange} 
            />
        </label>
        <input type="submit" value="Edit Hero" />
      </form>
      
      <button onClick={deleteHero}>Delete Hero</button>
        <input 
          value={heroDelete}
          onChange={e => setHeroDelete(e.target.value)}
          placeholder="Enter id hero to remove "
        />
      
      <button onClick={lvlHero}>LevelUp Hero</button>
        <input 
          value={heroLvl}
          onChange={e => setHeroLvl(e.target.value)}
          placeholder="Enter id hero to lvl "
        />

        
        {show && <Content/>}
        
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}

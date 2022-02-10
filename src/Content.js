import React from 'react';
import { useEffect, useState } from "react"

function Content() {
    const [heros, setHeros] = useState([])
    const [type, setType]  = useState("posts")
    const [topButton, setTopButton] = useState(false)

    //console.log(type);

    useEffect(() => {
        
        if (window.walletConnection.isSignedIn()) {
        
            // window.contract is set by initContract in index.js
              window.contract.get_all_hero()
              .then(listHeros => {
                setHeros(listHeros)
              })

        }
    },[])

    useEffect(() => {
        const handleTopButton = () => {
            setTopButton(window.scrollY >= 200)
        }

        window.addEventListener('scroll', handleTopButton)

        
    }, [])


    return (
        <div>
            <ul>
                {    
                heros.map(hero => (
                        <li key={hero.id}>
                            Onwer: &nbsp; { hero.owner} &nbsp; &nbsp;  <br/> 
                            Hero id:&nbsp;  { hero.id} &nbsp; &nbsp;   <br/> 
                            Hero name: &nbsp; { hero.name} &nbsp; &nbsp;  <br/> 
                            Hero level:&nbsp;  { hero.level} &nbsp; &nbsp;  <br/> 
                            Hero damage:&nbsp;  { hero.damage} &nbsp; &nbsp;  <br/> 
                            Hero health: &nbsp; { hero.health}  &nbsp;&nbsp; <br/> 
                            
                        </li>
                    ))
                }
            </ul>

            {topButton && (
                <button 
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 20
                    }}
                    >
                        GoTop
                </button>
            )}
        </div>
    )
}

export default Content
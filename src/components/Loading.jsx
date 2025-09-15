import React from 'react'
import styles from './Loading.module.scss'

export const Loading = () => (
  <div className={styles['loading']}>
    <div className={`${styles['loading__container']} d-f-c flex-column`}>
      <figure>
        <img className='animate__animated animate__wobble animate__infinite' 
        
        alt={`Loading`} src={`/logo.svg`} width={248} height={248}/>
      </figure>
      <div />
    </div>
  </div>
)
